import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routes from './routes/main.routes.js';
const app = express();
// const { DATABASE_URL } = process.env;

app.use(cors({
    origin: 'https://teacher-management-task.vercel.app',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
    }));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));



app.use("/api/v1", routes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});


export default app;
