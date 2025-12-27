# EC2 Setup Guide for NestJS Deployment

This guide walks you through setting up a fresh EC2 instance to host your NestJS application using Docker.

## Prerequisites

- AWS Account
- A domain name (optional, for HTTPS)
- Your GitHub repository

---

## Step 1: Launch EC2 Instance

1. Go to **AWS Console → EC2 → Launch Instance**
2. Choose the following settings:
   - **Name**: `nestjs-server` (or your preference)
   - **AMI**: Ubuntu Server 22.04 LTS (64-bit)
   - **Instance Type**: `t3.micro` (free tier) or `t3.small` for better performance
   - **Key Pair**: Create or select existing (you'll need this for SSH)
   - **Security Group**: Create with these rules:

| Type | Port | Source | Description |
|------|------|--------|-------------|
| SSH | 22 | Your IP | SSH access |
| HTTP | 80 | 0.0.0.0/0 | Web traffic |
| HTTPS | 443 | 0.0.0.0/0 | Secure web traffic |
| Custom TCP | 3001 | 0.0.0.0/0 | Direct API access (optional) |

3. Click **Launch Instance**

---

## Step 2: Connect to EC2

```bash
# Replace with your key path and EC2 public IP
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

---

## Step 3: Install Docker & Docker Compose

Run these commands on your EC2 instance:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu user to docker group (no sudo needed for docker commands)
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installations
docker --version
docker compose version

# IMPORTANT: Log out and log back in for group changes to take effect
exit
```

SSH back in:
```bash
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

---

## Step 4: Install Git & Clone Repository

```bash
# Install Git
sudo apt install git -y

# Create apps directory
mkdir -p ~/apps

# Clone your repository
cd ~/apps
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git nestjs-api

# Navigate to app directory
cd nestjs-api
```

---

## Step 5: Create Environment File

```bash
# Create .env file with your production values
nano .env
```

Paste your environment variables:
```env
DATABASE_URL="postgresql://user:password@your-neondb-host/database?sslmode=require"
JWT_SECRET="your-super-secure-production-jwt-secret"
JWT_EXPIRES_IN="15m"
NODE_ENV="production"
PORT="3001"
```

Save and exit (`Ctrl+X`, `Y`, `Enter`)

---

## Step 6: Test Docker Build Locally (On EC2)

```bash
# Build and run the container
docker compose up --build -d

# Check if container is running
docker compose ps

# View logs
docker compose logs -f

# Test the health endpoint
curl http://localhost:3001/health
```

---

## Step 7: Install Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration for your app
sudo nano /etc/nginx/sites-available/nestjs-api
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Or use _ for any domain/IP

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration:
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/nestjs-api /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## Step 8: Setup GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `EC2_HOST` | `ec2-xx-xx-xx-xx.compute-1.amazonaws.com` | Your EC2 public DNS or IP |
| `EC2_USERNAME` | `ubuntu` | EC2 user (ubuntu for Ubuntu AMI) |
| `EC2_SSH_KEY` | `-----BEGIN RSA PRIVATE KEY-----...` | Contents of your .pem file |
| `ENV_FILE` | Full contents of your .env file | All environment variables |

### How to get your SSH key content:
```bash
# On your local machine (Windows PowerShell)
Get-Content "C:\path\to\your-key.pem"

# Or on Mac/Linux
cat /path/to/your-key.pem
```

Copy the entire output including `-----BEGIN` and `-----END` lines.

---

## Step 9: Test the Pipeline

1. Make a small change to your code
2. Commit and push to `main`:
   ```bash
   git add .
   git commit -m "Test deployment pipeline"
   git push origin main
   ```
3. Go to GitHub → **Actions** tab to watch the deployment

---

## Optional: Setup HTTPS with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Certbot will automatically configure Nginx for HTTPS
# SSL certificates auto-renew via systemd timer
```

---

## Useful Commands

```bash
# View running containers
docker compose ps

# View container logs
docker compose logs -f

# Restart containers
docker compose restart

# Stop containers
docker compose down

# Rebuild and restart
docker compose up --build -d

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check Nginx status
sudo systemctl status nginx
```

---

## Hosting Multiple Apps

To host multiple apps on the same EC2:

1. Clone each app to `/home/ubuntu/apps/app-name`
2. Use different ports in `docker-compose.yml` (3001, 3002, 3003...)
3. Add Nginx server blocks for each app:

```nginx
# /etc/nginx/sites-available/app1
server {
    server_name app1.yourdomain.com;
    location / {
        proxy_pass http://localhost:3001;
        # ... proxy headers
    }
}

# /etc/nginx/sites-available/app2
server {
    server_name app2.yourdomain.com;
    location / {
        proxy_pass http://localhost:3002;
        # ... proxy headers
    }
}
```

---

## Troubleshooting

### Container won't start
```bash
docker compose logs  # Check for error messages
docker compose down && docker compose up --build  # Rebuild
```

### Permission denied on docker
```bash
sudo usermod -aG docker ubuntu
# Then logout and login again
```

### Nginx 502 Bad Gateway
- Container might not be running: `docker compose ps`
- Port mismatch: Check docker-compose.yml ports match Nginx config

### GitHub Actions failing
- Check EC2 Security Group allows SSH from GitHub IPs
- Verify SSH key is correctly added to GitHub Secrets
- Check EC2_HOST is correct (use public DNS or Elastic IP)
