import { Request, Response, NextFunction } from "express";
import { AnyZodObject, z, ZodError } from "zod";
import passport from "passport";
import { UserService } from "../services";

// Extract token from Authorization header or cookie
function extractToken(req: Request) {
  let token = null;
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.replace("Bearer ", "").trim();
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  return token;
}

const verifyCallback =
  (req: Request, resolve: any, reject: any, res: Response) =>
  async (err: any, user: any, info: any) => {
    if (err || info || !user) {
      return reject(new Error("UNAUTHOURIZED USER"));
    }
    req["user"] = user;
    resolve();
  };

export const authenticateUserJwt =
  () => async (req: any, res: any, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) {
      return res
        .status(401)
        .send({ success: false, error: "UNAUTHOURIZED USER" });
    }
    req.headers["authorization"] = `Bearer ${token}`;
    return new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(req, resolve, reject, res)
      )(req, res, next);
    })
      .then(() => {
        next();
      })
      .catch((err) => {
        if (res)
          return res
            .status(401)
            .send({ success: false, error: "UNAUTHOURIZED USER" });
        next(err);
      });
  };

export const authenticateUser = [authenticateUserJwt()];

// export const authorizeAdmin = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<any> => {
//   try {
//     const userId = (req as any)["user"]?.userId;
//     if (!userId) {
//       return res
//         .status(401)
//         .send({ success: false, error: "UNAUTHOURIZED USER" });
//     }
//     const user = await UserService.getUser(userId);
//     if (!user || user.role !== "admin") {
//       return res.status(403).send({ success: false, error: "Forbidden" });
//     }
//     next();
//   } catch (error) {
//     console.error("Error authorizing admin:", error);
//     return res.status(500).send({ success: false, error: "Server Error" });
//   }
// };

export const validateRequest =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sanitizedValues = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = sanitizedValues.body;
      req.query = sanitizedValues.query;
      req.params = sanitizedValues.params;
      return next();
    } catch (error) {
      const validationErrors: { [key: string]: string } = {};

      (error as ZodError).errors.forEach((errorMessage) => {
        const fieldName = errorMessage.path.join(".");
        validationErrors[fieldName] = errorMessage.message;
      });

      res.status(400).json({ errors: validationErrors });
    }
  };