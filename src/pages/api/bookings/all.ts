import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow admin (in real app, check session/role)
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const bookings = await prisma.booking.findMany({
      include: { hotel: true, roomType: true },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(bookings);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
}
