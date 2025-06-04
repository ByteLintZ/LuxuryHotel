// pages/api/bookings/index.ts

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import authOptions from "../auth/[...nextauth]"; // Import your NextAuth options
import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, authOptions)) as Session | null;
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const userEmail = session.user.email;

  if (req.method === "GET") {
    try {
      const bookings = await prisma.booking.findMany({
        where: { userEmail },
        include: { hotel: true },
      });
      return res.status(200).json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return res.status(500).json({ error: "Failed to fetch bookings" });
    }
  }

  if (req.method === "POST") {
    const { hotelId, checkIn, checkOut } = req.body;

    if (!hotelId || !checkIn || !checkOut) {
      return res.status(400).json({ error: "hotelId, checkIn, and checkOut are required" });
    }

    try {
      const booking = await prisma.booking.create({
        data: {
          userEmail,
          hotelId,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
        },
        include: { hotel: true },
      });
      return res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      return res.status(500).json({ error: "Failed to create booking" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
