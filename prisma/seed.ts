import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const userData: Prisma.UserCreateInput[] = [
    {
        email : "admin@gmail.com",
        fName : "Sithija",
        lName : "Himantha",
        passwordHash : "$2a$12$GmwdhloMsxtEn7q7EUDcO.ZVuWRkIv4CNi6j0XO009/1IKHGmybNO",
        role : "ADMIN"
    }
];

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

main();