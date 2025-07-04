import express from 'express';
import router from './routes/index';
import dotenv from 'dotenv';
import postgreDb from './config/dbConfig';
import { jwtStrategy } from './config/token';
import passport from "passport";
import cors from "cors"
import { envConfigs } from './config/envconfig';
import "./config/passport"
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from './middlewares/cors';


dotenv.config();

const app = express();
const port = envConfigs.port || 3000;

app.use( session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  }))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors({
//   origin: "*",
//   credentials: true,
// }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(corsMiddleware);


passport.use('jwt', jwtStrategy);


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/v1', router);

app.listen(port , () => {
  console.log(`Server is running on http://localhost:${port}`);
})



