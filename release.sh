#!/usr/bin/env zsh
# ------------------------------------------------------------------
#  release.sh – bump the version in package.json, Cargo.toml and
#  src-tauri/tauri.conf.json.
#
#  Usage when executed directly:
#      ./release.sh [--major | --minor]
#          (no flag → patch bump)
#
#  When sourced you can call the function manually:
#      source release.sh
#      release --minor
#
#  Requires:
#      * zsh (4.3+ – the default on macOS)
#      * jq
#
#  The script:
#      • Reads the current SemVer from package.json.
#      • Calculates the new version (major/minor/patch).
#      • Updates:
#          • package.json        → "version"
#          • src-tauri/Cargo.toml→ version = "<new>"
#          • src-tauri/tauri.conf.json → "version"
#
#  All other file content is preserved unchanged.
# ------------------------------------------------------------------

set -euo pipefail   # safe defaults – works in zsh

# ---------- File paths ----------
SCRIPT_DIR="$(cd "$(dirname "${(%):-%x}")" && pwd)"   # ${(%):-%x} → script filename (works when sourced)

PKG_JSON="$SCRIPT_DIR/package.json"
CARGO_TOML="$SCRIPT_DIR/src-tauri/Cargo.toml"
TAURI_CONF_JSON="$SCRIPT_DIR/src-tauri/tauri.conf.json"

# ---------- Helper functions ----------
die() {
  print -P "%F{red}ERROR:%f %1s" "$*" >&2
  exit 1
}

# Read a JSON key using jq (returns raw string)
jq_raw() {
  jq -r "$1" <"$2"
}

# Update a JSON key in place
jq_set() {
  local key=$1 val=$2 file=$3
  jq --arg v "$val" ".${key} = \$v" "$file" >"$file.tmp" && mv "$file.tmp" "$file"
}

# Increment SemVer components
bump_version() {
  local major=$1 minor=$2 patch=$3 type=$4
  case "$type" in
    major) ((major++)); minor=0; patch=0 ;;
    minor) ((minor++)); patch=0 ;;
    *)     ((patch++)) ;;
  esac
  echo "${major}.${minor}.${patch}"
}

# ---------- Detect OS for sed ----------
if [[ "$(uname)" == "Darwin" ]]; then
  # BSD sed – backup suffix is an empty string (no backup)
  SED_INPLACE=(-i '')
else
  # GNU sed – no suffix argument → in‑place edit only
  SED_INPLACE=(-i)
fi

# ---------- Main logic wrapped in a function ----------
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

  print -P "Bumping ${BUMP_TYPE} version..."

  # ---------- Read current version ----------
  CURRENT_VER="$(jq_raw '.version' "$PKG_JSON")"
  if [[ ! $CURRENT_VER =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    die "package.json contains an invalid SemVer: $CURRENT_VER"
  fi

  IFS='.' read -r CUR_MAJOR CUR_MINOR CUR_PATCH <<<"$CURRENT_VER"

  # ---------- Compute new version ----------
  NEW_VER="$(bump_version "$CUR_MAJOR" "$CUR_MINOR" "$CUR_PATCH" "$BUMP_TYPE")"
  print -P "Current: %F{cyan}$CURRENT_VER%f → New: %F{green}$NEW_VER%f"

  # ---------- Update package.json ----------
  jq_set 'version' "$NEW_VER" "$PKG_JSON"
  print -P "Updated %F{yellow}$PKG_JSON%f"

  # ---------- Update Cargo.toml ----------
  if ! grep -qE '^\s*version\s*=\s*"'"$CURRENT_VER"'"' "$CARGO_TOML"; then
    die "Could not find the current version string in $CARGO_TOML"
  fi
  sed "${SED_INPLACE[@]}" -e "s|\"$CURRENT_VER\"|\"$NEW_VER\"|" "$CARGO_TOML"
  print -P "Updated %F{yellow}$CARGO_TOML%f"

  # ---------- Update tauri.conf.json ----------
  if ! grep -qE '"version"\s*:\s*"'"$CURRENT_VER"'"' "$TAURI_CONF_JSON"; then
    die "Could not find the current version string in $TAURI_CONF_JSON"
  fi
  sed "${SED_INPLACE[@]}" -e "s|\"$CURRENT_VER\"|\"$NEW_VER\"|" "$TAURI_CONF_JSON"
  print -P "Updated %F{yellow}$TAURI_CONF_JSON%f"

  print -P "%F{green}Release bump complete.%f"

  print "Building App for iOS"

  yarn tauri ios build --export-method app-store-connect

  print "Uploading App to AppStoreConnect"

#  xcrun altool --upload-app --type ios --file src-tauri/gen/apple/build/arm64/YARM.ipa --apiKey $APPLE_API_KEY --apiIssuer $APPLE_API_ISSUER
#
#  git add .
#  git commit -m "chore: :bookmark: Release $NEW_VER"
#  git tag $NEW_VER
#  git push --tags
}

# ---------- Execute when script is run directly ----------
if [[ "${(%):-%x}" == "$0" ]]; then
  release "$@"
fi

# When sourced, the user can call `release` manually.