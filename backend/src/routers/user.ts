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
    prismaClient.$transaction(async (tx: PrismaClient) => {
        await tx.task.create({
            data: {
                title: parseData.data.title ?? DEFAULT_TITLE,
                amount : 1,
                signature: parseData.data.signature,
                user_id: userId
    
            }
        })

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