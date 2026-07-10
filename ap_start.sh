#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Prefer Docker Compose v2 (docker compose) — v1 has ContainerConfig bugs on newer Docker
if docker compose version &>/dev/null; then
  DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &>/dev/null; then
  DOCKER_COMPOSE="docker-compose"
else
  echo -e "${RED}Error: docker compose is not installed.${NC}"
  exit 1
fi

echo -e "${GREEN}Coridor — Starting Anchor Platform${NC}"

# Load secrets
if [ ! -f .env.secrets ]; then
  echo -e "${RED}Missing .env.secrets — copy .env.secrets.example and fill in your keys${NC}"
  exit 1
fi
set -a
source .env.secrets
set +a

if [ -z "$SECRET_SEP10_SIGNING_SEED" ]; then
  echo -e "${RED}SECRET_SEP10_SIGNING_SEED must be set in .env.secrets${NC}"
  exit 1
fi

if [ -z "$SECRET_DISTRIBUTION_SEED" ]; then
  echo -e "${RED}SECRET_DISTRIBUTION_SEED must be set in .env.secrets${NC}"
  exit 1
fi

# Derive SEP-10 public key for stellar.toml
if command -v stellar &>/dev/null; then
  HOST_SEP10_ACCOUNT=$(echo "$SECRET_SEP10_SIGNING_SEED" | stellar keys address 2>/dev/null || true)
fi
if [ -z "$HOST_SEP10_ACCOUNT" ]; then
  echo -e "${YELLOW}Warning: could not derive SEP-10 public key via stellar CLI${NC}"
  echo -e "${YELLOW}Set HOST_SEP10_ACCOUNT in .env.secrets if stellar.toml SIGNING_KEY is wrong${NC}"
  HOST_SEP10_ACCOUNT="${HOST_SEP10_ACCOUNT:-GCACTDNRY4V7QD4M6FSPGLCR5BNANSLBHIKACRTPSZ4B75NKL66QGSVS}"
fi

echo -e "${YELLOW}Generating stellar.toml...${NC}"
sed "s|\${HOST_SEP10_ACCOUNT}|$HOST_SEP10_ACCOUNT|g" \
  config/stellar.localhost.toml.template > config/stellar.localhost.toml

echo -e "${GREEN}Distribution account:${NC} ${DISTRIBUTION_ACCOUNT:-GCACTDNRY4V7QD4M6FSPGLCR5BNANSLBHIKACRTPSZ4B75NKL66QGSVS}"
echo -e "${GREEN}SEP-10 signing key:${NC}     $HOST_SEP10_ACCOUNT"

echo -e "${YELLOW}Installing coridor-server deps on host (faster than npm inside Docker)...${NC}"
if [ -f coridor-server/package.json ]; then
  (cd coridor-server && npm install --omit=dev) || {
    echo -e "${RED}npm install failed on host — check your internet connection${NC}"
    exit 1
  }
fi

$DOCKER_COMPOSE down --remove-orphans 2>/dev/null || true
$DOCKER_COMPOSE up -d --build

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Coridor is starting!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  SEP Server:      http://localhost:8082"
echo "  Platform API:    http://localhost:8086"
echo "  Coridor Server:  http://localhost:8091"
echo ""
echo "  Test TOML:  curl http://localhost:8082/.well-known/stellar.toml"
echo "  Health:     curl http://localhost:8091/health"
echo ""
echo "  Demo Wallet: https://demo-wallet.stellar.org"
echo "    Home domain: localhost:8082"
echo "    Asset: USDC / GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56"
echo ""
echo "Logs: $DOCKER_COMPOSE logs -f coridor-server platform"
