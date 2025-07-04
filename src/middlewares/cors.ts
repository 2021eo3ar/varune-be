import { Request, Response, NextFunction } from "express";
import cors, { CorsOptions } from "cors";
import { envConfigs } from "../config/envconfig";
const allowedOrigins = [
  "http://localhost:5173",
  envConfigs.CLIENT_REDIRECT_URL,
];
const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    console.log(`:mag: CORS Origin Attempt: ${origin}`);
    if (!origin || allowedOrigins.includes(origin)) {
      console.log(":white_check_mark: Origin Allowed:", origin);
      callback(null, true);
    } else {
      console.warn(":x: Origin Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // allow cookies/token
  methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};
export const corsMiddleware = cors(corsOptions);
