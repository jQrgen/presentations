import base64, json, os, subprocess, sys, pathlib
# Usage: python gl_commit.py <project_id> <branch> <message> <dir> [--update]
pid, branch, msg, root = sys.argv[1:5]
update = "--update" in sys.argv
prune = "--prune" in sys.argv
root = pathlib.Path(root)
existing = set()
if update:
    page = 1
    while True:
        out = subprocess.run(["glab", "api", f"projects/{pid}/repository/tree?ref={branch}&recursive=true&per_page=100&page={page}"], capture_output=True, text=True)
        items = json.loads(out.stdout or "[]")
        if not items: break
        existing |= {i["path"] for i in items if i["type"] == "blob"}
        page += 1
actions = []
for p in sorted(root.rglob("*")):
    if p.is_dir() or "node_modules" in p.parts or p.name == ".DS_Store": continue
    rel = p.relative_to(root).as_posix()
    data = p.read_bytes()
    actions.append({"action": "update" if rel in existing else "create", "file_path": rel,
                    "content": base64.b64encode(data).decode(), "encoding": "base64"})
local = {a["file_path"] for a in actions}
if prune:
    for rel in sorted(existing - local):
        actions.append({"action": "delete", "file_path": rel})
payload = {"branch": branch, "commit_message": msg, "actions": actions}
pathlib.Path("gl_payload.json").write_text(json.dumps(payload))
print("files:", len(actions), "payload MB:", round(os.path.getsize("gl_payload.json") / 1e6, 1))
res = subprocess.run(["glab", "api", f"projects/{pid}/repository/commits", "-X", "POST", "--input", "gl_payload.json"], capture_output=True, text=True)
try:
    j = json.loads(res.stdout)
    print("commit:", j.get("id", "?")[:10], j.get("web_url", res.stdout[:300]))
except Exception:
    print("response:", res.stdout[:500], res.stderr[:500])
