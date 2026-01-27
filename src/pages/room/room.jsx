import { React, useState, useEffect } from "react";
import Problem from "./problem";
import Editor from "./editor";
import ProblemPicker from "./prob_picker";
import Chat from "./chat";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useFirebase } from "../../services/firebase";
import { auth } from "../../services/firebase";

function Room(props) {
    const [focused, setFocused] = useState(null);
    const availableTopics = ["Array", "Hash Table", 'Graph']
    const [participants, setParticipants] = useState(null);
    const [roundStatus, setRoundStatus] = useState("initialising");
    const [activeProblem, setProblem] = useState(null);
    let user_id = localStorage.getItem("id") || props.user_id;
    const [users, setUsers] = useState(null);

    const [driver_id, setDriver] = useState(null);
    const [driver_uname, setDriverName] = useState(null);

    const show_prob_screen = (driver_id !== null) && (driver_id === user_id);

    const show_guest_screen = (driver_id !== null) && (driver_id !== user_id);
    const [show_loading, updateLoading] = useState(driver_id === null);
    const loadingMessage = (show_guest_screen || show_prob_screen)
        ? "Setting up the coding environment..."
        : "Loading the session for you...";
    const { roomId } = useParams();
    const f = useFirebase();
    const [running, setRunning] = useState(false);



    const loading = true;

    const handleConfirmSelection = async (selectedDifficulty, selectedTopic) => {
        updateLoading(true);
        console.log('chosen', selectedDifficulty, selectedTopic);
        try {

            const response = await fetch(`http://localhost:3000/fetchProblem?roomId=${roomId}&difficulty=${selectedDifficulty}&topic=${selectedTopic}`);

            // 2. Prepare updates for the Room (Phase 2: The Handshake)
            // const gameStateUpdates = {
            //     'gameState/currentProblem': chosenProblem,
            //     'gameState/show_prob_screen': false, // Hide picker for everyone
            //     'gameState/status': 'SOLVING'
            // };

            // 3. Update Firebase Room Data
            // await f.updateRoomData(gameStateUpdates, roomId, '');

            console.log("Problem selected and room updated!");
            updateLoading(false);
        } catch (error) {
            console.error("Selection failed:", error);
        }
    };


    function updateScores() {

    }
    //listen to chnges in the room -> 



    function startNewProblem() {

    }

    const handleRunCode = async (code, selectedLang) => {
        // setIsRunning(true);
        console.log('calling run api', code, selectedLang)



        try {
            const response = await fetch(`http://localhost:3000/runCode`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    problem: activeProblem,
                    roomId: roomId,
                    code: code, // The code from your Monaco state
                    language: selectedLang,
                    driverName: driver_uname,
                    test_case: activeProblem.sampleTestCase
                }),
            });


            console.log("Execution Result:", response.json());

        }



        catch (error) {
            console.error("Failed to run code:", error);
        }
    };



    useEffect(() => {
        if (!roomId) {
            console.log("roomId not ready yet");
            return;
        }

        // Subscribe and keep listening for changes
        const unsubscribe = f.subscribeToRoom(roomId, (roomData) => {
            if (!roomData || !roomData.gameState) {
                console.log("No room data found");
                return;
            }

            try {
                const user_id = localStorage.getItem("id") || props.user_id;
                const participantsObj = roomData.gameState.participants_list;
                const gameState = roomData.gameState;

                const currentStatus = gameState.status || gameState.roundStatus;
                const currentProblem = gameState.currentProblem;

                // 1. Verify Participants List exists
                if (!participantsObj) {
                    console.warn("No participants list in game state");
                    return;
                }

                setUsers(participantsObj);

                // 2. Convert Object keys to Array for logic
                const participants = Object.keys(participantsObj);

                // 3. Security Guard: Kick user if they are no longer in the room
                if (!participants.includes(user_id)) {
                    console.log('User not in participant list');
                    alert("You have been removed or the room is closed.");
                    // Optional: navigate('/')
                    return;
                }

                // 4. Update Driver State in real-time
                // This will trigger automatically when the cycle updates
                const currentDriverId = roomData.gameState.driver_id;

                updateLoading(false);
                setRoundStatus(currentStatus)
                setDriver(currentDriverId);
                setDriverName(participantsObj[currentDriverId]); // Handle nested object name
                setParticipants(participants);

                if (currentStatus === 'coding' && currentProblem) {
                    setProblem(currentProblem);
                }

                console.log("Sync successful. Driver is:", currentDriverId);

            } catch (error) {
                console.error("Error processing real-time update:", error);
            }
        });

        return () => {
            console.log("Cleaning up listener...");
            unsubscribe(); // Stop listening when component unmounts
        };

    }, [roomId]);


    // null | "problem" | "editor" | "chat"

    return (

        <>


            {show_loading && (
                <div className="text-white animate-pulse">{loadingMessage}</div>
            )}



            {roundStatus == "initialising" && show_prob_screen && !show_loading && <div>
                <ProblemPicker
                    topics={availableTopics}
                    difficulties={['Easy', 'Medium', 'Hard']}
                    onConfirm={handleConfirmSelection} // The room functio

                ></ProblemPicker>
            </div>}

            {driver_uname && roundStatus == "initialising" && show_guest_screen && <div className="text-white">
                {driver_uname} is choosing a problem !
            </div>}


            {roundStatus == "coding" && <div>
                <div className="relative h-screen w-screen bg-[#0b1020] text-white flex overflow-hidden">
                    {/* Normal layout */}
                    <div className="flex w-full h-full">

                        <div className="w-[30%] h-full ">
                            <Problem title={activeProblem.title} question={activeProblem.content} onFocus={() => setFocused("problem")} />
                        </div>

                        <div className="w-[45%]">
                            <Editor setRunning={handleRunCode} roomId={roomId} is_driver={show_prob_screen} driver_uname={show_prob_screen ? 'You' : driver_uname} codeSnippets={activeProblem.codeSnippets}
                                center={focused === "editor"}
                                onFocus={() => setFocused("editor")}
                                onClose={() => setFocused(null)} />
                        </div>

                        <div className="w-[25%]">
                            <Chat roomId={roomId} participants={users} center={focused === "chat"}
                                onFocus={() => setFocused("chat")}
                                onClose={() => setFocused(null)} />
                        </div>
                    </div>

                    {/* Center-stage overlay */}
                    {roundStatus == "coding" && focused && (
                        <CenterStage onClose={() => setFocused(null)}>
                            {focused === "problem" && <Problem title={activeProblem.title} question={activeProblem.content} center />}
                            {/* {focused === "editor" && <Editor driver_uname={ show_prob_screen ? 'You' : driver_uname } codeSnippets={activeProblem.codeSnippets} center />} */}
                            {/* {focused === "chat" && <Chat center />} */}
                        </CenterStage>
                    )}


                </div>

            </div>}

        </>

    );
}

export default Room;


function CenterStage({ children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

            {/* Background dim */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Focused content */}
            <div className="relative z-10 w-[80%] h-[85%] animate-scaleIn">
                {children}
            </div>
        </div>
    );
}
