import Link from "next/link";
import { AiOutlineStar, AiOutlineFacebook, AiOutlineInstagram, AiOutlineTwitter } from "react-icons/ai";
import { motion } from "framer-motion";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  return (
    <div className="bg-gray-50">
      {/* 🚀 Hero Section */}
      <motion.div 
        className="relative h-screen w-full bg-[url('/hotel.jpg')] bg-cover bg-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full bg-gradient-to-r text-center">
  <motion.h1 
    className="text-5xl font-bold drop-shadow-md bg-gradient-to-r from-[#e0cef4] via-[#fceabb] to-[#f4cf69] bg-clip-text text-transparent transition-all duration-500 hover:bg-gradient-to-r hover:from-[#ff9a9e] hover:via-[#fad0c4] hover:to-[#fad0c4]"
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 1, delay: 0.2 }}
  >
    Experience Luxury Like Never Before
  </motion.h1>
  <motion.p 
    className="mt-4 text-lg text-gray-200"
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 1, delay: 0.4 }}
  >
    Book a stay at world-class hotels with 
    <span className="bg-gradient-to-r from-[#c0f9ff] to-[#fee891] bg-clip-text text-transparent font-bold transition-all duration-500 hover:bg-gradient-to-r hover:from-[#ff758c] hover:via-[#ff7eb3] hover:to-[#ff758c]">
      LuxeStay.
    </span>
  </motion.p>
  <motion.div 
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.6 }}
  >
    <button
      className="mt-6 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg shadow-md transition-all duration-500 ease-in-out \
        hover:bg-gradient-to-r hover:from-[#ffecd2] hover:to-[#fcb69f] hover:scale-105 hover:shadow-lg"
      onClick={() => {
        if (!session) {
          router.push("/auth/login");
        } else {
          router.push("/book");
        }
      }}
    >
      Book Now
    </button>
  </motion.div>
</div>


      </motion.div>

      {/* 🌀 Wave Divider (Hero → Hotels) */}
      <div className="flex justify-center bg-gradient-to-r from-sky-400 via-white to-[#f0dc6d] py-4">
        <Image src="/www.svg" alt="Wave Divider" width={800} height={120} className="w-2/3 drop-shadow-xl" />
      </div>

      {/* 🏨 Featured Hotels */}
      <div className="py-16 px-6 bg-gradient-to-b from-[#c0f1f8] to-white">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">🏨 Featured Hotels</h2>

        <motion.div 
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {[
            { name: "Azure Sands Resort", img: "/hotel1.jpg", price: "$980/night" },
            { name: "Château Lumière", img: "/hotel2.jpg", price: "$450/night" },
            { name: "Celestia Sky Tower Hotel", img: "/hotel3.jpg", price: "$560/night" },
          ].map((hotel, index) => (
            <motion.div 
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <Image src={hotel.img} alt={hotel.name} width={400} height={224} className="w-full h-48 object-cover" />
              <div className="p-5 text-center">
                <h3 className="text-black text-grad text-xl font-bold">{hotel.name}</h3>
                <p className="text-gray-600">{hotel.price}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>      

      {/* ⭐ Customer Reviews */}
      <div className="py-16 bg-gradient-to-b from-[#ffffff] to-[#eddd83]">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">⭐ Customer Reviews</h2>

        <motion.div 
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {[
            { name: "Alice W.", review: "Absolutely amazing service and beautiful rooms!" },
            { name: "John D.", review: "The best luxury experience I've ever had." },
            { name: "Sophia K.", review: "Incredible amenities and stunning views!" },
          ].map((review, index) => (
            <motion.div 
              key={index}
              className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-gray-700 italic">&quot;{review.review}&quot;</p>
              <div className="flex items-center justify-center mt-2">
                <AiOutlineStar className="text-yellow-400 text-2xl drop-shadow-md animate-pulse" />
                <AiOutlineStar className="text-yellow-400 text-2xl drop-shadow-md animate-pulse" />
                <AiOutlineStar className="text-yellow-400 text-2xl drop-shadow-md animate-pulse" />
                <AiOutlineStar className="text-yellow-400 text-2xl drop-shadow-md animate-pulse" />
                <AiOutlineStar className="text-yellow-400 text-2xl drop-shadow-md animate-pulse" />
              </div>
              <p className="text-black mt-2 font-bold">{review.name}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* 🌎 Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 text-center">
        <p className="text-lg">© 2025 LuxeStay. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4 text-2xl">
          <Link href="https://facebook.com" className="hover:text-yellow-400 transition">
            <AiOutlineFacebook />
          </Link>
          <Link href="https://instagram.com" className="hover:text-yellow-400 transition">
            <AiOutlineInstagram />
          </Link>
          <Link href="https://twitter.com" className="hover:text-yellow-400 transition">
            <AiOutlineTwitter />
          </Link>
        </div>
      </footer>
    </div>
  );
}
