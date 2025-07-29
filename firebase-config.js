// Firebase Configuration and Utilities for Hostel Management System

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD9olGjCq2R5Ty-innj4b0ZSnJn-ztFV2I",
    authDomain: "el-corazonslots.firebaseapp.com",
    projectId: "el-corazonslots",
    storageBucket: "el-corazonslots.firebasestorage.app",
    messagingSenderId: "745745248762",
    appId: "1:745745248762:web:752704c94963518b1c7443",
    measurementId: "G-7Q0RQHVXX2"
};

// Initialize Firebase
let auth, db;

// Function to initialize Firebase
function initializeFirebase() {
    try {
        if (typeof firebase === 'undefined') {
            console.error('Firebase SDK not loaded');
            return false;
        }
        
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return false;
    }
}

// Initialize Firebase when the script loads
if (typeof firebase !== 'undefined') {
    initializeFirebase();
} else {
    // Wait for Firebase to be loaded
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof firebase !== 'undefined') {
            initializeFirebase();
        } else {
            console.error('Firebase SDK not available');
        }
    });
}

// Firebase Authentication Functions
class FirebaseAuth {
    // Check if Firebase is initialized
    static isInitialized() {
        return auth && db && typeof firebase !== 'undefined';
    }

    // Get current user
    static getCurrentUser() {
        if (!this.isInitialized()) {
            console.error('Firebase not initialized');
            return null;
        }
        return auth.currentUser;
    }

    // Sign in with email and password
    static async signIn(email, password) {
        try {
            if (!this.isInitialized()) {
                throw new Error('Firebase not initialized');
            }
            
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            console.log('User signed in successfully:', userCredential.user.email);
            return userCredential.user;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    }

    // Create new user account
    static async signUp(email, password) {
        try {
            if (!this.isInitialized()) {
                throw new Error('Firebase not initialized');
            }
            
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            console.log('User account created successfully:', userCredential.user.email);
            return userCredential.user;
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    }

    // Sign out
    static async signOut() {
        try {
            if (!this.isInitialized()) {
                throw new Error('Firebase not initialized');
            }
            
            await auth.signOut();
            console.log('User signed out successfully');
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }

    // Listen to authentication state changes
    static onAuthStateChanged(callback) {
        if (!this.isInitialized()) {
            console.error('Firebase not initialized');
            return;
        }
        
        return auth.onAuthStateChanged(callback);
    }
}

// Firestore Database Functions
class FirestoreDB {
    // Save user details to Firestore
    static async saveUser(name, hostel, roomNumber, token) {
        try {
            if (!FirebaseAuth.isInitialized()) {
                throw new Error('Firebase not initialized');
            }
            
            const userData = {
                name: name,
                hostel: hostel,
                roomNumber: roomNumber,
                token: token,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const docRef = await db.collection('users').add(userData);
            console.log('User saved to Firestore with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error saving user to Firestore:', error);
            throw error;
        }
    }

    // Get all users from Firestore
    static async getAllUsers() {
        try {
            if (!FirebaseAuth.isInitialized()) {
                throw new Error('Firebase not initialized');
            }
            
            const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
            const users = [];
            
            snapshot.forEach(doc => {
                users.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log('Retrieved users from Firestore:', users.length);
            return users;
        } catch (error) {
            console.error('Error getting users from Firestore:', error);
            throw error;
        }
    }

    // Update user in Firestore
    static async updateUser(userId, updatedData) {
        try {
            if (!FirebaseAuth.isInitialized()) {
                throw new Error('Firebase not initialized');
            }
            
            const updateData = {
                ...updatedData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('users').doc(userId).update(updateData);
            console.log('User updated in Firestore:', userId);
        } catch (error) {
            console.error('Error updating user in Firestore:', error);
            throw error;
        }
    }

    // Delete user from Firestore
    static async deleteUser(userId) {
        try {
            if (!FirebaseAuth.isInitialized()) {
                throw new Error('Firebase not initialized');
            }
            
            await db.collection('users').doc(userId).delete();
            console.log('User deleted from Firestore:', userId);
        } catch (error) {
            console.error('Error deleting user from Firestore:', error);
            throw error;
        }
    }

    // Get user by ID
    static async getUserById(userId) {
        try {
            if (!FirebaseAuth.isInitialized()) {
                throw new Error('Firebase not initialized');
            }
            
            const doc = await db.collection('users').doc(userId).get();
            if (doc.exists) {
                return {
                    id: doc.id,
                    ...doc.data()
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    }

    // Search users by criteria
    static async searchUsers(criteria) {
        try {
            if (!FirebaseAuth.isInitialized()) {
                throw new Error('Firebase not initialized');
            }
            
            let query = db.collection('users');
            
            // Add search criteria
            if (criteria.name) {
                query = query.where('name', '==', criteria.name);
            }
            if (criteria.hostel) {
                query = query.where('hostel', '==', criteria.hostel);
            }
            if (criteria.roomNumber) {
                query = query.where('roomNumber', '==', criteria.roomNumber);
            }
            if (criteria.token) {
                query = query.where('token', '==', criteria.token);
            }
            
            const snapshot = await query.get();
            const users = [];
            
            snapshot.forEach(doc => {
                users.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return users;
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    }

    // Save hostel data
    static async saveHostelData(hostelData) {
        try {
            if (!FirebaseAuth.isInitialized()) {
                throw new Error('Firebase not initialized');
            }
            
            await db.collection('hostelData').doc('current').set({
                data: hostelData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('Hostel data saved to Firestore');
        } catch (error) {
            console.error('Error saving hostel data:', error);
            throw error;
        }
    }

    // Load hostel data
    static async loadHostelData() {
        try {
            if (!FirebaseAuth.isInitialized()) {
                throw new Error('Firebase not initialized');
            }
            
            const doc = await db.collection('hostelData').doc('current').get();
            if (doc.exists) {
                return doc.data().data;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error loading hostel data:', error);
            throw error;
        }
    }
}

// Utility Functions
class FirebaseUtils {
    // Generate unique room code
    static generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 3; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        code += '-';
        for (let i = 0; i < 4; i++) {
            code += Math.floor(Math.random() * 10);
        }
        return code;
    }

    // Validate email format
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate password strength
    static isValidPassword(password) {
        return password.length >= 6;
    }

    // Format timestamp
    static formatTimestamp(timestamp) {
        if (!timestamp) return 'N/A';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    }

    // Export data to JSON
    static exportToJSON(data, filename = 'hostel-data.json') {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = filename;
        link.click();
    }

    // Import data from JSON
    static importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        firebaseConfig,
        FirebaseAuth,
        FirestoreDB,
        FirebaseUtils
    };
}

// Make available globally for browser use
if (typeof window !== 'undefined') {
    window.FirebaseAuth = FirebaseAuth;
    window.FirestoreDB = FirestoreDB;
    window.FirebaseUtils = FirebaseUtils;
} 
