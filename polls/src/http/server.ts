import fastify from "fastify";
import { createPoll } from "./routes/polls";

const app = fastify();

app.register(createPoll);

app.listen({ port: 3333 })
    .then(() => {
        console.log("NLW http server is running!")
});
