// Import the functions you need from the SDKs you need
import { initializeApp, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

try {
  var app = getApp();
} catch (error) {
  const firebaseConfig = {
    apiKey: "AIzaSyCmhbRB3VpTWElpKu4H76qxrpHwYzQSoxQ",
    authDomain: "my-chat-bc2bc.firebaseapp.com",
    databaseURL:
      "https://my-chat-bc2bc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "my-chat-bc2bc",
    storageBucket: "my-chat-bc2bc.appspot.com",
    messagingSenderId: "298859401464",
    appId: "1:298859401464:web:8cb0328c39d821685c6b0d",
  };
  var app = initializeApp(firebaseConfig);
}

export const auth = getAuth(app);
