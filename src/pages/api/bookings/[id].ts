import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { id } = req.query; // The booking ID from the request URL
  const userEmail = session.user.email; // Use email for user identification

  if (req.method === "DELETE") {
    try {
      // Find the booking and ensure it belongs to the user
      const booking = await prisma.booking.findUnique({
        where: { id: String(id) },
      });
      if (!booking || booking.userEmail !== userEmail) {
        return res.status(404).json({ error: "Booking not found" });
      }
      await prisma.booking.delete({
        where: { id: String(id) },
      });
      return res.status(200).json({ message: "Booking deleted" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      return res.status(500).json({ error: "Failed to delete booking" });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
