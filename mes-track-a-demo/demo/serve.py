#!/usr/bin/env python3
"""Serve this folder as a single-page app with clean routes (no .html / no ?tab in the URL).

Any extensionless path (e.g. /scheduling, /quality/inspection) falls back to index.html, so
deep-links and browser refresh keep working. Real files (*.html, *.js, *.css, fonts) are served
as-is, so the iframe modules still load.

    python serve.py [port]        # default 8080  ->  http://localhost:8080/
"""
import http.server
import functools
import os
import sys
from urllib.parse import urlsplit

DIR = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080


class SPAHandler(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.0"  # no keep-alive -> no stalled single connection blocking others

    def send_head(self):
        path = urlsplit(self.path).path
        fs = self.translate_path(self.path)
        # SPA fallback: an extensionless route that is not a real file -> serve the app shell.
        if not os.path.exists(fs) and "." not in os.path.basename(path.rstrip("/")):
            self.path = "/index.html"
        return super().send_head()

    def end_headers(self):
        # Vendored fonts/libs cache for a week; everything else stays dev-fresh.
        self.send_header("Cache-Control", "public, max-age=604800" if "/vendor/" in self.path else "no-store")
        super().end_headers()

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    handler = functools.partial(SPAHandler, directory=DIR)
    httpd = http.server.ThreadingHTTPServer(("", PORT), handler)
    print("MES demo running as an app:  http://localhost:%d/" % PORT)
    print("(clean routes: /scheduling, /quality/inspection, /reports, ...  -  Ctrl+C to stop)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.shutdown()
