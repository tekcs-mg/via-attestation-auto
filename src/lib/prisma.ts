import { PrismaClient } from "@prisma/client";

let prisma : PrismaClient

if(process.env.NODE_ENV === 'production'){
    prisma = new PrismaClient()
}else{
    //en dev on utilise une instance globale pour eviter les doublons à chaque reload
    if(!(global as any).prisma){
        (global as any).prisma = new PrismaClient()
    }
    prisma = (global as any).prisma
}

export default prisma