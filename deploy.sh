#!/bin/bash

# ============================================
# Plebiq Deployment Script
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Plebiq Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"

# Step 1: Navigate to project directory
echo -e "${YELLOW}📁 Navigating to /var/www/plebiq...${NC}"
cd /var/www/plebiq

# Step 2: Pull latest code
echo -e "${YELLOW}📦 Pulling latest code from GitHub...${NC}"
git pull origin main

# Step 3: Check for changes in docker-compose or Dockerfile
echo -e "${YELLOW}🔍 Checking for changes...${NC}"
if git diff --name-only HEAD@{1} HEAD | grep -E "(Dockerfile|docker-compose.yml|.env.production)"; then
    echo -e "${YELLOW}⚡ Build files changed - will rebuild with --no-cache${NC}"
    REBUILD_FLAG="--no-cache"
else
    echo -e "${GREEN}✅ No build file changes - using cache${NC}"
    REBUILD_FLAG=""
fi

# Step 4: Stop and remove old containers
echo -e "${YELLOW}🛑 Stopping old containers...${NC}"
docker compose down

# Step 5: Build and start
echo -e "${YELLOW}🏗️ Building and starting containers...${NC}"
if [ -n "$REBUILD_FLAG" ]; then
    docker compose build $REBUILD_FLAG
else
    docker compose build
fi
docker compose up -d

# Step 6: Wait for container to be healthy
echo -e "${YELLOW}⏳ Waiting for container to start...${NC}"
sleep 5

# Step 7: Check container status
echo -e "${YELLOW}🔍 Checking container status...${NC}"
if docker ps | grep -q plebiq-app; then
    echo -e "${GREEN}✅ Plebiq container is running!${NC}"
else
    echo -e "${RED}❌ Plebiq container is NOT running!${NC}"
    echo -e "${RED}Check logs: docker logs plebiq-app${NC}"
    exit 1
fi

# Step 8: Show logs
echo -e "${YELLOW}📋 Last 20 lines of logs:${NC}"
docker logs plebiq-app --tail 20

# Step 9: Test the app
echo -e "${YELLOW}🧪 Testing the app...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo -e "${GREEN}✅ App is responding on http://localhost:3000${NC}"
else
    echo -e "${RED}⚠️ App is not responding on http://localhost:3000${NC}"
fi

# Step 10: Reload nginx (just in case)
echo -e "${YELLOW}🔄 Reloading nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${BLUE}🌐 Access your app at: https://plebiq.com${NC}"
echo -e "${BLUE}========================================${NC}"

# Show running containers
echo -e "${YELLOW}📋 Running containers:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(NAMES|plebiq)"