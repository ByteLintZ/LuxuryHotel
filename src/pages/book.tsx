import { useState, useEffect } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import {
  FaCheckCircle,
  FaSearch,
  FaMapMarkerAlt,
  FaDollarSign,
  FaHotel,
} from "react-icons/fa";

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
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true); // Skeleton Loading
  const { data: session } = useSession();

  useEffect(() => {
    const fetchHotels = async () => {
      const res = await fetch("/api/hotels");
      const data = await res.json();
      setHotels(data);
      setFilteredHotels(data);
      setLoading(false); // Hide skeletons after loading
    };
    fetchHotels();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredHotels(hotels);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredHotels(
        hotels.filter(
          (hotel) =>
            hotel.name.toLowerCase().includes(lowerQuery) ||
            hotel.location.toLowerCase().includes(lowerQuery)
        )
      );
    }
  }, [searchQuery, hotels]);

  const openBookingModal = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setShowModal(true);
  };

  const createBooking = async () => {
    if (!bookingDate || !selectedHotel) return;

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelId: selectedHotel.id, date: bookingDate }),
    });

    if (res.ok) {
      setShowModal(false);
      setBookingDate("");
      setSelectedHotel(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      alert("Failed to book. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white">
      <Head>
        <title>Book a Hotel</title>
      </Head>

      {/* Title and Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-4xl font-bold animate-fadeIn tracking-wide">
          🏨 Available Hotels
        </h1>
        <div className="relative w-full md:w-96 mt-4 md:mt-0">
          <input
            type="text"
            placeholder="🔍 Search by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 rounded-full text-gray-900 bg-white shadow-lg focus:ring-4 focus:ring-blue-300 transition-all"
          />
          <FaSearch className="absolute right-4 top-3 text-gray-600" />
        </div>
      </div>

      {/* Hotel List (with staggered fade-in) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array(6)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-white animate-pulse rounded-lg shadow-lg p-4 h-64"
                ></div>
              ))
          : filteredHotels.map((hotel, index) => (
              <div
                key={hotel.id}
                className="bg-white text-gray-900 rounded-lg shadow-lg p-4 transform transition-transform hover:scale-105 hover:shadow-2xl duration-300 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-40 object-cover rounded-md transition-opacity duration-500 hover:opacity-80"
                />
                <h2 className="text-xl font-bold mt-2">{hotel.name}</h2>
                <p className="text-gray-700 flex items-center gap-2">
                  <FaMapMarkerAlt /> {hotel.location}
                </p>
                <p className="text-sm text-gray-600">{hotel.description}</p>
                <p className="font-bold mt-2 flex items-center gap-1">
                  <FaDollarSign /> {hotel.price}/night
                </p>
                <button
                  className="mt-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-full hover:scale-105 transition-transform"
                  onClick={() => openBookingModal(hotel)}
                >
                  Book Now
                </button>
              </div>
            ))}
      </div>

      {/* Booking Modal (Glassmorphism) */}
      {showModal && selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center animate-fadeIn">
          <div className="bg-white p-6 rounded-xl shadow-lg text-gray-900 w-96 backdrop-blur-lg bg-opacity-90 transition-all duration-300 scale-95 hover:scale-100 relative">
            <div className="flex justify-center">
              <FaHotel className="text-blue-500 text-5xl mb-2" />
            </div>

            <h2 className="text-xl font-bold mb-4 text-center">
              Book {selectedHotel.name}
            </h2>

            <label className="block mb-2 text-gray-700">Select Date:</label>
            <input
              type="date"
              className="border p-2 rounded w-full mb-4"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={createBooking}
              >
                <FaCheckCircle /> Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg animate-slideIn">
          <FaCheckCircle className="text-xl" />
          <span>Booking successful!</span>
        </div>
      )}
    </div>
  );
}
