# House of Lettings Deployment

This project is set up for:

- GitHub as the code repository
- Vercel as the website host
- Firebase for Authentication, Firestore, and Storage

## 1. Firebase

Create or open your Firebase project, then enable:

- Authentication
- Firestore Database
- Storage

Copy the web app config values from Firebase project settings.

Deploy the database and storage rules from this project:

```bash
firebase login
firebase use <your-firebase-project-id>
firebase deploy --only firestore:rules,storage
```

## 2. GitHub

Create a new GitHub repository, then push this project folder.

```bash
git init
git add .
git commit -m "Initial deployment"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## 3. Vercel

Import the GitHub repository into Vercel.

Use these project settings:

- Framework preset: Other
- Build command: `pnpm run build`
- Output directory: `dist/public`
- Install command: `pnpm install`

Add these Vercel environment variables:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
```

After adding the environment variables, deploy the Vercel project.
