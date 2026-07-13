# -*- coding: utf-8 -*-
"""Build a narrated LIVE-BROWSING walkthrough video from video_script.md + the running MES app.
Stages (each skips if output exists, so re-runs resume):
  1 TTS  : edge-tts (Neerja, en-IN) -> audio/<key>.mp3
  2 REC  : Playwright drives the real app live -> rec/<key>.webm  (evaluation points only)
  3 SRT  : sentence-level captions per scene
  4 CLIP : ffmpeg per scene -> clips/<key>.mp4 (freeze-hold to narration length + muxed voice + burned captions)
  5 CAT  : concat -> MES_Demo_Walkthrough.mp4
Usage: python make_video.py [--only sub1,sub2]   (--only filters scene keys by substring, for smoke tests)
"""
import os, re, sys, time, shutil, asyncio, subprocess, textwrap
sys.path.insert(0, os.path.dirname(__file__))
import shots
import edge_tts
from mutagen.mp3 import MP3
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
VOICE  = "en-IN-NeerjaNeural"
RATE   = "-2%"    # measured: +6% gave 16:45; -2% lands ~18:00 at a slightly calmer pace
BASE   = "http://localhost:8817/"
SCR    = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))       # scratchpad
ROOT   = r"D:\Rakesh Padamshali\workspace\MES_Production_Mockup\eval-deck\video"
MD     = r"D:\Rakesh Padamshali\workspace\MES_Production_Mockup\eval-deck\video_script.md"
AUD, REC, SRTD, CLIP, CARDS = [os.path.join(ROOT, d) for d in ("audio","rec","srt","clips","cards")]
for d in (AUD, REC, SRTD, CLIP): os.makedirs(d, exist_ok=True)
FINAL = os.path.join(ROOT, "MES_Demo_Walkthrough.mp4")
LEAD, TAIL = 1.0, 0.7
ONLY = []
if "--only" in sys.argv: ONLY = sys.argv[sys.argv.index("--only")+1].split(",")
REC_ONLY = "--rec-only" in sys.argv    # record live scenes only (skip TTS/assemble/concat)

PRELUDE = r"""
window.__see=function(t){var el=[].slice.call(document.querySelectorAll('*')).filter(function(e){return e.children.length<5&&e.textContent&&e.textContent.trim().indexOf(t)>=0;})[0];if(el)el.scrollIntoView({block:'center'});};
window.__tab=function(t){var re=new RegExp(t,'i');var el=[].slice.call(document.querySelectorAll('.bm-tab')).filter(function(e){return re.test(e.textContent);})[0];if(el)el.click();return !!el;};
window.__btn=function(t){var re=new RegExp(t,'i');var b=[].slice.call(document.querySelectorAll('button')).filter(function(e){return re.test(e.textContent)&&!e.disabled;})[0];if(b){b.click();return true;}return false;};
window.__btnRow=function(t){var re=new RegExp(t,'i');var rows=[].slice.call(document.querySelectorAll('tr'));var r=rows.filter(function(x){return re.test(x.textContent);})[0];if(r){var b=[].slice.call(r.querySelectorAll('button')).filter(function(x){return /run now|send|receive|trigger/i.test(x.textContent);})[0];if(b){b.click();return true;}}return false;};
window.__call=function(fn){try{if(typeof window[fn]==='function'){window[fn]();return true;}}catch(e){}return false;};
window.__seeSel=function(sel){try{var el=document.querySelector(sel);if(el)el.scrollIntoView({block:'center'});return !!el;}catch(e){return false;}};
window.__openDG=function(){try{if(typeof openDispo==='function'){openDispo(8);var dt=document.getElementById('dType');if(dt){dt.value='Downgrade';if(typeof dispoChange==='function')dispoChange();}return true;}}catch(e){}return false;};
"""

# ---------------- parse narrations ----------------
def parse_md():
    intro = closing = None; sec = {}; item = {}
    ctx = None; await_sec = None
    for ln in open(MD, encoding="utf-8").read().split("\n"):
        s = ln.strip()
        msec = re.match(r"^## A(\d) ", s); mit = re.match(r"^### (\S+) ", s)
        if "Title / Intro" in s: ctx, await_sec = "intro", None
        elif msec: ctx = await_sec = "A" + msec.group(1)
        elif s.startswith("## ") and "Closing" in s: ctx, await_sec = "closing", None
        elif s.startswith("## "): ctx, await_sec = None, None
        elif mit: ctx, await_sec = mit.group(1), None
        elif await_sec and s.startswith("> *"):
            sec[await_sec] = s.strip("> ").strip("*").strip(); await_sec = None
        elif s.startswith("**NARRATION:**"):
            txt = s[len("**NARRATION:**"):].strip()
            if ctx == "intro": intro = txt
            elif ctx == "closing": closing = txt
            elif ctx: item[ctx] = txt
    return intro, sec, item, closing

intro, sec, item, closing = parse_md()
AGENDA = "Here's the ground we'll cover: seven functional areas and fifty evaluation points, each demonstrated live in the running system."

# ---------------- scene list ----------------
scenes = []
def add(key, kind, text, **kw): scenes.append(dict(key=key, kind=kind, text=text or "", **kw))
add("00_intro", "card", intro, img=os.path.join(CARDS, "intro.png"))
add("01_agenda", "card", AGENDA, img=os.path.join(CARDS, "agenda.png"))
last = None; n = 2
for it in shots.ITEMS:
    if it["grp"] != last:
        last = it["grp"]
        add("%02d_sec%s" % (n, it["grp"]), "card", sec.get(it["grp"], ""), img=os.path.join(CARDS, "sec"+it["grp"]+".png")); n += 1
    add("%02d_%s" % (n, it["id"]), "live", item.get(it["id"], it.get("resp","")), it=it); n += 1
add("%02d_closing" % n, "card", closing, img=os.path.join(CARDS, "closing.png"))
if ONLY:
    scenes = [s for s in scenes if any(o in s["key"] for o in ONLY)]
print("scenes:", len(scenes))

def apath(sc): return os.path.join(AUD, sc["key"] + ".mp3")
def rpath(sc): return os.path.join(REC, sc["key"] + ".webm")
def spath(sc): return os.path.join(SRTD, sc["key"] + ".ass")
def cpath(sc): return os.path.join(CLIP, sc["key"] + ".mp4")

# ---------------- 1. TTS ----------------
async def tts_all():
    sem = asyncio.Semaphore(5)
    async def job(sc):
        out = apath(sc)
        if os.path.exists(out) and os.path.getsize(out) > 1200: return
        async with sem:
            for att in range(10):
                try:
                    await edge_tts.Communicate(sc["text"], VOICE, rate=RATE).save(out)
                    if os.path.exists(out) and os.path.getsize(out) > 1200: return
                    raise RuntimeError("empty mp3")
                except Exception as e:
                    print("tts retry", sc["key"], str(e)[:60]); await asyncio.sleep(3)
            print("TTS FAILED", sc["key"])
    await asyncio.gather(*[job(s) for s in scenes if s["text"].strip()])

if not REC_ONLY:
    print("== stage 1: TTS ==")
    asyncio.run(tts_all())
for sc in scenes:
    try: sc["adur"] = MP3(apath(sc)).info.length
    except Exception: sc["adur"] = 3.0
    sc["D"] = round(LEAD + sc["adur"] + TAIL, 2)
if not REC_ONLY:
    missing = [sc["key"] for sc in scenes if sc["text"].strip()
               and not (os.path.exists(apath(sc)) and os.path.getsize(apath(sc)) > 1200)]
    if missing:
        print("!! TTS INCOMPLETE: %d scenes missing audio -> %s" % (len(missing), missing))
        sys.exit(2)

# ---------------- 2. record live ----------------
def record_live():
    todo = [s for s in scenes if s["kind"] == "live" and not (os.path.exists(rpath(s)) and os.path.getsize(rpath(s)) > 5000)]
    if not todo: print("== stage 2: REC (all present) =="); return
    print("== stage 2: REC live", len(todo), "scenes ==")
    srv = subprocess.Popen(["python", os.path.join(SCR, "serve_nocache.py")],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2.5)
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            b = p.chromium.launch(channel="chrome", headless=True)
            for sc in todo:
                it = sc["it"]
                mob = bool(it.get("mobile"))                       # A5-6: tablet/phone responsive view
                vw, vh = (820, 1180) if mob else (1920, 1080)      # narrow portrait -> loads fresh at mobile width
                ctx = b.new_context(viewport={"width":vw,"height":vh},
                                    device_scale_factor=(2 if mob else 1),
                                    record_video_dir=REC, record_video_size={"width":vw,"height":vh})
                ctx.add_init_script(PRELUDE)
                pg = ctx.new_page()
                try:
                    try: pg.goto(BASE+it["url"], wait_until="networkidle", timeout=35000)
                    except Exception: pg.goto(BASE+it["url"], wait_until="load", timeout=35000)
                    pg.wait_for_timeout(900)
                    pg.evaluate("()=>{var t=document.querySelector('.ws-tabhost');if(t)t.style.display='none';}")
                    pg.wait_for_timeout(500)
                    for stmt in [x for x in (it.get("setup") or "").split(";") if x.strip()]:
                        try: pg.evaluate("()=>{ " + stmt + " }")
                        except Exception as e: print("  setup warn", sc["key"], str(e)[:50])
                        pg.wait_for_timeout(750)             # visible pacing between clicks
                    pg.wait_for_timeout(1600)                # settle on the final live state
                    vid = pg.video
                    ctx.close()
                    time.sleep(0.4)
                    src = vid.path()
                    shutil.move(src, rpath(sc))
                    print("  rec", sc["key"])
                except Exception as e:
                    print("  REC FAIL", sc["key"], str(e)[:70])
                    try: ctx.close()
                    except Exception: pass
            b.close()
    finally:
        srv.terminate()
        try: srv.wait(timeout=5)
        except Exception: srv.kill()

record_live()
if REC_ONLY:
    print("== rec-only complete =="); sys.exit(0)

# ---------------- 3. captions (ASS, small deterministic size at 1080p) ----------------
ASS_HEADER = ("[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\nWrapStyle: 2\nScaledBorderAndShadow: yes\n\n"
              "[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n"
              "Style: Def,Arial,30,&H00FFFFFF,&H00FFFFFF,&H001A1108,&H64000000,-1,0,0,0,100,100,0,0,1,2.4,0.9,2,150,150,46,1\n\n"
              "[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")
def ass_ts(t):
    if t < 0: t = 0
    h = int(t//3600); m = int((t%3600)//60); s = t%60
    return "%d:%02d:%05.2f" % (h, m, s)
def write_ass(sc):
    out = spath(sc)
    if os.path.exists(out): return
    text = sc["text"].strip(); adur = sc["adur"]; ev = []
    if text:
        sents = [x.strip() for x in re.split(r"(?<=[.!?])\s+", text) if x.strip()]
        tot = sum(len(x) for x in sents) or 1; t = LEAD; end_cap = LEAD + adur + 0.25
        for s in sents:
            d = max(1.3, adur*len(s)/tot)
            lines = textwrap.wrap(s, 88)
            chunks = [lines[i:i+2] for i in range(0, len(lines), 2)] or [[""]]
            cd = d/len(chunks)
            for ch in chunks:
                ev.append("Dialogue: 0,%s,%s,Def,,0,0,0,,%s" % (ass_ts(t), ass_ts(min(t+cd, end_cap)), "\\N".join(ch)))
                t += cd
    open(out, "w", encoding="utf-8").write(ASS_HEADER + "\n".join(ev) + "\n")

print("== stage 3: captions (ASS) ==")
for sc in scenes: write_ass(sc)

# ---------------- 4. assemble clips ----------------
def assemble(sc):
    out = cpath(sc)
    if os.path.exists(out) and os.path.getsize(out) > 10000: return True
    D = sc["D"]; mp3 = apath(sc)
    subs = "subtitles=%s" % (sc["key"]+".ass")   # ASS carries its own (small) style
    pad = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x0E1520,setsar=1"
    if sc["kind"] == "card":
        vin = ["-loop","1","-t",str(D),"-i", sc["img"]]
        vf = "[0:v]" + pad + "," + subs + "[v]"
    else:
        vin = ["-i", rpath(sc)]
        vf = "[0:v]tpad=stop_mode=clone:stop_duration=9999," + pad + "," + subs + "[v]"
    have_audio = os.path.exists(mp3) and os.path.getsize(mp3) > 1000
    if have_audio:
        af = "[1:a]adelay=%d|%d,apad[a]" % (int(LEAD*1000), int(LEAD*1000))
        fc = vf + ";" + af
        maps = ["-map","[v]","-map","[a]"]
        ain = ["-i", mp3]
    else:
        fc = vf; maps = ["-map","[v]"]; ain = ["-f","lavfi","-i","anullsrc=r=48000:cl=stereo"]; maps += ["-map","1:a"]
    cmd = [FFMPEG,"-y", *vin, *ain, "-filter_complex", fc, *maps, "-t", str(D),
           "-r","25","-c:v","libx264","-pix_fmt","yuv420p","-preset","veryfast","-crf","23",
           "-c:a","aac","-ar","48000","-ac","2","-b:a","160k", out]
    r = subprocess.run(cmd, cwd=SRTD, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if r.returncode != 0:
        print("  CLIP FAIL", sc["key"], r.stderr.decode("utf-8","ignore")[-300:])
        return False
    return True

print("== stage 4: assemble", len(scenes), "clips ==")
okc = 0
for sc in scenes:
    if assemble(sc): okc += 1;
    print("  clip", sc["key"], "ok" if os.path.exists(cpath(sc)) else "MISSING")
print("clips ok:", okc, "/", len(scenes))

# ---------------- 5. concat ----------------
print("== stage 5: concat ==")
listf = os.path.join(ROOT, "_concat.txt")
with open(listf, "w", encoding="utf-8") as f:
    for sc in scenes:
        if os.path.exists(cpath(sc)):
            f.write("file '%s'\n" % cpath(sc).replace("\\","/"))
r = subprocess.run([FFMPEG,"-y","-f","concat","-safe","0","-i", listf, "-c","copy", FINAL],
                   stdout=subprocess.PIPE, stderr=subprocess.PIPE)
if r.returncode != 0:
    print("concat -c copy failed, re-encoding...", r.stderr.decode("utf-8","ignore")[-300:])
    subprocess.run([FFMPEG,"-y","-f","concat","-safe","0","-i", listf,
                    "-r","25","-c:v","libx264","-pix_fmt","yuv420p","-preset","veryfast","-crf","23",
                    "-c:a","aac","-ar","48000","-ac","2", FINAL])
totd = sum(sc["D"] for sc in scenes)
print("DONE ->", FINAL, "| ~%.1f min" % (totd/60))
