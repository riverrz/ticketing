import { Publisher, Subjects, TicketUpdatedEvent } from "@skgittix/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
