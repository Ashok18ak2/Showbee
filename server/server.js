import express from 'express'
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"

const app = express();
const PORT = 3000;
await connectDB();


app.use(express.json());
app.use(cors())
app.use(clerkMiddleware())

app.get('/',(req,res)=>res.send('server is Live!'))
app.use('/api/inngest',serve({ client: inngest, functions }));



export default app;