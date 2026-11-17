#!/usr/bin/env python3
"""
Local development server with HTTP Range request support.
Required for video seeking in the browser.

Usage:
    cd "/Users/alanb/Documents/SOAR Model Suite Demo Platform"
    python3 serve.py

Then open:
    http://localhost:8000/SurgAI%20Forge%20Website%20Prototype/For%20Surgeons.dc.html
"""

import http.server
import os
import re
import socketserver
import threading

PORT = 8000
CHUNK_SIZE = 256 * 1024  # 256 KB chunks


class RangeHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """SimpleHTTPRequestHandler extended with HTTP Range request (HTTP 206) support."""

    protocol_version = "HTTP/1.1"

    def send_range_response(self, path, start, end, total):
        length = end - start + 1
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Range', f'bytes {start}-{end}/{total}')
        self.send_header('Content-Length', str(length))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Connection', 'keep-alive')
        self.end_headers()
        try:
            with open(path, 'rb') as f:
                f.seek(start)
                remaining = length
                while remaining > 0:
                    chunk = f.read(min(CHUNK_SIZE, remaining))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    remaining -= len(chunk)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_GET(self):
        path = self.translate_path(self.path)
        if not os.path.isfile(path):
            super().do_GET()
            return

        total = os.path.getsize(path)
        range_header = self.headers.get('Range')

        if not range_header:
            self.send_response(200)
            self.send_header('Content-Type', self.guess_type(path))
            self.send_header('Content-Length', str(total))
            self.send_header('Accept-Ranges', 'bytes')
            self.send_header('Cache-Control', 'no-store, must-revalidate')
            self.send_header('Connection', 'keep-alive')
            self.end_headers()
            try:
                with open(path, 'rb') as f:
                    while True:
                        chunk = f.read(CHUNK_SIZE)
                        if not chunk:
                            break
                        self.wfile.write(chunk)
            except (BrokenPipeError, ConnectionResetError):
                pass
            return

        # Handle suffix range: bytes=-N  →  last N bytes
        suffix_match = re.match(r'bytes=-(\d+)$', range_header)
        if suffix_match:
            n = int(suffix_match.group(1))
            start = max(0, total - n)
            end = total - 1
            self.send_range_response(path, start, end, total)
            return

        m = re.match(r'bytes=(\d*)-(\d*)', range_header)
        if not m:
            self.send_error(400, 'Invalid Range header')
            return

        start_str, end_str = m.group(1), m.group(2)
        start = int(start_str) if start_str else 0
        end   = int(end_str)   if end_str   else total - 1
        end   = min(end, total - 1)

        if start > end:
            self.send_error(416, 'Range Not Satisfiable')
            return

        self.send_range_response(path, start, end, total)

    def log_message(self, fmt, *args):
        pass

    def log_request(self, code='-', size='-'):
        import sys, datetime
        try:
            path = self.path
        except Exception:
            path = '?'
        rng = self.headers.get('Range', '') if hasattr(self, 'headers') else ''
        tag = f'RANGE={rng}' if rng else 'FULL'
        if '.mp4' in path or 'manifest' in path or '.dc.html' in path:
            print(f'{datetime.datetime.now().strftime("%H:%M:%S")} [{code}] {tag} {path}', file=sys.stderr, flush=True)


class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with ThreadedTCPServer(('', PORT), RangeHTTPRequestHandler) as httpd:
        print(f'SurgAI Forge local server running at http://localhost:{PORT}')
        print(f'Demo: http://localhost:{PORT}/SurgAI%20Forge%20Website%20Prototype/For%20Surgeons.dc.html')
        print('Press Ctrl+C to stop.')
        httpd.serve_forever()
