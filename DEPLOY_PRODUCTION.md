# Production Deployment (Linux VM + Docker + Caddy)

This guide deploys the platform on a Linux VM (Oracle Cloud / VPS) using Docker Compose with automatic HTTPS.

## 1) Prerequisites

- Ubuntu 22.04+ (or equivalent Linux)
- A domain/subdomain pointing to the VM public IP (A record)
- Open inbound ports: `80/tcp` and `443/tcp`

## 2) Install Docker Engine + Compose Plugin (Ubuntu)

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
```

Optional: run Docker without `sudo`.

```bash
sudo usermod -aG docker $USER
newgrp docker
```

## 3) Clone the project

```bash
git clone <YOUR_REPOSITORY_URL> geant-recruitment
cd geant-recruitment
```

## 4) Configure production environment

Edit `.env.prod` and set real values:

- `DOMAIN` (example: `careers.example.com`)
- `MYSQL_ROOT_PASSWORD`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `RESET_TOKEN_SECRET`
- SMTP values (`SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, optional `SMTP_USER`, `SMTP_PASS`)

## 5) Build and start production stack

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

## 6) Run database migrations (required)

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm backend npx --yes prisma@6.19.2 migrate deploy --schema prisma/schema.prisma
```

If you also want seeded sample data (not recommended for live production):

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm backend npm run prisma:seed
```

## 7) Verify health

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f caddy
```

Checks:

- Frontend healthcheck: `http://frontend:3000/fr` (internal)
- Backend healthcheck: `http://backend:4000/api/health` (internal)
- Public endpoint: `https://<DOMAIN>`

## 8) Notes on production hardening in this setup

- MySQL is internal only (no public port mapping).
- Only Caddy exposes ports `80/443`.
- TLS certificates are managed automatically by Caddy (Let's Encrypt).
- Uploads are persisted in Docker volume `uploads_data`.
- Database is persisted in Docker volume `mysql_data`.
- All services use `restart: unless-stopped`.
