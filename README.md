# Supabase Docker Self-Hosting Guide

<div align="center">

![Supabase Logo](https://raw.githubusercontent.com/supabase/supabase/master/web/static/img/supabase-logo.svg)

*Your Complete Self-Hosted Supabase Solution*

[![Waqf License](https://img.shields.io/badge/License-Waqf-green.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>

> Keywords: supabase-docker, self-hosted database, postgres, realtime, auth, edge functions, storage, docker-compose, waqf, open-source, self-hosting, database-as-a-service, BaaS, Firebase alternative, self-hosted-supabase, postgresql-database, authentication-service, object-storage, serverless-functions

This is a production-ready Docker Compose setup for self-hosting Supabase, with resolved common issues and optimized configuration. Perfect for those looking to self-host their own Supabase instance with full control over their data and infrastructure.

## 📚 Table of Contents
- [What is This?](#what-is-this)
- [Features](#features)
- [System Requirements](#system-requirements)
- [Quick Start](#quick-start)
- [Configuration](#configuration-guide)
- [Security](#security-best-practices)
- [Maintenance](#maintenance-operations)
- [Troubleshooting](#troubleshooting-guide)
- [Community](#community-and-support)

## What is This?

This repository provides a complete, production-ready Supabase environment using Docker. It's perfect for:
- 🏢 Organizations requiring data sovereignty
- 🔒 Projects with specific privacy requirements
- 💻 Developers wanting full control over their infrastructure
- 🚀 Applications needing customized Supabase setups

### Components Included
- 📊 PostgreSQL Database (v15+)
- ⚡ Realtime Engine (Live Queries & Broadcasts)
- 🔄 PostgREST API (Auto-generated REST API)
- 🔑 GoTrue Auth (User Management)
- 📁 Storage API (Large File Handling)
- ⚙️ Edge Functions (Serverless Functions)
- 🎯 Supabase Studio UI (Admin Dashboard)

## License

This project is released under the Waqf General Public License - a perpetual, irrevocable charitable endowment (Waqf) dedicated to the benefit of humanity.

Key aspects:
- ✅ Free to use, modify, and distribute
- ✅ Must maintain attribution
- ✅ Changes must be shared under same license
- ✅ Commercial use allowed
- ✅ Patent rights included

For complete license terms, see the [LICENSE](LICENSE) file.

## System Requirements

### Minimum Hardware Requirements
- CPU: 2+ cores (4+ recommended for production)
- RAM: 4GB (8GB+ recommended for production)
- Storage: 20GB SSD (100GB+ recommended for production)
- Network: 100Mbps (1Gbps recommended for production)

### Recommended Hardware for Different Scales
| Scale          | CPU  | RAM   | Storage |
|----------------|------|-------|---------|
| Development    | 2    | 4GB   | 20GB    |
| Small Prod     | 4    | 8GB   | 100GB   |
| Medium Prod    | 8    | 16GB  | 500GB   |
| Large Prod     | 16+  | 32GB+ | 1TB+    |

### Software Prerequisites
- Git (2.x+)
- Docker Engine 20.10.x or newer
- Docker Compose V2
- Operating System:
  - 🐧 Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+)
  - 🍎 macOS (11.0+)
  - 🪟 Windows 10/11 with WSL2

### Network Requirements
- Open ports:
  - 80/443: HTTP/HTTPS
  - 5432: PostgreSQL
  - 8000: Dashboard
  - 9000: Edge Functions
  - 5433: PgBouncer
  - 3000: GoTrue
  - 5000: PostgREST

## Features and Resolved Issues

### Core Features
#### Infrastructure
- ✅ Complete Supabase stack in Docker
- ✅ Production-ready configuration
- ✅ Automatic backups with retention policies
- ✅ Prometheus-compatible monitoring
- ✅ Multi-platform support
- ✅ SSL/TLS support
- ✅ Custom domain support

#### Development
- ✅ Hot-reload for Edge Functions
- ✅ Local development environment
- ✅ Database migration tools
- ✅ Seeding scripts
- ✅ Testing framework integration

#### Security
- ✅ Row Level Security (RLS)
- ✅ JWT Authentication
- ✅ SSL/TLS encryption
- ✅ Network isolation
- ✅ Secure secret management

### Fixed Common Issues
- ✅ Connection pooling optimization
  - Configured PgBouncer
  - Optimized pool sizes
  - Connection timeout handling
- ✅ Storage service initialization
  - Proper volume mounting
  - Permissions handling
  - Bucket creation
- ✅ Service startup order
  - Dependency management
  - Health checks
  - Retry mechanisms
- ✅ Memory management
  - Resource limits
  - Swap configuration
  - OOM handling
- ✅ Volume persistence
  - Backup strategies
  - Data recovery
  - Volume management
- ✅ Cross-platform compatibility
  - WSL2 support
  - MacOS optimizations
  - Linux native support
- ✅ Network configuration
  - Service discovery
  - Load balancing
  - Traffic routing

## Quick Start

### 1. Clone and Prepare
```bash
# Clone repository
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# Prepare environment
cp .env.example .env
```

### 2. Configure Environment
Edit `.env` file with your settings:
```bash
# Required settings
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret
ANON_KEY=your-anon-key
SERVICE_ROLE_KEY=your-service-key

# Optional settings
SMTP_HOST=your-smtp-server
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

### 3. Launch Services
```bash
# Pull latest images
docker compose pull

# Start services
docker compose up -d

# Verify status
docker compose ps
```

### 4. Verify Installation
```bash
# Check service health
curl http://localhost:8000/health

# Test database connection
psql postgres://postgres@localhost:5432/postgres
```

## Configuration Guide

### Essential Environment Variables
```env
# Database Configuration
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=postgres
POSTGRES_USER=postgres

# Authentication
JWT_SECRET=your-jwt-secret
ANON_KEY=your-anon-key
SERVICE_ROLE_KEY=your-service-key

# API Configuration
API_EXTERNAL_URL=http://localhost:8000
KONG_URL=http://kong:8000

# SMTP Configuration
SMTP_HOST=mail.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=secure-password
SMTP_SENDER_NAME=Supabase
```

### Advanced Configuration Files
#### Database (`postgres/config.sql`)
```sql
-- Example configuration
ALTER SYSTEM SET max_connections = '200';
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET effective_cache_size = '6GB';
```

#### Auth (`auth/config.json`)
```json
{
  "site_url": "http://localhost:3000",
  "jwt_expiry": 3600,
  "db_schema": "auth",
  "enable_signup": true
}
```

#### API (`api/kong.yml`)
```yaml
_format_version: "2.1"
services:
  - name: auth-v1
    url: http://auth:9999
    routes:
      - name: auth-v1-route
        paths:
          - /auth/v1
```

#### Storage (`storage/config.json`)
```json
{
  "region": "local",
  "bucket_id": "default",
  "file_size_limit": "50MiB"
}
```

## Service Access

### Dashboard Access
- URL: `http://localhost:8000`
- Default credentials:
  - Username: `supabase`
  - Password: `this_password_is_insecure_and_should_be_updated`

### API Endpoints
| Service   | URL                                  | Purpose                    |
|-----------|--------------------------------------|----------------------------|
| REST API  | `http://localhost:8000/rest/v1/`     | Database Access           |
| Auth API  | `http://localhost:8000/auth/v1/`     | User Management           |
| Storage   | `http://localhost:8000/storage/v1/`  | File Operations           |
| Realtime  | `http://localhost:8000/realtime/v1/` | Live Updates              |
| Functions | `http://localhost:9000/functions/v1/` | Edge Functions            |

### Database Connections
```typescript
// Direct connection (for admin tasks)
const directUrl = 'postgres://postgres:${POSTGRES_PASSWORD}@localhost:5432/postgres'

// Pooled connection (for applications)
const pooledUrl = 'postgres://postgres:${POSTGRES_PASSWORD}@localhost:6543/postgres'
```

## Troubleshooting Guide

### Storage Service Issues
If storage service fails:
```bash
# Check volume mounts
docker compose ps
docker volume ls

# View logs
docker compose logs storage

# Verify initialization
docker compose logs -f storage

# Check permissions
ls -la volumes/storage
chmod -R 777 volumes/storage
```

### Database Connection Problems
Common database issues:
1. Initialization delay
   ```bash
   # Wait for DB to be ready
   docker compose logs -f db
   ```

2. Credential mismatch
   ```bash
   # Verify credentials
   docker compose exec db psql -U postgres -c "\du"
   ```

3. Port conflicts
   ```bash
   # Check port usage
   netstat -tulpn | grep 5432
   ```

4. Memory limitations
   ```bash
   # Check memory usage
   docker stats
   ```

### Performance Optimization
```bash
# Monitor resource usage
docker stats

# Check slow queries
docker compose exec db psql -U postgres -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Optimize PostgreSQL
docker compose exec db psql -U postgres -c "VACUUM ANALYZE;"
```

## Security Best Practices

### Production Checklist
1. Update credentials
   ```bash
   # Generate secure passwords
   openssl rand -base64 32
   ```

2. Generate API keys
   ```bash
   # Generate JWT secret
   openssl rand -base64 64
   ```

3. Configure SSL/TLS
   ```bash
   # Enable SSL in Kong
   sed -i 's/enable_ssl: false/enable_ssl: true/' kong.yml
   ```

4. Set up monitoring
   ```bash
   # Enable Prometheus metrics
   docker compose -f docker-compose.yml -f docker-compose.metrics.yml up -d
   ```

## Maintenance Operations

### Backup Management
```bash
# Full database backup
docker compose exec db pg_dump -U postgres > backup.sql

# Automated daily backups
cat << EOF > /etc/cron.daily/supabase-backup
#!/bin/bash
docker compose exec db pg_dump -U postgres > /backups/backup_$(date +%Y%m%d).sql
find /backups -type f -mtime +7 -delete
EOF
chmod +x /etc/cron.daily/supabase-backup
```

### System Updates
```bash
# Update all services
docker compose pull
docker compose down
docker compose up -d

# Update single service
docker compose pull api
docker compose up -d api
```

## Common Commands

### Service Management
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose stop

# View logs
docker compose logs -f

# Restart specific service
docker compose restart api

# Scale services
docker compose up -d --scale realtime=3
```

### Cleanup
```bash
# Remove all data
docker compose down -v
rm -rf volumes/db/data/

# Remove specific service data
docker compose rm storage

# Clean unused images
docker image prune -a
```

## Community and Support

### Getting Help
1. 📖 Check this troubleshooting guide
2. 🔍 Search [GitHub issues](https://github.com/supabase/supabase/issues)
3. 💬 Join [Discord community](https://discord.supabase.com)
4. 📝 Create detailed issue report

### Contributing
We welcome contributions! Please:
1. Fork the repository
2. Create feature branch
3. Submit pull request
4. Follow coding standards

### Support Channels
- 📚 [Documentation](https://supabase.com/docs)
- 💬 [Discord Community](https://discord.supabase.com)
- 🐦 [Twitter Updates](https://twitter.com/supabase)
- 📧 [Email Support](mailto:support@supabase.com)

For detailed configuration options and advanced usage, visit the [official Supabase Docker hosting guide](https://supabase.com/docs/guides/hosting/docker).

---
Tags: supabase, docker, self-hosted, postgresql, authentication, storage, realtime, api, baas, database, waqf-license, open-source, firebase-alternative, self-hosting, docker-compose, postgres, edge-functions, serverless, database-as-service, auth-service, file-storage, real-time-database
