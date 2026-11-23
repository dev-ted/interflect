"""Tiny one-shot receiver: POST body -> file given in ?out=... (must be under media/)."""
import http.server, pathlib, urllib.parse, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
class H(http.server.BaseHTTPRequestHandler):
    def cors(self):
        self.send_header("Access-Control-Allow-Origin", "https://elevenlabs.io")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Allow-Private-Network", "true")
    def do_OPTIONS(self):
        self.send_response(204); self.cors(); self.end_headers()
    def do_GET(self):
        page = b"""<!doctype html><title>receiver</title><p id=s>waiting</p><script>
(async () => {
  const s = document.getElementById('s');
  if (!window.name.startsWith('{')) { s.textContent = 'no payload'; return; }
  const {out, b64, back} = JSON.parse(window.name); window.name = '';
  const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const t = await (await fetch('/?out=' + encodeURIComponent(out), {method: 'POST', body: bin})).text();
  s.textContent = 'saved ' + out + ' ' + t + ' bytes';
  document.title = 'saved ' + t;
})();
</script>"""
        self.send_response(200); self.send_header("Content-Type", "text/html"); self.end_headers(); self.wfile.write(page)
    def do_POST(self):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        out = (ROOT / q["out"][0]).resolve()
        assert ROOT in out.parents and out.suffix == ".mp3"
        data = self.rfile.read(int(self.headers["Content-Length"]))
        out.parent.mkdir(parents=True, exist_ok=True); out.write_bytes(data)
        self.send_response(200); self.cors(); self.end_headers(); self.wfile.write(f"{len(data)}".encode())
        print("wrote", out, len(data), flush=True)
http.server.HTTPServer(("127.0.0.1", 8765), H).serve_forever()
