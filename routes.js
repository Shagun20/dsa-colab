import express from 'express';
import { initGame, setProblem, normalizeTestCases } from './controller.js';
import problemSet from './controller.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config({ path: './credentials.env' });
const router = express.Router();

// import { OpenRouter } from "@openrouter/sdk";

// const openrouter = new OpenRouter({
//   apiKey: "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"
// });

// Initialization
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function fetchTestCasesFromAI(problem, no_of_test_cases) {
    const problemTitle= problem.title;
    const problemSlug= problem.titleSlug;
    const test_cases= problem.sampleTestCase
    console.log('calling gemini')
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            // This ensures you get a clean JSON array without extra text
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
  Act as a Leetcode Programming Judge. 
  Problem: ${problemTitle} (slug: ${problemSlug})
  SampleTestCase: ${test_cases}

  Task: Generate ${no_of_test_cases} diverse test cases that verify the correctness of a solution.
  Format Requirements:
    - Try to do similar to sample test case.
    - Return ONLY a JSON array of objects.
    - Each object must have "stdin" and "expected".
    - "stdin" must be a string where each input parameter is on a new line (\\n).
    - "expected" must be the exact string output the program should produce.

    JSON Structure:
    [
      { "stdin": "input_line_1\\ninput_line_2", "expected": "output_string" }
    ]
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log('call done')
        return JSON.parse(text);

    } catch (error) {
        console.error("Gemini failed:", error);
        return null;
    }
}

async function judgeCodeAI(test_cases, code, language, problem, is_run=false) {
    const problemTitle= problem.title;
    const problemSlug= problem.titleSlug;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            // This ensures you get a clean JSON array without extra text
            generationConfig: { responseMimeType: "application/json" }
        });

        const run_prompt = `
  Act as a Leetcode Programming Judge. 
  Problem: ${problemTitle} (slug: ${problemSlug})
  Code: ${code}
  Language: ${language}
  SampleTestCase: ${problem.sampleTestCase}


  Task: Execute the code provided for the given LeetCode problem, and identify if this code will execute correctly or not.
  Check mainly for code correctness in the language and if it will pass any of the same test cases correctly.
  Return a JSON object:
  {
    "overallStatus": "Accepted" | "WA" | "TLE" | "MLE",
    "testReport": [{ "case": 1, "passed": true, "details": "..." }],
    "analysis": "Deep dive into why the code passed or failed."
  }
`;
    const submitPrompt = `
  Act as a Leetcode Programming Judge. 
  Problem: ${problemTitle} (slug: ${problemSlug})
  Code: ${code}
  Language: ${language}
  TestCases: ${test_cases}


  STRICT EVALUATION:
  1. Correctness: Test against 10 hidden edge cases (empty arrays, large values, etc.).
  2. Efficiency: Calculate the Big O complexity of the User Code. If the problem requires O(N) and the code is O(N^2), mark as "Time Limit Exceeded".
  3. Memory: Check for unnecessary space usage.

  Return ONLY JSON:
  {
    "overallStatus": "Accepted" | "WA" | "TLE" | "MLE",
    "complexity": { "time": "O(...)", "space": "O(...)" },
    "score": 0-100,
    "testReport": [{ "case": 1, "passed": true, "details": "..." }],
    "analysis": "Deep dive into why the code passed or failed."
  }
`;
        const prompt=is_run?run_prompt: submitPrompt;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log('call done')
        return JSON.parse(text);
    
    //     try {
    // const response = await openrouter.chat.send({
    //   // Use the stable 1.5-flash or 2.0-flash via OpenRouter
    //   model: "google/gemini-flash-1.5", 
    //   messages: [
    //     {
    //       role: "user",
    //       content: prompt,
    //     },
    //   ],
    //   // This is crucial for your JSON result
    //   response_format: { type: "json_object" }, 
    // });

    // const text = response.choices[0]?.message?.content;
    
    // if (!text) throw new Error("Empty response from AI");

    // console.log('Evaluation complete');
    // return JSON.parse(text);

  } catch (error) {
    console.error("gemini Judge failed:", error);
    
    // Fallback if quota is hit
    return {
      status: "Error",
      overallStatus: "WA",
      feedback: "The judge is currently overloaded. Please try again in 30 seconds."
    };
  }

    
}

router.get('/createGame', async (req, res) => {
    console.log('api is hit');

    try {

        const roomId = req.query.roomId;

        //fetch the problems and store them in a variable
        await initGame(roomId);
        res.status(200).json({
            success: true,
            message: "Successfully started the game"
        });


    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }

});




//fetch a specific problem  
router.get('/fetchProblem', async (req, res) => {
    console.log('fetch api is hit');
    try {

        const roomId = req.query.roomId;
        const difficulty = req.query.difficulty;
        const topic = req.query.topic;

        console.log('d', difficulty)

        //fetch the problems and store them in a variable
        await setProblem(roomId, topic, difficulty);
        res.status(200).json({
            success: true,
            message: "Successfully fetched problem"
        });


    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }


})

router.post('/runCode', async (req, res) => {
    try {

        const { problem, roomId, code, language, driverName , is_run} = req.body;
        // const lang = await fetch('https://ce.judge0.com/languages/')
        // const body = await lang.json()
        let  test_cases= await fetchTestCasesFromAI(problem, 5);
        test_cases=normalizeTestCases(test_cases)
        // const mapping = body.map(item => {
        //     const cleanedName = item.name.replace(/\s*\(.*\)/, '');
        //     return {
        //         ...item, // Keep other properties as they are
        //         name: cleanedName
        //     };
        // })
        // const id = mapping.find(item => item.name === language).id;
        const results= await judgeCodeAI(test_cases, code, language, problem);
        // console.log('tokens', tokens, code);
        // const res = await fetch(`https://ce.judge0.com/submissions/batch?tokens=${tokens.join(",")}&base64_encoded=false&fields=token,status_id,language_id`)
        // const results= await res.json();
        console.log('results', results)
        // --- RETURN THE RESULTS HERE ---

        res.status(200).json({
            success: true,
            results: results
             // This is your JSON object with overallStatus, score, etc.
        });

      //if its submit put into firebase.




    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }


})

function buildBatchRequest(testCases, code, languageId) {
  return {
    submissions: testCases.map(tc => ({
      source_code: code,
      language_id: languageId,
      stdin: tc.stdin,
      expected_output: tc.expected
    }))
  };
}

async function submitBatch(testCases, code, languageId) {
  const body = buildBatchRequest(testCases, code, languageId);
  console.log('caaliing judge 0');
  const response = await fetch(
    'https://ce.judge0.com/submissions/batch?base64_encoded=false',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  );

  const result = await response.json();
  console.log("batch response:", result);
  const tokens = result.map(r => r.token);

  return tokens; 
}



export { router };