import { getSession } from "next-auth/react";
import { FaUserShield, FaHotel, FaClipboardList, FaUsers } from "react-icons/fa";

export default function Admin({ user, stats }: { user: any; stats: any }) {
  if (!user || user.role !== "admin") {
    return <p className="text-center mt-10 text-xl text-red-500">Access Denied</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-cyan-600 to-cyan-500 p-8">
      <header className="flex justify-center items-center gap-3 text-center text-white text-4xl font-bold mb-8 drop-shadow-lg animate-fadeIn">
        <FaUserShield className="text-4xl text-yellow-200" />
        Admin Dashboard
      </header>
      <div className="bg-white rounded-lg shadow-2xl p-8 border-l-4 border-yellow-200 max-w-6xl mx-auto animate-fadeIn">
        <p className="text-2xl text-gray-800 mb-8">Welcome, {user.name}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Hotels Card */}
          <div className="bg-blue-100 p-6 rounded-lg shadow-lg flex items-center gap-4">
            <FaHotel className="text-4xl text-blue-900" />
            <div>
              <p className="text-lg font-bold text-blue-900">Total Hotels</p>
              <p className="text-2xl font-semibold text-blue-900">{stats.totalHotels}</p>
            </div>
          </div>
          {/* Total Bookings Card */}
          <div className="bg-green-100 p-6 rounded-lg shadow-lg flex items-center gap-4">
            <FaClipboardList className="text-4xl text-green-900" />
            <div>
              <p className="text-lg font-bold text-green-900">Total Bookings</p>
              <p className="text-2xl font-semibold text-green-900">{stats.totalBookings}</p>
            </div>
          </div>
          {/* New Users Card */}
          <div className="bg-purple-100 p-6 rounded-lg shadow-lg flex items-center gap-4">
            <FaUsers className="text-4xl text-purple-900" />
            <div>
              <p className="text-lg font-bold text-purple-900">New Users</p>
              <p className="text-2xl font-semibold text-purple-900">{stats.newUsers}</p>
            </div>
          </div>
        </div>
        <div className="mt-10">
          {/* Placeholder for future charts or additional statistics */}
          <p className="text-center text-gray-600 italic">
            Charts and further statistics coming soon...
          </p>
        </div>
      </div>
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
