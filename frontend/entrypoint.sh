#!/bin/sh
set -e
[ -z "$REACT_APP_BACKEND_BASE_URL" ] && echo "REACT_APP_BACKEND_BASE_URL is not set" && exit 1

# Replace env vars in JavaScript files
sed -i -e 's|["'\''"]BACKEND_BASE_URL["'\''"]|'\"${REACT_APP_BACKEND_BASE_URL}\"'|g' /usr/share/nginx/html/config.js

echo "Starting Nginx"
nginx -g 'daemon off;'
