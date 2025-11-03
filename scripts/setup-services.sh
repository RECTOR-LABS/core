#!/bin/bash
# Setup systemd services for RECTOR LABS CORE
# Run this script WITH SUDO (sudo ./scripts/setup-services.sh)

set -e

echo "⚙️  Setting up systemd services..."

# Copy service files
cp /home/core/core/docs/systemd/core-puma.service /etc/systemd/system/
cp /home/core/core/docs/systemd/core-solidqueue.service /etc/systemd/system/

# Reload systemd
systemctl daemon-reload

# Enable services (start on boot)
systemctl enable core-puma
systemctl enable core-solidqueue

# Start services
systemctl start core-puma
systemctl start core-solidqueue

# Wait a moment for services to start
sleep 3

echo ""
echo "✅ Services started!"
echo ""

# Show status
echo "📊 Service status:"
echo ""
systemctl status core-puma --no-pager -l
echo ""
systemctl status core-solidqueue --no-pager -l

echo ""
echo "📋 Test the application:"
echo "   curl http://localhost:3000/up"
echo ""
curl -f http://localhost:3000/up && echo "✅ Application is healthy!" || echo "❌ Application health check failed"
echo ""
echo "Next step: sudo ./scripts/setup-nginx.sh"
echo ""
