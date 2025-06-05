import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Booking {
  id: string;
  userEmail: string;
  hotel: { id: string; name: string };
  roomType: { id: string; name: string };
  checkIn: string;
  checkOut: string;
  status: string;
  totalPrice?: number;
  createdAt?: string;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState({ status: '', hotel: '', user: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const res = await fetch("/api/bookings/all");
    const data = await res.json();
    setBookings(data);
    setLoading(false);
  };

  const filtered = bookings.filter(b => {
    if (filter.status && b.status !== filter.status) return false;
    if (filter.hotel && b.hotel.name !== filter.hotel) return false;
    if (filter.user && !b.userEmail.includes(filter.user)) return false;
    return true;
  });

  const uniqueHotels = Array.from(new Set(bookings.map(b => b.hotel.name)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-700 to-cyan-500 p-8 text-white">
      <ToastContainer position="top-right" />
      <h1 className="text-3xl font-bold mb-6">Booking Management</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <select className="text-gray-900 p-2 rounded" value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Pending Payment">Pending Payment</option>
        </select>
        <select className="text-gray-900 p-2 rounded" value={filter.hotel} onChange={e => setFilter(f => ({ ...f, hotel: e.target.value }))}>
          <option value="">All Hotels</option>
          {uniqueHotels.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <input className="text-gray-900 p-2 rounded" placeholder="User email..." value={filter.user} onChange={e => setFilter(f => ({ ...f, user: e.target.value }))} />
        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300" onClick={() => setFilter({ status: '', hotel: '', user: '' })}>Clear</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-gray-900 rounded-lg shadow-lg">
          <thead>
            <tr>
              <th className="p-2">User</th>
              <th className="p-2">Hotel</th>
              <th className="p-2">Room Type</th>
              <th className="p-2">Check-In</th>
              <th className="p-2">Check-Out</th>
              <th className="p-2">Status</th>
              <th className="p-2">Total</th>
              <th className="p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center p-4">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center p-4">No bookings found.</td></tr>
            ) : filtered.map(b => (
              <tr key={b.id} className="border-b">
                <td className="p-2">{b.userEmail}</td>
                <td className="p-2">{b.hotel.name}</td>
                <td className="p-2">{b.roomType?.name}</td>
                <td className="p-2">{new Date(b.checkIn).toLocaleDateString()}</td>
                <td className="p-2">{new Date(b.checkOut).toLocaleDateString()}</td>
                <td className="p-2 font-bold {b.status === 'Cancelled' ? 'text-red-500' : b.status === 'Pending Payment' ? 'text-yellow-500' : 'text-green-600'}">{b.status}</td>
                <td className="p-2">{b.totalPrice ? `$${b.totalPrice}` : '-'}</td>
                <td className="p-2 text-xs">{b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
