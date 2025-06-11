import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { FaCalendarAlt, FaHotel, FaInfoCircle, FaTimesCircle } from "react-icons/fa";
import Modal from "react-modal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion"; // Framer Motion for animations
import Image from "next/image"; // Next.js Image component

Modal.setAppElement("#__next");

interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  nights?: number;
  totalPrice?: number;
  paymentMethod?: string;
  paymentDetails?: string | null;
  status?: string;
  createdAt?: string;
  hotel: {
    id: string;
    name: string;
    location: string;
    image: string;
    price?: number;
  };
  roomType?: {
    id: string;
    name: string;
    price: number;
  };
}

function getPendingCountdown(createdAt: string): { expired: boolean; minutes: number; seconds: number } {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const msLeft = 10 * 60 * 1000 - (now - created);
  if (msLeft <= 0) return { expired: true, minutes: 0, seconds: 0 };
  const minutes = Math.floor(msLeft / 60000);
  const seconds = Math.floor((msLeft % 60000) / 1000);
  return { expired: false, minutes, seconds };
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    hotel: '',
    paymentMethod: '',
    status: '',
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pendingCountdown, setPendingCountdown] = useState<{ minutes: number; seconds: number; expired: boolean }>({ minutes: 10, seconds: 0, expired: false });
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<Record<string, string>>({});
  const [bookingToPay, setBookingToPay] = useState<Booking | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingIdToCancel, setBookingIdToCancel] = useState<string | null>(null);

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
      const data: Booking[] = await res.json();
      setBookings(data);
    } catch (err) {
      toast.error("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Filtering logic
  const filteredBookings = bookings.filter((b) => {
    const checkIn = new Date(b.checkIn);
    const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const to = filters.dateTo ? new Date(filters.dateTo) : null;
    if (from && checkIn < from) return false;
    if (to && checkIn > to) return false;
    if (filters.hotel && b.hotel.name !== filters.hotel) return false;
    if (filters.paymentMethod && b.paymentMethod !== filters.paymentMethod) return false;
    if (filters.status && b.status !== filters.status) return false;
    return true;
  });
  // Split into active/history
  const now = new Date();
  const activeBookings = filteredBookings.filter(b => b.status !== 'Cancelled' && (new Date(b.checkOut) >= now || b.status === 'Pending Payment'));
  const historyBookings = filteredBookings.filter(b => b.status === 'Cancelled' || new Date(b.checkOut) < now);

  // Unique hotel names for filter dropdown
  const hotelNames = Array.from(new Set(bookings.map(b => b.hotel.name)));

  useEffect(() => {
    if (showDetailsModal && selectedBooking && selectedBooking.status === 'Pending Payment' && selectedBooking.createdAt) {
      const updateCountdown = () => {
        setPendingCountdown(getPendingCountdown(selectedBooking.createdAt!));
      };
      updateCountdown();
      countdownInterval.current = setInterval(updateCountdown, 1000);
      return () => { if (countdownInterval.current) clearInterval(countdownInterval.current); };
    } else {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    }
  }, [showDetailsModal, selectedBooking]);

  const cancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to cancel booking");
      toast.success("Booking cancelled successfully");
      fetchBookings();
    } catch (err) {
      toast.error("Error: " + (err instanceof Error ? err.message : String(err)));
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
      {/* Filters */}
      <div className="bg-white bg-opacity-80 rounded-lg p-4 mb-8 flex flex-wrap gap-4 items-end shadow-md">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1">From</label>
          <input type="date" className="border p-2 rounded text-gray-900" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1">To</label>
          <input type="date" className="border p-2 rounded text-gray-900" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1">Hotel</label>
          <select className="border p-2 rounded text-gray-900" value={filters.hotel} onChange={e => setFilters(f => ({ ...f, hotel: e.target.value }))}>
            <option value="">All</option>
            {hotelNames.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1">Payment</label>
          <select className="border p-2 rounded text-gray-900" value={filters.paymentMethod} onChange={e => setFilters(f => ({ ...f, paymentMethod: e.target.value }))}>
            <option value="">All</option>
            <option value="credit">Credit Card</option>
            <option value="paypal">PayPal</option>
            <option value="applepay">Apple Pay</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1">Status</label>
          <select className="border p-2 rounded text-gray-900" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Pending Payment">Pending Payment</option>
          </select>
        </div>
        <button className="ml-auto bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300" onClick={() => setFilters({ dateFrom: '', dateTo: '', hotel: '', paymentMethod: '', status: '' })}>Clear</button>
      </div>
      {/* Active Bookings Section */}
      <h2 className="text-2xl font-bold mb-3 mt-6">Active Bookings</h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array(3).fill(0).map((_, index) => (
            <motion.div key={index} className="bg-white rounded-lg shadow-xl p-4 animate-pulse h-64" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.2 }} />
          ))}
        </div>
      ) : activeBookings.length === 0 ? (
        <p className="text-center text-lg">No active bookings.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeBookings.map((booking) => {
            return (
              <motion.div
                key={booking.id}
                className="bg-white text-gray-900 rounded-lg shadow-xl p-4 transition-all transform hover:scale-105 hover:shadow-2xl border-l-4 border-yellow-300 cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => { setSelectedBooking(booking); setShowDetailsModal(true); }}
              >
                <Image src={booking.hotel.image} alt={booking.hotel.name} className="w-full h-44 object-cover rounded-md" width={400} height={160} priority />
                <h2 className="text-2xl font-bold mt-3">{booking.hotel.name}</h2>
                <p className="text-sm text-gray-600">{booking.hotel.location}</p>
                <p className="mt-2 flex items-center gap-2 text-blue-900 font-semibold">
                  <FaCalendarAlt />
                  {`Check-in: ${new Date(booking.checkIn).toLocaleDateString()} | Check-out: ${new Date(booking.checkOut).toLocaleDateString()}`}
                </p>
                {booking.roomType && (
                  <p className="text-blue-900 font-semibold mt-1">
                    Room Type: {booking.roomType.name} (${booking.roomType.price}/night)
                  </p>
                )}
                {booking.nights && booking.totalPrice && (
                  <p className="text-blue-900 font-semibold mt-1">
                    {booking.nights} night{booking.nights > 1 ? "s" : ""} | Total: ${booking.totalPrice}
                  </p>
                )}
                {booking.status && (
                  <p className={`font-semibold mt-1 ${booking.status === 'Cancelled' ? 'text-red-500' : booking.status === 'Pending Payment' ? 'text-yellow-500' : 'text-green-600'}`}>Status: {booking.status}</p>
                )}
                {booking.createdAt && (
                  <p className="text-xs text-gray-500 mt-1">Booked on: {new Date(booking.createdAt).toLocaleString()}</p>
                )}
                {booking.status === 'Pending Payment' && (
                  <button className="mt-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700" onClick={e => { e.stopPropagation(); setSelectedBooking(booking); setShowDetailsModal(true); }}>Pay Now</button>
                )}
                {booking.status !== 'Cancelled' && (
                  <motion.button
                    onClick={e => {
                      e.stopPropagation();
                      setBookingIdToCancel(booking.id);
                      setShowCancelModal(true);
                    }}
                    className="mt-4 flex items-center gap-2 text-red-500 hover:text-red-700 transition"
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTimesCircle /> Cancel Booking
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
      {/* Booking History Section */}
      <h2 className="text-2xl font-bold mb-3 mt-10">Booking History</h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array(3).fill(0).map((_, index) => (
            <motion.div key={index} className="bg-white rounded-lg shadow-xl p-4 animate-pulse h-64" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.2 }} />
          ))}
        </div>
      ) : historyBookings.length === 0 ? (
        <p className="text-center text-lg">No booking history.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {historyBookings.map((booking) => {
            return (
              <motion.div
                key={booking.id}
                className="bg-white text-gray-900 rounded-lg shadow-xl p-4 transition-all transform hover:scale-105 hover:shadow-2xl border-l-4 border-gray-400 cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => { setSelectedBooking(booking); setShowDetailsModal(true); }}
              >
                <Image src={booking.hotel.image} alt={booking.hotel.name} className="w-full h-44 object-cover rounded-md" width={400} height={160} priority />
                <h2 className="text-2xl font-bold mt-3">{booking.hotel.name}</h2>
                <p className="text-sm text-gray-600">{booking.hotel.location}</p>
                <p className="mt-2 flex items-center gap-2 text-blue-900 font-semibold">
                  <FaCalendarAlt />
                  {`Check-in: ${new Date(booking.checkIn).toLocaleDateString()} | Check-out: ${new Date(booking.checkOut).toLocaleDateString()}`}
                </p>
                {booking.roomType && (
                  <p className="text-blue-900 font-semibold mt-1">
                    Room Type: {booking.roomType.name} (${booking.roomType.price}/night)
                  </p>
                )}
                {booking.nights && booking.totalPrice && (
                  <p className="text-blue-900 font-semibold mt-1">
                    {booking.nights} night{booking.nights > 1 ? "s" : ""} | Total: ${booking.totalPrice}
                  </p>
                )}
                <p className={`font-semibold mt-1 ${booking.status === 'Cancelled' ? 'text-red-500' : booking.status === 'Pending Payment' ? 'text-yellow-500' : 'text-green-600'}`}>Status: {booking.status}</p>
              </motion.div>
            );
          })}
        </div>
      )}
      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-gray-900 w-full max-w-md animate-fade-in-up relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowDetailsModal(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><FaInfoCircle /> Booking Details</h2>
            <Image src={selectedBooking.hotel.image} alt={selectedBooking.hotel.name} className="w-full h-40 object-cover rounded mb-3" width={400} height={160} priority />
            <div className="mb-2"><span className="font-bold">Hotel:</span> {selectedBooking.hotel.name}</div>
            <div className="mb-2"><span className="font-bold">Location:</span> {selectedBooking.hotel.location}</div>
            {selectedBooking.roomType && <div className="mb-2"><span className="font-bold">Room Type:</span> {selectedBooking.roomType.name} (${selectedBooking.roomType.price}/night)</div>}
            <div className="mb-2"><span className="font-bold">Check-in:</span> {new Date(selectedBooking.checkIn).toLocaleDateString()}</div>
            <div className="mb-2"><span className="font-bold">Check-out:</span> {new Date(selectedBooking.checkOut).toLocaleDateString()}</div>
            <div className="mb-2"><span className="font-bold">Nights:</span> {selectedBooking.nights}</div>
            <div className="mb-2"><span className="font-bold">Total Price:</span> ${selectedBooking.totalPrice}</div>
            <div className="mb-2"><span className="font-bold">Status:</span> <span className={`font-semibold ${selectedBooking.status === 'Cancelled' ? 'text-red-500' : selectedBooking.status === 'Pending Payment' ? 'text-yellow-500' : 'text-green-600'}`}>{selectedBooking.status}</span></div>
            {selectedBooking.status === 'Pending Payment' && selectedBooking.createdAt && (
              <div className="mb-2 text-sm text-yellow-700 font-semibold">
                Time left to pay: {pendingCountdown.expired ? <span className="text-red-600">Expired</span> : `${pendingCountdown.minutes}:${pendingCountdown.seconds.toString().padStart(2, '0')}`}
              </div>
            )}
            <div className="mb-2"><span className="font-bold">Payment Method:</span> {selectedBooking.paymentMethod ? selectedBooking.paymentMethod.charAt(0).toUpperCase() + selectedBooking.paymentMethod.slice(1) : 'N/A'}
              {/* Payment details breakdown */}
              {selectedBooking.paymentDetails && selectedBooking.paymentMethod === "credit" && (() => { try { const d = JSON.parse(selectedBooking.paymentDetails); return d.card ? <> (**** **** **** {String(d.card).slice(-4)})</> : null; } catch { return null; } })()}
              {selectedBooking.paymentDetails && selectedBooking.paymentMethod === "paypal" && (() => { try { const d = JSON.parse(selectedBooking.paymentDetails); return d.paypal ? <> ({d.paypal})</> : null; } catch { return null; } })()}
              {selectedBooking.paymentDetails && selectedBooking.paymentMethod === "applepay" && (() => { try { const d = JSON.parse(selectedBooking.paymentDetails); return d.applepay ? <> ({d.applepay})</> : null; } catch { return null; } })()}
            </div>
            <div className="mb-2 text-xs text-gray-500">Booked on: {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString() : ''}</div>
            <div className="mt-4 mb-2 p-3 bg-blue-50 rounded text-blue-900 text-sm">
              <span className="font-bold">Cancellation Policy:</span> Free cancellation up to 24 hours before check-in. After that, one night will be charged.
            </div>
            {selectedBooking.status === 'Pending Payment' && (
              <button className="w-full bg-green-600 text-white py-2 rounded font-bold mt-2 hover:bg-green-700" onClick={() => {
                setShowPaymentModal(true);
                setBookingToPay(selectedBooking);
              }} disabled={pendingCountdown.expired}>Pay Now</button>
            )}
          </div>
        </div>
      )}
      {/* Payment Modal for Pending Payment */}
      {showPaymentModal && bookingToPay && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-gray-900 w-full max-w-md animate-fade-in-up relative">
            <h2 className="text-2xl font-bold text-center mb-4">Payment</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (bookingToPay.createdAt && getPendingCountdown(bookingToPay.createdAt).expired) {
                toast.error("Payment time expired. Please re-book.");
                setShowPaymentModal(false);
                setBookingToPay(null);
                return;
              }
              setShowPaymentModal(false);
              // Update the pending booking to confirmed
              const res = await fetch("/api/bookings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  hotelId: bookingToPay.hotel.id,
                  roomTypeId: bookingToPay.roomType ? bookingToPay.roomType.id : undefined,
                  checkIn: bookingToPay.checkIn,
                  checkOut: bookingToPay.checkOut,
                  createdAt: bookingToPay.createdAt,
                  paymentMethod,
                  paymentDetails,
                  status: "Confirmed",
                }),
              });
              if (res.ok) {
                setShowSuccessModal(true);
                setPaymentMethod("");
                setPaymentDetails({});
                setBookingToPay(null);
                setShowDetailsModal(false);
                await fetchBookings();
              } else {
                toast.error("Failed to pay for booking. Please try again.");
              }
            }}>
              <label className="block mb-2 text-gray-700">Select Payment Method:</label>
              <select className="border p-2 rounded w-full mb-4" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} required>
                <option value="">Choose method</option>
                <option value="credit">Credit Card</option>
                <option value="paypal">PayPal</option>
                <option value="applepay">Apple Pay</option>
              </select>
              {paymentMethod === "credit" && (
                <div className="mb-4">
                  <input type="text" className="border p-2 rounded w-full mb-2" placeholder="Card Number" maxLength={16} required onChange={e => setPaymentDetails({ ...paymentDetails, card: e.target.value })} />
                  <input type="text" className="border p-2 rounded w-full mb-2" placeholder="Name on Card" required onChange={e => setPaymentDetails({ ...paymentDetails, name: e.target.value })} />
                  <input type="text" className="border p-2 rounded w-full mb-2" placeholder="MM/YY" maxLength={5} required onChange={e => setPaymentDetails({ ...paymentDetails, expiry: e.target.value })} />
                  <input type="text" className="border p-2 rounded w-full mb-2" placeholder="CVC" maxLength={4} required onChange={e => setPaymentDetails({ ...paymentDetails, cvc: e.target.value })} />
                </div>
              )}
              {paymentMethod === "paypal" && (
                <div className="mb-4">
                  <input type="email" className="border p-2 rounded w-full" placeholder="PayPal Email" required onChange={e => setPaymentDetails({ ...paymentDetails, paypal: e.target.value })} />
                </div>
              )}
              {paymentMethod === "applepay" && (
                <div className="mb-4">
                  <input type="text" className="border p-2 rounded w-full" placeholder="Apple Pay ID" required onChange={e => setPaymentDetails({ ...paymentDetails, applepay: e.target.value })} />
                </div>
              )}
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition">
                Confirm Payment
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-gray-900 w-full max-w-md animate-fade-in-up relative text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-700">Payment Successful!</h2>
            <p className="mb-4">Your booking has been confirmed and payment received.</p>
            <button className="bg-green-600 text-white px-6 py-2 rounded-full font-bold shadow-md hover:scale-105 transition" onClick={() => setShowSuccessModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
      {/* Cancel Confirmation Modal */}
      {showCancelModal && bookingIdToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-gray-900 w-full max-w-md animate-fade-in-up relative text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-700">Cancel Booking?</h2>
            <p className="mb-4">Are you sure to cancel this booking?</p>
            <div className="flex justify-center gap-4">
              <button className="bg-gray-300 text-gray-800 px-6 py-2 rounded-full font-bold shadow-md hover:scale-105 transition" onClick={() => setShowCancelModal(false)}>
                No
              </button>
              <button className="bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-md hover:scale-105 transition" onClick={async () => {
                setShowCancelModal(false);
                if (bookingIdToCancel) await cancelBooking(bookingIdToCancel);
                setBookingIdToCancel(null);
              }}>
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
