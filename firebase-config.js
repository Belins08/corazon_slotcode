// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // This will be unique to your app
  authDomain: "el-corazonslots.firebaseapp.com",
  databaseURL: "https://el-corazonslots.firebaseio.com", // For Realtime Database, often based on your project ID
  projectId: "el-corazonslots",
  storageBucket: "el-corazonslots.appspot.com",
  messagingSenderId: "745745248762",
  appId: "YOUR_APP_ID", // This will be unique to your app
  measurementId: "G-498636854" // For Google Analytics
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();