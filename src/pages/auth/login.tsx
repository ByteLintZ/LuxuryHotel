// pages/auth/login.tsx

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FaSignInAlt, FaUser, FaLock } from "react-icons/fa";
import { toast } from "react-toastify";

export default function Login() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
    setErrorMessage(""); // Clear previous errors

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Prevent auto-redirect
    });

    if (result?.error) {
      setErrorMessage("Invalid email or password."); // Show error message
      toast.error("Invalid email or password.");
    } else {
      // Refetch session to get updated user role
      const session = await fetch("/api/auth/session").then((res) => res.json());
      if (session?.user?.role === "admin") {
        toast.success("Login successful! Redirecting to admin dashboard...");
        router.push("/admin");
      } else {
        toast.success("Login successful!");
        router.push("/");
      }
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center bg-cover bg-center min-h-screen px-4 py-8"
      style={{ backgroundImage: "url('/log.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10"></div>
      <form
        onSubmit={handleLogin}
        className="relative bg-white p-8 w-full max-w-md rounded-xl shadow-2xl border-l-4 border-yellow-300 animate-fadeIn transform transition-transform hover:scale-105"
      >
        <h2 className="text-3xl font-bold mb-2 text-blue-800 flex items-center justify-center gap-2">
          <FaSignInAlt /> Welcome Back
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Log in to{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3dc6d5] to-[#e4c030]">
            LuxeStay
          </span>
        </p>

        {/* Show error message if login fails */}
        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}

        {/* Email Field */}
        <div className="relative mb-4">
          <FaUser className="absolute top-3 left-3 text-gray-400" />
          <input
            className="text-black pl-10 pr-3 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password Field */}
        <div className="relative mb-6">
          <FaLock className="absolute top-3 left-3 text-gray-400" />
          <input
            className="text-black pl-10 pr-3 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-300 transition"
          type="submit"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
