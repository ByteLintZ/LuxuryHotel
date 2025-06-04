import { useEffect, useState } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { FaCalendarAlt, FaTimesCircle, FaHotel } from "react-icons/fa";
import Modal from "react-modal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion"; // Framer Motion for animations

Modal.setAppElement("#__next");

interface Booking {
  id: string;
  date: string;
  hotel: {
    id: string;
    name: string;
    location: string;
    image: string;
  };
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id: string) => {
    setSelectedBookingId(id);
    setModalIsOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedBookingId(null);
    setModalIsOpen(false);
  };

  const cancelBooking = async () => {
    if (!selectedBookingId) return;
    try {
      const res = await fetch(`/api/bookings/${selectedBookingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to cancel booking");

      setBookings((prev) => prev.filter((booking) => booking.id !== selectedBookingId));

      toast.success("Booking canceled successfully!", { autoClose: 3000 });
    } catch (err) {
      toast.error("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-cyan-400 to-cyan-600 p-8 text-white">
      <Head>
        <title>My Bookings</title>
      </Head>

      <ToastContainer position="top-right" />

      <motion.h1
        className="text-4xl font-bold mb-6 flex items-center gap-3 drop-shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FaHotel className="text-yellow-300" /> My Bookings
      </motion.h1>

      {loading ? (
        // Skeleton Loader Animation
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg shadow-xl p-4 animate-pulse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="w-full h-44 bg-gray-300 rounded-md"></div>
                <div className="h-6 bg-gray-400 rounded w-3/4 mt-3"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mt-2"></div>
              </motion.div>
            ))}
        </div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : bookings.length === 0 ? (
        <p className="text-center text-lg">No bookings yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookings.map((booking) => (
            <motion.div
              key={booking.id}
              className="bg-white text-gray-900 rounded-lg shadow-xl p-4 transition-all transform hover:scale-105 hover:shadow-2xl border-l-4 border-yellow-300"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={booking.hotel.image}
                alt={booking.hotel.name}
                className="w-full h-44 object-cover rounded-md"
              />
              <h2 className="text-2xl font-bold mt-3">{booking.hotel.name}</h2>
              <p className="text-sm text-gray-600">{booking.hotel.location}</p>
              <p className="mt-2 flex items-center gap-2 text-blue-900 font-semibold">
                <FaCalendarAlt /> {new Date(booking.date).toLocaleDateString()}
              </p>
              <motion.button
                onClick={() => openDeleteModal(booking.id)}
                className="mt-4 flex items-center gap-2 text-red-500 hover:text-red-700 transition"
                whileTap={{ scale: 0.95 }}
              >
                <FaTimesCircle /> Cancel Booking
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modalIsOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-md shadow-lg max-w-md mx-auto text-center relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-center">
                <FaHotel className="text-blue-500 text-5xl mb-2" />
              </div>

              <h2 className="text-xl font-bold text-gray-800">Cancel Booking</h2>
              <p className="text-gray-600 mt-2">Are you sure you want to cancel this booking?</p>

              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={cancelBooking}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Yes, Cancel
                </button>
                <button
                  onClick={closeDeleteModal}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  No, Keep It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
