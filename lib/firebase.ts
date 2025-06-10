// lib/firebase.ts
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyChpbptd5H6oxYT5CuPPFMcx3-hRXQ9z08",                 
  authDomain: "matermihach-44888.firebaseapp.com",
  projectId: "matermihach-44888",
  storageBucket: "matermihach-44888.appspot.com",
  messagingSenderId: "1042809307063",
  appId: "1:1042809307063:web:2dd8046f3b8caca17b7232"
};

export const app = initializeApp(firebaseConfig);