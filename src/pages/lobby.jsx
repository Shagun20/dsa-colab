import React from "react"
import { useParams } from 'react-router-dom';

function Lobby({user_id}) {

    

    const { roomId } = useParams(); // This matches the ":roomId" in your Route

    return (<>
        <div className="flex flex-row h-[400px] animate-in fade-in zoom-in duration-500 gap-4 max-w-[600px] font-inter">

            <div className="flex-[2] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)]  p-8 rounded-[2.5rem] w-[400px] text-white flex flex-col items-center">

                <h1 className="text-xl font-semibold tracking-tight mb-5">
                    Configure Your Session
                </h1>
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent " />


                <div className="space-y-4 p-4 w-full">
                    <div className="flex justify-between text-xs uppercase tracking-tight text-gray-400">
                        <span>Duration</span>
                        <span className="text-gray-300">15 Minutes</span>
                    </div>
                    <input
                        type="range"
                        className="w-full h-1.5 bg-white/10 accent-gray-400 rounded-full cursor-pointer"
                    />
                </div>

                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent " />


                <div className="mx-4 flex flex-row p-1">
                    <div className="flex-1">



                        <div className="w-[150px] gap-4 my-4">
                            <h3 className=" text-sm font-medium tracking-tight">DIifficulty Filter</h3>

                            <div className="grid grid-cols-3 my-2 gap-2">
                                {['Easy', 'Med', 'Hard'].map((lvl) => (
                                    <button key={lvl} className="cursor-pointer text-xs w-10 h-10 flex items-center justify-center rounded-md bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition active:scale-95">

                                        {lvl.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block w-[1px] h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent mx-4 self-center" />
                    <div className="mt-4 flex-1 flex flex-col items-center">
                        <h3 className="text-white text-sm font-medium tracking-tight">Max Problems</h3>

                        <div className="mt-2 flex items-center gap-2">
                            <button className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-md bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition active:scale-95">
                                −
                            </button>

                            <span className="text-3xl font-semibold min-w-[32px] text-center">
                                3
                            </span>

                            <button className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-md bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition active:scale-95">
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
                        className="
              h-[38px]
              
              text-sm
              font-semibold
              bg-white/40 text-black font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all transform active:scale-95 shadow-lg cursor-pointer">


                        Create & Enter Room
                    </button>



                </div>

            </div>
            <div className="w-[300px] flex flex-col bg-[#161b2e] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 text-gray-100 gap-6">
                <h1 className="text-xl font-semibold tracking-tight">
                    Participants
                </h1>

                {/* Divider */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="space-y-2 text-gray-400 text-sm">
                    <div>Participant 1</div>
                    <div>Participant 2</div>
                    <div>Participant 3</div>
                </div>
            </div>
        </div>



    </>);
}

export default Lobby;