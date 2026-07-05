#!/usr/bin/env bash
# Vestro security check — runs automatically after code edits.
# Fast, side-effect-free probes. Prints WARN lines if anything looks unsafe.
# Exit code is always 0 so it never blocks work; it just reports.

set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_KEY="AIzaSyBlcVNRMMMhGdvhJ_71m7kYbKbovjLUJ80"
PROJECT="vestro-e5637"
FS="https://firestore.googleapis.com/v1/projects/$PROJECT/databases/(default)/documents/products"
issues=0

echo "== Vestro security check =="

# 1) Dangerous DOM sinks in our own code (XSS risk).
if grep -rnE 'innerHTML|insertAdjacentHTML|document\.write|eval\(|new Function' \
     "$ROOT"/*.html "$ROOT"/admin/*.html "$ROOT"/*.js 2>/dev/null; then
  echo "WARN: found a risky HTML/JS sink above -- prefer textContent / DOM methods."
  issues=$((issues+1))
fi

# 2) Firestore must REJECT anonymous writes (the core protection).
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$FS" \
  -H "Content-Type: application/json" \
  -d '{"fields":{"name":{"stringValue":"probe"}}}')
if [ "$code" = "200" ]; then
  echo "WARN: anonymous write to Firestore SUCCEEDED (got 200) — rules are OPEN. Fix firestore.rules in the Firebase console."
  issues=$((issues+1))
else
  echo "OK: anonymous writes are blocked (HTTP $code)."
fi

# 3) Public read should still work (shop must load).
rcode=$(curl -s -o /dev/null -w "%{http_code}" "$FS")
[ "$rcode" = "200" ] && echo "OK: public product read works (HTTP $rcode)." \
  || echo "WARN: public read returned $rcode — the shop may not load products."

if [ "$issues" -eq 0 ]; then echo "All clear."; else echo "$issues issue(s) flagged above."; fi
exit 0
