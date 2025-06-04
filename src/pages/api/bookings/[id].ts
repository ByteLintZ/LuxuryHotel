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
  const userId = session.user.id; // Ensure the user can only delete their own bookings

  if (req.method === "DELETE") {
    try {
      const hotel = await prisma.hotel.findUnique({
        where: { id: String(id) },
      });
  
      if (!hotel) {
        return res.status(404).json({ error: "Hotel not found" });
      }
  
      // Delete related bookings first
      await prisma.booking.deleteMany({
        where: { hotelId: String(id) },
      });
  
      // Now delete the hotel
      await prisma.hotel.delete({
        where: { id: String(id) },
      });
  
      return res.status(200).json({ message: "Hotel and related bookings deleted" });
    } catch (error) {
      console.error("Error deleting hotel:", error);
      return res.status(500).json({ error: "Failed to delete hotel" });
    }
  }
   else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
