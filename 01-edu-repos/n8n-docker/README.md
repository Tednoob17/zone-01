# ⚙️ Nodemation (n8n) Docker Deployment

This repository contains Docker Compose files for deploying [n8n](https://n8n.io/) with Traefik as a reverse proxy (on debug mode).
n8n is a workflow automation tool that enables users to integrate and automate various services and applications.

## Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/HarryVasanth/n8n-docker.git
   ```

2. Navigate to the project directory:

   ```bash
   cd n8n-docker
   ```

3. Create a `.env` file using `.env.example` as a template and customize the values.

```bash
cp .env.example .env
```

4. Deploy n8n using the main `docker-compose.yml`:

   ```bash
   docker-compose up -d
   ```

## Debugging Setup

For debugging, use the `docker-compose.debug.yml` file:

```bash
docker-compose -f docker-compose.debug.yml up -d
```

## Configuration

- **Main Configuration** (`docker-compose.yml`): Configures n8n with environment variables.

- **Debug Configuration** (`docker-compose.debug.yml`): Adds Traefik for debugging, exposing its API.

- **Environment Variables** (`.env`): Define subdomain, domain, port, and timezone for n8n (additional SSL email for debug).

## Accessing n8n

Access n8n at `https://<SUBDOMAIN>.<DOMAIN_NAME>`.
