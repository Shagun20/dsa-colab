import { useState } from "react";
import { db } from "./config/firebase-admin.js";
import { LeetCode } from "leetcode-query";
let problemSet = [];
let seenProbs = [];

const lc = new LeetCode();

async function seedDatabase() {
    try {
        console.log('Auto-Seed: Fetching problems from LeetCode...');
        const problemList = await lc.problems({ limit: 2000 });
        // const data = JSON.stringify(problemList.questions, null, 2);

        await db.ref('problemList/').set(problemList.questions);



        console.log(`Success! Seeded ${problemList.questions.length} problems into Firebase.`);
    } catch (error) {
        console.error(" Auto-Seed Failed:", error.message);
    }
}

async function fetchProblems() {

    const probs = await db.ref('problemList/').get();


    if (!probs.exists()) {
        await seedDatabase();

        let data = probs.val();
        data = Array.isArray(data) ? data : Object.values(data);

        const cleanProblems = data?.map(prob => {
            return {
                id: prob.questionFrontendId,
                title: prob.title,
                slug: prob.titleSlug,
                difficulty: prob.difficulty,
                tags: prob.topicTags ? prob.topicTags.map(tag => tag.name) : []
            };
        });
        return cleanProblems;


    }

    else {

        let data = probs.val();
        data = Array.isArray(data) ? data : Object.values(data);

        const cleanProblems = data?.map(prob => {
            return {
                id: prob.questionFrontendId,
                title: prob.title,
                slug: prob.titleSlug,
                difficulty: prob.difficulty,
                tags: prob.topicTags ? prob.topicTags.map(tag => tag.name) : []
            };
        });
        return cleanProblems;

    }


}

export async function initGame(roomId) {

    problemSet = await fetchProblems();
    console.log('room', roomId);

    //once this is done, we have the probls set, noow assign a driver based on participants list
    chooseDriver(roomId);



    // console.log('p', probs);

}

async function getProblemDetails(topic, difficulty) {
    try {
        if (!problemSet || problemSet.length == 0) {
            problemSet = await fetchProblems();
            console.log('heyyy')
        }

        if (problemSet.length != 0) {
            const eligibleProblems = problemSet.filter(prob =>
                prob.difficulty === difficulty &&
                prob.tags.includes(topic) && (!seenProbs.includes(prob.id))
            );
            if (eligibleProblems.length === 0) {
                console.warn("No problems found for these criteria!");
                return null;
            }

            const randomIndex = Math.floor(Math.random() * eligibleProblems.length);
            const problem_id = eligibleProblems[randomIndex].id;
            const problem_slug = eligibleProblems[randomIndex].slug;


            try {
                const problem = await lc.problem(problem_slug);

                console.log("Fetched Problem:", problem.title);
                seenProbs.push(problem_id);

                return problem;
            } catch (error) {
                console.error("Error fetching problem details:", error);
            }
        }

    } catch (err) {
        console.error("Failed to load problem set:", err);
        return res.status(500).json({ error: "Database load failed" });
    }



}

export function normalizeTestCases(testCases) {
  return testCases.map(tc => ({
    stdin: tc.stdin
      .trim()
      .replace(/\r\n/g, "\n"), // windows safety
    expected: tc.expected
      .trim()
      .replace(/\s+/g, "")     // remove spaces/newlines
  }));
}


export async function setProblem(roomId, topic, difficulty) {

    console.log('prob is', topic, difficulty)
    const problem = await getProblemDetails(topic, difficulty);

    console.log('2');
    const duration = await db.ref(`root/rooms/${roomId}/config/timer`).get();
    const round = await db.ref(`root/rooms/${roomId}/gameState/currentRound`).get(); 

    const startTime = Date.now();
    const endTime = startTime + (duration.val() * 60 * 1000);

    const updates = {
        'gameState/currentProblem': problem,
        'gameState/timerStartTime': startTime,
        'gameState/timerEndTime': endTime,
        'gameState/roundStatus': 'coding',
        'gameState/currentRound': round.val()+1,
        // Add the new problem to seenProbs
    };

    console.log('iu', updates);

    await db.ref(`root/rooms/${roomId}/`).update(updates);



    //set the problem into the firebase as active problem

    //update the current round and states, make status as coding, and catch it in frontend
    //also initialise the timer with the confi time , 
    //store the prob start and end time and store it in the gamestaate/

}

async function chooseDriver(roomId) {

    const participants = await db.ref(`root/users/${roomId}/`).get();

    const userIds = Object.keys(participants.val());
    console.log('paart',);

    const ind = await db.ref(`root/rooms/${roomId}`).child('currentDriverIndex').get()

    let currentIndex = ind.exists() ? ind.val() : 0;
    const nextIndex = (currentIndex + 1) % userIds.length;
    const selectedDriverId = userIds[nextIndex];

    await db.ref(`root/rooms/${roomId}/gameState/driver_id`).set(selectedDriverId);
    //updt in the users/ too


    console.log('driver is selected');


}

const initiatenextROund = () => {
    //first chk for no of rounds done and how many are pending
    chooseDriver(roomId);
    //append the prev prob to round history and clear that data from there,

    //this is called after judgement is done, and then update the whole session at redirecting it to the end page

}

const judge = () => {
    // 
    //
}

export default problemSet;

