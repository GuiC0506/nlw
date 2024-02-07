import fastify from "fastify";
import { createPoll, getPoll, voteOnPoll } from "./routes/polls";

const app = fastify();

app.register(createPoll);
app.register(getPoll);
app.register(voteOnPoll);


app.listen({ port: 3333 })
    .then(() => {
        console.log("NLW http server is running!")
});
