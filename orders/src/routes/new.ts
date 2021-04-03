import express, { Response, Request } from "express";
import {
  validateRequest,
  requireAuth,
  NotFoundError,
  BadRequestError,
} from "@skgittix/common";
import { body } from "express-validator";
import { Ticket } from "../models/Tickets";
import { Order, OrderStatus } from "../models/Order";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
  "/api/orders",
  requireAuth,
  [body("ticketId").isMongoId().withMessage("TicketId must be provided")],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    // Find the ticket, the user is trying to order in DB
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }
    // Make sure that the ticket is not already reserved
    const isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }

    // Calculate an expiration date for the order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the DB
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });

    await order.save();

    // Publish an event related to order creation
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: new Date(order.expiresAt).toISOString(),
      version: order.version,
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });
    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
