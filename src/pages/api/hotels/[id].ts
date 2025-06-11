import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import formidable from "formidable";
import cloudinaryModule from "cloudinary";
import fs from "fs";
import util from "util";

export const config = { api: { bodyParser: false } }

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
      const updateData: { name?: string; location?: string; description?: string; price?: number; image?: string } = {};
      if (req.headers["content-type"]?.includes("multipart/form-data")) {
        // Handle FormData (with image upload)
        const form = formidable({ keepExtensions: true });
        const data = await new Promise<{ fields: Record<string, string | string[]>; files: Record<string, formidable.File | formidable.File[]> }>((resolve, reject) => {
          form.parse(req, (err: unknown, fields: formidable.Fields, files: formidable.Files) => {
            if (err) reject(err);
            else resolve({ fields: fields as Record<string, string | string[]>, files: files as Record<string, formidable.File | formidable.File[]> });
          });
        });
        const { name, location, description, price } = data.fields;
        if (name !== undefined) updateData.name = Array.isArray(name) ? name[0] : name;
        if (location !== undefined) updateData.location = Array.isArray(location) ? location[0] : location;
        if (description !== undefined) updateData.description = Array.isArray(description) ? description[0] : description;
        if (price !== undefined) updateData.price = Number(price);
        let fileObj = data.files.image;
        if (Array.isArray(fileObj)) fileObj = fileObj[0];
        if (fileObj && (fileObj as formidable.File).size && (fileObj as formidable.File).size > 0) {
          const filePath = (fileObj as formidable.File).filepath;
          const cloudinary = cloudinaryModule.v2;
          const result = await cloudinary.uploader.upload(filePath, { folder: "hotels" });
          updateData.image = result.secure_url;
          await util.promisify(fs.unlink)(filePath);
        }
      } else {
        // Handle JSON
        const { name, location, description, price, image } = req.body;
        if (name !== undefined) updateData.name = Array.isArray(name) ? name[0] : name;
        if (location !== undefined) updateData.location = Array.isArray(location) ? location[0] : location;
        if (description !== undefined) updateData.description = Array.isArray(description) ? description[0] : description;
        if (price !== undefined) updateData.price = Number(price);
        if (image !== undefined) updateData.image = image;
      }
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No fields provided for update" });
      }
      const updatedHotel = await prisma.hotel.update({
        where: { id: String(id) },
        data: updateData,
      });
      return res.status(200).json(updatedHotel);
    } catch (error) {
      console.error("Error updating hotel:", error instanceof Error ? error.message : error);
      return res.status(500).json({ error: "Failed to update hotel" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
