import { getSession } from "next-auth/react";
import { FaUserShield, FaHotel, FaClipboardList, FaUsers } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Admin({ user, stats }: { user: any; stats: any }) {
  if (!user || user.role !== "admin") {
    return (
      <p className="text-center mt-10 text-xl text-red-500 animate-fadeIn">
        Access Denied
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-700 to-cyan-500 p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center items-center gap-3 text-center text-white text-4xl font-bold mb-8 drop-shadow-lg"
      >
        <FaUserShield className="text-4xl text-yellow-200" />
        Admin Dashboard
      </motion.header>

      {/* Admin Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-2xl p-8 border-l-4 border-yellow-300 max-w-6xl mx-auto"
      >
        <p className="text-2xl text-gray-800 mb-8">
          Welcome, <span className="font-semibold text-blue-600">{user.name}</span>
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Hotels Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-blue-100 p-6 rounded-lg shadow-lg flex items-center gap-4 transition-all border-l-4 border-blue-500"
          >
            <FaHotel className="text-4xl text-blue-900" />
            <div>
              <p className="text-lg font-bold text-blue-900">Total Hotels</p>
              <p className="text-2xl font-semibold text-blue-900">{stats.totalHotels}</p>
              <div className="mt-1 w-full bg-blue-300 h-2 rounded-md">
                <div
                  className="bg-blue-700 h-2 rounded-md"
                  style={{ width: `${Math.min(stats.totalHotels, 100)}%` }}
                ></div>
              </div>
            </div>
          </motion.div>

          {/* Total Bookings Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-green-100 p-6 rounded-lg shadow-lg flex items-center gap-4 transition-all border-l-4 border-green-500"
          >
            <FaClipboardList className="text-4xl text-green-900" />
            <div>
              <p className="text-lg font-bold text-green-900">Total Bookings</p>
              <p className="text-2xl font-semibold text-green-900">{stats.totalBookings}</p>
              <div className="mt-1 w-full bg-green-300 h-2 rounded-md">
                <div
                  className="bg-green-700 h-2 rounded-md"
                  style={{ width: `${Math.min(stats.totalBookings / 2, 100)}%` }}
                ></div>
              </div>
            </div>
          </motion.div>

          {/* New Users Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-purple-100 p-6 rounded-lg shadow-lg flex items-center gap-4 transition-all border-l-4 border-purple-500"
          >
            <FaUsers className="text-4xl text-purple-900" />
            <div>
              <p className="text-lg font-bold text-purple-900">New Users</p>
              <p className="text-2xl font-semibold text-purple-900">{stats.newUsers}</p>
              <div className="mt-1 w-full bg-purple-300 h-2 rounded-md">
                <div
                  className="bg-purple-700 h-2 rounded-md"
                  style={{ width: `${Math.min(stats.newUsers * 10, 100)}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Future Charts Placeholder */}
        <div className="mt-10 text-center">
          <p className="text-gray-600 italic animate-pulse">
            📊 Interactive charts coming soon...
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getSession(context);
  if (!session || session.user.role !== "admin") {
    return { redirect: { destination: "/auth/login", permanent: false } };
  }

  // Dummy statistics for demonstration.
  const stats = {
    totalHotels: 42,
    totalBookings: 128,
    newUsers: 7,
  };

  return { props: { user: session.user, stats } };
}
