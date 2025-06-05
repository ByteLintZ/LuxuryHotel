import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaUserPlus, FaUser, FaEnvelope, FaLock } from "react-icons/fa";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/auth/login");
      } else {
        setError(data.error || "An unexpected error occurred");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/reg.jpg')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <form
        onSubmit={handleSignup}
        className="relative bg-white/90 backdrop-blur-lg p-8 w-full max-w-md rounded-xl shadow-2xl border-l-4 border-yellow-300 animate-fadeIn transition-transform duration-300 hover:scale-105"
      >
        {/* Header */}
        <h2 className="text-3xl font-bold mb-4 text-blue-800 flex items-center justify-center gap-2">
          <FaUserPlus /> Create Your Account
        </h2>

        <p className="text-gray-600 text-center mb-6">
          Join our exclusive community and unlock premium features. Enjoy{" "}
          <span className="bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
            permanent luxury
          </span>.
        </p>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-center mb-4 animate-pulse">{error}</p>
        )}

        {/* Name Field */}
        <div className="relative mb-4 ">
          <FaUser className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-black pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          />
        </div>

        {/* Email Field */}
        <div className="relative mb-4 text-black">
          <FaEnvelope className="absolute top-3 left-3 text-gray-400" />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          />
        </div>

        {/* Password Field */}
        <div className="relative mb-6 text-black">
          <FaLock className="absolute top-3 left-3 text-gray-400" />
          <input
            type="password"
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          />
        </div>

        {/* Signup Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white text-lg font-semibold transition-all duration-300 ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-900 hover:bg-blue-800"
          }`}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        {/* Already Have an Account */}
        <p className="mt-6 text-center text-black text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-blue-700 font-semibold relative before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-[2px] before:bg-yellow-300 before:transition-all before:duration-300 hover:before:w-full"
          >
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
