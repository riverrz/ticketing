import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";

it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({ title: "asjndkan", price: 20 })
    .expect(404);
});
it("returns  a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: "asjndkan", price: 20 })
    .expect(401);
});
it("returns  a 401 if the user does not own the ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "ajksndkj", price: 20 });
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({ title: "ashbdjknkj", price: 2200 })
    .expect(401);
});
it("returns a 400 if the user provides invalid title or price", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "ajksndkj", price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "", price: 20 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "asdasd", price: -10 })
    .expect(400);
});
it("updates the ticket provided valid inputs", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "ajksndkj", price: 20 });

  const updatedTitle = "Updated Ticket";
  const updatedPrice = 200;

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: updatedTitle, price: updatedPrice })
    .expect(200);

  const updatedResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(updatedResponse.body.title).toEqual(updatedTitle);
  expect(updatedResponse.body.price).toEqual(updatedPrice);
});
