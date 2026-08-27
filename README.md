

Install the following before starting:

* Node.js (LTS)
* npm
* Python 3.12+
* PostgreSQL
* Git
* Expo Go *(optional, for testing on a physical Android device)*

---

## 1. Clone the Project

```bash
git clone <repository-url>
cd syncate_final
```

Project structure:

```text
syncate_final/
├── syncate-backend/
└── syncate-mobile/
```

---

## 2. Backend Setup

Open a terminal:

```bash
cd syncate-backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

### PostgreSQL

Make sure PostgreSQL is running.

Create the database required by the project and configure the PostgreSQL credentials according to the backend environment/settings configuration.

Run migrations:

```bash
python manage.py migrate
```

Check the Django configuration:

```bash
python manage.py check
```

Start the backend:

```bash
python manage.py runserver
```

The backend normally runs at:

```text
http://127.0.0.1:8000/
```

API root:

```text
http://127.0.0.1:8000/api/
```

---

## 3. Frontend Setup

Open another terminal:

```bash
cd syncate-mobile
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside `syncate-mobile`:

```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

> Use `127.0.0.1` when the frontend and backend are running on the same computer.

For testing on a physical device, use the computer's local network IP instead.

Example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.5:8000/api
```

Run a TypeScript check:

```bash
npx tsc --noEmit
```

Start Expo:

```bash
npx expo start
```

For web testing, press:

```text
w
```

For a physical Android device, scan the Expo QR code using Expo Go.

---

## 4. Running the Project

Keep both frontend and backend terminals running.

### Backend

```bash
cd syncate-backend
venv\Scripts\activate
python manage.py runserver
```

### Frontend

```bash
cd syncate-mobile
npx expo start
```

---

## 5. Common Issues

### PostgreSQL connection refused

Example error:

```text
connection to server at "localhost", port 5432 failed
```

Make sure PostgreSQL is running before starting Django.

---

### `expo/tsconfig.base` not found

Run:

```bash
npm install
```

Then restart the TypeScript server in VS Code.

---

### Frontend shows fallback or dummy backend data

Check that the frontend `.env` contains:

```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Then restart Expo with a cleared cache:

```bash
npx expo start --clear
```

---

## 6. Before Committing

Frontend check:

```bash
npx tsc --noEmit
```

Backend check:

```bash
python manage.py check
```

Do not commit:

* `.env`
* `venv/`
* `node_modules/`
* database passwords
* API keys
* secret keys
