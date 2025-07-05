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

app.set("trust proxy", 1); // required on Render

// Secure session cookie setup
app.use(session({
  secret: "defaultsecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    httpOnly: true,
  }
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// // ✅ Replace custom cors with proper config
// app.use(cors({
//   origin: envConfigs.clientUrl,
//   credentials: true,
// }));
app.use(corsMiddleware);

// Auth setup
app.use(passport.initialize());
app.use(passport.session());
passport.use('jwt', jwtStrategy);

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/v1', router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});




