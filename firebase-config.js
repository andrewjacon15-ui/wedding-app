// ---------------------------------------------------------------------------
// Fill this in with YOUR Firebase project's config, then commit + push.
// Get it from: Firebase Console (https://console.firebase.google.com) >
// Project settings > General > Your apps > SDK setup and configuration.
// (Create a free project first if you don't have one yet -- it takes a minute,
// no credit card needed for the free "Spark" tier this app fits comfortably in.)
//
// These values are meant to be public (they identify your project, not secrets) --
// access control happens in Firestore security rules (see firestore.rules), not by
// hiding this file. See README.md for full setup steps.
//
// Leave apiKey blank and the app will show a "not configured yet" message instead
// of trying to connect.
// ---------------------------------------------------------------------------
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyAUv-l-sDOek9Ob35bpE-3mcjZfRgSCPXw",
  authDomain: "wedding-drink-tracker.firebaseapp.com",
  projectId: "wedding-drink-tracker",
  storageBucket: "wedding-drink-tracker.firebasestorage.app",
  messagingSenderId: "367201485491",
  appId: "1:367201485491:web:6a4691791ae05491e866c6"
};

// A shared passcode required to edit the drink menu and event settings (lightweight
// deterrent for public write rules) -- unlocks the Admin tab in the app itself.
// This is NOT strong security -- anyone who reads the page source can see it. It just
// keeps randoms from messing with your curated bar menu. Set the SAME value in
// firestore.rules before publishing. Change this before your wedding!
window.WEDDING_CODE = "cheers2026";
