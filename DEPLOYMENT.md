# SAT Practice Tool - Deployment Guide

This guide will help you deploy the SAT practice tool online so you and your son can access it from any device with automatic progress syncing.

## Quick Start (5 minutes)

### 1. Create a .env file

Copy `.env.example` to `.env` in the project root and fill in your values:

```bash
cp .env.example .env
```

### 2. Set Up Firebase (for cloud sync)

**Skip this if you only want local progress (no cross-device sync)**

1. Go to https://console.firebase.google.com
2. Click "Create Project" and follow the wizard
3. Once created, click the gear icon → Project Settings
4. Scroll down to "Your apps" section
5. Click "Add app" → Web
6. Copy the Firebase config:
   ```javascript
   {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   }
   ```
7. Paste these values into your `.env` file as:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

### 3. Set Up Firestore Security Rules

In Firebase Console:
1. Go to Firestore Database
2. Go to Rules tab
3. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write only their own progress
    match /progress/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /customQuestions/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

4. Click "Publish"

### 4. Deploy to Vercel

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "SAT practice tool"
git remote add origin https://github.com/YOUR_USERNAME/sat-practice.git
git branch -M main
git push -u origin main
```

2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. In "Environment Variables", add:
   - `VITE_CLAUDE_API_KEY` = your Claude API key
   - `VITE_FIREBASE_API_KEY` = your Firebase API key
   - `VITE_FIREBASE_AUTH_DOMAIN` = your Firebase auth domain
   - `VITE_FIREBASE_PROJECT_ID` = your Firebase project ID
   - `VITE_FIREBASE_STORAGE_BUCKET` = your Firebase storage bucket
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` = your Firebase sender ID
   - `VITE_FIREBASE_APP_ID` = your Firebase app ID

6. Click "Deploy"

**Your app is now live!** 🎉

Your deployment URL will be: `https://sat-practice-YOUR_USERNAME.vercel.app`

## How It Works

### Progress Syncing

- **Local Storage**: Questions and progress are stored locally in your browser first
- **Cloud Sync**: If Firebase is configured, changes automatically sync to the cloud every 3 seconds
- **Cross-Device**: Login from any device with the same browser, and your progress syncs automatically
- **Offline**: Works offline! Changes sync when you're back online

### Access from Different Devices

Both of you can:
1. Open the same deployed URL from any device
2. Progress automatically syncs between devices
3. No login needed - uses anonymous authentication
4. Each device has its own browser (if you want separate progress)

**To share progress:**
- Use the same browser on different devices
- Or clear browser data to start fresh on a device

## Admin Panel

The admin panel (for question generation) is at: `/admin`
- Default password: `satprep2024`
- **Change this password in `src/pages/AdminPage.tsx` for security!**

## Troubleshooting

### "Cloud sync disabled"
- Set all Firebase environment variables
- Restart the dev server or redeploy

### Progress not syncing
- Make sure Firebase Firestore is created
- Check that security rules are published
- Check browser console for errors

### Question generation not working
- Make sure `VITE_CLAUDE_API_KEY` is set
- Verify your Claude API key is valid

## Security Notes

⚠️ **Important:**
1. **Change the admin password** before deploying
2. **Keep API keys secret** - only add them to environment variables, never commit to git
3. **Firebase rules** are configured to only allow users to access their own data
4. **Anonymous authentication** is safe - each browser session is independent

## Alternative Deployments

### Netlify
1. Same GitHub setup as Vercel
2. Go to https://netlify.com
3. Click "New site from Git"
4. Add the same environment variables

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## For Your Son

**Share this link:**
```
https://sat-practice-YOUR_USERNAME.vercel.app
```

He can:
- Start drilling immediately
- Practice from school, home, on his phone
- Progress syncs automatically across all his devices
- See detailed analytics in Progress page

## Questions?

If something isn't working:
1. Check that `.env` has all required variables
2. Verify Firebase Firestore is created and rules are published
3. Check browser console (F12) for error messages
4. Try clearing localStorage: `localStorage.clear()` in console
