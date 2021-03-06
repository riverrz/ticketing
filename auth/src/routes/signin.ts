import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import { BadRequestError, validateRequest } from "@skgittix/common";
import { User } from "../models/User";
import { Password } from "../services/password";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Please enter a valid password").trim().notEmpty(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new BadRequestError("Invalid credentials");
    }
    const isMatch = await Password.compare(existingUser.password, password);
    if (!isMatch) {
      throw new BadRequestError("Invalid credentials");
    }
    // Generate jsonwebtoken, store it on session object
    const userJwt = jwt.sign(
      { id: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };

    res.status(200).json(existingUser);
  }
);

export { router as signinRouter };
