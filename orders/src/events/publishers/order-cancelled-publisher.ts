import { Publisher, OrderCancelledEvent, Subjects } from "@skgittix/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
