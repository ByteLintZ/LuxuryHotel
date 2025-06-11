import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== "string") return res.status(400).json({ error: "Invalid id" });

  if (req.method === "PUT") {
    const { name, price, hotelId } = req.body;
    if (!name || price === undefined || price === null || !hotelId) {
      console.error("Missing fields", { name, price, hotelId, body: req.body });
      return res.status(400).json({ error: "Missing fields" });
    }
    const parsedPrice = typeof price === "string" ? parseFloat(price) : Number(price);
    if (isNaN(parsedPrice)) {
      console.error("Invalid price", { price });
      return res.status(400).json({ error: "Invalid price" });
    }
    const roomType = await prisma.roomType.update({ where: { id }, data: { name, price: parsedPrice, hotelId } });
    return res.status(200).json(roomType);
  }
  if (req.method === "DELETE") {
    await prisma.roomType.delete({ where: { id } });
    return res.status(204).end();
  }
  return res.status(405).json({ error: "Method Not Allowed" });
}
