import Link from 'next/link';
import Head from 'next/head';
import { FaHotel } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-cyan-500  flex flex-col items-center justify-center relative overflow-hidden">
      <Head>
        <title>Luxury Hotel Booking</title>
        <meta name="description" content="Book your stay at the best hotels effortlessly." />
        <meta property="og:title" content="Luxury Hotel Booking" />
        <meta property="og:description" content="Experience comfort and elegance at the best hotels." />
      </Head>

      {/* Background overlay for improved contrast */}

      <header className="w-full py-6 text-center text-3xl font-bold text-white relative">
        <div className="inline-flex items-center justify-center gap-2 animate-fadeIn">
          Luxury Hotel Booking <FaHotel className="text-yellow-300" />
        </div>
      </header>

      <main className="relative z-10 max-w-xl px-4 flex flex-col items-center gap-6 mt-10">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white text-center drop-shadow-md animate-slideInDown">
          Find Your Perfect Stay
        </h1>
        <p className="text-lg md:text-xl text-white text-center">
          Experience comfort and elegance at the best hotels.
        </p>
        <div className="flex gap-4 mt-4">
          <Link 
            href="/book"
            className="px-8 py-3 bg-white text-blue-900 rounded-lg shadow-md hover:bg-gray-100 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Book Now"
          >
            Book Now
          </Link>
        </div>
      </main>
    </div>
  );
}
