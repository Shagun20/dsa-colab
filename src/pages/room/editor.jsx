// import React from "react";
// import { useState, useEffect, useRef } from "react";
// import './scrollbar.css'
// import { useFirebase } from "../../services/firebase";
// import { useCallback } from 'react';
// import debounce from 'lodash.debounce'

// import MonacoEditor from "@monaco-editor/react"; //

// function Editor({ roundStatus, problem, setRunning, roomId, is_driver, driver_uname, codeSnippets, onFocus, center, onClose }) {
//   console.log('roundstatus', roundStatus);
//   const f = useFirebase();
//   console.log('prob', problem)
//   const editorRef = useRef(null);

//   function handleEditorDidMount(editor, monaco) {
//     editorRef.current = editor; // Save the editor instance
//   }

//   const [selectedLang, setSelectedLang] = useState('JavaScript');

//   const monacoLanguageMap = {
//     "JavaScript": "javascript",
//     "TypeScript": "typescript",
//     "Python3": "python",
//     "Python": "python",
//     "Java": "java",
//     "C++": "cpp",
//     "C#": "csharp",
//     "C": "c",
//     "Go": "go",
//     "Kotlin": "kotlin",
//     "Swift": "swift",
//     "Rust": "rust",
//     "Ruby": "ruby",
//     "PHP": "php",
//     "Dart": "dart",
//     "Scala": "scala",
//     "Elixir": "elixir",
//     "Erlang": "erlang",
//     "Racket": "racket"
//   };

//   // 1. Parse Metadata for the fallback template
//   const getFallbackJS = (problem) => {
//     try {
//       const meta = JSON.parse(problem.metaData);
//       const funcName = meta.name || "solution";
//       const params = meta.params ? meta.params.map(p => p.name).join(', ') : "";
//       return `var ${funcName} = function(${params}) {\n    \n};`;
//     } catch (e) {
//       return "// Start coding here...";
//     }
//   };

//   // 1. Determine if we actually need a fallback
//   const hasSnippets = codeSnippets && codeSnippets.length > 0;

//   // 2. Initialize the 'codes' object
//   // If we have snippets, start with an empty object.
//   // If not, pre-populate with the JavaScript fallback.
//   const initialValue = hasSnippets ? {} : { "JavaScript": getFallbackJS(problem) };

//   const codes = (codeSnippets || []).reduce((acc, element) => {
//     if (element && element.lang) {
//       acc[element.lang] = element.code;
//     }
//     return acc;
//   }, initialValue);

//   // 3. Selection Logic
//   // If snippets exist, find the active one. 
//   // If they don't, default to the generated 'JavaScript' key.
//   const activeSnippet = hasSnippets
//     ? (codeSnippets?.find(s => s.lang === selectedLang) || codeSnippets[0])
//     : { lang: "JavaScript", code: codes["JavaScript"] };


//   const [allCode, setAllCode] = useState(codes); // The object we just created
//   const [codeByProblem, setCodeByProblem] = useState({});


//   const [typingStatus, setTypingStatus] = useState({ isTyping: false, driverName: driver_uname });
//   console.log('updtd', allCode[selectedLang]);
//   const isHydrated = useRef(false); // Track if we've loaded initial data


//   useEffect(() => {
//     if (!roomId) {
//       console.log("roomId not ready yet");
//       return;
//     }

//     // Subscribe and keep listening for changes
//     const unsubscribe = f.subscribeToEditor(roomId, (editorData) => {
//       console.log('room', roomId);
//       if (!editorData) {
//         console.log("No editor data found");
//         return;
//       }

//       try {

//         console.log('editor', editorData);
//         console.log('driver', is_driver);

//         if (!is_driver || !isHydrated.current) {

//           console.log(editorData, "gg");


//           if (editorData?.language) {
//             setSelectedLang(editorData?.language);
//             console.log(editorData, "gg");

//           }
//           setTypingStatus(editorData?.status);

//           setAllCode(prev => ({
//             ...prev,
//             [editorData?.language || selectedLang]: editorData?.code // Update only the current language's code
//           }));

//           isHydrated.current = true;


//         }

//       } catch (error) {
//         console.error("Error processing real-time update:", error);
//       }
//     });

//     return () => {
//       console.log("Cleaning up listener...");
//       unsubscribe(); // Stop listening when component unmounts
//     };

//   }, [roomId, problem.questionId]);

//   //any chnges in the selected lang, or 

//   const sendTypingSignal = async (roomId, isTyping) => {

//     const data = {
//       typing: isTyping,
//       driver: driver_uname
//     };

//     await f.writeCode(roomId, data, 'status/')
//     console.log('typing status updated');

//   };

//   const debouncedWrite = useCallback(
//     debounce((newValue, roomId) => {
//       const data = {
//         lastChangeBy: driver_uname,
//         updatedAt: Date.now(),
//         code: newValue
//       }
//       f.writeCode(roomId, data);

//     }, 300), // Wait 300ms after the last keystroke
//     []
//   );
//   const handleEditorChange = async (newValue) => {
//     console.log('new val', allCode[selectedLang]);

//     setAllCode(prev => ({
//       ...prev,
//       [selectedLang]: newValue // Update only the current language's code
//     }));

//     sendTypingSignal(roomId, true);
//     debouncedWrite(newValue, roomId);





//     //update and show it a sa livestream to other users

//   };





//   return (

//     <>
//       {center && (
//         <div
//           className="fixed inset-0 z-[10] bg-[#11172a]/40 backdrop-blur-sm transition-opacity duration-300"
//           onClick={(e) => { onClose(); }}
//         />
//       )}


//       <div
//         onClick={!center ? onFocus : undefined}
//         className={`
//           transition-all duration-300 ease-in-out custom-scroller
//           ${center
//             ? "fixed inset-0 z-[90] ease-in-out flex items-center justify-center p-4"
//             : "relative h-[500px] w-full p-4 "}
//         `}
//       >



//         <div className={`bg-[#11172a] p-4 rounded-xl flex flex-col shadow-lg border border-cyan-400/30 transition-all
//             ${center ? "relative z-10 w-[80%] h-[85%] animate-scaleIn" : " h-full"}`}>
//           <div className="flex justify-between items-center px-2 mb-2">
//             <label className="font-semibold text-cyan-400">
//               {driver_uname}
//             </label>
//             <label className="text-xs text-white/60 hover:text-white">
//               Driver
//             </label>
//             {center && (
//               <button
//                 onClick={(e) => { e.stopPropagation(); onClose(); }}
//                 className="p-2 cursor-pointer hover:bg-white/10 rounded-full text-white/60 hover:text-white transition"
//               >
//                 ✕
//               </button>
//             )}
//           </div>




//          



//           {/* Footer */}
//           <div className="mt-3 flex justify-between items-center">


//             <button className="bg-cyan-500 text-black px-4 py-1.5 rounded-lg cursor-pointer text-sm font-semibold"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 // Use the ref to get the absolute latest code
//                 const currentCode = editorRef.current ? editorRef.current.getValue() : allCode[selectedLang];
//                 console.log("Submitting code:", currentCode);
//                 setRunning(currentCode, selectedLang, false);
//               }}
//             >
//               Submit Code
//             </button>
//           </div>


//         </div>
//       </div>
//     </>
//   );
// }

// export default Editor;


import React, { useState, useEffect, useRef, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import debounce from "lodash.debounce";
import Timer from "./timer";
import "./scrollbar.css";
import { useFirebase } from "../../services/firebase";
import { useMemo } from "react";

function Editor({
  roundStatus,
  problem,
  setRunning,
  roomId,
  is_driver,
  driver_uname,
  codeSnippets,
  onFocus,
  center,
  onClose
}) {
  const f = useFirebase();
  const editorRef = useRef(null);
  const isHydrated = useRef(false);

  const problemId = problem?.questionId;
  const endTime = useMemo(() => Date.now() + (1 * 60 * 1000), []);
  const [selectedLang, setSelectedLang] = useState("JavaScript");
  const [typingStatus, setTypingStatus] = useState({
    typing: false,
    driver: driver_uname
  });

  const monacoLanguageMap = {
    "JavaScript": "javascript",
    "TypeScript": "typescript",
    "Python3": "python",
    "Python": "python",
    "Java": "java",
    "C++": "cpp",
    "C#": "csharp",
    "C": "c",
    "Go": "go",
    "Kotlin": "kotlin",
    "Swift": "swift",
    "Rust": "rust",
    "Ruby": "ruby",
    "PHP": "php",
    "Dart": "dart",
    "Scala": "scala",
    "Elixir": "elixir",
    "Erlang": "erlang",
    "Racket": "racket"
  };

  /** ================= FALLBACK TEMPLATE ================= */
  const getFallbackJS = () => {
    try {
      const meta = JSON.parse(problem.metaData);
      const name = meta.name || "solution";
      const params = meta.params?.map(p => p.name).join(", ") || "";
      return `var ${name} = function(${params}) {\n\n};`;
    } catch {
      return "// Start coding here...";
    }
  };

  /** ================= CODE STORE ================= */
  const [codeByProblem, setCodeByProblem] = useState({});

  /** ================= INITIALIZE ON PROBLEM CHANGE ================= */
  useEffect(() => {
    if (!problemId) return;

    setCodeByProblem(prev => {
      if (prev[problemId]) return prev;

      const initial = {};
      if (codeSnippets?.length) {
        codeSnippets.forEach(s => {
          initial[s.lang] = s.code;
        });
      } else {
        initial["JavaScript"] = getFallbackJS();
      }

      return { ...prev, [problemId]: initial };
    });

    setSelectedLang(
      codeSnippets?.[0]?.lang || "JavaScript"
    );

    isHydrated.current = false;
  }, [problemId]);

  const currentCode =
    codeByProblem?.[problemId]?.[selectedLang] || "";

  /** ================= FIREBASE LISTENER ================= */
  /** ================= FIREBASE LISTENER ================= */
  useEffect(() => {
    if (!roomId || !problemId) return;

    const unsubscribe = f.subscribeToEditor(roomId, editorData => {
      if (!editorData) return;

      // Ensure we are looking at the correct problem
      if (editorData.questionId !== problem.questionId) return;

      if (!is_driver) {
        // 1. Sync the UI language first
        console.log('l', editorData)
        if (editorData.language) {
          console.log('hii')
          setSelectedLang(prev =>
            prev !== editorData.language ? editorData.language : prev
          );
        }

        setTypingStatus(editorData.status);

        // 2. Update the code store
        setCodeByProblem(prev => {
          // Determine which language key to use
          // Prioritize the incoming language from the driver

          if (!editorData.language) return;

          const targetLang = editorData.language;

          return {
            ...prev,
            [problemId]: {
              ...(prev[problemId] || {}),
              [targetLang]: editorData.code
            }
          };
        });

        isHydrated.current = true;
      }
    });

    return unsubscribe;
    // ADD selectedLang and problemId to the dependencies
  }, [roomId, problemId, is_driver]);

  /** ================= WRITE HELPERS ================= */
  const sendTypingSignal = async isTyping => {
    await f.writeCode(roomId, {
      typing: isTyping,
      driver: driver_uname
    }, "status/");
  };

  const debouncedWrite = useCallback(
    debounce((code, lang) => { // Accept lang here
      f.writeCode(roomId, {
        questionId: problem.questionId,
        lastChangeBy: driver_uname,
        updatedAt: Date.now(),
        language: lang, // Use the passed argument, NOT the state variable
        code: code
      });
    }, 300),
    [roomId, driver_uname, problem.questionId] // Add dependencies
  );

  const handleEditorChange = newValue => {
    if (!is_driver) return;
    setCodeByProblem(prev => ({
      ...prev,
      [problemId]: {
        ...(prev[problemId] || {}),
        [selectedLang]: newValue
      }
    }));

    sendTypingSignal(true);
    // Pass selectedLang explicitly so the debounce doesn't use a stale one
    debouncedWrite(newValue, selectedLang);
  };

  /** ================= RENDER ================= */
  return (
    <>
      {center && (
        <div
          className="fixed inset-0 z-[10] bg-[#11172a]/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div
        onClick={!center ? onFocus : undefined}
        className={`transition-all custom-scroller ${center
          ? "fixed inset-0 z-[90] flex items-center justify-center p-4"
          : "relative h-[500px] w-full p-4"
          }`}
      >
        <div
          className={`bg-[#11172a] p-4 rounded-xl flex flex-col border border-cyan-400/30 ${center ? "w-[80%] h-[85%]" : "h-full"
            }`}
        >
          {/* HEADER */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-cyan-400 font-semibold">{driver_uname}</span>
            <span className="text-xs text-white/60">Driver</span>
            {center && (
              <button onClick={onClose} className="cursor-pointer text-white/60">✕</button>
            )}
          </div>


          <div className="flex text-sm justify-between py-4  custom-scrollbar items-center mb-4">
            <button onClick={(e) => e.stopPropagation()}
              className="text-xs text-gray-400 justify-start hover:text-white font-bold border border-none tracking-wider">
              Hints
            </button>

            <div className="flex-1 flex justify-center min-w-[200px]">
              <Timer targetDate={endTime} />
            </div>

            {is_driver && <select

              onClick={(e) => e.stopPropagation()}
              value={selectedLang}
              onChange={async (e) => {
                // if (!is_driver) return;
                const lang = e.target.value;
                setSelectedLang(lang);

                console.log('ll', lang);
                await f.writeCode(roomId, {
                  questionId: problem.questionId,
                  lastChangeBy: driver_uname,
                  language: lang,
                  updatedAt: Date.now(),
                  code: codeByProblem?.[problem.questionId]?.[lang] || ""
                });
              }}
              className="bg-gray-800 cursor-pointer justify-end text-xs text-white rounded px-2 py-1"
            >
              {codeSnippets?.map(s => (
                <option key={s.lang} value={s.lang}>{s.lang}</option>
              ))}
            </select>
            }

            {
              !is_driver && <label className="font-semibold text-cyan-400">
                {selectedLang}
              </label>
            }
          </div>




          <div className="flex-1 bg-[#0b1020] rounded-lg p-3 text-sm font-mono text-left text-white/80
             overflow-auto custom-scrollbar flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >

            {roundStatus === "coding" && (
              <MonacoEditor
                onMount={editor => (editorRef.current = editor)}
                height="100%"
                language={monacoLanguageMap[selectedLang]}
                value={currentCode}
                onChange={handleEditorChange}
                options={{
                  readOnly: !is_driver,
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  padding: { top: 10 },
                }}
              />
            )}
            {roundStatus === "running" && (
              <span className="text-white/60">Code is Running...</span>
            )}
          </div>

          {/* FOOTER */}
          <div className="mt-3 flex justify-between">

            <button disabled={!is_driver} onClick={(e) => {
              e.stopPropagation();
              // Use the ref to get the absolute latest code
              setRunning(editorRef.current?.getValue(), selectedLang)
            }}
              className="cursor-pointer flex items-center gap-2 text-cyan-400">
              ▶
              <span className="text-sm ">Run Code</span>
            </button>

            <button disabled={!is_driver} className="bg-cyan-500 text-black px-4 py-1.5 rounded-lg cursor-pointer text-sm font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                // Use the ref to get the absolute latest code
                const currentCode = editorRef.current ? editorRef.current.getValue() : allCode[selectedLang];
                setRunning(editorRef.current?.getValue(), selectedLang, false)
              }}
            >
              Submit Code
            </button>
          </div>

          {/* {!is_driver && (
            <div className="text-xs text-gray-400">
              {typingStatus.typing
                ? `${typingStatus.driver} is typing...`
                : "Idle"}
            </div>
          )} */}

          {!is_driver && <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${typingStatus?.typing ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-xs text-gray-400">
              {typingStatus?.typing
                ? `${typingStatus.driver} is typing...`
                : 'Idle'}
            </span>
          </div>
          }


        </div>
      </div >
    </>
  );
}

export default Editor;

