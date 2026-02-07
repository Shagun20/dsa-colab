import { LeetCode } from "leetcode-query";
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { db } from "./config/firebase-admin.js";
import { router } from './routes.js';
import { writeFile } from 'fs/promises';
import { firestore } from "./config/firebase-admin.js";


const lc = new LeetCode();
const app = express();
const PORT = 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('', router);






// Start the server
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}/`);
  
  // seedDatabase2();
});