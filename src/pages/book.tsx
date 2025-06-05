import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import {
  FaCheckCircle,
  FaSearch,
  FaMapMarkerAlt,
  FaDollarSign,
  FaHotel,
} from "react-icons/fa";
import { RoomType } from "../types/roomtype";

interface Hotel {
  id: string;
  name: string;
  location: string;
  description: string;
  price: number;
  image: string;
}

interface BookingConfirmation {
  hotel: Hotel;
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  status?: string;
  createdAt?: string; // Add createdAt for countdown
}

export default function Book() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showSuccess, setShowSuccess] = useState<BookingConfirmation | null>(
    null
  );
  const [loading, setLoading] = useState(true); // Skeleton Loading
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(
    null
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState<any>({});
  const [bookingPayload, setBookingPayload] = useState<any>(null);
  const { data: session } = useSession();
  const [pendingCountdown, setPendingCountdown] = useState<{
    minutes: number;
    seconds: number;
    expired: boolean;
  }>({
    minutes: 10,
    seconds: 0,
    expired: false,
  });
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      const res = await fetch("/api/hotels");
      const data = await res.json();
      setHotels(data);
      setFilteredHotels(data);
      setLoading(false); // Hide skeletons after loading
    };
    fetchHotels();
    // Fetch all room types
    const fetchRoomTypes = async () => {
      const res = await fetch("/api/roomtypes");
      const data = await res.json();
      setRoomTypes(data);
    };
    fetchRoomTypes();
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
    setCheckIn("");
    setCheckOut("");
    setNights(0);
    setTotalPrice(0);
    setSelectedRoomType(null);
    setShowModal(true);
  };

  useEffect(() => {
    if (selectedHotel && checkIn && checkOut && selectedRoomType) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const msPerDay = 1000 * 60 * 60 * 24;
      const diff = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / msPerDay
      );
      if (diff > 0) {
        // Use hotel.price + roomType.price for per-night total
        setNights(diff);
        setTotalPrice((selectedHotel.price + selectedRoomType.price) * diff);
      } else {
        setNights(0);
        setTotalPrice(0);
      }
    } else {
      setNights(0);
      setTotalPrice(0);
    }
  }, [checkIn, checkOut, selectedHotel, selectedRoomType]);

  // Open payment modal instead of booking directly
  const handleConfirmBooking = () => {
    if (!checkIn || !checkOut || !selectedHotel || !selectedRoomType) return;
    if (nights < 1) {
      alert("Check-out must be after check-in (at least 1 night)");
      return;
    }
    setBookingPayload({
      hotel: selectedHotel,
      roomType: selectedRoomType,
      checkIn,
      checkOut,
      nights,
      totalPrice,
    });
    setShowModal(false);
    setShowPaymentModal(true);
  };

  // Called after mock payment is submitted
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingPayload) return;
    setShowPaymentModal(false);
    // If this is a pending payment, update the booking instead of creating a new one
    if (bookingPayload.status === "Pending Payment" && bookingPayload.createdAt) {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId: bookingPayload.hotel.id,
          roomTypeId: bookingPayload.roomType.id,
          checkIn: bookingPayload.checkIn,
          checkOut: bookingPayload.checkOut,
          createdAt: bookingPayload.createdAt,
          paymentMethod,
          paymentDetails,
          status: "Confirmed",
        }),
      });
      if (res.ok) {
        setCheckIn("");
        setCheckOut("");
        setSelectedHotel(null);
        setSelectedRoomType(null);
        setShowSuccess({ ...bookingPayload, status: "Confirmed" });
        setBookingPayload(null);
        setPaymentMethod("");
        setPaymentDetails({});
      } else {
        alert("Failed to pay for booking. Please try again.");
      }
      return;
    }
    // Only allow new booking creation if not a pending payment
    if (!bookingPayload.status) {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId: bookingPayload.hotel.id,
          roomTypeId: bookingPayload.roomType.id,
          checkIn: bookingPayload.checkIn,
          checkOut: bookingPayload.checkOut,
          paymentMethod,
          paymentDetails,
          status: "Confirmed",
        }),
      });
      if (res.ok) {
        setCheckIn("");
        setCheckOut("");
        setSelectedHotel(null);
        setSelectedRoomType(null);
        setShowSuccess(bookingPayload);
        setBookingPayload(null);
        setPaymentMethod("");
        setPaymentDetails({});
      } else {
        alert("Failed to book. Please try again.");
      }
    }
  };

  // Postpone payment handler
  const handlePostponePayment = async () => {
    if (!bookingPayload) return;
    setShowPaymentModal(false);
    // If this is already a pending booking, do not create a new one
    if (bookingPayload.status === "Pending Payment" && bookingPayload.createdAt) {
      setShowSuccess({ ...bookingPayload });
      setBookingPayload(null);
      setPaymentMethod("");
      setPaymentDetails({});
      return;
    }
    // Create booking with status 'Pending Payment' (only if not already pending)
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hotelId: bookingPayload.hotel.id,
        roomTypeId: bookingPayload.roomType.id,
        checkIn: bookingPayload.checkIn,
        checkOut: bookingPayload.checkOut,
        status: "Pending Payment",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setCheckIn("");
      setCheckOut("");
      setSelectedHotel(null);
      setSelectedRoomType(null);
      setShowSuccess({ ...bookingPayload, status: "Pending Payment", createdAt: data.createdAt });
      setBookingPayload(null);
      setPaymentMethod("");
      setPaymentDetails({});
    } else {
      alert("Failed to book. Please try again.");
    }
  };

  // Countdown logic for pending payment
  useEffect(() => {
    if (showSuccess && showSuccess.status === "Pending Payment" && showSuccess.createdAt) {
      const created = new Date(showSuccess.createdAt).getTime();
      const updateCountdown = () => {
        const msLeft = 10 * 60 * 1000 - (Date.now() - created);
        if (msLeft <= 0) {
          setPendingCountdown({ expired: true, minutes: 0, seconds: 0 });
          if (countdownInterval.current) clearInterval(countdownInterval.current);
        } else {
          const minutes = Math.floor(msLeft / 60000);
          const seconds = Math.floor((msLeft % 60000) / 1000);
          setPendingCountdown({ expired: false, minutes, seconds });
        }
      };
      updateCountdown();
      countdownInterval.current = setInterval(updateCountdown, 1000);
      return () => {
        if (countdownInterval.current) clearInterval(countdownInterval.current);
      };
    } else {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    }
  }, [showSuccess]);

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
            <label className="block mb-2 text-gray-700">Room Type:</label>
            <select
              className="border p-2 rounded w-full mb-4"
              value={selectedRoomType?.id || ""}
              onChange={(e) => {
                const rt = roomTypes.find((rt) => rt.id === e.target.value);
                setSelectedRoomType(rt || null);
              }}
            >
              <option value="">Select room type</option>
              {roomTypes
                .filter((rt) => rt.hotelId === selectedHotel.id)
                .map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name} (${rt.price}/night)
                  </option>
                ))}
            </select>
            <label className="block mb-2 text-gray-700">Check-in Date:</label>
            <input
              type="date"
              className="border p-2 rounded w-full mb-4"
              value={checkIn}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckIn(e.target.value)}
            />
            <label className="block mb-2 text-gray-700">Check-out Date:</label>
            <input
              type="date"
              className="border p-2 rounded w-full mb-4"
              value={checkOut}
              min={checkIn || new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckOut(e.target.value)}
            />
            {nights > 0 && (
              <div className="mb-4 text-center">
                <p className="font-semibold">Nights: {nights}</p>
                <p className="font-semibold">Total: ${totalPrice}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={handleConfirmBooking}
                disabled={nights < 1 || !selectedRoomType}
              >
                <FaCheckCircle /> Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && bookingPayload && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-gray-900 w-full max-w-md animate-fade-in-up relative">
            <h2 className="text-2xl font-bold text-center mb-4">Payment</h2>
            <form onSubmit={handlePaymentSubmit}>
              <label className="block mb-2 text-gray-700">
                Select Payment Method:
              </label>
              <select
                className="border p-2 rounded w-full mb-4"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="">Choose method</option>
                <option value="credit">Credit Card</option>
                <option value="paypal">PayPal</option>
                <option value="applepay">Apple Pay</option>
              </select>
              {paymentMethod === "credit" && (
                <div className="mb-4">
                  <input
                    type="text"
                    className="border p-2 rounded w-full mb-2"
                    placeholder="Card Number"
                    maxLength={16}
                    required
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        card: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="border p-2 rounded w-full mb-2"
                    placeholder="Name on Card"
                    required
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        name: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="border p-2 rounded w-full mb-2"
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        expiry: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="border p-2 rounded w-full"
                    placeholder="CVC"
                    maxLength={4}
                    required
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        cvc: e.target.value,
                      })
                    }
                  />
                </div>
              )}
              {paymentMethod === "paypal" && (
                <div className="mb-4">
                  <input
                    type="email"
                    className="border p-2 rounded w-full"
                    placeholder="PayPal Email"
                    required
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        paypal: e.target.value,
                      })
                    }
                  />
                </div>
              )}
              {paymentMethod === "applepay" && (
                <div className="mb-4">
                  <input
                    type="text"
                    className="border p-2 rounded w-full"
                    placeholder="Apple Pay ID"
                    required
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        applepay: e.target.value,
                      })
                    }
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setBookingPayload(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                  onClick={handlePostponePayment}
                >
                  Postpone Payment
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  disabled={!paymentMethod}
                >
                  Pay & Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-gray-900 w-full max-w-md animate-fade-in-up relative">
            <div className="flex justify-center mb-2">
              <FaCheckCircle className="text-green-500 text-5xl" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">
              {showSuccess.status === "Pending Payment"
                ? "Booking Pending Payment"
                : "Payment Confirmed!"}
            </h2>
            <p className="text-center text-gray-700 mb-4">
              {showSuccess.status === "Pending Payment"
                ? "You have 10 minutes to complete your payment. Your booking is reserved but not confirmed."
                : "Your booking was successful."}
            </p>
            {showSuccess.status === "Pending Payment" && (
              <div className="mb-2 text-sm text-yellow-700 font-semibold text-center">
                Time left to pay:{" "}
                {pendingCountdown.expired ? (
                  <span className="text-red-600">Expired</span>
                ) : (
                  `${pendingCountdown.minutes}:${pendingCountdown.seconds
                    .toString()
                    .padStart(2, "0")}`
                )}
              </div>
            )}
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-bold text-lg mb-1">{showSuccess.hotel.name}</p>
              <p className="text-gray-700 mb-1">{showSuccess.hotel.location}</p>
              <p className="mb-1">
                Room Type:{" "}
                <span className="font-semibold">{showSuccess.roomType.name}</span> ($
                {showSuccess.roomType.price}/night)
              </p>
              <p className="mb-1">
                Check-in:{" "}
                <span className="font-semibold">
                  {new Date(showSuccess.checkIn).toLocaleDateString()}
                </span>
              </p>
              <p className="mb-1">
                Check-out:{" "}
                <span className="font-semibold">
                  {new Date(showSuccess.checkOut).toLocaleDateString()}
                </span>
              </p>
              <p className="mb-1">
                Nights:{" "}
                <span className="font-semibold">{showSuccess.nights}</span>
              </p>
              <p className="font-bold text-blue-700 mt-2">
                Total: ${showSuccess.totalPrice}
              </p>
            </div>
            <div className="flex justify-center gap-2">
              {showSuccess.status === "Pending Payment" && (
                <button
                  className="bg-green-600 text-white px-6 py-2 rounded-full font-bold shadow-md hover:scale-105 transition"
                  onClick={() => {
                    setShowSuccess(null);
                    setShowModal(false);
                    setShowPaymentModal(true);
                    setBookingPayload({ ...showSuccess }); // Do not mutate bookingPayload, just pass the pending booking
                  }}
                  disabled={pendingCountdown.expired}
                >
                  Pay Now
                </button>
              )}
              <button
                className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-2 rounded-full font-bold shadow-md hover:scale-105 transition"
                onClick={() => setShowSuccess(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
