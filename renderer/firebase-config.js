// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // 코드 추가
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmhbRB3VpTWElpKu4H76qxrpHwYzQSoxQ",
  authDomain: "my-chat-bc2bc.firebaseapp.com",
  projectId: "my-chat-bc2bc",
  storageBucket: "my-chat-bc2bc.appspot.com",
  messagingSenderId: "298859401464",
  appId: "1:298859401464:web:8cb0328c39d821685c6b0d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // 코드 추가
