#!/usr/bin/env bash
# Publish only this demo prefix; retain older assets for cached entry pages.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
mode="${1:---plan-only}"
case "$mode" in --plan-only|--apply|--verify-only) ;; *) echo "Usage: $0 [--plan-only|--apply|--verify-only]" >&2; exit 2 ;; esac
[[ $# -le 1 ]] || { echo 'Unexpected arguments' >&2; exit 2; }
export AWS_REGION=ap-southeast-1
bucket=kiwiai.org
prefix=demo
distribution_id=E2CC3D6RKJ4OQA
if [[ "$mode" == --verify-only ]]; then exec python3 scripts/check-deployment.py --live https://kiwiai.org/demo/index.html; fi
python3 scripts/check-deployment.py
aws sts get-caller-identity
if [[ "$mode" == --plan-only ]]; then
  aws s3 sync dist/ "s3://$bucket/$prefix/" --dryrun --no-progress
  exit 0
fi
aws s3 sync dist/ "s3://$bucket/$prefix/" --exclude index.html --no-progress --cache-control 'public, max-age=300, must-revalidate'
aws s3 cp dist/index.html "s3://$bucket/$prefix/index.html" --no-progress --content-type 'text/html; charset=utf-8' --cache-control 'no-cache, max-age=0, must-revalidate'
if invalidation_id="$(aws cloudfront create-invalidation --distribution-id "$distribution_id" --paths '/demo' '/demo/*' --query Invalidation.Id --output text)"; then
  aws cloudfront wait invalidation-completed --distribution-id "$distribution_id" --id "$invalidation_id"
else
  echo 'Upload complete; cache invalidation unavailable. Assets expire within five minutes. Verification will fail if cached content is stale; rerun --verify-only after expiry.' >&2
fi
python3 scripts/check-deployment.py --live https://kiwiai.org/demo/index.html
