import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); // Consider using a singleton pattern

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

  if (!id) {
    return res.status(400).json({ error: "Invalid or missing ID parameter" });
  }

  const isUUID = /^[0-9a-fA-F-]{36}$/.test(id);
  if (!isUUID) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  if (req.method === "DELETE") {
    try {
      const hotel = await prisma.hotel.findUnique({ where: { id: String(id) } });

      if (!hotel) {
        return res.status(404).json({ error: "Hotel not found" });
      }

      await prisma.hotel.delete({ where: { id: String(id) } });

      return res.status(200).json({ message: "Hotel deleted successfully" });
    } catch (error) {
      console.error("Error deleting hotel:", error instanceof Error ? error.message : error);
      return res.status(500).json({ error: "Failed to delete hotel" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { name, location, description, price, image } = req.body;

      if (!name || !location || !description || !price || !image) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const updatedHotel = await prisma.hotel.update({
        where: { id: String(id) },
        data: {
          name,
          location,
          description,
          price: Number(price),
          image,
        },
      });

      return res.status(200).json(updatedHotel);
    } catch (error) {
      console.error("Error updating hotel:", error instanceof Error ? error.message : error);
      return res.status(500).json({ error: "Failed to update hotel" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
