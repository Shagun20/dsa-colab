import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { getDatabase, ref, set } from 'firebase/database'
import { app } from './services/firebase'
import './App.css'
import LoginPage from './pages/login_page'
import { Route, Routes } from 'react-router-dom'
import backgroundImage from './assets/bg.jpg';
import Lobby from './pages/lobby'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './services/firebase'
import { useFirebase } from "./services/firebase";



function App() {
  const [count, setCount] = useState(0);
  const f = useFirebase();
  let user_id=f.getUserId();
  


  return (
    <>

      <Routes>



        <Route path='/' element={<div className="min-h-screen w-full flex items-center justify-center bg-cover bg-cover bg-[#05071a] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] bg-center bg-no-repeat"
        >
          <LoginPage></LoginPage>
        </div>} />
        <Route path="/:roomId/lobby" element={<div className="min-h-screen w-full flex items-center justify-center bg-cover bg-[#05071a] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] bg-center bg-no-repeat"
        >
          <Lobby user_id={user_id} ></Lobby>
        </div>} />
        <Route path='/:roomId/room' element={<div className="min-h-screen bg-blue w-full flex items-center justify-center bg-cover bg-center bg-no-repeat">

          Room
        </div>} />

        <Route path='/:roomId/waiting-room' element={<div className="min-h-screen bg-[#05071a] w-full flex items-center justify-center bg-cover bg-center bg-no-repeat text-white items-center">


          <h1>
            Waiting for host to start the session..

          </h1>

        </div>} />







      </Routes>


    </>
  )
}

export default App
