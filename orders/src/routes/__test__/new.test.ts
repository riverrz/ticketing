import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/Order";
import { Ticket } from "../../models/Tickets";

it("throws a 401 when user is not signed in", async () => {
  await request(app).post("/api/orders").send({}).expect(401);
});

it("throws an error when invalid ticketId is provided", async () => {
  const cookie = global.signin();
  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({})
    .expect(400);
  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId: "123" })
    .expect(400);
});

it("returns an error if the ticket does not exist", async () => {
  const cookie = global.signin();
  const ticketId = new mongoose.Types.ObjectId();
  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({ ticketId })
    .expect(404);
});
it("returns an error if the ticket is already reserved", async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: "123",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });

  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});
it("reserves a ticket", async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
  });
  await ticket.save();
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);
  expect(response.body).toHaveProperty("id");
});
