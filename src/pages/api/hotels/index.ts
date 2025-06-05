// pages/api/hotels/index.ts

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { IncomingForm, Fields, Files } from "formidable";
import cloudinaryModule from "cloudinary";
import fs from "fs";
import util from "util";

// Disable Next.js default body parser so that formidable can handle the request.
export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

// Configure Cloudinary using environment variables.
const cloudinary = cloudinaryModule.v2;
if (
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET ||
  !process.env.CLOUDINARY_CLOUD_NAME
) {
  throw new Error("Missing Cloudinary credentials in environment variables.");
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to parse incoming form data using formidable.
const parseForm = (req: NextApiRequest): Promise<{ fields: any; files: any }> => {
    const form = new IncomingForm({ keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err: any, fields: Fields, files: Files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // GET: Fetch and return all hotels.
    try {
      const hotels = await prisma.hotel.findMany();
      return res.status(200).json(hotels);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      return res.status(500).json({ error: "Error fetching hotels" });
    }
  } else if (req.method === "POST") {
    // POST: Parse form data, optionally upload an image to Cloudinary, and create a hotel record.
    try {
      const { fields, files } = await parseForm(req);
      console.log("Parsed fields:", fields);
console.log("Parsed files:", files);
      const { name, location, description, price } = fields;
      const nameValue = Array.isArray(name) ? name[0] : name;
      const locationValue = Array.isArray(location) ? location[0] : location;
      const descriptionValue = Array.isArray(description) ? description[0] : description;
      const priceValue = Array.isArray(price) ? price[0] : price;
      let imageUrl = "";

      if (files.image) {
        const fileObj = Array.isArray(files.image) ? files.image[0] : files.image;
        const filePath = fileObj.filepath || fileObj.path;
        if (!filePath) {
            console.error("No file path found for the uploaded image. fileObj:", fileObj);
            throw new Error("No file path found for the uploaded image.");
          }
        
          const result = await cloudinary.uploader.upload(filePath, { folder: "hotels" });
          console.log("Cloudinary upload result:", result);
          imageUrl = result.secure_url;
          
        // Remove the temporary file.
        await util.promisify(fs.unlink)(filePath);
      }

      const roomTypesRaw = fields.roomTypes;
      let roomTypes: { name: string; price: string }[] = [];
      if (roomTypesRaw) {
        try {
          roomTypes = JSON.parse(Array.isArray(roomTypesRaw) ? roomTypesRaw[0] : roomTypesRaw);
        } catch (e) {
          console.error("Failed to parse roomTypes", e);
        }
      }
      const hotel = await prisma.hotel.create({
        data: {
          name: nameValue,
          location: locationValue,
          description: descriptionValue,
          price: parseFloat(priceValue),
          image: imageUrl,
          roomTypes: {
            create: roomTypes.filter(rt => rt.name && rt.price).map(rt => ({ name: rt.name, price: parseFloat(rt.price) }))
          }
        },
        include: { roomTypes: true },
      });
      
      return res.status(201).json(hotel);
    } catch (error) {
      console.error("Error creating hotel:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({ error: "Error creating hotel", details: errorMessage });
    }
  } else {
    // For any other HTTP methods, return 405 Method Not Allowed.
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
