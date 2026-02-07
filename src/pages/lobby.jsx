import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebase } from "../services/firebase";
import Avatar from 'boring-avatars';
import { auth } from "../services/firebase";



function Lobby(props) {

    const navigate = useNavigate();

    const user_id = localStorage.getItem('id') || props.user_id;

    // const user_id= auth.currentUser.uuid;

    const { roomId } = useParams();
    const f = useFirebase();
    let list = [];
    // This matches the ":roomId" in your Route


    const [url, seturl] = useState('');
    const [participants, setParticipants] = useState([]);
    const [host_id, setHostId] = useState(null);

    useEffect(() => {

        if (!roomId) {
            console.log("roomId not ready yet");
            return;
        }

        const unsubscribe = f.subscribeToRoom(roomId, (roomData) => {
            const gameUrl = roomData?.gameState?.gameUrl;
            const driver = roomData?.gameState?.driver_id;


            if (gameUrl) {
                console.log('url', gameUrl);
            }
            const gameStatus = roomData?.gameState?.gameStatus;




            if (gameStatus != "waiting") {
                navigate(gameUrl);

            }



            if (roomData?.gameState?.participants_list) {
                list = Object.values(roomData?.gameState?.participants_list)
                // 2. Transform the object into a list
                console.log('1', list)

                if (list) {
                    const userList = list;

                    setParticipants(userList);

                    console.log(userList);

                }
            }
        });

        return () => {
            console.log("Cleaning up listener...");
            unsubscribe(); // This stops the Firebase listener
        };

    }, [roomId]); // Re-run if room chnges


    useEffect(() => {
        if (!roomId) return;

        const fetchHost = async () => {
            try {
                // Using your existing getRoomData logic
                const host = await f.getRoomData(roomId, 'host_id');
                console.log("Host", host);
                setHostId(host);
                console.log('aaa', host, user_id);

            } catch (error) {
                console.error("Failed to fetch host:", error);
            }
        };

        fetchHost();

    }, []); //runs once to fetch the host



    const [time, setTime] = useState(15);
    const [count, setCount] = useState(1);


    // Frontend: script.js
    async function startNewGame(id) {
        try {
            // The Handshake: Requesting the data from your API
            const response = await fetch(`http://localhost:3000/createGame?roomId=${id}`);

            if (!response.ok) throw new Error('Network response was not ok');


            // Phase 3: Collaboration (The Hot Zone)
            // Now you have your clean problems ready to display!
            console.log(response);

        } catch (error) {
            console.error("Failed to create game:", error);
        }
    }

    const createGame = async () => {


        //update the game state objects
        const gameStateUpdates = {
            "config/max_prob": count*participants.length,
            "config/timer": time,

            "gameState/gameStatus": "started",
            "gameState/currentRound": 0,
            "gameState/roundStatus": "initialising",
            "gameState/gameUrl": `/${roomId}/room`,


        }

        startNewGame(roomId)
            .then(async () => {
                console.log("Success! Problems loaded.", gameStateUpdates);
                await f.updateRoomData(gameStateUpdates, roomId, '');


            })
            .catch((err) => {
                console.error("There was some issue in creating a room", err);
                displayErrorMessage(err);
            });






        //navogate to gameurl


    }

    return (<>
        {user_id === host_id && <div className="flex flex-row h-[400px] animate-in fade-in zoom-in duration-500 gap-4 max-w-[600px] font-inter">

            <div className="flex-[2] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)]  p-8 rounded-[2.5rem] w-[400px] text-white flex flex-col items-center">

                <h1 className="text-xl font-semibold tracking-tight mb-5">
                    Configure Your Session
                </h1>
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent " />


                <div className="space-y-4 p-4 font-mono w-full">
                    <div className="flex justify-between text-xs uppercase tracking-tight text-gray-400">
                        <span>Duration</span>
                        <span className="text-white">{time} MINUTES</span>
                    </div>
                    <input
                        type="range"
                        min="10" max="60"
                        value={time} // Control the input with state
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full h-1.5 bg-white/10 accent-gray-400 rounded-full cursor-pointer"
                    />
                </div>

                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent " />


                <div className="mx-4 flex flex-row p-1">

                    <div className="my-4 flex-1 flex flex-col items-center">
                        <h3 className="text-white text-sm font-medium tracking-tight">Max Problems</h3>

                        <div className="mt-2 flex items-center gap-2">
                            <button disabled={count<=1} onClick={() => setCount((count - 1))} className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-md bg-white/5 border border-white/10 text-gray-400 focus:bg-white/10 placeholder:opacity-20 hover:bg-white/10 transition active:scale-95">
                                −
                            </button>

                            <span className="text-3xl font-semibold min-w-[32px] text-center">
                                {count * participants.length}
                            </span>

                            <button onClick={() => setCount((count + 1))} className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-md bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition active:scale-95">
                                +
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-0 h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent " />
                <div className="max-h-full font-medium ms-13 text-xs w-[420px] flex items-center gap-4  p-5 rounded-xl">

                    <div className="flex w-[140px] h-[40px] items-center bg-[#11172a] rounded-lg overflow-hidden">
                        <div className="w-full bg-[#20263d] border border-white/10 rounded-xl py-4   text-center text-xl font-mono text-white/20 uppercase tracking-[0.2em] outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder:opacity-20"
                        >
                            {roomId}
                        </div>


                    </div>
                    <button
                        onClick={() => createGame()}
                        className=" h-[38px] text-sm font-semibold bg-white/40 text-black font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all transform active:scale-95 shadow-lg cursor-pointer">


                        Create & Enter Room
                    </button>



                </div>

            </div>
            <div className="w-[500px] flex flex-col bg-[#161b2e] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 text-gray-100 gap-6">
                <h1 className="text-xl font-semibold tracking-tight">
                    Participants
                </h1>

                {/* Divider */}
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="flex flex-col gap-2 text-white text-xl">
                    {participants.map((user) => (
                        <div
                            key={user}
                            className="flex items-center gap-3 w-full border-b border-white/10 pb-2 "
                        >
                            {/* Dynamic Avatar based on the username for Phase 2 */}
                            <Avatar
                                size={35}
                                name={user}
                                variant="beam"
                            />

                            {/* Username on the same line */}
                            <span className="font-mono tracking-wide">
                                {user}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        }

        {user_id !== host_id && <div className="text-white">
            <h1>
                Waiting for host to start the session....</h1></div>}




    </>);
}

export default Lobby;