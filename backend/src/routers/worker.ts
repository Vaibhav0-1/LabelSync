import { Router } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client"
import { JWT_SECRET} from "..";
import { workerMiddleware } from "../middleware";

export const WORKER_JWT_SECRET = JWT_SECRET + "worker";

const prismaClient = new PrismaClient();

const router =  Router()

router.get("/nexttask",workerMiddleware, async(req, res) => {
    // @ts-ignore
    const userId = req.userId;
    
    const task = await prismaClient.task.findFirst({
        where: {
            done: false,
            submissions: {
                none: {
                    worker_id: userId,
                    
                }
            }
        },
        select: {
            options: true
        }    
    })
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