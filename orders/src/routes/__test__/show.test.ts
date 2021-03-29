import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Order } from "../../models/Order";
import { Ticket } from "../../models/Tickets";

it("throws an error if a user is not logged in", async () => {
  const orderId = new mongoose.Types.ObjectId();

  await request(app).get(`/api/orders/${orderId}`).send().expect(401);
});

it("throws an error if the orderId is not valid", async () => {
  await request(app)
    .get(`/api/orders/123`)
    .set("Cookie", global.signin())
    .send()
    .expect(400);
});

it("throws a 404 if the orderId is not found", async () => {
  const orderId = new mongoose.Types.ObjectId();

  await request(app)
    .get(`/api/orders/${orderId}`)
    .set("Cookie", global.signin())
    .send()
    .expect(404);
});

it("fetched the order", async () => {
  // Create a ticket
  const ticket = Ticket.build({
    title: "Concert",
    price: 30,
  });
  await ticket.save();

  const user = global.signin();

  // Create an order with the ticket
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make a request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);
  expect(fetchedOrder.id).toEqual(order.id);
});

it("returns an error if one user tries to fetch other user's order", async () => {
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
    .get(`/api/orders/${order.id}`)
    .set("Cookie", global.signin())
    .send()
    .expect(401);
});
