import { requireAuth, validateRequest } from "@skgittix/common";
import { body } from "express-validator";
import express, { Request, Response } from "express";
import { Ticket } from "../models/Ticket";

const router = express.Router();

router.get("/api/tickets", async (req: Request, res: Response) => {
  const tickets = await Ticket.find({});
  res.send(tickets);
});

export { router as getTicketsRouter };
