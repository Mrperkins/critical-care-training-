#!/usr/bin/env python3
"""Import explicitly approved public voice URLs into project-owned durable assets.

This is an engineering ingest step, NOT clinical/listening approval. Imported assets remain
reviewed=false and published=false until a human listening + clinical review is recorded.
"""
from __future__ import annotations
import hashlib, html, json, re, subprocess, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOICE = ROOT / "public" / "audio" / "voice"
REQ = VOICE / "import.json"
LINES = VOICE / "lines.json"
MANIFEST = VOICE / "manifest.json"

def sha256(p: Path) -> str:
    h=hashlib.sha256()
    with p.open("rb") as f:
        for b in iter(lambda:f.read(1024*1024), b""): h.update(b)
    return h.hexdigest()

def duration(p: Path) -> float:
    r=subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",str(p)],capture_output=True,text=True,check=True)
    return round(float(r.stdout.strip()),3)

def main():
    req=json.loads(REQ.read_text())
    lines={x["id"]:x for x in json.loads(LINES.read_text())}
    old=json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {"assets":[]}
    assets={a["id"]:a for a in old.get("assets",[])}
    for item in req.get("assets",[]):
        aid=item["id"]
        if aid not in lines: raise SystemExit(f"{aid}: no canonical transcript in lines.json")
        name=item.get("file") or aid.replace("/","_")+".mp3"
        if not name.endswith(".mp3"): raise SystemExit(f"{aid}: MP3 destination required")
        out=VOICE/name
        print("fetch", aid, "->", name, flush=True)
        rq=urllib.request.Request(item["url"],headers={"User-Agent":"critical-care-audio-import/1.0"})
        with urllib.request.urlopen(rq,timeout=60) as r:
            data=r.read()
            ctype=(r.headers.get("content-type") or "").lower()
            final_url=r.geturl()
        if data[:3] != b"ID3" and data[:2] not in (b"\xff\xfb",b"\xff\xf3",b"\xff\xf2"):
            if "html" in ctype:
                text=html.unescape(data.decode("utf-8","ignore"))
                candidates=re.findall(r"""https?://[^"'<>\\s]+(?:\\.mp3|/audio/[^"'<>\\s]+)[^"'<>\\s]*""",text,re.I)
                candidates += [urllib.parse.urljoin(final_url,x) for x in re.findall(r"""(?:src|href)=["']([^"']+(?:\\.mp3|/audio/[^"']+))["']""",text,re.I)]
                candidates=list(dict.fromkeys(candidates))
                resolved=False
                for candidate in candidates[:12]:
                    try:
                        rq2=urllib.request.Request(candidate,headers={"User-Agent":"critical-care-audio-import/1.0"})
                        with urllib.request.urlopen(rq2,timeout=60) as rr:
                            d2=rr.read(); ct2=(rr.headers.get("content-type") or "").lower()
                        if d2[:3] == b"ID3" or d2[:2] in (b"\xff\xfb",b"\xff\xf3",b"\xff\xf2"):
                            print("resolved HTML audio page ->", candidate, flush=True)
                            data=d2; ctype=ct2; resolved=True; break
                    except Exception as exc:
                        print("candidate failed", candidate, type(exc).__name__, flush=True)
                if not resolved:
                    snippet=re.sub(r"\\s+"," ",text)[:1200]
                    raise SystemExit(f"{aid}: HTML page did not expose a raw MP3; page snippet: {snippet}")
            else:
                raise SystemExit(f"{aid}: response is not an MP3 (content-type {ctype})")
        if len(data)<2048: raise SystemExit(f"{aid}: implausibly small asset ({len(data)} bytes)")
        out.write_bytes(data)
        d=duration(out)
        if d<1 or d>180: raise SystemExit(f"{aid}: implausible duration {d}s")
        assets[aid]={
            "id":aid,
            "file":name,
            "transcriptHash":lines[aid]["transcriptHash"],
            "reviewed":False,
            "published":False,
            "voice":item.get("voice","Natural clinical narrator prototype"),
            "provider":item.get("provider","AI Voice Generator"),
            "sha256":sha256(out),
            "durationSeconds":d,
            "sourceUrl":item["url"],
            "note":"Durable imported prototype; requires listening + clinical review before publication."
        }
    MANIFEST.write_text(json.dumps({"assets":sorted(assets.values(),key=lambda x:x["id"])},indent=2)+"\n")
    print("imported",len(req.get("assets",[])),"assets; manifest",len(assets))

if __name__=="__main__": main()
