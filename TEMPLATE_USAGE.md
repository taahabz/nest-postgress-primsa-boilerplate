# 🎯 Using This as a Template

This repository is a **production-ready boilerplate** for building NestJS APIs with authentication, RBAC, and automated deployment. Here's how to use it for your own project.

---

## 🚀 Getting Started with the Template

### Option 1: Use GitHub's "Use this template" Feature (Recommended)

1. Click the **"Use this template"** button at the top of the GitHub repository
2. Choose a name for your new repository
3. Select Public or Private
4. Click **"Create repository from template"**
5. Clone your new repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_PROJECT_NAME.git
   cd YOUR_PROJECT_NAME
   ```

### Option 2: Manual Clone and Reset

```bash
# Clone the template
git clone https://github.com/taahabz/nest-postgress-primsa-boilerplate.git my-project
cd my-project

# Remove template git history
rm -rf .git

# Initialize fresh git repository
git init
git add .
git commit -m "Initial commit from NestJS RBAC template"

# Add your remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_PROJECT.git
git branch -M main
git push -u origin main
```

---

## 📝 Customization Checklist

After creating your project from this template, customize these files:

### 1. **Update package.json**
```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "description": "Your project description",
  "author": "Your Name",
  "repository": {
    "url": "https://github.com/YOUR_USERNAME/YOUR_PROJECT"
  }
}
```

### 2. **Update README.md**
- [ ] Change project title and description
- [ ] Update repository URLs
- [ ] Add your project-specific features
- [ ] Update contact/support information
- [ ] Add your own screenshots or demos

### 3. **Configure Environment Variables**
- [ ] Copy `example.env` to `.env`
- [ ] Update `DATABASE_URL` with your database connection
- [ ] Generate new `JWT_SECRET` (use: `openssl rand -base64 32`)
- [ ] Set `NODE_ENV` to "production" for production

### 4. **Customize Database Schema**
- [ ] Edit `prisma/schema.prisma` to add your models
- [ ] Run `npx prisma migrate dev --name init_your_schema`
- [ ] Update seed data if needed

### 5. **Update Docker Configuration (if needed)**
```dockerfile
# In Dockerfile, update:
# - Image names
# - Exposed ports
# - Health check endpoints
```

### 6. **Customize API Endpoints**
- [ ] Remove or modify demo endpoints in `src/app.controller.ts`
- [ ] Add your own controllers and services
- [ ] Update API documentation

### 7. **GitHub Actions Workflow**
- [ ] Update workflow name in `.github/workflows/deploy.yml`
- [ ] Configure branch triggers (currently `main`)
- [ ] Update deployment targets if using different server

### 8. **Documentation**
- [ ] Update `docs/COMPLETE_DEPLOYMENT_GUIDE.md` with your specifics
- [ ] Customize `docs/DEPLOYMENT_CHECKLIST.md`
- [ ] Add project-specific troubleshooting tips

---

## 🎨 What's Included Out-of-the-Box

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Bcrypt password hashing
- ✅ Role-based access control (USER/ADMIN)
- ✅ Custom decorators (`@GetCurrentUser`, `@Roles`)
- ✅ Guards (JWT, Roles)

### Database & ORM
- ✅ Prisma ORM setup
- ✅ PostgreSQL schema
- ✅ Migration system
- ✅ User model with roles

### Security
- ✅ Helmet for HTTP headers
- ✅ CORS configuration
- ✅ Rate limiting (@nestjs/throttler)
- ✅ Input validation (class-validator)
- ✅ Environment variable validation

### DevOps & Deployment
- ✅ Docker multi-stage build
- ✅ Docker Compose orchestration
- ✅ GitHub Actions CI/CD
- ✅ AWS EC2 deployment scripts
- ✅ Nginx reverse proxy config
- ✅ Health check endpoints
- ✅ Automated rollback on failure

### Development Tools
- ✅ ESLint configuration
- ✅ Prettier setup
- ✅ Jest for testing
- ✅ Hot reload in development
- ✅ TypeScript strict mode

---

## 🔧 Common Modifications

### Adding New Roles

1. Update Prisma schema:
```prisma
enum Role {
  USER
  ADMIN
  MODERATOR  // Add new role
}
```

2. Run migration:
```bash
npx prisma migrate dev --name add_moderator_role
```

3. Use in controllers:
```typescript
@Roles(Role.MODERATOR)
@Get('moderator-only')
moderatorRoute() { ... }
```

### Adding New Endpoints

1. Create a new module:
```bash
nest g module posts
nest g controller posts
nest g service posts
```

2. Add to `app.module.ts`:
```typescript
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    // ... other imports
    PostsModule,
  ],
})
```

### Changing Database Provider

Currently configured for PostgreSQL (NeonDB), but Prisma supports:
- MySQL
- SQLite
- MongoDB
- SQL Server
- CockroachDB

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "mysql"  // Change provider
  url      = env("DATABASE_URL")
}
```

---

## 📚 Project Structure Explained

```
my-nestjs-app/
├── .github/workflows/     # CI/CD pipeline
│   └── deploy.yml         # Auto-deploy to EC2
├── docs/                  # Documentation
│   ├── COMPLETE_DEPLOYMENT_GUIDE.md
│   ├── DEPLOYMENT_CHECKLIST.md
│   └── REVIEW_SUMMARY.md
├── prisma/               # Database
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Migration history
├── src/
│   ├── auth/             # Authentication module
│   │   ├── decorators/   # Custom decorators
│   │   ├── dto/          # Data transfer objects
│   │   ├── guards/       # Auth guards
│   │   └── strategies/   # Passport strategies
│   ├── prisma/           # Prisma service
│   ├── users/            # Users module
│   ├── app.module.ts     # Root module
│   └── main.ts           # Bootstrap
├── docker-compose.yml    # Container orchestration
├── Dockerfile            # Multi-stage build
└── example.env           # Environment template
```

---

## 🛠️ Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev

# Start development server
npm run start:dev
```

### Running Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Building for Production
```bash
# Build the application
npm run build

# Run production build locally
npm run start:prod
```

### Docker Development
```bash
# Build and start containers
docker compose up --build

# View logs
docker compose logs -f

# Stop containers
docker compose down
```

---

## 🚀 Deployment Options

### 1. AWS EC2 (Included)
- Follow `docs/COMPLETE_DEPLOYMENT_GUIDE.md`
- Automated via GitHub Actions
- Nginx reverse proxy included

### 2. Other Platforms
This template can be deployed to:
- **Heroku**: Use Heroku buildpacks
- **DigitalOcean**: Similar to EC2 setup
- **Railway**: Direct GitHub integration
- **Render**: Auto-deploy from GitHub
- **AWS ECS/Fargate**: Use included Dockerfile
- **Google Cloud Run**: Containerized deployment
- **Azure App Service**: Docker container support

---

## 📖 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## 🤝 Contributing to the Template

If you've made improvements that could benefit others:

1. Fork the original template repository
2. Create a feature branch
3. Make your improvements
4. Submit a pull request

---

## 📄 License

This template is provided as-is for you to use in your projects. Check the LICENSE file for details.

---

## 💬 Support

**For template-specific questions:**
- Open an issue in the template repository
- Check existing issues for solutions

**For your project built from this template:**
- Customize this section with your support channels
- Add your project's Discord/Slack/email

---

## 🎉 Success Stories

Built something awesome with this template? Let us know!

- Add your project showcase here
- Share your deployment experience
- Contribute improvements back

---

**Happy Building! 🚀**
