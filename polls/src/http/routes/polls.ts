import { FastifyReply, FastifyRequest, FastifyInstance } from "fastify";
import prisma from "../../lib/prisma";
import { randomUUID } from "node:crypto"
import { z } from "zod";

export async function createPoll(app: FastifyInstance) {
    app.post("/polls", async (req: FastifyRequest, reply:FastifyReply) => {
        const createPollBody = z.object({
            title: z.string(),
            options: z.array(z.string())
        });

        const { title, options } = createPollBody.parse(req.body);
        const poll = await prisma.poll.create({
            data: {
                title,
                options: {createMany: {
                    data: options.map(option => {
                        return {
                            title: option,
                        }
                    })
                }}
            }
        });

        /* prisma.pollOption.createMany({ */
        /*     data: options.map(option => { */
        /*         return { */
        /*             title: option, */
        /*             pollId: poll.id */
        /*         } */
        /*     }) */
        /* }) */

        return reply.status(201).send(poll);
    })
}

export async function getPoll(app: FastifyInstance) {
    app.get("/polls/:pollId", async(req, reply) => {
        const getPollParams = z.object({
            pollId: z.string().uuid()
        });

        const {pollId} = getPollParams.parse(req.params);

        const poll = await prisma.poll.findUnique({
            where: { id: pollId },
            include: {options: {
                select: {
                    id: true,
                    title: true
                }
            }}
        })

        return reply.status(200).send(poll);
    })
}


export async function voteOnPoll(app: FastifyInstance) {
    app.post("/polls/:pollId/votes", async (req: FastifyRequest, reply:FastifyReply) => {
        const voteOnPollBody = z.object({
            pollOptionId: z.string().uuid()
        });

        const voteOnPollParams = z.object({
            pollId: z.string().uuid()
        });

        const { pollOptionId } = voteOnPollBody.parse(req.body);
        const { pollId } = voteOnPollParams.parse(req.params);

        let { sessionId } = req.cookies;

        if(sessionId) {
            const userVotedPrevious = await prisma.vote.findUnique({
                where: {
                    sessionId_pollId: {
                        sessionId,
                        pollId
                    }}}
            );

            if(userVotedPrevious && userVotedPrevious.pollOptionId !== pollOptionId) {
                await prisma.vote.delete({
                    where: {
                        id: userVotedPrevious.id
                        }
                });               
                
            } else if(userVotedPrevious) {
                return reply.status(400).send({ message: "You already voted on this poll"});
            } else {

            }
        };


        if(!sessionId) {
            sessionId = randomUUID();
            reply.setCookie("sessionId", sessionId, {
                path: "/",
                maxAge: 60 * 60 * 24 * 30,
                signed: true,
                httpOnly: true, // only acessible via backend
            });
        }

        await prisma.vote.create({
            data: {
                sessionId,
                pollId,
                pollOptionId
            }
        })
        return reply.status(200).send({sessionId});
    }
)}
