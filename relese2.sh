#!/usr/bin/env bash

GIT_TOKEN="64eebb80299ac8ac629291dddb9aecc0a211e5ef"
GH_API="https://api.github.com"
GH_REPO="$GH_API/visa4/thor"
GH_TAGS="$GH_REPO/releases/tags/0.2.0"
AUTH="Authorization: token $GIT_TOKEN"
WGET_ARGS="--content-disposition --auth-no-challenge --no-cookie"

curl -o /dev/null -sH "$AUTH" $GH_REPO || { echo "Error: Invalid repo, token or network issue!";  exit 1; }