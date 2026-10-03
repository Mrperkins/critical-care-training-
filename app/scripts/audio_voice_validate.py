#!/usr/bin/env python3
"""Validate durable premium voice assets before publication.

Expected manifest: public/audio/voice/manifest.json
{
  "assets": [{
    "id": "episode.foo",
    "file": "episode.foo.mp3",
    "transcriptHash": "...",
    "reviewed": true,
    "voice": "...",
    "provider": "...",
    "sha256": "...",
    "durationSeconds": 123.4
  }]
}
"""
from __future__ import annotations
import hashlib, json, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOICE = ROOT / "public" / "audio" / "voice"
LINES = VOICE / "lines.json"
MANIFEST = VOICE / "manifest.json"

def sha(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""): h.update(chunk)
    return h.hexdigest()

def duration(p: Path) -> float:
    r = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",str(p)], capture_output=True,text=True,check=True)
    return float(r.stdout.strip())

def main():
    lines = {x["id"]: x for x in json.loads(LINES.read_text())} if LINES.exists() else {}
    if not MANIFEST.exists():
        print("audio voice manifest absent: no durable production assets to validate")
        return
    m = json.loads(MANIFEST.read_text()); seen=set()
    for a in m.get("assets", []):
        aid=a["id"]; assert aid not in seen, f"duplicate {aid}"; seen.add(aid)
        assert aid in lines, f"{aid}: no canonical transcript"
        assert a["transcriptHash"] == lines[aid]["transcriptHash"], f"{aid}: stale audio; transcript changed"
        p=VOICE / a["file"]; assert p.is_file(), f"{aid}: missing {p.name}"
        assert sha(p) == a["sha256"], f"{aid}: checksum mismatch"
        d=duration(p); assert abs(d-float(a["durationSeconds"])) < 0.25, f"{aid}: duration mismatch"
        assert d > 1, f"{aid}: implausibly short"
        if a.get("published"): assert a.get("reviewed") is True, f"{aid}: published without listening QA"
    print(f"premium voice assets valid: {len(seen)}")

if __name__ == "__main__": main()
