# Syncate 

Syncate is a period and pregnancy tracking mobile app — **React Native (Expo)** frontend, **Django REST Framework** backend, **PostgreSQL** database.

## Repository Structure

```
Syncate/
├── syncate-mobile/     # React Native / Expo frontend
├── syncate-backend/    # Django REST Framework backend
├── docker-compose.yml  # Local Postgres
└── README.md
```

## Getting Started

### 1. Database (Postgres via Docker)

```bash
docker compose up -d
```

### 2. Backend (Django)

```bash
cd syncate-backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env      # fill in real values if needed
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`. Admin panel at `/admin/`. API at `/api/`.

### 3. Frontend (Expo)

```bash
cd syncate-mobile
cp .env.example .env      # defaults work for local dev
npm install
npx expo start
```

Scan the QR with Expo Go, or press `w` for web. If testing on a physical phone, set `EXPO_PUBLIC_API_URL` in `.env` to your computer's LAN IP instead of `127.0.0.1`.

## Git Workflow

- `main` — stable, always working
- `dev` — integration branch, all feature branches merge here first
- `feature/<name>` — your actual work, branched off `dev`

```bash
git checkout dev
git pull
git checkout -b feature/your-feature-name
```

Open a Pull Request into `dev` when done. Never push directly to `main` or `dev`.
