// pages/api/bookings/index.ts

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import authOptions from "../auth/[...nextauth]"; // Import your NextAuth options
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions) as { user: { email: string } }; // ✅ Explicitly typing session

  console.log("Session Data:", session); // ✅ Debugging log

  if (!session || !session.user || !session.user.email) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const userEmail = session.user.email as string;

  if (req.method === "GET") {
    try {
      // Expire overdue pending payment bookings (older than 10 minutes)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      await prisma.booking.updateMany({
        where: {
          status: "Pending Payment",
          createdAt: { lt: tenMinutesAgo },
        },
        data: { status: "Cancelled" },
      });
      const bookings = await prisma.booking.findMany({
        where: { userEmail },
        include: { hotel: true, roomType: true },
      });
      return res.status(200).json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return res.status(500).json({ error: "Failed to fetch bookings" });
    }
  }

  if (req.method === "POST") {
    const { hotelId, roomTypeId, checkIn, checkOut, paymentMethod, paymentDetails, status } = req.body;

    if (!hotelId || !roomTypeId || !checkIn || !checkOut) {
      return res.status(400).json({ error: "hotelId, roomTypeId, checkIn, and checkOut are required" });
    }

    // Validate date format and logic
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format for checkIn or checkOut" });
    }
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ error: "checkOut must be after checkIn (at least 1 night)" });
    }
    if (checkInDate < new Date(new Date().toDateString())) {
      return res.status(400).json({ error: "checkIn date must be today or in the future" });
    }

    // Validate hotel and room type exist
    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }
    const roomType = await prisma.roomType.findUnique({ where: { id: roomTypeId } });
    if (!roomType || roomType.hotelId !== hotelId) {
      return res.status(404).json({ error: "Room type not found for this hotel" });
    }

    // Calculate number of nights
    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / msPerDay);
    if (nights < 1) {
      return res.status(400).json({ error: "Booking must be at least 1 night" });
    }
    // Calculate total price: (hotel.price + roomType.price) * nights
    const totalPrice = (hotel.price + roomType.price) * nights;

    try {
      const booking = await prisma.booking.create({
        data: {
          userEmail,
          hotelId,
          roomTypeId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          paymentMethod: paymentMethod || null,
          paymentDetails: paymentDetails ? JSON.stringify(paymentDetails) : null,
          status: paymentMethod ? (status || "Confirmed") : "Pending Payment",
        },
        include: { hotel: true, roomType: true },
      });
      if (!booking) {
        return res.status(500).json({ error: "Booking creation failed" });
      }
      return res.status(201).json({ ...booking, nights, totalPrice });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error creating booking:", errorMessage);
      return res.status(500).json({ error: "Failed to create booking", details: errorMessage });
    }
  }

  if (req.method === "PUT") {
    const { hotelId, roomTypeId, checkIn, checkOut, createdAt, paymentMethod, paymentDetails, status } = req.body;
    if (!hotelId || !roomTypeId || !checkIn || !checkOut || !createdAt) {
      return res.status(400).json({ error: "Missing required fields for payment update" });
    }
    try {
      // Find the pending booking by user, hotel, roomType, checkIn, checkOut, and createdAt
      const booking = await prisma.booking.findFirst({
        where: {
          userEmail,
          hotelId,
          roomTypeId,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          createdAt: new Date(createdAt),
          status: "Pending Payment",
        },
      });
      if (!booking) {
        return res.status(404).json({ error: "Pending booking not found or already paid/expired" });
      }
      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentMethod,
          paymentDetails: paymentDetails ? JSON.stringify(paymentDetails) : null,
          status: status || "Confirmed",
        },
      });
      return res.status(200).json(updated);
    } catch {
      return res.status(500).json({ error: "Failed to update booking for payment" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
