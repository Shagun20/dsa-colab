import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { createContext , useContext, useState, useEffect} from "react";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";

import { getDatabase, ref, set, get, onValue, child } from "firebase/database";

// const starCountRef = ref(db, 'posts/' + postId + '/starCount');
// onValue(starCountRef, (snapshot) => {
//   const data = snapshot.val();
//   updateStarCount(postElement, data);
// });


const getRoomData = async (roomId) => {
  const db = getDatabase();
  const dbRef = ref(db);
  const room_snapshot = await get(child(dbRef, `root/rooms/${roomId}`));
  
  if (room_snapshot.exists()) {
    return(room_snapshot.val()); // This is your room object
  } else {
    console.log("No room found");
    return null;
  }
};

function writeUserData(data, link) {
  const db = getDatabase();

  set(ref(db, 'root/' + link), data);
}


const firebaseConfig = {

  apiKey: "AIzaSyAvLAh8oDkWSvVPE6Ak6Om8ogU0Q9VWrBU",
  authDomain: "colab-code-ed3cb.firebaseapp.com",
  databaseURL: "https://colab-code-ed3cb-default-rtdb.firebaseio.com",
  projectId: "colab-code-ed3cb",
  storageBucket: "colab-code-ed3cb.firebasestorage.app",
  messagingSenderId: "363408041720",
  appId: "1:363408041720:web:7a04d6d7366b708ffabd0d"
};

// Initialize Firebase
const Firebasecontext = createContext(null);





const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        try {
            const result = await signInWithPopup(auth, provider);
            
            const user = result.user;
            console.log("Success! Welcome,", user);

        } catch (error) {
            console.error("Authentication Error:", error.message);
            alert("Failed to sign in. Please try again.");
        }
    };

export const FirebaseProvider = (props) => {
  return (
    <Firebasecontext.Provider value={{handleGoogleSignIn, writeUserData, getRoomData, getUserId}}>

      {props.children}

    </Firebasecontext.Provider>
  )
};

export const useFirebase=() => useContext(Firebasecontext);
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const getUserId = () => {
  const user = auth.currentUser;
  
  // If user exists, return their UID, otherwise return null
  return user ? user.uid : null;
}