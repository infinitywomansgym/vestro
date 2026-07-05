#!/usr/bin/env python
"""PostToolUse hook: after an edit to Vestro site code, run the security
check and, only if it flags something, feed the result back to Claude.

Reads the hook JSON on stdin. Stays silent (no output) when the edited file
isn't site code or when the check is all-clear, so it never adds noise.
"""
import json, os, subprocess, sys, re

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

fp = (data.get("tool_input") or {}).get("file_path") or ""
fp_norm = fp.replace("\\", "/").lower()

# Only care about Vestro site code files.
is_vestro = "vestro" in fp_norm
is_code = bool(re.search(r"\.(html|js|css)$", fp_norm)) or fp_norm.endswith("firestore.rules")
if not (is_vestro and is_code):
    sys.exit(0)

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
try:
    # Run from the repo root with a POSIX-relative path so the script's
    # own $0-based directory resolution works under Git Bash on Windows.
    out = subprocess.run(
        ["bash", "scripts/security-check.sh"],
        cwd=root, capture_output=True, text=True, timeout=45
    ).stdout
except Exception as e:
    out = f"security-check could not run: {e}"

if "WARN" in out:
    msg = "SECURITY CHECK flagged issues after this edit — review and fix:\n" + out
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PostToolUse",
            "additionalContext": msg,
        }
    }))
sys.exit(0)
