import { Publisher, Subjects, ExpirationCompleteEvent } from "@skgittix/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
