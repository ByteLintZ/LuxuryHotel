// pages/bookings.tsx

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { FaCalendarAlt } from 'react-icons/fa';

interface Booking {
  id: string;
  date: string;
  hotel: {
    id: string;
    name: string;
    location: string;
    image: string;
  }
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    const res = await fetch('/api/bookings');
    const data = await res.json();
    setBookings(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-cyan-500 p-8 text-white">
      <Head>
        <title>My Bookings</title>
      </Head>
      <h1 className="text-3xl font-bold mb-6">My Past Bookings</h1>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white text-gray-900 rounded-lg shadow-lg p-4">
              <img src={booking.hotel.image} alt={booking.hotel.name} className="w-full h-40 object-cover rounded-md" />
              <h2 className="text-xl font-bold mt-2">{booking.hotel.name}</h2>
              <p>{booking.hotel.location}</p>
              <p className="mt-2 flex items-center gap-2">
                <FaCalendarAlt /> {new Date(booking.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
