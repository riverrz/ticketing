import { Publisher, Subjects, PaymentCreatedEvent } from "@skgittix/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
