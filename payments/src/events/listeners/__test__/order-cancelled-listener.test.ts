import mongoose from "mongoose";
import { Order } from "../../../models/Order";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent, OrderStatus } from "@skgittix/common";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: "2234",
    price: 20,
    status: OrderStatus.Created,
    version: 0,
  });
  await order.save();

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: "213123",
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { data, order, listener, msg };
};

it("sets the order status to cancelled", async () => {
  const { data, order, listener, msg } = await setup();
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { data, order, listener, msg } = await setup();
  // await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
