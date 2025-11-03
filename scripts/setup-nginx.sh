#!/bin/bash
# Setup Nginx for RECTOR LABS CORE
# Run this script WITH SUDO (sudo ./scripts/setup-nginx.sh)

set -e

echo "🌐 Setting up Nginx..."

# Create Nginx config
cat > /etc/nginx/sites-available/rectorspace.com << 'EOF'
upstream puma_core {
  server localhost:3000 fail_timeout=0;
}

server {
  listen 80;
  listen [::]:80;
  server_name rectorspace.com www.rectorspace.com;

  location /.well-known/acme-challenge/ {
    root /var/www/html;
  }

  location / {
    root /home/core/core/public;
    try_files $uri @puma_core;
  }

  location @puma_core {
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off;
    proxy_pass http://puma_core;
  }

  location /up {
    access_log off;
    proxy_pass http://puma_core;
  }

  location ~* ^/assets/ {
    root /home/core/core/public;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  error_page 500 502 503 504 /500.html;
  client_max_body_size 10M;
  keepalive_timeout 10;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/rectorspace.com /etc/nginx/sites-enabled/

# Remove default site if exists
rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
nginx -t

# Restart Nginx
systemctl restart nginx

echo ""
echo "✅ Nginx configured!"
echo ""
echo "📋 Test the site:"
echo "   curl -I http://rectorspace.com"
echo ""
echo "Next step: sudo ./scripts/setup-ssl.sh"
echo ""
