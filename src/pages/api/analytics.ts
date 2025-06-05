import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [totalRevenue, totalBookings, totalHotels, bookings, hotels] = await Promise.all([
      prisma.booking.aggregate({ _sum: { /* price is per night, so sum up per booking */ total: { _avg: true } } }),
      prisma.booking.count(),
      prisma.hotel.count(),
      prisma.booking.findMany({ include: { roomType: true } }),
      prisma.hotel.findMany({ include: { roomTypes: true } }),
    ]);
    // Calculate revenue
    let revenue = 0;
    bookings.forEach(b => {
      if (b.checkIn && b.checkOut && b.roomType) {
        const nights = Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000*60*60*24));
        revenue += nights * (b.roomType.price || 0);
      }
    });
    // Occupancy rate: bookings / (hotels * 365)
    const occupancyRate = hotels.length > 0 ? Math.round((bookings.length / (hotels.length * 365)) * 1000) / 10 : 0;
    // Popular room types
    const roomTypeCounts: Record<string, number> = {};
    bookings.forEach(b => {
      if (b.roomType?.name) roomTypeCounts[b.roomType.name] = (roomTypeCounts[b.roomType.name] || 0) + 1;
    });
    const popularRoomTypes = Object.entries(roomTypeCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    res.status(200).json({
      totalRevenue: isNaN(revenue) ? 0 : revenue,
      totalBookings: bookings.length,
      occupancyRate,
      popularRoomTypes,
      totalHotels: hotels.length,
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
}
