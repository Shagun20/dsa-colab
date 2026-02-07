import express from 'express';
import { initGame, setProblem, normalizeTestCases, runCode, initiatenextRound, submitCode } from './controller.js';
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
  const problemTitle = problem.title;
  const problemSlug = problem.titleSlug;
  const test_cases = problem.sampleTestCase
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

  ALWAYS return output in the valid given JSON Structure:
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

async function judgeCodeAI(test_cases, code, language, problem, is_run = true) {
  const problemTitle = problem.title;
  const problemSlug = problem.titleSlug;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      // This ensures you get a clean JSON array without extra text
      generationConfig: { responseMimeType: "application/json" }
    });
    const run_prompt = `
  ### ROLE: Strict LeetCode Judge (Sample Validator)
  ### CONTEXT:
  - Problem: ${problemTitle}
  - Language: ${language}
  - User Code: """${code}"""
  - Sample Input: ${problem.sampleTestCase}

  ### TASK:
  1. If User Code is empty or just comments, return "Error" and score 0.
  2. Mentally execute the code against the sample input. 
  3. Compare the result with the expected output for ${problemTitle}.

  ### OUTPUT FORMAT:
  Return ONLY JSON:
  {
    "overallStatus": "Accepted" | "WA" | "Runtime Error",
    "score": 0-100,
    "complexity": { "time": "N/A", "space": "N/A" },
    "testReport": [{ "case": 1, "input": "${problem.sampleTestCase}", "expected": "...", "actual": "...", "passed": boolean }],
    "analysis": "Explain the sample test result."
  }
`;

    const submitPrompt =
      `### ROLE: Elite Competitive Programming Judge
 ### CONTEXT:
 - Problem: ${problemTitle}
 - Language: ${language}
 - User Code: """${code}"""
 - Hidden Test Cases: ${test_cases}

 ### MANDATORY EVALUATION PROTOCOL:
 1. **Code Sanity**: If the code is empty, contains only comments, or is a "dummy" function that returns a hardcoded value to bypass tests, set overallStatus to "WA" and score to 0 immediately.
 2. **Logical Validation**: Step through the code using the inputs in ${test_cases}. You MUST simulate the execution. If the code’s return value does not match the expected output for ANY case, that specific case passed must be false.
 3. **Null/Edge Cases**: Be ruthless. If the code fails to handle null inputs, empty arrays, or single-node trees (where applicable to the problem), penalize the score heavily.
 4. **Complexity Guard**: If the code uses nested loops for a problem requiring linear time, or fails to use the optimal data structure, it cannot receive a score above 60, even if it passes all tests.

 ### OUTPUT FORMAT (Strict JSON only):
 {
   "overallStatus": "Accepted" | "WA" | "TLE" | "MLE",

    "score": 0-100,

    "complexity": { "time": "O(...)", "space": "O(...)" },

    "testReport": [{ "case": 1, "passed": boolean, "details": "..." }],

    "analysis": "Critically analyze logic and efficiency."
   
  } `;
    const prompt = is_run ? run_prompt : submitPrompt;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```json|```/g, "").trim();

    // 2. REGEX FIX: Replace "bad" control characters (newlines/tabs) 
    // inside the string literals so JSON.parse doesn't choke.
    console.log('Evaluation complete');
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
      overallStatus: "Runtime Error",
      score: 0,
      testReport: [],
      analysis: "The judge returned an unreadable format. Please try running again."
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

router.get('/nextRound', async (req, res) => {
  console.log('next round api is hit');

  try {

    const roomId = req.query.roomId;

    //fetch the problems and store them in a variable
    await initiatenextRound(roomId);
    res.status(200).json({
      success: true,
      message: "Successfully started the next round"
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

    const { problem, roomId, code, language, driverName, is_run } = req.body;
    // const lang = await fetch('https://ce.judge0.com/languages/')
    // const body = await lang.json()
    let test_cases = await fetchTestCasesFromAI(problem, 5);
    test_cases = normalizeTestCases(test_cases)
    // const mapping = body.map(item => {
    //     const cleanedName = item.name.replace(/\s*\(.*\)/, '');
    //     return {
    //         ...item, // Keep other properties as they are
    //         name: cleanedName
    //     };
    // })
    // const id = mapping.find(item => item.name === language).id;
    const results = await judgeCodeAI(test_cases, code, language, problem, is_run);
    // console.log('tokens', tokens, code);
    // const res = await fetch(`https://ce.judge0.com/submissions/batch?tokens=${tokens.join(",")}&base64_encoded=false&fields=token,status_id,language_id`)
    // const results= await res.json();
    console.log('results', results)
    // --- RETURN THE RESULTS HERE ---
    if (is_run)
      await runCode(roomId, results);

    else
      await submitCode(roomId, results);

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