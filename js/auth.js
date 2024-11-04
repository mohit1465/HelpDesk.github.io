import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

const auth = getAuth(); // Initialize Firebase Authentication
const db = getFirestore(); // Initialize Firestore

// Login form submit event
document.getElementById('loginForm')?.addEventListener('submit', loginUser);
document.getElementById('signupForm')?.addEventListener('submit', signupUser);

document.getElementById('googleSignInicon')?.addEventListener('click', googleSignInBtn);
document.getElementById('googleLoginicon')?.addEventListener('click', googleSignInBtn);

document.getElementById('switchToSignup')?.addEventListener('click', signup);
document.getElementById('switchToLogin')?.addEventListener('click', login);
document.getElementById('switchToSignupMob')?.addEventListener('click', signup);
document.getElementById('switchToLoginMob')?.addEventListener('click', login);

function loginUser(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      alert("Login successful!");
      window.location.href = localStorage.getItem('lastPage') || 'text-editor.html';
    })
    .catch(error => {
      alert("Error: " + error.message);
    });
}

function signupUser(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      const user = userCredential.user;
      setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        posts: []
      }).then(() => {
        alert("Signup successful!");
        window.location.href = localStorage.getItem('lastPage') || 'text-editor.html';
      });
    })
    .catch(error => {
      alert("Error: " + error.message);
    });
}

function googleSignInBtn(e) {
  e.preventDefault();
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      setDoc(doc(db, 'users', user.uid), {
        name: user.displayName,
        email: user.email,
        posts: []
      }).then(() => {
        alert("Signup successful!");
        window.location.href = localStorage.getItem('lastPage') || 'text-editor.html';
      });
    })
    .catch((error) => {
      console.error("Error during sign-in:", error);
    });
}

function signup(e){
  e.preventDefault();
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('signup-form').classList.remove('hidden');
  document.getElementById('switchToSignup').classList.add('active');
  document.getElementById('switchToSignup').classList.remove('notactive');
  document.getElementById('switchToLogin').classList.add('notactive');
  document.getElementById('switchToLogin').classList.remove('active');
  document.getElementById('switchToSignupMob').classList.add('active');
  document.getElementById('switchToSignupMob').classList.remove('notactive');
  document.getElementById('switchToLoginMob').classList.add('notactive');
  document.getElementById('switchToLoginMob').classList.remove('active');
}

function login(e){
  e.preventDefault();
  document.getElementById('signup-form').classList.add('hidden');
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('switchToSignup').classList.add('notactive');
  document.getElementById('switchToSignup').classList.remove('active');
  document.getElementById('switchToLogin').classList.add('active');
  document.getElementById('switchToLogin').classList.remove('notactive');
  document.getElementById('switchToSignupMob').classList.add('notactive');
  document.getElementById('switchToSignupMob').classList.remove('active');
  document.getElementById('switchToLoginMob').classList.add('active');
  document.getElementById('switchToLoginMob').classList.remove('notactive');
}


document.addEventListener(`DOMContentLoaded`, onLoadfun);

function onLoadfun(){
  const body = document.body;
  const logoimg = document.getElementById('logo');
  const Theme = localStorage.getItem('currentTheme');
  if (Theme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    logoimg.src = 'assets/PrimeX logo dark.gif'
  } else {
      body.removeAttribute('data-theme');
      logoimg.src = 'assets/PrimeX logo light.gif'
  }
  document.getElementById('switchToSignup').classList.add('notactive');
  document.getElementById('switchToSignup').classList.remove('active');
  document.getElementById('switchToLogin').classList.add('active');
  document.getElementById('switchToLogin').classList.remove('notactive');
  document.getElementById('switchToSignupMob').classList.add('notactive');
  document.getElementById('switchToSignupMob').classList.remove('active');
  document.getElementById('switchToLoginMob').classList.add('active');
  document.getElementById('switchToLoginMob').classList.remove('notactive');
}










