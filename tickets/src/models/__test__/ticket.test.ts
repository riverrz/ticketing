import { Ticket } from "../Ticket";

it("implements occ ", async (done) => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "123",
  });
  // Save the ticket to the db
  await ticket.save();

  // Fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two seperate changes
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // Save the first
  await firstInstance!.save();

  // Save the second fetch ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (error) {
    return done();
  }
  throw new Error("Should not reach this point");
});
