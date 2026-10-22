#!/usr/bin/env bash
# Creates a todo with a random Wikipedia article URL
set -euo pipefail

: "${TODO_BACKEND_URL:?TODO_BACKEND_URL is required, e.g. localhost:3001}"

location=$(curl -sS -o /dev/null -A "random-todo/1.0" -w '%header{location}' https://en.wikipedia.org/wiki/Special:Random)
if [[ -z "$location" ]]; then
  echo "No location header in the Wikipedia response" >&2
  exit 1
fi

# Wikipedia returns a protocol-relative location (//en.wikipedia.org/wiki/...), strip any scheme and use https
url="https://${location#*//}"

base_url="http://$TODO_BACKEND_URL"
body="{\"text\":\"Read $url\"}"

echo "Wikipedia location: $location"
echo "Todo backend base URL: $base_url"
echo "Request body: $body"

# -v logs the whole request and response (headers included) to stderr
curl -v -sS --fail-with-body -X POST -H 'Content-Type: application/json' \
  -d "$body" "$base_url/todos"
echo
