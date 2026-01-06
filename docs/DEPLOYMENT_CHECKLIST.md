# 🚀 Quick Deployment Checklist

Use this checklist to ensure you've completed all steps correctly.

---

## ☁️ AWS EC2 Setup

- [ ] AWS account created and billing enabled
- [ ] EC2 instance launched (Ubuntu 22.04 LTS, t3.micro or t3.small)
- [ ] Security Group configured:
  - [ ] SSH (22) - Your IP or 0.0.0.0/0
  - [ ] HTTP (80) - 0.0.0.0/0
  - [ ] HTTPS (443) - 0.0.0.0/0
  - [ ] Custom TCP (3001) - 0.0.0.0/0
- [ ] Key pair (.pem file) downloaded and saved securely
- [ ] Elastic IP allocated and associated (recommended)
- [ ] Can connect via SSH: `ssh -i key.pem ubuntu@EC2_IP`

---

## 🖥️ EC2 Server Configuration

- [ ] System packages updated: `sudo apt update && sudo apt upgrade -y`
- [ ] Docker installed: `curl -fsSL https://get.docker.com | sudo sh`
- [ ] User added to docker group: `sudo usermod -aG docker ubuntu`
- [ ] Docker Compose installed: `sudo apt install docker-compose-plugin -y`
- [ ] Logged out and back in (for docker group to take effect)
- [ ] Docker works without sudo: `docker ps`
- [ ] Git installed: `sudo apt install git -y`
- [ ] Node.js 20 installed (for Prisma migrations):
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
  ```
- [ ] SSH key generated and added to GitHub (for private repos)
- [ ] Repository cloned to `~/apps/nestjs-api`
- [ ] `.env` file created with production values
- [ ] JWT_SECRET generated: `openssl rand -base64 32`
- [ ] Nginx installed: `sudo apt install nginx -y`
- [ ] Nginx configuration created at `/etc/nginx/sites-available/nestjs-api`
- [ ] Nginx site enabled: `sudo ln -s /etc/nginx/sites-available/nestjs-api /etc/nginx/sites-enabled/`
- [ ] Nginx tested: `sudo nginx -t`
- [ ] Nginx restarted: `sudo systemctl restart nginx`

---

## 🗄️ Database Setup

- [ ] NeonDB (or PostgreSQL) database created
- [ ] Database connection string obtained
- [ ] Connection string includes `?sslmode=require`
- [ ] Connection tested from local machine
- [ ] Prisma schema up to date
- [ ] Migrations created: `npx prisma migrate dev`
- [ ] Migrations applied on production: `npx prisma migrate deploy`

---

## 🐳 Initial Docker Test on EC2

- [ ] Containers built: `docker compose build`
- [ ] Containers started: `docker compose up -d`
- [ ] Container status checked: `docker compose ps` (should show "Up")
- [ ] Logs checked: `docker compose logs -f`
- [ ] Health check passed: `curl http://localhost:3001/api/health`
- [ ] Nginx proxy works: `curl http://localhost/health`
- [ ] Test API endpoint: `curl http://localhost/api`

---

## 🔐 GitHub Secrets

Go to: Repository → Settings → Secrets and variables → Actions

- [ ] `EC2_HOST` - EC2 Elastic IP or Public DNS
- [ ] `EC2_USERNAME` - `ubuntu`
- [ ] `EC2_SSH_KEY` - Complete .pem file contents (including BEGIN/END lines)
- [ ] `ENV_FILE` - Complete .env file contents

**Verify all secrets are saved and accessible**

---

## 🔧 GitHub Actions Workflow

- [ ] Workflow file exists at `.github/workflows/deploy.yml`
- [ ] Workflow updated with latest fixes (health check, error handling)
- [ ] Workflow enabled in repository settings
- [ ] Branch protection not blocking deployments (if configured)

---

## 🧪 Manual Testing

From your local machine, test these endpoints (replace YOUR_EC2_IP):

```bash
# Health check
curl http://YOUR_EC2_IP/health

# API root
curl http://YOUR_EC2_IP/api

# Register a user
curl -X POST http://YOUR_EC2_IP/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Login
curl -X POST http://YOUR_EC2_IP/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Use the token from login response:
export TOKEN="your-jwt-token-here"

# Test protected route
curl http://YOUR_EC2_IP/api/protected \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] All endpoints return expected responses
- [ ] No 502/503 errors
- [ ] Response times acceptable

---

## 🚀 First Automated Deployment

- [ ] Make a small code change (e.g., update README)
- [ ] Commit and push to main:
  ```bash
  git add .
  git commit -m "test: trigger deployment"
  git push origin main
  ```
- [ ] Go to GitHub → Actions tab
- [ ] Watch deployment run live
- [ ] Tests pass ✅
- [ ] Deployment completes successfully ✅
- [ ] Application still accessible and working

---

## 🔒 Security Hardening (Post-Deployment)

- [ ] Change default SSH port (optional)
- [ ] Restrict SSH to specific IPs in Security Group
- [ ] Enable UFW firewall:
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```
- [ ] Setup fail2ban for SSH protection:
  ```bash
  sudo apt install fail2ban -y
  sudo systemctl enable fail2ban
  ```
- [ ] Disable root login: Edit `/etc/ssh/sshd_config` → `PermitRootLogin no`
- [ ] Setup automatic security updates:
  ```bash
  sudo apt install unattended-upgrades -y
  sudo dpkg-reconfigure -plow unattended-upgrades
  ```

---

## 🌐 HTTPS Setup (Optional but Recommended)

Only if you have a domain name:

- [ ] Domain DNS points to EC2 IP (A record)
- [ ] Update Nginx config with your domain name (not `_`)
- [ ] Install Certbot: `sudo apt install certbot python3-certbot-nginx -y`
- [ ] Get SSL certificate: `sudo certbot --nginx -d yourdomain.com`
- [ ] Test auto-renewal: `sudo certbot renew --dry-run`
- [ ] Force HTTPS redirect in Nginx (Certbot does this automatically)

---

## 📊 Monitoring Setup (Recommended)

- [ ] UptimeRobot configured (free tier)
- [ ] CloudWatch agent installed (optional)
- [ ] Error tracking setup (Sentry, Rollbar, etc.)
- [ ] Log aggregation configured (CloudWatch Logs, Papertrail, etc.)
- [ ] Disk space alerts configured
- [ ] Email/Slack notifications for downtime

---

## 💾 Backup Strategy

- [ ] Database backup script created
- [ ] Cron job scheduled for daily backups
- [ ] Backup retention policy defined (e.g., keep 7 days)
- [ ] Backup restore tested at least once
- [ ] `.env` file backed up securely (NOT in git)
- [ ] EC2 snapshot created (optional)

---

## 📚 Documentation

- [ ] API documentation updated (Swagger/OpenAPI)
- [ ] Environment variables documented
- [ ] Deployment process documented (you have this guide!)
- [ ] Rollback procedure documented
- [ ] Team members trained on deployment process

---

## 🎯 Production Readiness

- [ ] All tests passing locally and in CI
- [ ] Database migrations tested
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Rate limiting enabled (already done with @nestjs/throttler)
- [ ] CORS configured correctly
- [ ] Security headers enabled (already done with helmet)
- [ ] Input validation implemented (already done with class-validator)
- [ ] Load testing performed (optional)
- [ ] Rollback tested at least once

---

## 🔄 Regular Maintenance Tasks

### Daily
- [ ] Check GitHub Actions for failed deployments
- [ ] Monitor application health endpoint
- [ ] Check error logs if any alerts

### Weekly
- [ ] Review application logs for errors
- [ ] Check disk space: `df -h`
- [ ] Check memory usage: `free -h`
- [ ] Update system packages: `sudo apt update && sudo apt upgrade -y`
- [ ] Review security group rules

### Monthly
- [ ] Review and rotate secrets (JWT_SECRET, API keys)
- [ ] Update dependencies: `npm update`
- [ ] Run security audit: `npm audit`
- [ ] Test database backup restore
- [ ] Review CloudWatch metrics
- [ ] Clean up old Docker images and containers

---

## 🆘 Emergency Contacts & Resources

**Key URLs:**
- Production API: `http://YOUR_EC2_IP/api`
- GitHub Repository: `https://github.com/YOUR_USERNAME/YOUR_REPO`
- GitHub Actions: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
- AWS EC2 Console: `https://console.aws.amazon.com/ec2/`
- NeonDB Console: `https://console.neon.tech/`

**Important Commands:**
```bash
# SSH into server
ssh -i key.pem ubuntu@YOUR_EC2_IP

# Check application status
docker compose ps

# View logs
docker compose logs -f

# Restart application
docker compose restart

# Full rebuild
docker compose down && docker compose up -d --build

# Rollback (manual)
git reset --hard HEAD~1
docker compose down && docker compose up -d --build
```

**Support Resources:**
- NestJS Discord: https://discord.gg/nestjs
- Prisma Discord: https://discord.gg/prisma
- AWS Support: https://console.aws.amazon.com/support/

---

## ✅ Final Checklist

Before marking deployment as complete:

- [ ] Application accessible from the internet
- [ ] All API endpoints working correctly
- [ ] Database connected and queries working
- [ ] Authentication working (register, login, protected routes)
- [ ] GitHub Actions pipeline successful
- [ ] Health checks passing
- [ ] Logs accessible and readable
- [ ] Error handling working as expected
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Team notified of deployment
- [ ] Deployment tagged in Git (optional): `git tag v1.0.0 && git push origin v1.0.0`

---

**🎉 Congratulations! Your deployment is complete!**

Keep this checklist handy for future deployments and reference.
