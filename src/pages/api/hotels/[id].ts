// pages/api/hotels/[id].ts

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (req.method === "DELETE") {
    try {
      await prisma.hotel.delete({ where: { id: String(id) } });
      return res.status(204).end();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to delete hotel" });
    }
  }
  
  res.status(405).json({ error: "Method Not Allowed" });
}
