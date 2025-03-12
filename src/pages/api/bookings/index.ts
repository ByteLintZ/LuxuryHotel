// pages/api/bookings/index.ts

import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  // TypeScript: user id from session (assuming it was attached in the jwt callback)
  const userId = session.user.id;

  if (req.method === "GET") {
    try {
      const bookings = await prisma.booking.findMany({
        where: { userId },
        include: { hotel: true },
      });
      return res.status(200).json(bookings);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch bookings" });
    }
  } else if (req.method === "POST") {
    const { hotelId, date } = req.body;
    try {
      const booking = await prisma.booking.create({
        data: {
          userId,
          hotelId,
          date: new Date(date),
        },
      });
      return res.status(201).json(booking);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to create booking" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
