#!/bin/sh
set -e
[ -z "$BACKEND_BASE_URL" ] && echo "BACKEND_BASE_URL is not set" && exit 1

# Replace env vars in JavaScript files
sed -i -e 's|["'\''"]BACKEND_BASE_URL["'\''"]|'\"${BACKEND_BASE_URL}\"'|g' /usr/share/nginx/html/config.js

echo "Starting Nginx"
nginx -g 'daemon off;'
