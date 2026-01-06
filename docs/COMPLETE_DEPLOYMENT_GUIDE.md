# 🚀 Complete Deployment Guide - NestJS to AWS EC2

This is your comprehensive end-to-end guide to deploy your NestJS application with PostgreSQL (NeonDB) to AWS EC2 using GitHub Actions.

---

## 📑 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Part 1: AWS EC2 Setup](#part-1-aws-ec2-setup)
3. [Part 2: EC2 Server Configuration](#part-2-ec2-server-configuration)
4. [Part 3: GitHub Repository Setup](#part-3-github-repository-setup)
5. [Part 4: GitHub Secrets Configuration](#part-4-github-secrets-configuration)
6. [Part 5: First Manual Deployment](#part-5-first-manual-deployment)
7. [Part 6: Enable Automated Deployments](#part-6-enable-automated-deployments)
8. [Part 7: Optional Enhancements](#part-7-optional-enhancements)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance & Monitoring](#maintenance--monitoring)

---

## Prerequisites

Before starting, ensure you have:

- ✅ AWS Account with billing enabled
- ✅ GitHub account with your NestJS repository
- ✅ NeonDB PostgreSQL database created (or any PostgreSQL database)
- ✅ Domain name (optional, for HTTPS)
- ✅ Local machine with SSH client (Git Bash/PowerShell/Terminal)
- ✅ 30-60 minutes of focused time

---

## Part 1: AWS EC2 Setup

### 1.1 Launch EC2 Instance

1. **Login to AWS Console**
   - Go to https://console.aws.amazon.com/ec2/
   - Select your preferred region (e.g., `us-east-1`)

2. **Click "Launch Instance"**

3. **Configure Instance:**

   **Name and tags:**
   ```
   Name: nestjs-production-server
   ```

   **Application and OS Images (AMI):**
   ```
   Ubuntu Server 22.04 LTS (HVM), SSD Volume Type
   Architecture: 64-bit (x86)
   ```

   **Instance type:**
   ```
   t3.micro (Free tier eligible - 1GB RAM, 2 vCPU)
   or
   t3.small (Recommended - 2GB RAM, 2 vCPU) - ~$15/month
   ```

4. **Key pair (login):**
   - Click "Create new key pair"
   - Name: `nestjs-server-key`
   - Key pair type: `RSA`
   - Private key file format: `.pem` (for Mac/Linux) or `.ppk` (for PuTTY on Windows)
   - Click "Create key pair"
   - **IMPORTANT:** Save this file securely! You'll need it for SSH access

### 1.2 Configure Security Group

**Create a new security group** with these inbound rules:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | My IP | SSH access from your IP only |
| HTTP | TCP | 80 | 0.0.0.0/0, ::/0 | HTTP web traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0, ::/0 | HTTPS web traffic |
| Custom TCP | TCP | 3001 | 0.0.0.0/0 | Direct API access (can be removed after Nginx setup) |

**Important Security Notes:**
- For SSH (Port 22), use "My IP" for better security
- Later, you'll need to add GitHub Actions IP ranges (or use 0.0.0.0/0 temporarily)

### 1.3 Configure Storage

```
Storage: 20 GB gp3 (SSD)
```

### 1.4 Advanced Details (Optional but Recommended)

Enable **Detailed CloudWatch monitoring** for better insights.

### 1.5 Launch Instance

1. Review all settings
2. Click "Launch instance"
3. Wait 1-2 minutes for instance to initialize
4. Note down your **Public IPv4 address** (e.g., `54.123.45.67`)

### 1.6 (Optional but Recommended) Allocate Elastic IP

An Elastic IP ensures your server's IP doesn't change if you stop/start the instance.

1. Go to **EC2 Dashboard → Network & Security → Elastic IPs**
2. Click "Allocate Elastic IP address"
3. Click "Allocate"
4. Select the new IP → Actions → **Associate Elastic IP address**
5. Select your instance → Associate
6. **Use this Elastic IP** instead of the public IP for all future connections

---

## Part 2: EC2 Server Configuration

### 2.1 Connect to Your EC2 Instance

**On Windows (PowerShell):**
```powershell
# Navigate to where you saved the key
cd C:\path\to\your\keys

# Set correct permissions (if needed)
icacls "nestjs-server-key.pem" /inheritance:r
icacls "nestjs-server-key.pem" /grant:r "%USERNAME%:R"

# Connect
ssh -i "nestjs-server-key.pem" ubuntu@YOUR_EC2_IP
```

**On Mac/Linux:**
```bash
# Set correct permissions
chmod 400 nestjs-server-key.pem

# Connect
ssh -i nestjs-server-key.pem ubuntu@YOUR_EC2_IP
```

Type `yes` when asked about authenticity.

### 2.2 Initial Server Setup

Once connected, run these commands:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git nano unzip

# Check if successful
git --version
curl --version
```

### 2.3 Install Docker

```bash
# Download and run Docker installation script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu user to docker group (no sudo needed for docker commands)
sudo usermod -aG docker ubuntu

# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin

# Verify installations
docker --version
docker compose version
```

**CRITICAL:** Logout and login again for group changes to take effect:
```bash
exit
```

Then reconnect:
```bash
ssh -i nestjs-server-key.pem ubuntu@YOUR_EC2_IP
```

### 2.4 Verify Docker Access

```bash
# This should work without sudo now
docker ps
docker compose version
```

### 2.5 Setup Application Directory Structure

```bash
# Create directory for apps
mkdir -p ~/apps
cd ~/apps
```

### 2.6 Configure Git (For Repository Cloning)

```bash
# Set git user (needed for git operations)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2.7 Setup SSH Key for GitHub (Option A - Recommended for Private Repos)

If your repository is private, you'll need to authenticate with GitHub:

```bash
# Generate SSH key on EC2
ssh-keygen -t ed25519 -C "your.email@example.com"
# Press Enter for all prompts (default location, no passphrase)

# Display public key
cat ~/.ssh/id_ed25519.pub
```

**Copy the entire output**, then:
1. Go to GitHub → Settings → SSH and GPG keys → New SSH key
2. Title: `EC2 NestJS Server`
3. Paste the public key
4. Click "Add SSH key"

**Test connection:**
```bash
ssh -T git@github.com
# Should see: "Hi username! You've successfully authenticated..."
```

### 2.8 Clone Your Repository

**For Private Repo (with SSH key setup):**
```bash
cd ~/apps
git clone git@github.com:taahabz/nest-postgress-primsa-boilerplate nestjs-api
```

**For Public Repo:**
```bash
cd ~/apps
git clone https://github.com/taahabz/nest-postgress-primsa-boilerplate nestjs-api
```

### 2.9 Create Environment File

```bash
cd ~/apps/nestjs-api

# Create .env file
nano .env
```

**Paste your production environment variables:**
```env
# Database (NeonDB or your PostgreSQL URL)
DATABASE_URL="postgresql://user:password@ep-cool-cell-adumdwzq-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# JWT Configuration
JWT_SECRET="CHANGE_THIS_TO_SUPER_SECURE_RANDOM_STRING_32CHARS_OR_MORE"
JWT_EXPIRES_IN="15m"

# Application
NODE_ENV="production"
PORT="3001"
```

**Generate a secure JWT_SECRET:**
```bash
# On EC2, generate a random secret:
openssl rand -base64 32
# Copy the output and use it as JWT_SECRET
```

**Save and exit:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

### 2.10 Install Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### 2.11 Configure Nginx for Your API

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/nestjs-api
```

**Paste this configuration:**
```nginx
# Upstream definition
upstream nestjs_backend {
    server localhost:3001;
}

server {
    listen 80;
    listen [::]:80;
    
    # Change this to your domain or use _ for any domain/IP
    server_name _;
    
    # Increase body size for file uploads if needed
    client_max_body_size 10M;
    
    # API routes
    location /api {
        proxy_pass http://nestjs_backend;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint (no /api prefix)
    location = /health {
        proxy_pass http://nestjs_backend/api/health;
        access_log off;
    }
    
    # Root endpoint
    location = / {
        proxy_pass http://nestjs_backend/api;
    }
}
```

**Enable the configuration:**
```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/nestjs-api /etc/nginx/sites-enabled/

# Remove default site (optional but recommended)
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test is successful, reload Nginx
sudo systemctl reload nginx
```

### 2.12 Test Initial Docker Build

```bash
cd ~/apps/nestjs-api

# Build and start containers
docker compose up -d --build

# Check container status
docker compose ps

# View logs
docker compose logs -f
```

**Wait 30-60 seconds for the container to start**, then test:

```bash
# Test health endpoint (through Nginx)
curl http://localhost/health

# Should return: {"status":"ok","timestamp":"..."}

# Test direct container access
curl http://localhost:3001/api/health
```

If both work, you're ready! Press `Ctrl+C` to stop viewing logs.

---

## Part 3: GitHub Repository Setup

### 3.1 Ensure GitHub Actions Workflow File Exists

The workflow file should be at: `.github/workflows/deploy.yml`

**Important fixes needed** in your current workflow (we'll apply these next).

### 3.2 Update Security Group for GitHub Actions

GitHub Actions needs SSH access to your EC2 instance. You have two options:

**Option A (Less Secure, Easier):** Allow SSH from anywhere
- In AWS Console → EC2 → Security Groups
- Edit inbound rules for your security group
- Change SSH rule source from "My IP" to `0.0.0.0/0`

**Option B (More Secure, Recommended):** Use GitHub's IP ranges
- GitHub publishes their IP ranges at: https://api.github.com/meta
- Add each IP range as a separate SSH rule
- Note: These IPs change occasionally

For now, use **Option A** for initial setup. We'll secure it later.

---

## Part 4: GitHub Secrets Configuration

### 4.1 Prepare Your SSH Private Key

**On your local machine:**

**Windows PowerShell:**
```powershell
Get-Content "C:\path\to\nestjs-server-key.pem" | Set-Clipboard
```

**Mac/Linux:**
```bash
cat /path/to/nestjs-server-key.pem | pbcopy  # Mac
cat /path/to/nestjs-server-key.pem | xclip -selection clipboard  # Linux
```

Or simply open the `.pem` file in a text editor and copy the entire contents including:
```
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

### 4.2 Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** (repository settings, not account settings)
3. In the left sidebar: **Secrets and variables → Actions**
4. Click **New repository secret**

**Add these secrets one by one:**

#### Secret 1: `EC2_HOST`
```
Name: EC2_HOST
Value: 54.123.45.67
```
(Use your EC2 Elastic IP or public IP)

#### Secret 2: `EC2_USERNAME`
```
Name: EC2_USERNAME
Value: ubuntu
```

#### Secret 3: `EC2_SSH_KEY`
```
Name: EC2_SSH_KEY
Value: [Paste entire contents of your .pem file]
```

#### Secret 4: `ENV_FILE`
```
Name: ENV_FILE
Value: [Paste your entire .env file contents]
```

Example ENV_FILE value:
```
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
JWT_SECRET="your-super-secure-jwt-secret-min-32-chars"
JWT_EXPIRES_IN="15m"
NODE_ENV="production"
PORT="3001"
```

#### Secret 5 (Optional): `NEON_DATABASE_URL`
If you want to run Prisma migrations from GitHub Actions:
```
Name: NEON_DATABASE_URL
Value: [Your NeonDB connection string]
```

### 4.3 Verify Secrets

Click on "Actions secrets" to see all secrets. You should see:
- ✅ EC2_HOST
- ✅ EC2_USERNAME
- ✅ EC2_SSH_KEY
- ✅ ENV_FILE

---

## Part 5: First Manual Deployment

### 5.1 Initial Manual Setup on EC2

SSH into your EC2 instance:

```bash
ssh -i nestjs-server-key.pem ubuntu@YOUR_EC2_IP

cd ~/apps/nestjs-api

# Run Prisma migrations
npx prisma migrate deploy

# Or if you need to generate Prisma client first:
npx prisma generate
npx prisma migrate deploy
```

**Note:** You'll need Node.js installed on EC2 to run Prisma commands outside Docker:

```bash
# Install Node.js 20 on EC2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version

# Now you can run Prisma commands
cd ~/apps/nestjs-api
npm install
npx prisma generate
npx prisma migrate deploy
```

### 5.2 Start the Application

```bash
cd ~/apps/nestjs-api

# Build and start containers
docker compose up -d --build

# Wait 30 seconds, then check
docker compose ps

# Check logs
docker compose logs -f api
```

### 5.3 Test the Deployment

**From your local machine:**
```bash
# Test health endpoint
curl http://YOUR_EC2_IP/health

# Test API root
curl http://YOUR_EC2_IP/api

# Register a test user
curl -X POST http://YOUR_EC2_IP/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'

# Login
curl -X POST http://YOUR_EC2_IP/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

If all tests pass, your manual deployment works! 🎉

---

## Part 6: Enable Automated Deployments

### 6.1 Update GitHub Actions Workflow

Your current workflow has some issues. Let's fix them:

**Issues to fix:**
1. Health check endpoint mismatch (`/health` vs `/api/health`)
2. Missing Prisma migration step
3. No proper error handling
4. Missing environment validation

I'll provide the updated workflow file next.

### 6.2 Test Automated Deployment

1. Make a small change to your code (e.g., update README.md)
2. Commit and push:
   ```bash
   git add .
   git commit -m "test: trigger deployment pipeline"
   git push origin main
   ```
3. Go to GitHub → **Actions** tab
4. Watch the workflow run
5. If it succeeds, check your app is still working

### 6.3 Monitor Deployment

**Watch in real-time:**
- GitHub Actions tab shows live logs
- SSH into EC2 and run: `docker compose logs -f`

---

## Part 7: Optional Enhancements

### 7.1 Setup HTTPS with Let's Encrypt

**Prerequisites:**
- You need a domain name pointing to your EC2 IP
- Update Nginx config to use your domain (not `_`)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts
# Certbot will automatically configure Nginx for HTTPS
# Certificates auto-renew via systemd timer
```

**Test auto-renewal:**
```bash
sudo certbot renew --dry-run
```

### 7.2 Setup CloudWatch Logging

Install CloudWatch agent for better monitoring:

```bash
# Download CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb

# Install
sudo dpkg -i amazon-cloudwatch-agent.deb

# Configure (requires IAM role attached to EC2)
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

### 7.3 Add Database Backups

Create a daily backup script:

```bash
# Create backup script
nano ~/backup-db.sh
```

**Content:**
```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR

# Export from NeonDB (requires pg_dump)
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$TIMESTAMP.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup completed: backup_$TIMESTAMP.sql"
```

**Make executable and schedule:**
```bash
chmod +x ~/backup-db.sh

# Add to crontab (runs daily at 2 AM)
crontab -e
# Add this line:
0 2 * * * /home/ubuntu/backup-db.sh
```

### 7.4 Setup Monitoring & Alerting

Consider integrating:
- **UptimeRobot** (free) - monitors if your API is up
- **Sentry** - error tracking
- **Datadog** or **New Relic** - APM
- **AWS CloudWatch Alarms** - CPU, memory, disk alerts

---

## Troubleshooting

### Issue: Container won't start

```bash
# Check logs
docker compose logs

# Common issues:
# - DATABASE_URL not set correctly
# - Port 3001 already in use
# - Prisma schema outdated

# Fix: Rebuild completely
docker compose down -v
docker compose up --build -d
```

### Issue: GitHub Actions SSH fails

**Error:** `Permission denied (publickey)`

**Solutions:**
1. Verify `EC2_SSH_KEY` secret contains the full `.pem` file including BEGIN/END lines
2. Check Security Group allows SSH from 0.0.0.0/0 or GitHub IPs
3. Verify `EC2_HOST` is correct (public IP or Elastic IP)
4. Ensure `EC2_USERNAME` is `ubuntu` for Ubuntu AMI

### Issue: Health check fails

**Error:** Container exits with "unhealthy" status

**Solution:**
```bash
# Check which port the app is actually listening on
docker compose logs | grep "listening"

# Verify health endpoint works
docker exec nestjs-api wget --spider http://localhost:3001/api/health

# If it returns 404, check your routes
```

### Issue: Database connection fails

**Error:** `Can't reach database server`

**Solutions:**
1. Verify `DATABASE_URL` in `.env` is correct
2. Check NeonDB allows connections from your EC2 IP
3. Ensure `?sslmode=require` is in the connection string
4. Test connection:
   ```bash
   docker exec -it nestjs-api sh
   npx prisma db pull
   ```

### Issue: Nginx 502 Bad Gateway

**Causes:**
- Container not running
- Wrong port in Nginx config
- Container still starting up

**Fix:**
```bash
# Check container status
docker compose ps

# Check if port 3001 is open
nc -zv localhost 3001

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Issue: Deployment works but changes don't appear

**Cause:** Docker is using cached images

**Fix:**
```bash
# Force rebuild without cache
docker compose build --no-cache
docker compose up -d
```

### Issue: Out of disk space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a --volumes -f

# Clean up old logs
sudo journalctl --vacuum-time=7d
```

---

## Maintenance & Monitoring

### Daily Checks

```bash
# SSH into EC2
ssh -i nestjs-server-key.pem ubuntu@YOUR_EC2_IP

# Check container health
docker compose ps

# Check disk space
df -h

# Check memory
free -h

# Check recent logs
docker compose logs --tail=50
```

### Weekly Tasks

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Check for security updates
sudo unattended-upgrades --dry-run

# Review logs for errors
docker compose logs | grep -i error

# Check Nginx access logs
sudo tail -100 /var/log/nginx/access.log
```

### Monthly Tasks

1. Review CloudWatch metrics (if setup)
2. Test database backups restore
3. Review security group rules
4. Update dependencies (`npm update`)
5. Review and rotate JWT secrets if needed

### Useful Commands Reference

```bash
# Container management
docker compose ps                    # List containers
docker compose logs -f               # Follow logs
docker compose logs -f api           # Follow specific service logs
docker compose restart               # Restart all containers
docker compose restart api           # Restart specific service
docker compose down                  # Stop containers
docker compose up -d                 # Start containers in background
docker compose up -d --build         # Rebuild and start

# Docker cleanup
docker system df                     # Check Docker disk usage
docker system prune -f               # Remove unused data
docker image prune -a -f             # Remove all unused images
docker volume prune -f               # Remove unused volumes

# Nginx
sudo systemctl status nginx          # Check Nginx status
sudo systemctl restart nginx         # Restart Nginx
sudo systemctl reload nginx          # Reload config without restart
sudo nginx -t                        # Test configuration
sudo tail -f /var/log/nginx/access.log  # Access logs
sudo tail -f /var/log/nginx/error.log   # Error logs

# Prisma
npx prisma migrate deploy            # Run pending migrations
npx prisma migrate status            # Check migration status
npx prisma studio                    # Open Prisma Studio (not recommended on production)
npx prisma db pull                   # Pull schema from database

# System monitoring
htop                                 # Interactive process viewer (install: sudo apt install htop)
df -h                                # Disk usage
free -h                              # Memory usage
journalctl -u docker -n 50           # Docker service logs
```

---

## Security Best Practices

1. **Never commit `.env` files or secrets to Git**
2. **Regularly update packages:** `npm audit fix`
3. **Use strong, unique passwords** for database and JWT secrets
4. **Enable CloudTrail** in AWS for audit logs
5. **Setup CloudWatch Alarms** for unusual activity
6. **Regularly review IAM permissions**
7. **Enable MFA** on AWS and GitHub accounts
8. **Backup your database** regularly
9. **Use HTTPS** in production (Let's Encrypt)
10. **Implement rate limiting** (already done with `@nestjs/throttler`)

---

## Cost Estimate

**Monthly AWS costs (approximate):**
- EC2 t3.micro (free tier): $0 (first year) or ~$7/month
- EC2 t3.small: ~$15/month
- Elastic IP (if instance running): $0
- Elastic IP (if instance stopped): ~$3.65/month
- Data transfer: ~$0.09/GB
- **Total: $0-20/month** depending on instance type and traffic

**NeonDB (PostgreSQL):**
- Free tier: $0 (0.5 GB storage)
- Pro tier: $19/month (8 GB storage)

---

## Next Steps After Deployment

1. ✅ **Test all API endpoints** thoroughly
2. ✅ **Setup HTTPS** with Let's Encrypt
3. ✅ **Configure monitoring** (UptimeRobot, Sentry)
4. ✅ **Setup database backups**
5. ✅ **Document your API** (Swagger/OpenAPI)
6. ✅ **Setup staging environment** (optional)
7. ✅ **Configure CI/CD** for other branches
8. ✅ **Load testing** (k6, Apache JMeter)
9. ✅ **Setup alerts** for downtime/errors
10. ✅ **Create rollback procedure**

---

## Support & Resources

- **NestJS Docs:** https://docs.nestjs.com
- **Prisma Docs:** https://www.prisma.io/docs
- **AWS EC2 Docs:** https://docs.aws.amazon.com/ec2
- **Docker Docs:** https://docs.docker.com
- **Nginx Docs:** https://nginx.org/en/docs
- **GitHub Actions:** https://docs.github.com/en/actions

---

**🎉 Congratulations!** You now have a fully automated deployment pipeline from GitHub to EC2!

Every push to `main` will automatically test and deploy your application. 🚀
