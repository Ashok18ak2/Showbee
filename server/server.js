import express from 'express'
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import showRouter from './routes/showRoutes.js';

const app = express();
const PORT = 3000;
await connectDB();


app.use(express.json());
app.use(cors())
app.use(clerkMiddleware())

app.get('/',(req,res)=>res.send('server2 is Live!'))
app.use('/api/inngest',serve({ client: inngest, functions }));
app.use('/api/show',showRouter)

app.listen(PORT,()=>console.log(`server is listening to Port ${PORT}`));

export default app;