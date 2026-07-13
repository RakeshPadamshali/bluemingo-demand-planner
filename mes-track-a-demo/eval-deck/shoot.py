# -*- coding: utf-8 -*-
# Capture one PNG per Section-A evaluation point using headless system Chrome (Playwright, channel='chrome').
import os, sys, time, subprocess
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(__file__))
import shots

OUT = os.path.join(os.path.dirname(__file__), "img")
SCR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))   # scratchpad (holds serve_nocache.py)
os.makedirs(OUT, exist_ok=True)

# helpers injected on every page (window.__x) — used by per-item setup strings in shots.py
PRELUDE = r"""
window.__see = function(t){ var el=[].slice.call(document.querySelectorAll('*')).filter(function(e){return e.children.length<5 && e.textContent && e.textContent.trim().indexOf(t)>=0;})[0]; if(el) el.scrollIntoView({block:'center'}); };
window.__tab = function(t){ var re=new RegExp(t,'i'); var el=[].slice.call(document.querySelectorAll('.bm-tab')).filter(function(e){return re.test(e.textContent);})[0]; if(el) el.click(); return !!el; };
window.__btn = function(t){ var re=new RegExp(t,'i'); var b=[].slice.call(document.querySelectorAll('button')).filter(function(e){return re.test(e.textContent) && !e.disabled;})[0]; if(b){ b.click(); return true;} return false; };
window.__btnRow = function(t){ var re=new RegExp(t,'i'); var rows=[].slice.call(document.querySelectorAll('tr')); var r=rows.filter(function(x){return re.test(x.textContent);})[0]; if(r){ var b=[].slice.call(r.querySelectorAll('button')).filter(function(x){return /run now|send|receive|trigger/i.test(x.textContent);})[0]; if(b){ b.click(); return true;} } return false; };
window.__call = function(fn){ try{ if(typeof window[fn]==='function'){ window[fn](); return true;} }catch(e){} return false; };
window.__seeSel = function(sel){ try{ var el=document.querySelector(sel); if(el) el.scrollIntoView({block:'center'}); return !!el; }catch(e){ return false; } };
window.__openDG = function(){ try{ if(typeof openDispo==='function'){ openDispo(8); var dt=document.getElementById('dType'); if(dt){ dt.value='Downgrade'; if(typeof dispoChange==='function') dispoChange(); } return true; } }catch(e){} return false; };
"""

def shoot():
    ok, warn = [], []
    only = set(sys.argv[1:])                      # optional: re-shoot only these ids
    items = [it for it in shots.ITEMS if not only or it["id"] in only]
    srv = subprocess.Popen(["python", os.path.join(SCR, "serve_nocache.py")],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2.5)
    try:
      with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        for it in items:
            iid = it["id"]
            mobile = it.get("mobile")
            vp = {"width": 400, "height": 860} if mobile else {"width": 1600, "height": 900}
            ctx = browser.new_context(viewport=vp, device_scale_factor=2)
            ctx.add_init_script(PRELUDE)
            pg = ctx.new_page()
            try:
                try:
                    pg.goto(shots.BASE + it["url"], wait_until="networkidle", timeout=35000)
                except Exception:
                    pg.goto(shots.BASE + it["url"], wait_until="load", timeout=35000)
                pg.wait_for_timeout(500)
                # clean chrome: hide the workspace tab strip on standalone pages
                pg.evaluate("()=>{var t=document.querySelector('.ws-tabhost'); if(t) t.style.display='none';}")
                setup = (it.get("setup") or "").strip()
                if setup:
                    try:
                        pg.evaluate("()=>{ " + setup + " }")
                    except Exception as e:
                        warn.append((iid, "setup:" + str(e)[:70]))
                pg.wait_for_timeout(950)
                path = os.path.join(OUT, iid + ".png")
                pg.screenshot(path=path)
                ok.append(iid)
                print("shot", iid, "->", os.path.basename(path))
            except Exception as e:
                warn.append((iid, "FAIL:" + str(e)[:70]))
                print("FAIL", iid, str(e)[:90])
            finally:
                ctx.close()
        browser.close()
      print("\nDONE: %d shots, %d setup-warnings" % (len(ok), len(warn)))
      for w in warn:
        print("  warn", w[0], w[1])
    finally:
      srv.terminate()
      try: srv.wait(timeout=5)
      except Exception: srv.kill()

if __name__ == "__main__":
    shoot()
