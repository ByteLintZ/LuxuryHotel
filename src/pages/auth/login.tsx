// pages/auth/login.tsx

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FaSignInAlt, FaUser, FaLock } from "react-icons/fa";

export default function Login() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // If already logged in, redirect based on role
  useEffect(() => {
    if (session && session.user) {
      if (session.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/book");
      }
    }
  }, [session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", { email, password, callbackUrl: "/" });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 via-cyan-600 to-cyan-500 px-4 py-8">
      <form
        onSubmit={handleLogin}
        className="relative bg-white p-8 w-full max-w-md rounded-xl shadow-2xl border-l-4 border-yellow-300 animate-fadeIn transform transition-transform hover:scale-105"
      >
        <h2 className="text-3xl font-bold mb-2 text-blue-800 flex items-center justify-center gap-2">
          <FaSignInAlt /> Welcome Back
        </h2>
        <p className="text-gray-600 text-center mb-6">Log in to your account</p>
        
        {/* Email Field */}
        <div className="relative mb-4">
          <FaUser className="absolute top-3 left-3 text-gray-400" />
          <input
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        {/* Password Field */}
        <div className="relative mb-6">
          <FaLock className="absolute top-3 left-3 text-gray-400" />
          <input
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800 transition"
          type="submit"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
