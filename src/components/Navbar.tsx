import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FaHotel } from "react-icons/fa";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-cyan-400 shadow-lg text-white">
      {/* Brand / Logo */}
      <div className="text-2xl font-bold flex items-center gap-2">
        <FaHotel className="text-yellow-200" />
        {session?.user?.role === "admin" ? (
          <span className="bg-gradient-to-r from-purple-600 via-yellow-300 to-blue-500 bg-clip-text text-transparent font-extrabold tracking-widest drop-shadow-lg select-none cursor-default animate-pulse">
            LuxeStay Admin
          </span>
        ) : (
          <Link
            href="/"
            className="hover:text-yellow-200 transition-colors"
          >
            LuxeStay
          </Link>
        )}
      </div>

      {/* Nav Links */}
      <div className="flex gap-4 items-center">
        {!session && (
          <>
            <Link
              href="/auth/login"
              className="hover:text-yellow-200 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="hover:text-yellow-200 transition-colors"
            >
              Sign Up
            </Link>
          </>
        )}
        {session?.user?.role === "admin" && (
          <>
            <Link
              href="/admin"
              className="hover:text-yellow-200 transition-colors"
            >
              Admin Dashboard
            </Link>
            <Link
              href="/admin/hotels"
              className="hover:text-yellow-200 transition-colors"
            >
              Manage Hotels
            </Link>
            <Link
              href="/admin/roomtypes"
              className="hover:text-yellow-200 transition-colors"
            >
              Room Types
            </Link>
            <Link
              href="/admin/bookings"
              className="hover:text-yellow-200 transition-colors"
            >
              Bookings
            </Link>
            <Link
              href="/admin/analytics"
              className="hover:text-yellow-200 transition-colors"
            >
              Analytics
            </Link>
          </>
        )}
        {session && session.user.role !== "admin" && (
          <>
            <Link
              href="/book"
              className="hover:text-yellow-200 transition-colors"
            >
              Book Hotel
            </Link>
            <Link
              href="/bookings"
              className="hover:text-yellow-200 transition-colors"
            >
              My Bookings
            </Link>
            <Link
              href="/profile"
              className="hover:text-yellow-200 transition-colors"
            >
              Profile
            </Link>
          </>
        )}

        {/* Optional: Sign Out button for authenticated users */}
        {session && (
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="hover:text-yellow-200 transition-colors"
          >
            Sign Out
          </button>
        )}
      </div>
    </nav>
  );
}
