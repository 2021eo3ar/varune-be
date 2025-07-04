import express from "express";
import auth from "./authRoutes";
import narratives from "./narrativesRoutes";


const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: auth,
  },
  {
    path: "/narratives",
    route: narratives,
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
