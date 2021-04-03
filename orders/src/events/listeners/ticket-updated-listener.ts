import { Listener, Subjects, TicketUpdatedEvent } from "@skgittix/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Tickets";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;
  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const { title, price, id } = data;

    const ticket = await Ticket.findOne({
      _id: data.id,
      version: data.version - 1,
    });
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    ticket.title = title;
    ticket.price = price;
    await ticket.save();
    msg.ack();
  }
}
