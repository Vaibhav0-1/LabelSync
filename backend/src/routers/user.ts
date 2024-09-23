import { Router } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client"
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { JWT_SECRET} from "..";
import {authMiddleware} from '../middleware';




const router =  Router()

const prismaClient = new PrismaClient();

router.get("presignedUrl", authMiddleware, (req,res)=>{
    const s3Client = new S3Client()

const command = new PutObjectCommand({
  Bucket: "decentralized-data-labeling-platform",
  Key: `/labelsync/${}`
})

const preSignedUrl = await getSignedUrl(s3Client, command, {
  expiresIn: 3600
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