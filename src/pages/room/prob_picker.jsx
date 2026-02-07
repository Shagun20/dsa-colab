import React from "react";
import { useState } from "react";

function ProblemPicker({ topics, difficulties, onConfirm }) {
    const [selectedTopic, setSelectedTopic] = useState('');
    const [selectedDiff, setSelectedDiff] = useState('');

    return (
        <div className="flex flex-col text-white rounded-2xl border border-cyan-400/40 bg-[#05071a] p-5 space-y-5   w-[500px] h-full">


            <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Your Turn to Choose!
            </h2>


            <div className="flex flex-col mb-8 items-center">
                <h3 className="mb-3 ">Select Topic </h3>
                <div className="flex flex-wrap gap-2">
                    {topics.map(topic => (
                        <button
                            key={topic}
                            onClick={() => setSelectedTopic(topic)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border ${selectedTopic === topic
                                ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                                : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300'
                                }`}
                        >
                            {topic}
                        </button>
                    ))}
                </div>
            </div>



            <div>                 <h3 className="mb-3 ">Select Difficulty </h3>

                <div className="grid grid-cols-3 gap-3">

                    {difficulties.map(diff => (
                        <button
                            key={diff}
                            onClick={() => setSelectedDiff(diff)}
                            className={`py-3 rounded-xl font-bold transition-all border ${selectedDiff === diff
                                ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {diff}
                        </button>
                    ))}
                </div>

            </div>

            <button  
                disabled={!selectedTopic || !selectedDiff}
                onClick={() => onConfirm(selectedDiff, selectedTopic)} className="mt-6 w-full  hover:border-white transition-all transform active:scale-95 shadow-lg cursor-pointer bg-cyan-500 py-3 rounded-lg disabled:opacity-40"
            >
                Confirm Selection
            </button>
        </div>

    );
}

export default ProblemPicker
