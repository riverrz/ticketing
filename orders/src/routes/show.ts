import express, { Response, Request } from "express";
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@skgittix/common";
import { param } from "express-validator";
import { Order } from "../models/Order";
const router = express.Router();

router.get(
  "/api/orders/:orderId",
  requireAuth,
  [param("orderId", "Please provide a valid orderId").isMongoId()],
  validateRequest,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate("ticket");
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    res.send(order);
  }
);

export { router as showOrderRouter };
