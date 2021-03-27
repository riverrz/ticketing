import express, { Response, Request } from "express";
import { validateRequest, requireAuth } from "@skgittix/common";
import { body } from "express-validator";

const router = express.Router();

router.post(
  "/api/orders",
  requireAuth,
  [body("ticketId").isMongoId().withMessage("TicketId must be provided")],
  validateRequest,
  async (req: Request, res: Response) => {
    res.send({});
  }
);

export { router as newOrderRouter };
