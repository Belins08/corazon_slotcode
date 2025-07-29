# Hostel Management System with Firebase

This is a hostel slot procurement system that has been migrated to use Firebase Firestore as the database instead of localStorage and Google Sheets.

## Features

- **Auto and Manual Allocation**: Automatically assign students to available rooms or manually select specific rooms
- **Gender Separation**: Ensures proper gender separation in rooms
- **Real-time Updates**: Data is synchronized with Firebase Firestore
- **Room Management**: View room details, mark payments, and manage occupants
- **Reporting**: Generate reports and export data to Excel
- **Responsive Design**: Works on desktop and mobile devices

## Firebase Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "hostel-management-system")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Firestore Database

1. In your Firebase project console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can set up security rules later)
4. Select a location for your database (choose the closest to your users)
5. Click "Done"

### 3. Get Your Firebase Configuration

1. In your Firebase project console, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "hostel-management-web")
6. Copy the firebaseConfig object

### 4. Update the Firebase Configuration

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### 5. Set Up Firestore Security Rules (Optional but Recommended)

1. In your Firebase console, go to Firestore Database
2. Click on the "Rules" tab
3. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /hostelData/{document} {
      allow read, write: if true; // For development - make more restrictive for production
    }
  }
}
```

### 6. Deploy Your Application

You can deploy this application to any static hosting service:

- **Firebase Hosting** (Recommended):
  1. Install Firebase CLI: `npm install -g firebase-tools`
  2. Login: `firebase login`
  3. Initialize: `firebase init hosting`
  4. Deploy: `firebase deploy`

- **GitHub Pages**:
  1. Push your code to a GitHub repository
  2. Go to repository settings
  3. Enable GitHub Pages

- **Netlify**:
  1. Drag and drop your project folder to Netlify
  2. Or connect your GitHub repository

## Usage

1. Open `index.html` in a web browser
2. The system will automatically load existing data from Firebase
3. Use the "Auto" mode to automatically assign students to available rooms
4. Use the "Manual" mode to manually select specific rooms
5. Click on any room to view details and manage occupants
6. Use the export functions to download reports and data

## Data Structure

The system stores data in Firebase Firestore with the following structure:

```
hostelData/
  main/
    data: {
      1: {
        name: "Hostel 1",
        rooms: {
          "Room 101": {
            code: "ABC-1234",
            student1: "John Doe",
            tenantCode1: "TNT-ABC123",
            gender1: "male",
            paid1: true,
            student2: "Jane Smith",
            tenantCode2: "TNT-DEF456",
            gender2: "female",
            paid2: false,
            status: "full",
            occupancy: 2,
            roomPrice: 7200,
            maintenanceFee: 400
          }
        }
      }
    }
    lastUpdated: timestamp
```

## Security Considerations

For production use, consider implementing:

1. **Authentication**: Add Firebase Authentication to restrict access
2. **Security Rules**: Implement proper Firestore security rules
3. **Data Validation**: Add client-side and server-side validation
4. **Backup Strategy**: Set up regular backups of your Firestore data

## Troubleshooting

- **Firebase connection errors**: Check your configuration in `firebase-config.js`
- **Permission errors**: Ensure your Firestore security rules allow read/write access
- **Data not loading**: Check the browser console for error messages
- **CORS issues**: Make sure you're serving the files from a web server, not just opening the HTML file directly

## Support

If you encounter any issues, check the browser console for error messages and ensure your Firebase configuration is correct.