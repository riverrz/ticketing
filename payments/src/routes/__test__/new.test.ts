import { OrderStatus } from "@skgittix/common";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/Order";
import { stripe } from "../../stripe";

jest.mock("../../stripe");

it("throws an error if unauthenticated", async () => {
  await request(app).post("/api/payments").send({}).expect(401);
});

it("throws an error for invalid request body", async () => {
  const cookie = global.signin();
  await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({})
    .expect(400);
  await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({ token: "sadasd" })
    .expect(400);
  await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({ orderId: "asdasd" })
    .expect(400);
});

it("returns a 404 when purchasing unavailable order", async () => {
  const cookie = global.signin();
  await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({ token: "sadasd", orderId: mongoose.Types.ObjectId().toHexString() })
    .expect(404);
});

it("returns a 401 when purchasing an order that doesnt belong to user", async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 20,
  });
  await order.save();

  const cookie = global.signin();
  await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({ token: "sadasd", orderId: order.id })
    .expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId,
    status: OrderStatus.Cancelled,
    price: 20,
  });
  await order.save();

  const cookie = global.signin(userId);
  await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({ token: "sadasd", orderId: order.id })
    .expect(400);
});

it("returns a 201 with valid inputs", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId,
    status: OrderStatus.Created,
    price: 20,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({ token: "tok_visa", orderId: order.id })
    .expect(201);
  expect(stripe.charges.create).toBeCalled();
  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual("tok_visa");
  expect(chargeOptions.amount).toEqual(order.price * 100);
  expect(chargeOptions.currency).toEqual("inr");
});
