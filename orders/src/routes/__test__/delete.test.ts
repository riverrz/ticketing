import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/Tickets";
import { OrderStatus } from "@skgittix/common";
import { Order } from "../../models/Order";

it("throws an error if a user is not logged in", async () => {
  const orderId = new mongoose.Types.ObjectId();

  await request(app).delete(`/api/orders/${orderId}`).send().expect(401);
});

it("throws an error if the orderId is not valid", async () => {
  await request(app)
    .delete(`/api/orders/123`)
    .set("Cookie", global.signin())
    .send()
    .expect(400);
});

it("throws a 404 if the orderId is not found", async () => {
  const orderId = new mongoose.Types.ObjectId();

  await request(app)
    .delete(`/api/orders/${orderId}`)
    .set("Cookie", global.signin())
    .send()
    .expect(404);
});

it("returns an error if one user tries to delete other user's order", async () => {
  // Create a ticket
  const ticket = Ticket.build({
    title: "Concert",
    price: 30,
  });
  await ticket.save();

  // Create an order with the ticket
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make a request to fetch the order with another user
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", global.signin())
    .send()
    .expect(401);
});

it("marks an order as cancelled", async () => {
  // Create a ticket with Ticket model
  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
  });
  await ticket.save();

  const user = global.signin();

  // Make a request to create an order
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  // Expectation to make sure order was cancelled
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it.todo("emits an order cancelled event");
