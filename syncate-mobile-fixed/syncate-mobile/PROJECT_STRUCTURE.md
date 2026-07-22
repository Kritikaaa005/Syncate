# Syncate Mobile Structure

- `src/app/`: Expo Router route files only. Route files re-export screens or render small placeholders.
- `src/screens/`: Screen-level state and layout.
- `src/components/`: Reusable UI components.
- `src/hooks/`: Reusable data-fetching/state hooks.
- `src/services/`: Backend API communication.
- `src/constants/`: Theme tokens and bundled fallback content.
- `src/contexts/`: App-wide React contexts.
- `src/types/`: Shared TypeScript models.
- `src/utils/`: Pure date and prediction utilities.
- `assets/`: Expo app assets and Syncate illustrations.

## Run

```bash
npm install
npx expo start -c
```

For a physical phone, copy `.env.example` to `.env` and replace the API host with the computer's LAN IP. `127.0.0.1` points to the phone itself and cannot reach Django running on the computer.
