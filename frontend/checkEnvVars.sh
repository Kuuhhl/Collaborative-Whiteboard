#!/bin/sh
[ -z "$BACKEND_BASE_URL" ] && echo "BACKEND_BASE_URL is not set" && exit 1
echo 'All required environment variables are set'