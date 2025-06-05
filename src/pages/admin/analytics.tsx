import { useEffect, useState } from "react";
import { FaChartBar, FaMoneyBill, FaBed, FaHotel } from "react-icons/fa";

interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  occupancyRate: number;
  popularRoomTypes: { name: string; count: number }[];
  totalHotels: number;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-700 to-cyan-500 p-8 text-white">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><FaChartBar /> Analytics Dashboard</h1>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : !data ? (
        <div className="text-center text-red-500">Failed to load analytics.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white text-gray-900 rounded-lg shadow-lg p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-2xl font-bold"><FaMoneyBill className="text-green-600" /> Total Revenue: <span className="text-green-700">${(data.totalRevenue ?? 0).toLocaleString()}</span></div>
            <div className="flex items-center gap-2 text-xl"><FaBed className="text-blue-600" /> Total Bookings: <span className="text-blue-700">{data.totalBookings}</span></div>
            <div className="flex items-center gap-2 text-xl"><FaHotel className="text-purple-600" /> Total Hotels: <span className="text-purple-700">{data.totalHotels}</span></div>
            <div className="flex items-center gap-2 text-xl"><FaBed className="text-yellow-600" /> Occupancy Rate: <span className="text-yellow-700">{data.occupancyRate}%</span></div>
          </div>
          <div className="bg-white text-gray-900 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Popular Room Types</h2>
            <ul>
              {(data.popularRoomTypes ?? []).map(rt => (
                <li key={rt.name} className="mb-2 flex justify-between border-b pb-1">
                  <span>{rt.name}</span>
                  <span className="font-bold">{rt.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
