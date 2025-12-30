import React, { useState } from "react"
import { auth } from "../services/firebase";
import { useFirebase } from "../services/firebase";
import { useNavigate } from 'react-router-dom';
import { customAlphabet } from 'nanoid';

function LoginPage() {
    const navigate = useNavigate();
    const [step, updateStep] = useState(0);
    const [username, updateUserName] = useState(null);
    let [roomId, updateRoomId] = useState('');
    const [is_host, updateIsHost] = useState(false);



    //when auth is successful, route to the relevant waiting area,
    //and when somebody chooses a particular session id, verify with the existing ones, 
    //add the participant to that lobby


    const f = useFirebase();

    const addUserToRoom = async () => {

        const user_id = await f.getUserId();

        const user_config = {
            [user_id]: {
                user_name: username,
                is_host: is_host,
                is_ready: false,
                score: 0,
                is_driver: false,
                avatar: `https://source.boringavatars.com/beam/80/${username}?colors=ffadad,ffd6a5,fdffb6,caffbf,9bf6ff`
            }
        }

        f.writeUserData(user_config, "users/" + roomId);



    }


    const handleGoogleSignIn = async () => {

        await f.handleGoogleSignIn();
        //route to the lobby
        updateIsHost(true);
        updateStep(1);




    };

    const sendHost = () => {

        const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);


        const id = nanoid();
        updateRoomId(id);
        addUserToRoom();


        const gameState = {
            gameState: {
                gameStatus: "waiting",
                createdAt: Date.now(),
                roundStatus: null,
                gameUrl: `/${id}/waiting-room`,
                lastRound: null
            }
        }
        f.writeUserData(gameState, "rooms/" + id);

        navigate(`/${id}/lobby`);



    }

    const checkValidId = async () => {


        //fn to check if there is any room whose id is valid
        //if so fetch the game state of the game

        //based on the game state drive the user to the relvant page
        //return game state url
        const room = await f.getRoomData(roomId);
        if (room) {
            navigate(room.gameState.gameUrl);
            addUserToRoom();

        }


        else {
            alert('wrong sess id');
        }



    }

    const handleSessionSignIn = () => {

        //check if the entered room id is correct, 

        //if sttaus is waiting
        checkValidId();






    }


    return (
        <>
            <div>

                {(step == 0) && <div className="gap-4 bg-white/10 backdrop-blur-xl border border-white/20 p-12 rounded-[2.5rem] w-full max-w-[500px] shadow-2xl flex flex-col items-center" >

                    <h1 className="text-2xl md:text-3xl font-bold text-white text-center tracking-tight mt-3 leading-tight">
                        Solve. Collab. Level Up.
                    </h1>

                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full rounded border border-blue h-full max-h-[70px] max-w-[320px] bg-white/80 text-gray font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all transform active:scale-95 shadow-lg cursor-pointer"                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            className="w-6 h-6 object-contain" // This is the fix!
                            alt="Google"
                        />
                        <span className="text-lg">Sign in with Google</span>
                    </button>

                    <button onClick={() => {

                        updateStep(1);

                    }}


                        className="w-full rounded border border-blue h-full max-h-[70px] max-w-[280px] bg-white/40 text-gray font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all transform active:scale-95 shadow-lg cursor-pointer"                    >
                        Join Session by ID
                    </button>



                </div>}

                {(step == 1) && <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-10 rounded-[2.5rem] w-full max-w-[420px] shadow-2xl flex flex-col items-center gap-8 ">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Enter Preferred UserName</h2>

                    <div className="relative w-full">
                        <input
                            type="text"
                            maxLength={6}
                            onChange={(e) => updateUserName(e.target.value.toUpperCase())}
                            placeholder="name"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 text-center text-4xl font-mono text-white uppercase tracking-[0.2em] outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder:opacity-20"
                        />
                        {/* Subtle underline glow */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-blue-500/50 blur-sm"></div>
                    </div>

                    {/* <button className="w-full bg-white text-black py-4 rounded-2xl text-lg hover:bg-blue-50 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer">
                        ENTER LOBBY
                    </button> */}

                    <button
                        onClick={() => {

                            addUserToRoom();

                            if (is_host)
                                sendHost();

                            else
                                updateStep(2);

                        }}

                        className="w-full rounded border border-blue h-full max-h-[70px] max-w-[280px] bg-white/40 text-gray font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all transform active:scale-95 shadow-lg cursor-pointer"                    >
                        {is_host ? 'ENTER LOBBY' : 'ENTER USERNAME'}
                    </button>
                </div>}

                {(step == 2) && <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-10 rounded-[2.5rem] w-full max-w-[420px] shadow-2xl flex flex-col items-center gap-8 ">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Enter Room ID</h2>

                    <div className="relative w-full">
                        <input
                            type="text"
                            maxLength={6}
                            onChange={(e) => updateRoomId(e.target.value.toUpperCase())}
                            placeholder="A7B2X9"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 text-center text-4xl font-mono text-white uppercase tracking-[0.2em] outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder:opacity-20"
                        />
                        {/* Subtle underline glow */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-blue-500/50 blur-sm"></div>
                    </div>

                    {/* <button className="w-full bg-white text-black py-4 rounded-2xl text-lg hover:bg-blue-50 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer">
                        ENTER LOBBY
                    </button> */}

                    <button
                        onClick={handleSessionSignIn}

                        className="w-full rounded border border-blue h-full max-h-[70px] max-w-[280px] bg-white/40 text-gray font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all transform active:scale-95 shadow-lg cursor-pointer"                    >
                        ENTER LOBBY
                    </button>
                </div>}

            </div >




        </>
    )
}

export default LoginPage;