import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // List all room types with hotel info
    const roomTypes = await prisma.roomType.findMany({ include: { hotel: true } });
    return res.status(200).json(roomTypes);
  }
  if (req.method === "POST") {
    const { name, price, hotelId } = req.body;
    if (!name || !price || !hotelId) return res.status(400).json({ error: "Missing fields" });
    const roomType = await prisma.roomType.create({ data: { name, price: Number(price), hotelId } });
    return res.status(201).json(roomType);
  }
  return res.status(405).json({ error: "Method Not Allowed" });
}
