import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import React from "react";
import { FaGoogle } from "react-icons/fa";
import { toast } from "react-toastify";
import {db} from "../firebase";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";


export default function OAuth() {
  const navigate = useNavigate()
  async function onGoogleClick(){
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      //check for the user

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if(docSnap.exists()) {
        await setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
       });
      }

      navigate("/");
    } catch (error) {
      toast.error("Could not authorize with Google");

    }

  }
  return (
    <button
    type="button"
    onClick={onGoogleClick}
    className="flex items-center justify-center w-full bg-white border border-gray-300 px-7 py-3 uppercase text-sm shadow-md hover:shadow-lg active: shadow-lg transition duration-150 ease-in-out rounded">
        <FcGoogle className="text-2xl bg-white rounded-full mr-2" />
        Continue with Google
    </button>
  )
}
