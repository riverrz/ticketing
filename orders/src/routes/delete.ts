import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@skgittix/common";
import express, { Response, Request } from "express";
import { param } from "express-validator";
import { Order, OrderStatus } from "../models/Order";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  [param("orderId", "Please provide a valid orderId").isMongoId()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();

    // Publish an event saying this was cancelled

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
