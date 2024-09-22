import { Router } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client"

const JWT_SECRET = "VAIBHAV123"

const router =  Router()

const prismaClient = new PrismaClient();

//signin with wallet
// signinwith message 
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