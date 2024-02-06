import fastify from "fastify";

const app = fastify();

app.post("/polls", () => {

})

app.listen({ port: 3333 })
    .then(() => {
        console.log("NLW http server is running!")
});
