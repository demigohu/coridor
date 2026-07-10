# Deploy Coridor ke VPS Ubuntu 24.04

Panduan deploy anchor **Coridor** (Anchor Platform + coridor-server) ke VPS production/staging dengan HTTPS, domain publik, dan webhook Xendit.

## Arsitektur

```
Internet
   │
   ├─ sep.YOURDOMAIN.com  ──► Nginx ──► platform:8080   (SEP-24, auth, stellar.toml)
   │
   └─ api.YOURDOMAIN.com  ──► Nginx ──► coridor-server:8091 (widget, rate, webhook Xendit)

Internal (Docker network):
  platform ◄──► coridor-server ◄──► postgres + kafka
```

| Service | Port internal | Publik (via Nginx) |
|---------|---------------|---------------------|
| Anchor Platform (SEP) | 8080 | `https://sep.YOURDOMAIN.com` |
| Platform API | 8085 | Tidak perlu expose (internal) |
| coridor-server | 8091 | `https://api.YOURDOMAIN.com` |
| PostgreSQL | 5432 | **Jangan expose** ke internet |
| Kafka | 29092 | **Jangan expose** ke internet |

---

## 1. Persiapan VPS

### Spesifikasi minimum

- Ubuntu **24.04** LTS
- 2 vCPU, 4 GB RAM (Kafka + Anchor Platform butuh memori)
- 20 GB disk
- Domain dengan akses DNS (A record)

### Install dependensi

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ca-certificates gnupg lsb-release ufw

# Docker (official)
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

sudo usermod -aG docker $USER
# Logout & login ulang agar grup docker aktif
```

### Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 2. DNS

Buat **A record** ke IP VPS:

| Host | Contoh |
|------|--------|
| `sep` | `sep.coridor.id` → `203.0.113.10` |
| `api` | `api.coridor.id` → `203.0.113.10` |

Ganti `coridor.id` dengan domain kamu. Tunggu propagasi DNS (5–30 menit).

---

## 3. Clone & setup project

```bash
sudo mkdir -p /opt/coridor
sudo chown $USER:$USER /opt/coridor
cd /opt/coridor

# Clone repo (sesuaikan URL)
git clone https://github.com/YOUR_ORG/anchor-platform.git .
cd coridor
```

### Secrets

```bash
cp .env.secrets.example .env.secrets
chmod 600 .env.secrets
nano .env.secrets
```

Isi minimal:

```bash
SECRET_DISTRIBUTION_SEED=S...          # seed akun distribution (JANGAN commit)
SECRET_SEP10_SIGNING_SEED=S...         # seed SEP-10 signing
HOST_SEP10_ACCOUNT=G...                # public key dari seed di atas

# Production: ganti ke live key saat go-live
XENDIT_SECRET_KEY=xnd_development_...
XENDIT_WEBHOOK_TOKEN=...               # dari dashboard Xendit

# Password DB production (ganti!)
SECRET_DATA_PASSWORD=GantiDenganPasswordKuat123!
```

Generate JWT secret acak (min 32 karakter):

```bash
openssl rand -base64 32
```

Salin ke `dev.env` untuk semua `SECRET_*_JWT_SECRET`.

---

## 4. Konfigurasi production (`dev.env`)

Edit `dev.env` — ganti semua `localhost` dengan domain production.

```bash
nano dev.env
```

**Wajib diubah:**

```bash
# Domain SEP (tanpa https://, tanpa port — wallet pakai ini sebagai home domain)
SEP10_WEB_AUTH_DOMAIN=sep.coridor.id
SEP10_HOME_DOMAINS=sep.coridor.id

# URL publik coridor-server
SEP24_INTERACTIVE_URL_BASE_URL=https://api.coridor.id/sep24/interactive
SEP24_MORE_INFO_URL_BASE_URL=https://api.coridor.id/sep24/transaction/more_info

# DB password — harus sama dengan .env.secrets
SECRET_DATA_PASSWORD=GantiDenganPasswordKuat123!

# Stellar testnet (ubah ke pubnet saat production mainnet)
STELLAR_NETWORK_TYPE=horizon
STELLAR_NETWORK_HORIZON_URL=https://horizon-testnet.stellar.org
```

**Penting:** `STELLAR_NETWORK_TYPE=horizon` wajib untuk withdraw — RPC observer tidak mendeteksi classic USDC payment.

---

## 5. Generate `stellar.toml` production

Edit template atau generate dengan domain production:

```bash
export SEP_DOMAIN=sep.coridor.id
export API_DOMAIN=api.coridor.id
export HOST_SEP10_ACCOUNT=G...   # dari .env.secrets

cat > config/stellar.localhost.toml << EOF
ACCOUNTS = ["GCACTDNRY4V7QD4M6FSPGLCR5BNANSLBHIKACRTPSZ4B75NKL66QGSVS"]
VERSION = "0.1.0"
SIGNING_KEY = "${HOST_SEP10_ACCOUNT}"
NETWORK_PASSPHRASE = "Test SDF Network ; September 2015"

WEB_AUTH_ENDPOINT = "https://${SEP_DOMAIN}/auth"
KYC_SERVER = "https://${SEP_DOMAIN}/sep12"
TRANSFER_SERVER = "https://${SEP_DOMAIN}/sep6"
TRANSFER_SERVER_SEP0024 = "https://${SEP_DOMAIN}/sep24"
ANCHOR_QUOTE_SERVER = "https://${SEP_DOMAIN}/sep38"

[[CURRENCIES]]
code = "USDC"
issuer = "GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56"
status = "test"
is_asset_anchored = true
anchor_asset_type = "fiat"
desc = "USDC Blend — on/off-ramp IDR via Coridor"
display_decimals = 2

[DOCUMENTATION]
ORG_NAME = "Coridor"
ORG_URL = "https://coridor.id"
ORG_DESCRIPTION = "IDR anchor Indonesia — cash in/out Rupiah ↔ Stellar via Xendit."
EOF
```

Verifikasi nanti:

```bash
curl -s https://sep.coridor.id/.well-known/stellar.toml | head -20
```

---

## 6. Docker Compose production

Buat override agar DB/Kafka tidak expose ke internet:

```bash
cat > docker-compose.prod.yaml << 'EOF'
services:
  platform:
    restart: unless-stopped
    ports:
      - "127.0.0.1:8082:8080"
      - "127.0.0.1:8086:8085"

  coridor-server:
    restart: unless-stopped
    ports:
      - "127.0.0.1:8091:8091"

  db:
    restart: unless-stopped
    ports: []   # hapus expose 5432

  kafka:
    restart: unless-stopped
    ports: []   # hapus expose 29092
EOF
```

---

## 7. Nginx + SSL (Let's Encrypt)

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### `/etc/nginx/sites-available/coridor-sep`

```nginx
server {
    listen 80;
    server_name sep.coridor.id;

    location / {
        proxy_pass http://127.0.0.1:8082;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
```

### `/etc/nginx/sites-available/coridor-api`

```nginx
server {
    listen 80;
    server_name api.coridor.id;

    location / {
        proxy_pass http://127.0.0.1:8091;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
```

Aktifkan & SSL:

```bash
sudo ln -sf /etc/nginx/sites-available/coridor-sep /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/coridor-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d sep.coridor.id -d api.coridor.id
```

Certbot otomatis redirect HTTP → HTTPS.

---

## 8. Jalankan stack

```bash
cd /opt/coridor/coridor

# Install deps coridor-server di host (sama seperti ap_start.sh)
(cd coridor-server && npm install --omit=dev)

# Build & start
docker compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d --build

# Cek logs
docker compose logs -f platform coridor-server
```

Tunggu ~30–60 detik sampai platform healthy.

### Health check

```bash
curl -s https://sep.coridor.id/.well-known/stellar.toml | head -5
curl -s https://api.coridor.id/health | jq .
curl -s "https://api.coridor.id/rate?type=indicative&sell_asset=iso4217:IDR&buy_asset=stellar:USDC:GATALTGTWIOT6BUDBCZM3Q4OQ4BO2COLOAZ7IYSKPLC2PMSOPPGF5V56&sell_amount=100000" | jq .
```

---

## 9. Xendit webhook

Di [Xendit Dashboard](https://dashboard.xendit.co) → **Settings → Webhooks**:

| Setting | Value |
|---------|-------|
| URL | `https://api.coridor.id/xendit/webhook` |
| Verification token | sama dengan `XENDIT_WEBHOOK_TOKEN` di `.env.secrets` |

Events yang perlu: payment request succeeded / payment capture.

**Sandbox vs Live:**
- Test: `xnd_development_...` — deposit VA/QR perlu tombol simulate di widget
- Production: `xnd_production_...` — pembayaran real

---

## 10. Akun Stellar distribution

Akun distribution harus sudah:

- [ ] Trustline **USDC Blend** (`GATALTGT...`)
- [ ] Saldo **XLM** untuk fee transaksi
- [ ] Saldo **USDC** cukup untuk deposit (inventory)

Cek di [Stellar Expert testnet](https://stellar.expert/explorer/testnet).

---

## 11. Test end-to-end

### Demo Wallet

1. Buka https://demo-wallet.stellar.org
2. Add asset: **USDC** / home domain **`sep.coridor.id`** (HTTPS wajib)
3. Deposit IDR → simulate (sandbox) → terima USDC
4. Withdraw USDC → Approve & Send → cek payout di Xendit

### Wallet / project lain

Project lain integrate via standar SEP — tidak perlu fork code Coridor:

1. Baca `https://sep.YOURDOMAIN.com/.well-known/stellar.toml`
2. SEP-10 auth ke `WEB_AUTH_ENDPOINT`
3. SEP-24 deposit/withdraw ke `TRANSFER_SERVER_SEP0024`

Contoh flow (pseudo):

```
GET  /.well-known/stellar.toml
POST /auth (SEP-10)
POST /sep24/transactions/deposit/interactive
     → buka interactive URL dari response
POST /sep24/transactions/withdraw/interactive
```

Lihat [SEP-24 docs](https://developers.stellar.org/docs/data/anchor/sep-guide/sep-24).

---

## 12. Auto-start saat reboot (opsional)

```bash
sudo tee /etc/systemd/system/coridor.service << EOF
[Unit]
Description=Coridor Anchor Platform
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/coridor/coridor
ExecStart=/usr/bin/docker compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.yaml -f docker-compose.prod.yaml down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable coridor
```

---

## 13. Update / redeploy

```bash
cd /opt/coridor/coridor
git pull
(cd coridor-server && npm install --omit=dev)
docker compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d --build
docker compose logs -f --tail=50 platform coridor-server
```

---

## 14. Troubleshooting

| Gejala | Penyebab | Solusi |
|--------|----------|--------|
| Demo Wallet tidak connect | HTTP / domain salah | Pastikan HTTPS + `SEP10_HOME_DOMAINS` match domain TOML |
| Deposit stuck setelah bayar | Webhook tidak sampai | Cek URL webhook Xendit + log `docker compose logs coridor-server` |
| Withdraw USDC terkirim, IDR tidak | Observer tidak deteksi | Pastikan `STELLAR_NETWORK_TYPE=horizon`, bukan `rpc` |
| `fetch failed` ke Xendit | DNS Docker | Sudah ada DNS `8.8.8.8` di docker-compose coridor-server |
| Widget redirect "coming soon" | Cache lama | Hard refresh; pastikan coridor-server versi terbaru |
| SEP-10 error | JWT secret beda | Pastikan `SECRET_SEP10_JWT_SECRET` sama di platform & server |

Log penting:

```bash
docker compose logs -f platform          # observer, SEP
docker compose logs -f coridor-server    # Xendit, payout, events
sudo tail -f /var/log/nginx/error.log
```

---

## 15. Checklist go-live

- [ ] Domain HTTPS aktif (`sep.` + `api.`)
- [ ] `stellar.toml` accessible via HTTPS
- [ ] `.env.secrets` chmod 600, tidak di-commit
- [ ] JWT secrets diganti dari default dev
- [ ] Postgres password kuat, port 5432 tidak public
- [ ] Xendit webhook terkonfigurasi & tested
- [ ] Distribution account funded (XLM + USDC)
- [ ] Deposit & withdraw tested end-to-end
- [ ] (Production) Ganti ke Xendit live key + mainnet config

---

## Referensi

- [Anchor Platform docs](https://developers.stellar.org/docs/platforms/anchor-platform)
- [SEP-24](https://developers.stellar.org/docs/data/anchor/sep-guide/sep-24)
- [Xendit Payments API v3](https://docs.xendit.co)
- Local dev: lihat [README.md](./README.md)
