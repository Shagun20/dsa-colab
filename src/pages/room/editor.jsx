import React from "react";
import { useState, useEffect, useRef } from "react";
import './scrollbar.css'
import { useFirebase } from "../../services/firebase";
import { useCallback } from 'react';
import debounce from 'lodash.debounce'

import MonacoEditor from "@monaco-editor/react"; //

function Editor({ setRunning, roomId, is_driver, driver_uname, codeSnippets, onFocus, center, onClose }) {
  console.log('code', codeSnippets);
  const f = useFirebase();

  const editorRef = useRef(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor; // Save the editor instance
  }

  const [selectedLang, setSelectedLang] = useState('JavaScript');

  const activeSnippet = codeSnippets.find(s => s.lang === selectedLang)
    || codeSnippets[0];

  const codes = codeSnippets.reduce((acc, element) => {
    acc[element.lang] = element.code;
    return acc;
  }, {});

  const [allCode, setAllCode] = useState(codes); // The object we just created


  const [typingStatus, setTypingStatus] = useState({ isTyping: false, driverName: driver_uname });
  console.log('updtd', allCode[selectedLang]);
  const isHydrated = useRef(false); // Track if we've loaded initial data


  useEffect(() => {
    if (!roomId) {
      console.log("roomId not ready yet");
      return;
    }

    // Subscribe and keep listening for changes
    const unsubscribe = f.subscribeToEditor(roomId, (editorData) => {
      console.log('room', roomId);
      if (!editorData) {
        console.log("No editor data found");
        return;
      }

      try {

        console.log('editor', editorData);
        console.log('driver', is_driver);

        if (!is_driver || !isHydrated.current) {

          console.log(editorData, "gg");


          if (editorData?.language) {
            setSelectedLang(editorData?.language);
            console.log(editorData, "gg");

          }
          setTypingStatus(editorData?.status);

          setAllCode(prev => ({
            ...prev,
            [editorData?.language || selectedLang]: editorData?.code // Update only the current language's code
          }));

          isHydrated.current = true;


        }

      } catch (error) {
        console.error("Error processing real-time update:", error);
      }
    });

    return () => {
      console.log("Cleaning up listener...");
      unsubscribe(); // Stop listening when component unmounts
    };

  }, [roomId]);

  //any chnges in the selected lang, or 

  const sendTypingSignal = async (roomId, isTyping) => {

    const data = {
      typing: isTyping,
      driver: driver_uname
    };

    await f.writeCode(roomId, data, 'status/')
    console.log('typing status updated');

  };

  const debouncedWrite = useCallback(
    debounce((newValue, roomId) => {
      const data = {
        lastChangeBy: driver_uname,
        updatedAt: Date.now(),
        code: newValue
      }
      f.writeCode(roomId, data);

    }, 300), // Wait 300ms after the last keystroke
    []
  );
  const handleEditorChange = async (newValue) => {
    console.log('new val', allCode[selectedLang]);

    setAllCode(prev => ({
      ...prev,
      [selectedLang]: newValue // Update only the current language's code
    }));

    sendTypingSignal(roomId, true);
    debouncedWrite(newValue, roomId);





    //update and show it a sa livestream to other users

  };





  return (

    <>
      {center && (
        <div
          className="fixed inset-0 z-[10] bg-[#11172a]/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={(e) => { onClose(); }}
        />
      )}


      <div
        onClick={!center ? onFocus : undefined}
        className={`
          transition-all duration-300 ease-in-out custom-scroller
          ${center
            ? "fixed inset-0 z-[90] ease-in-out flex items-center justify-center p-4"
            : "relative h-[500px] w-full p-4 "}
        `}
      >



        <div className={`bg-[#11172a] p-4 rounded-xl flex flex-col shadow-lg border border-cyan-400/30 transition-all
            ${center ? "relative z-10 w-[80%] h-[85%] animate-scaleIn" : " h-full"}`}>
          <div className="flex justify-between items-center px-2 mb-2">
            <label className="font-semibold text-cyan-400">
              {driver_uname}
            </label>
            <label className="text-xs text-white/60 hover:text-white">
              Driver
            </label>
            {center && (
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="p-2 cursor-pointer hover:bg-white/10 rounded-full text-white/60 hover:text-white transition"
              >
                ✕
              </button>
            )}
          </div>


          <div className="flex text-sm justify-between py-4  custom-scrollbar items-center mb-4">
            <button className="text-xs text-gray-400 hover:text-white font-bold border border-none tracking-wider">
              Hints
            </button>
            {<select

              onClick={(e) => e.stopPropagation()}
              value={selectedLang}
              onChange={async (e) => {
                console.log('ee', e)
                if (is_driver) {
                  setSelectedLang(e.target.value);
                  const lang = e.target.value;
                  const data = {
                    lastChangeBy: driver_uname,
                    language: lang,
                    updatedAt: Date.now(),
                    code: allCode[lang]
                  }
                  await f.writeCode(roomId, data);
                  console.log('updtd lang', lang)
                }

              }}
              className="bg-gray-800 text-xs font-semibold text-white border border-gray-700 rounded px-2 py-1 outline-none focus:border-cyan-400 transition-all cursor-pointer hover:bg-gray-700"            >
              {codeSnippets.map((snippet) => (
                <option key={snippet.lang} value={snippet.lang}
                  className="bg-[#11172a] text-white py-2" // This styles the internal list items
                >
                  {snippet.lang}
                </option>
              ))}
            </select>}
            {/* {
              !is_driver && <label className="font-semibold text-cyan-400">
                {selectedLang}
              </label>
            } */}
          </div>



          {/* Code area */}
          <div onClick={(e) => e.stopPropagation()} className="flex-1 bg-[#0b1020] rounded-lg p-3 text-sm font-mono text-left text-white/80 overflow-auto custom-scrollbar">
            <MonacoEditor
              onMount={handleEditorDidMount} // Add this!
              height="100%"
              language={selectedLang}
              value={allCode[selectedLang]} // Pulls the code for the active lang
              onChange={handleEditorChange}
              options={{
                readOnly: !is_driver, // Set to true for Navigators
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                // automaticLayout: true, // Crucial: resizes when the 'center' state changes
                padding: { top: 10 }
              }}
            />
          </div>

          {/* Footer */}
          <div className="mt-3 flex justify-between items-center">
            <button disabled={!is_driver} onClick={(e) => {
              e.stopPropagation();
              // Use the ref to get the absolute latest code
              const currentCode = editorRef.current ? editorRef.current.getValue() : allCode[selectedLang];
              console.log("Running code:", currentCode);
              setRunning(currentCode, selectedLang);
            }}
              className="cursor-pointer flex items-center gap-2 text-cyan-400">
              ▶
              <span className="text-sm ">Run Code</span>
            </button>

            <button className="bg-cyan-500 text-black px-4 py-1.5 rounded-lg text-sm font-semibold">
              Submit Code
            </button>
          </div>

          {!is_driver && <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${typingStatus.typing ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-xs text-gray-400">
              {typingStatus.typing
                ? `${typingStatus.driver} is typing...`
                : 'Idle'}
            </span>
          </div>
          }
        </div>
      </div>
    </>
  );
}

export default Editor;
