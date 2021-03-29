import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/Tickets";

it("throws an 401 if user is not logged in", async () => {
  await request(app).get("/api/orders").send().expect(401);
});

const buildTicket = async () => {
  const ticket = Ticket.build({ title: "Concert", price: 20 });
  ticket.save();
  return ticket;
};

it("fetches orders for a particular user", async () => {
  // Create 3 tickets
  const ticket1 = await buildTicket();
  const ticket2 = await buildTicket();
  const ticket3 = await buildTicket();

  const user1 = global.signin();
  const user2 = global.signin();

  // Create 1 order as user #1
  await request(app)
    .post("/api/orders")
    .set("Cookie", user1)
    .send({ ticketId: ticket1.id })
    .expect(201);

  // Create 2 orders as user #2
  const { body: order1 } = await request(app)
    .post("/api/orders")
    .set("Cookie", user2)
    .send({ ticketId: ticket2.id })
    .expect(201);
  const { body: order2 } = await request(app)
    .post("/api/orders")
    .set("Cookie", user2)
    .send({ ticketId: ticket3.id })
    .expect(201);

  // Make request to get orders for user #2
  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", user2)
    .expect(200);

  // Make sure we only get orders for user #2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(order1.id);
  expect(response.body[1].id).toEqual(order2.id);
  expect(response.body[0].ticket.id).toEqual(ticket2.id);
  expect(response.body[1].ticket.id).toEqual(ticket3.id);
});
