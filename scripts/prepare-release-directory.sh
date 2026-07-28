#!/usr/bin/env bash
set -euo pipefail

app_root="${1:?Application root is required}"
release_sha="${2:?Release SHA is required}"

case "${app_root}" in
  /home/*/goldvault-app) ;;
  *)
    echo "Refusing cleanup outside a GoldVault application root: ${app_root}" >&2
    exit 1
    ;;
esac

case "${release_sha}" in
  *[!0-9a-f]* | "")
    echo "Refusing invalid release SHA: ${release_sha}" >&2
    exit 1
    ;;
esac

releases_root="${app_root}/releases"
current_link="${app_root}/current"

if [ ! -L "${current_link}" ]; then
  echo "Refusing cleanup because the current release symlink is missing: ${current_link}" >&2
  exit 1
fi

current_dir="$(readlink -f "${current_link}")"
case "${current_dir}" in
  "${releases_root}/"*) ;;
  *)
    echo "Refusing cleanup because current points outside releases: ${current_dir}" >&2
    exit 1
    ;;
esac

if [ ! -d "${current_dir}" ]; then
  echo "Refusing cleanup because the current release directory is missing: ${current_dir}" >&2
  exit 1
fi

mkdir -p "${releases_root}" "${app_root}/tmp"

echo "Preserving live release: ${current_dir}"
while IFS= read -r -d '' candidate; do
  candidate_dir="$(readlink -f "${candidate}")"
  if [ "${candidate_dir}" = "${current_dir}" ]; then
    continue
  fi

  echo "Removing obsolete or incomplete release: ${candidate_dir}"
  rm -rf -- "${candidate}"
done < <(find "${releases_root}" -mindepth 1 -maxdepth 1 -type d -print0)

release_dir="${releases_root}/${release_sha}"
mkdir -p "${release_dir}"

echo "Release storage after cleanup:"
du -sh "${releases_root}" 2>/dev/null || true
df -h "${app_root}" 2>/dev/null || true
