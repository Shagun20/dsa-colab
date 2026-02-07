import React, { useEffect, useState } from 'react';
import { useFirebase } from "../../services/firebase";
import { useParams } from 'react-router-dom';
import { useLocation, useNavigate } from "react-router-dom";

const RoundHistoryPage = () => {

    const { roomId } = useParams();

    console.log('room', roomId);

    const [history, setHistory] = useState([]);

    const f = useFirebase();
    const navigate = useNavigate();


    // Inside your firebase service/hook
    const getSessionHistory = async (roomId) => {

        const data = await f.getRoomData(roomId, 'roundHistory') || [];

        console.log('d', data)
        if (!data || typeof data !== "object") {
            return [];
        }

        {

            return Object.entries(data)
                .filter(([_, val]) => val !== null)
                .map(([key, val]) => ({
                    roundId: key,
                    ...val
                }));
        }
    };

    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});


    useEffect(() => {
        const fetchData = async () => {
            // Calling it exactly like your f.getRoomData pattern
            const data = await getSessionHistory(roomId);
            setHistory(data);
            setLoading(false);
        };
        fetchData();
    }, [roomId, f]);






    if (loading) return <div className="min-h-screen bg-[#05071a] flex items-center justify-center text-cyan-400">Loading Recap...</div>;

    return (
        <div className="h-screen bg-[#05071a] overflow-hidden flex items-center justify-center p-6 text-white font-sans">
            <div
                className="
        bg-white/10 backdrop-blur-2xl
        border border-white/20
        rounded-[2.5rem]
        w-full max-w-[600px]
        max-h-[600px]
        shadow-2xl
        flex flex-col
        px-10 py-8
      "
            >
                {/* Title */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Round History
                    </h2>
                    <p className="text-xs text-white/40 tracking-widest uppercase mt-1">
                        Session Recap
                    </p>
                </div>

                {(history.length>0) &&
                    <div className="mt-6 flex-1 overflow-y-scroll pr-2 space-y-4 custom-scrollbar">
                        {history?.map((round) => (
                            <div
                                key={round.roundId}
                                className="bg-white/5 border border-white/10 rounded-2xl p-3 transition-all hover:bg-white/10 text-left"
                            >
                                <div className="flex justify-between items-start">
                                    {/* LEFT */}
                                    <div className="flex flex-col">
                                        <h4 className="text-sm font-semibold text-white">
                                            {round.problemTitle || `Problem ${round.roundId}`}
                                        </h4>

                                        <p className="text-[11px] text-white/40 uppercase tracking-widest mt-1">
                                            Solved by: {round.driver || "Anonymous"}
                                        </p>
                                    </div>

                                    {/* RIGHT */}
                                    <span
                                        className={`text-xs font-bold tracking-widest uppercase whitespace-nowrap ${round.overallStatus === "Accepted"
                                            ? "text-green-400"
                                            : "text-red-400"
                                            }`}
                                    >
                                        {round.overallStatus === "Accepted" ? "Accepted" : "Failed"}
                                    </span>
                                </div>
                                <p
                                    onClick={() =>
                                        setExpanded((prev) => ({
                                            ...prev,
                                            [round.roundId]: !prev[round.roundId],
                                        }))
                                    }
                                    className={`mt-3 text-sm text-white/70 leading-snug text-left cursor-pointer transition-all ${expanded[round.roundId] ? "" : "line-clamp-3"
                                        }`}
                                >
                                    {round.analysis || "No analysis available for this round."}
                                </p>
                            </div>
                        ))}
                    </div>}


                {/* Divider */}
                <div className="my-6 w-1/2 h-[1px] bg-blue-500/50 blur-sm mx-auto" />

                {/* Footer Stats */}
                <div className="text-center text-sm text-white/60 mb-4">
                    Team Success:&nbsp;
                    <span className="text-white font-semibold">
                        {history.filter(r => r.overallStatus === "Accepted").length}
                    </span>
                    /{history.length}

                </div>

                {/* Actions */}
                <div className="flex justify-center">
                    <button

                        onClick={() => navigate('/')}
                        className="
          w-full max-w-[300px]
          bg-white/40 text-black font-semibold
          py-3 px-6 rounded-xl
          hover:bg-white transition-all
          active:scale-95 cursor-pointer
          shadow-lg
        ">
                        Play Again
                    </button>
                </div>
            </div>
        </div>
    );




};

export default RoundHistoryPage;