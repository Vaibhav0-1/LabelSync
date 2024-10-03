import { Router } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client"
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { JWT_SECRET} from "..";
import { authMiddleware } from '../middleware';
import { createTaskInput } from "../types";


const DEFAULT_TITLE = "Select the most clickable thumbnail";
   
const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.ACCESS_SECRET;

const s3Client = new S3Client({
    credentials: {
        accessKeyId:  accessKeyId as string,
        secretAccessKey:  secretAccessKey as string,
    },
    region: "eu-north-1"
}); 

const router =  Router()

const prismaClient = new PrismaClient();

router.get("/task", authMiddleware, async (req, res) => {
    //@ts-ignore
    const taskId = req.query.taskId
    //@ts-ignore
    const userId = req.query.userId

    const taskDetails = await prismaClient.task.findFirst({
        where: {
            user_id: Number(userId),
            id: Number(taskId),
        }
    })

    if (!taskDetails) {
        return res.status(411).json({
            message: "You dont have acces to this task"
        })
    }
    //can you make this faster?
    const responses = await prismaClient.submission.findMany({
        where:{
            task_id: Number(taskId)
        },
        include : {
            option: true
        }
    });

    const result: Record<string, {
        count: number;
        task: {
            imageUrl: string
        }
    }> = {};
    responses.forEach(r => {
        if(!result[r.option_id]) {
            result[r.option_id] = {
                count: 1,
                task: {
                    imageUrl: r.option.image_url
                }
            }
        }else{
            result[r.option_id].count++;
        }
    });

    res.json({
        result
    })

})

router.post("/task", authMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId
    // validate the inputs from the user;
    const body = req.body;

    const parseData = createTaskInput.safeParse(body);

    const user = await prismaClient.user.findFirst({
        where: {
            id: userId
        }
    })

    if (!parseData.success) {
        return res.status(411).json({
            message: "You've sent the wrong inputs"
        })
    }

    //parse the signature here to ensure the person has paid $50
    let response = await  prismaClient.$transaction(async tx => {
        const response = await tx.task.create({
            data: {
                title: parseData.data.title ?? DEFAULT_TITLE,
                amount : "1",
                signature: parseData.data.signature,
                user_id: userId
            }
        });
        console.log(parseData.data.options.map(x => ({
            image_url: x.imageUrl,
            task_id: response.id
        })))

        await tx.option.createMany({
            data: parseData.data.options.map(x => ({
                image_url: x.imageUrl,
                task_id: response.id
            }))
        })
        return response;
    })

    res.json({
        id : response.id
    })
})


router.get("/presignedUrl", authMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;


    const command = new PutObjectCommand({
        Bucket: "decentralized-data-labeling-platform",
        Key: `labelsync/${userId}/${Math.random()}/image.jpg`
      })
      
      const preSignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600
      })
      

    res.json({
        preSignedUrl
    })
})

router.post("/signin", async(req,res)=>{
    //Todo: add sign verificartion logic here
    const hardcodedWalletAddress = "3hwCCfEKk3Buj36NKzzgDEiraeM175h8REKnSfjQKbBe"


    const existingUser = await prismaClient.user.findFirst({
        where: {
            address: hardcodedWalletAddress
        }
    })  

    if (existingUser){
        const token = jwt.sign({
            userId: existingUser.id
        }, JWT_SECRET)

        res.json({
            token
        })

    } else{
        const user = await prismaClient.user.create({
            data:{
                address: hardcodedWalletAddress,
            }
        })

        const token = jwt.sign({
            userId: user.id
        }, JWT_SECRET)

        res.json({
            token
        })
    }


});

export default router;