// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBxlYfW-vLQS0foO0nZ8TNgcVJkQ57NNkM",
  authDomain: "novio-91bc4.firebaseapp.com",
  projectId: "novio-91bc4",
  storageBucket: "novio-91bc4.appspot.com",
  messagingSenderId: "301570914083",
  appId: "1:301570914083:web:495a7457d3b6ff042b3e96",
  measurementId: "G-DK7JWCQEDX"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore()