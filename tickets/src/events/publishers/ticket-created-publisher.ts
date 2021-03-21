import { Publisher, Subjects, TicketCreatedEvent } from "@skgittix/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
