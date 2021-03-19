import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { errorHandler, NotFoundError } from "@skgittix/common";
import { createTicketRouter } from './routes/new'

const app = express();
app.set("trust proxy", true);

app.use(json());
app.use(
  cookieSession({
    secure: process.env.NODE_ENV !== "test",
    signed: false,
  })
);

app.use(createTicketRouter)


app.all("*", async () => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
