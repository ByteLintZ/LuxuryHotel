// pages/book.tsx

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { FaCheckCircle } from 'react-icons/fa';

interface Hotel {
  id: string;
  name: string;
  location: string;
  description: string;
  price: number;
  image: string;
}

export default function Book() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const { data: session } = useSession();

  useEffect(() => {
    // Fetch available hotels from our API
    const fetchHotels = async () => {
      const res = await fetch('/api/hotels');
      const data = await res.json();
      setHotels(data);
    };
    fetchHotels();
  }, []);

  const openBookingModal = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setShowModal(true);
  };

  const createBooking = async () => {
    if (!bookingDate || !selectedHotel) return;
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotelId: selectedHotel.id, date: bookingDate })
    });
    if (res.ok) {
      alert('Booking successful!');
      setShowModal(false);
      setBookingDate('');
      setSelectedHotel(null);
    } else {
      alert('Failed to book. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-cyan-500 p-8 text-white">
      <Head>
        <title>Book a Hotel</title>
      </Head>
      <h1 className="text-3xl font-bold mb-6">Available Hotels</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map(hotel => (
          <div key={hotel.id} className="bg-white text-gray-900 rounded-lg shadow-lg p-4">
            <img src={hotel.image} alt={hotel.name} className="w-full h-40 object-cover rounded-md" />
            <h2 className="text-xl font-bold mt-2">{hotel.name}</h2>
            <p>{hotel.location}</p>
            <p className="text-sm mt-1">{hotel.description}</p>
            <p className="font-bold mt-2">${hotel.price}/night</p>
            <button 
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => openBookingModal(hotel)}
            >
              Book Now
            </button>
          </div>
        ))}
      </div>

      {showModal && selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-gray-900 w-96">
            <h2 className="text-xl font-bold mb-4">Book {selectedHotel.name}</h2>
            <label className="block mb-2">Select Date:</label>
            <input 
              type="date"
              className="border p-2 rounded w-full mb-4"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowModal(false)}>Cancel</button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2" 
                onClick={createBooking}
              >
                <FaCheckCircle /> Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
