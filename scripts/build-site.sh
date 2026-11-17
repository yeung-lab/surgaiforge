#!/usr/bin/env bash
# Builds the public surgaiforge.org site into _site/ with clean URLs.
# Source pages stay in "SOAR Model Suite Demo Platform/SurgAI Forge Website Prototype".
# Run from the repo root:  bash scripts/build-site.sh
set -euo pipefail

SRC="SOAR Model Suite Demo Platform/SurgAI Forge Website Prototype"
OUT="_site"

rm -rf "$OUT"
mkdir -p "$OUT"

# Static assets used by the pages
cp -R "$SRC/assets" "$SRC/demo-data" "$SRC/mint-demo" "$SRC/support.js" "$OUT/"
cp CNAME "$OUT/" 2>/dev/null || true

# Internal Gantt view keeps its existing path
[ -d "SurgAI Forge Gantt Chart" ] && cp -R "SurgAI Forge Gantt Chart" "$OUT/"

# "Source name|clean slug" (empty slug = homepage)
PAGES=(
  "SurgAI Forge Homepage|"
  "About Us|about"
  "Open Resources|open-resources"
  "For Surgeons|for-surgeons"
  "For Computer Scientists|for-computer-scientists"
  "Papers|papers"
  "Support|support"
  "Privacy|privacy"
  "Terms|terms"
)

# Build one sed program that rewrites every page link to its clean URL
SED_ARGS=()
for entry in "${PAGES[@]}"; do
  name="${entry%%|*}"; slug="${entry#*|}"
  enc="${name// /%20}"
  # ../X.dc.html, /X.dc.html and X.dc.html all become /slug
  SED_ARGS+=(-e "s#\(\.\./\)\{0,1\}/\{0,1\}${enc}\.dc\.html#/${slug}#g")
done

for entry in "${PAGES[@]}"; do
  name="${entry%%|*}"; slug="${entry#*|}"
  dest="$OUT/${slug:-index}.html"
  sed "${SED_ARGS[@]}" "$SRC/${name}.dc.html" > "$dest"
done

# MINT demo was built for a server rooted at "SOAR Model Suite Demo Platform";
# point its absolute paths at the site root instead.
find "$OUT/mint-demo" -maxdepth 2 -type f \( -name '*.html' -o -name '*.js' -o -name '*.css' \) -print0 |
  while IFS= read -r -d '' f; do
    sed -i \
      -e 's#/SurgAI Forge Website Prototype/#/#g' \
      -e 's#/SurgAI%20Forge%20Website%20Prototype/#/#g' \
      "${SED_ARGS[@]}" "$f"
  done

# Redirect stubs so the old long URLs keep working
OLD="$OUT/SOAR Model Suite Demo Platform/SurgAI Forge Website Prototype"
mkdir -p "$OLD"
for entry in "${PAGES[@]}"; do
  name="${entry%%|*}"; slug="${entry#*|}"
  cat > "$OLD/${name}.dc.html" <<EOF
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>SurgAI Forge</title>
<meta http-equiv="refresh" content="0; url=/${slug}"><link rel="canonical" href="https://surgaiforge.org/${slug}">
<script>location.replace("/${slug}" + location.hash)</script></head>
<body><p>Moved to <a href="/${slug}">surgaiforge.org/${slug}</a>.</p></body></html>
EOF
done

touch "$OUT/.nojekyll"
echo "Built $(find "$OUT" -type f | wc -l) files into $OUT/"
