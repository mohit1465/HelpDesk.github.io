// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA086moXd8Fxz-4z56OzsCsbQ4rx5ub-K8",
    authDomain: "website-10efd.firebaseapp.com",
    projectId: "website-10efd",
    storageBucket: "website-10efd.appspot.com",
    messagingSenderId: "394728984945",
    appId: "1:394728984945:web:cafbc90a99dbef0642a6d0",
    measurementId: "G-CH0T2RNMBZ"
  };
  
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();
