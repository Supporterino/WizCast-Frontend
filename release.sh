#!/usr/bin/env zsh
# ------------------------------------------------------------------
#  release.sh – bump the version in package.json, Cargo.toml and
#                src-tauri/tauri.conf.json.
#
#  Usage:
#      ./release.sh [--major | --minor]
#      source release.sh
#      release --minor
#
#  Requires: zsh, jq, sed (BSD or GNU), git, yarn, xcrun
# ------------------------------------------------------------------

set -euo pipefail

# ------------------------------------------------------------
#  Helper: print an error and exit
die() {
  echo "❌  $*" >&2
  exit 1
}

# ------------------------------------------------------------
#  Helper: run a command, log it and die on failure
run() {
  local msg=$1; shift
  echo "▶︎ $msg" >&2
  "$@" || die "❌  Failed: $msg"
}

# ------------------------------------------------------------
#  Verify prerequisites
for cmd in jq sed git yarn xcrun; do
  command -v $cmd >/dev/null || die "❌  Required tool not found: $cmd"
done

# ------------------------------------------------------------
#  File paths
SCRIPT_DIR="$(pwd)"   # works when sourced or executed

PKG_JSON="$SCRIPT_DIR/package.json"
CARGO_TOML="$SCRIPT_DIR/src-tauri/Cargo.toml"
TAURI_CONF_JSON="$SCRIPT_DIR/src-tauri/tauri.conf.json"

# Verify files exist
for f in "$PKG_JSON" "$CARGO_TOML" "$TAURI_CONF_JSON"; do
  [[ -f $f ]] || die "❌  File missing: $f"
done

# ------------------------------------------------------------
#  Helper: read a JSON key (raw string)
jq_raw() {
  jq -r "$1" <"$2"
}

# ------------------------------------------------------------
#  Helper: set a JSON key in place
jq_set() {
  local key=$1 val=$2 file=$3
  run "Updating $file – setting .${key} to $val" \
      jq --arg v "$val" ".${key} = \$v" "$file" >"$file.tmp" && mv "$file.tmp" "$file"
}

# ------------------------------------------------------------
#  Increment SemVer components
bump_version() {
  [[ $# -lt 3 ]] && printf >&2 'usage: %s <major> <minor> <patch> [type]\n' "$0" && return 1

  for v in "$1" "$2" "$3"; do
    [[ $v =~ ^[0-9]+$ ]] || { printf >&2 'error: version components must be integers\n'; return 1; }
  done

  local major=$1 minor=$2 patch=$3 type=${4:-patch}

  case "$type" in
    major) ((major++)); minor=0; patch=0 ;;
    minor) ((minor++)); patch=0 ;;
    patch|default) ((patch++)) ;;
    *) printf >&2 'error: unknown bump type %s\n' "$type"; return 1 ;;
  esac

  printf '%d.%d.%d' "$major" "$minor" "$patch"
}

# ------------------------------------------------------------
#  Detect OS for sed in‑place editing
if [[ "$(uname)" == "Darwin" ]]; then
  SED_INPLACE=(-i '')
else
  SED_INPLACE=(-i)
fi

# ------------------------------------------------------------
release() {
  local BUMP_TYPE=patch   # default
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --major) BUMP_TYPE=major ;;
      --minor) BUMP_TYPE=minor ;;
      *) die "Unknown option: $1" ;;
    esac
    shift
  done

  echo "🔧  Bumping ${BUMP_TYPE} version..."

  # ---------- Read current version ----------
  CURRENT_VER=$(run "Read current version" jq_raw '.version' "$PKG_JSON")
  [[ $CURRENT_VER =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "package.json contains an invalid SemVer: $CURRENT_VER"

  IFS='.' read -r CUR_MAJOR CUR_MINOR CUR_PATCH <<<"$CURRENT_VER"
  echo "🟢  Current: $CUR_MAJOR.$CUR_MINOR.$CUR_PATCH → type: $BUMP_TYPE"

  # ---------- Compute new version ----------
  NEW_VER=$(bump_version "$CUR_MAJOR" "$CUR_MINOR" "$CUR_PATCH" "$BUMP_TYPE")
  echo "🟢  New version: $NEW_VER"

  # ---------- Update package.json ----------
  jq_set 'version' "$NEW_VER" "$PKG_JSON"
  echo "✅  Updated $PKG_JSON"

  # ---------- Update Cargo.toml ----------
  if ! grep -qE '^\s*version\s*=\s*"'"$CURRENT_VER"'"' "$CARGO_TOML"; then
    die "Could not find the current version string in $CARGO_TOML"
  fi
  run "Updating Cargo.toml" \
      sed "${SED_INPLACE[@]}" -e "s|\"$CURRENT_VER\"|\"$NEW_VER\"|" "$CARGO_TOML"
  echo "✅  Updated $CARGO_TOML"

  # ---------- Update tauri.conf.json ----------
  if ! grep -qE '"version"\s*:\s*"'"$CURRENT_VER"'"' "$TAURI_CONF_JSON"; then
    die "Could not find the current version string in $TAURI_CONF.JSON"
  fi
  run "Updating tauri.conf.json" \
      sed "${SED_INPLACE[@]}" -e "s|\"$CURRENT_VER\"|\"$NEW_VER\"|" "$TAURI_CONF_JSON"
  echo "✅  Updated $TAURI_CONF_JSON"

  echo "🎉  Release bump complete."

  # ------------------------------------------------------------
  # Optional: build & upload
  echo "📦  Building App for iOS"
  run "yarn tauri ios build" \
      yarn tauri ios build --export-method app-store-connect

  echo "🚀  Uploading App to AppStoreConnect"
  run "xcrun altool upload" \
      xcrun altool --upload-app --type ios --file src-tauri/gen/apple/build/arm64/wizcast.ipa \
      --apiKey "$APPLE_API_KEY" --apiIssuer "$APPLE_API_ISSUER"

  # ------------------------------------------------------------
  echo "💾  Committing changes"
  run "git add" \
      git add .
  run "git commit" \
      git commit -m "chore: :bookmark: Release $NEW_VER"
  run "git push" \
      git push
}

# ------------------------------------------------------------
release "$@"
