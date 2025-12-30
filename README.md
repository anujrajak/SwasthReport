# Swasth Report

A modern pathology report management system built with React, Vite, and Firebase.

## Features

- Patient management
- Pathology report creation and management
- Lab details configuration
- Report viewing and printing
- Google authentication

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Create a `.env.local` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

## Build

To build for production:

```bash
pnpm build
```

## Deploy

The app is configured for GitHub Pages deployment. Push to the `main` branch to trigger automatic deployment.
