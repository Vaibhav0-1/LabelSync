import { Router } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client"
import { JWT_SECRET} from "..";
import { workerMiddleware } from "../middleware";
import { getNextTask } from "../db";
import { createSubmissionInput } from "../types";
import { TOTAL_DECIMALS } from "../config";

export const WORKER_JWT_SECRET = JWT_SECRET + "worker";

const TOTAL_SUBMISSIONS = 100;

const prismaClient = new PrismaClient();

const router =  Router()

router.get("/balance", workerMiddleware, async(req,res) =>{
        // @ts-ignore
        const userId = req.userId;

        const worker = await prismaClient.worker.findFirst({
            where: {
                id : Number(userId)
            }
        })

        res.json({
            pendingAmount: worker?.pending_amount,
            lockedAmount: worker?.locked_amount
        })   
})

router.post("/submission", workerMiddleware, async(req,res) => {
    // @ts-ignore
    const userId = req.userId;
    const body = req.body;
    const parsedBody  = createSubmissionInput.safeParse(body);

    if(parsedBody.success){
        const task = await getNextTask(Number(userId));
        if(!task || task?.id !== Number(parsedBody.data.taskId)) {
            return res.status(411).json({
                message: "Incorrect task id"
            })
        }

        const amount = (Number(task.amount) / TOTAL_SUBMISSIONS).toString()

        const submisison = await prismaClient.$transaction(async tx => {
            const submission = await tx.submission.create({
                data: {
                    option_id: Number(parsedBody.data.selection),
                    worker_id: userId,
                    task_id: Number(parsedBody.data.taskId),
                    amount
                }
            })

        await tx.worker.update({
            where: {
                id: userId,
            },
            data: {
                pending_amount: {
                    increment: Number(amount)
                }
            }
        })

        return submission;
    })

        const nextTask = await getNextTask(Number(userId));
        res.json({
            nextTask,
            amount
        })

    } else{
         res.status(411).json({
            message: "Incorrect inputs"
         })
    }  
})

router.get("/nexttask",workerMiddleware, async(req, res) => {
    // @ts-ignore
    const userId = req.userId;
    
    const task = await getNextTask(Number(userId));

    if (!task) {
        res.status(411).json({
            message: "No more tasks left for you to review"
        })
    } else {
        res.status(411).json({
            task
    })
    }
})

router.post("/signin", async(req,res)=>{
        //Todo: add sign verificartion logic here
        const hardcodedWalletAddress = "3hwCCfEKk3Buj36NKzzgDEiraeM175h8REKnSfjQKbBa"


        const existingUser = await prismaClient.worker.findFirst({
            where: {
                address: hardcodedWalletAddress
            }
        })  
    
        if (existingUser){
            const token = jwt.sign({
                userId: existingUser.id
            }, WORKER_JWT_SECRET)
    
            res.json({
                token
            })
    
        } else{
            const user = await prismaClient.worker.create({
                data:{
                    address: hardcodedWalletAddress,
                    pending_amount: 0,
                    locked_amount: 0
                }
            })
    
            const token = jwt.sign({
                userId: user.id
            }, WORKER_JWT_SECRET)
    
            res.json({
                token
            })
        }
    
});

export default router;