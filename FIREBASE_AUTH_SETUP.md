# Firebase Authentication Setup

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard

## Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" as a sign-in provider
5. Add your domain (localhost:3000 for development) to authorized domains

## Step 3: Get Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" icon to add a web app
4. Register your app
5. Copy the Firebase configuration object

## Step 4: Set Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Firebase configuration values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Step 5: Test Authentication

1. Run `npm run dev`
2. Click "Sign In" in the navbar
3. Try signing in with Google

## Features Implemented

- ✅ Google Authentication with Firebase
- ✅ User state persistence
- ✅ Protected routes
- ✅ User profile display
- ✅ Sign out functionality
- ✅ Error handling
- ✅ Loading states

## Files Modified

- `src/lib/firebase.js` - Firebase configuration
- `src/context/AuthContext.js` - Authentication context with Firebase
- `src/app/auth/page.js` - Authentication page
- `src/components/Navbar.jsx` - Updated to show user info and logout
- `next.config.mjs` - Added Google image domains
