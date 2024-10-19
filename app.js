// Import the necessary functions from Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";

// Firebase configuration (Your web app's Firebase config)
const firebaseConfig = {
  apiKey: "AIzaSyAB-F6Vu8huQ0zUMWO6j5XTHwfka8Eldi8",
  authDomain: "todo-6dfe7.firebaseapp.com",
  projectId: "todo-6dfe7",
  storageBucket: "todo-6dfe7.appspot.com",
  messagingSenderId: "895771140986",
  appId: "1:895771140986:web:3429273093e952dd21ecc3",
  measurementId: "G-2CNJB4X535"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

// Elements
const googleSignInBtn = document.getElementById("googleSignInBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("user-info");
const userName = document.getElementById("user-name");
const userEmail = document.getElementById("user-email");
const userPhoto = document.getElementById("user-photo");

// Google Sign-In functionality
googleSignInBtn.addEventListener("click", () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      displayUserInfo(user);
    })
    .catch((error) => {
      console.error("Error during sign-in:", error);
    });
});

// Logout functionality
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    clearUserInfo();
  }).catch((error) => {
    console.error("Error during sign-out:", error);
  });
});

// Check for current user session
onAuthStateChanged(auth, (user) => {
  if (user) {
    displayUserInfo(user);
  } else {
    clearUserInfo();
  }
});

// Function to display user info
function displayUserInfo(user) {
  userInfo.style.display = "block";
  googleSignInBtn.style.display = "none";
  
  userName.textContent = user.displayName;
  userEmail.textContent = user.email;
  userPhoto.src = user.photoURL;
}

// Function to clear user info (on logout)
function clearUserInfo() {
  userInfo.style.display = "none";
  googleSignInBtn.style.display = "inline-block";
}
