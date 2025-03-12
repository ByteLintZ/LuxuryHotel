// pages/api/auth/profile.ts

import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const userId = session.user.id;

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch profile" });
    }
  } else if (req.method === "PUT") {
    const { name, password } = req.body;
    const updateData: { name?: string; password?: string } = {};
    if (name) {
      updateData.name = name;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update profile" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
