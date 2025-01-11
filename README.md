# Supabase Docker

This is a minimal Docker Compose setup for self-hosting Supabase.

## Prerequisites

- Git
- Docker (Windows, MacOS, or Linux)

## Quick Start

1. Clone the repository:bash
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker


2. Set up environment variables:
bash
cp .env.example .env


3. Start the services:
bash
docker compose pull
docker compose up -d



## Accessing Services

### Supabase Studio (Dashboard)
- URL: `http://localhost:8000`
- Default credentials (change these immediately):
  - Username: `supabase`
  - Password: `this_password_is_insecure_and_should_be_updated`

### API Endpoints
- REST: `http://localhost:8000/rest/v1/`
- Auth: `http://localhost:8000/auth/v1/`
- Storage: `http://localhost:8000/storage/v1/`
- Realtime: `http://localhost:8000/realtime/v1/`

### Database Access
- Session connections: `postgres://postgres.your-tenant-id:your-super-secret-and-long-postgres-password@localhost:5432/postgres`
- Pooled connections: `postgres://postgres.your-tenant-id:your-super-secret-and-long-postgres-password@localhost:6543/postgres`

## Security

⚠️ **Important**: Before deploying to production, make sure to:
1. Update all default credentials in `.env`
2. Generate new API keys
3. Configure secure secrets
4. Set up proper SMTP settings
5. Update Dashboard authentication

For detailed security configuration, visit the [official documentation](https://supabase.com/docs/guides/hosting/docker).

## Stopping Services
bash
docker compose stop

## Uninstalling

bash
docker compose down -v
rm -rf volumes/db/data/

For more detailed instructions and advanced configuration options, please refer to the [official Supabase Docker hosting guide](https://supabase.com/docs/guides/hosting/docker).
