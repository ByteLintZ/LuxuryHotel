// pages/profile.tsx

import { useState, useEffect } from "react";
import Head from "next/head";
import { useSession, signOut } from "next-auth/react";
import { FaUserEdit, FaSignOutAlt, FaUserCircle } from "react-icons/fa";

export default function Profile() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/auth/profile")
        .then((res) => res.json())
        .then((data) => {
          setName(data.name);
          setEmail(data.email);
        })
        .catch(() => setMessage({ text: "Failed to load profile.", type: "error" }))
        .finally(() => setLoading(false));
    }
  }, [session]);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      if (res.ok) {
        setMessage({ text: "Profile updated successfully!", type: "success" });
        setPassword("");
      } else {
        setMessage({ text: "Failed to update profile.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error. Please try again.", type: "error" });
    }
  };

  if (!session) return <p className="text-center text-lg text-red-500">Please log in to view your profile.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-cyan-500 flex flex-col items-center justify-center p-8 text-white">
      <Head>
        <title>My Profile</title>
      </Head>

      <h1 className="text-4xl font-bold mb-6 flex items-center gap-2 drop-shadow-lg">
        <FaUserEdit /> My Profile
      </h1>

      {loading ? (
        <p className="text-lg animate-pulse">Loading profile...</p>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-2xl w-96 text-gray-900">
          {/* Profile Avatar */}
          <div className="flex flex-col items-center mb-4">
            {session.user?.image ? (
              <img src={session.user.image} alt="User Avatar" className="w-20 h-20 rounded-full shadow-lg" />
            ) : (
              <FaUserCircle className="w-20 h-20 text-gray-400" />
            )}
          </div>

          {/* Success/Error Messages */}
          {message && (
            <p className={`mb-4 text-center ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {message.text}
            </p>
          )}

          <form onSubmit={updateProfile}>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Email</label>
              <input className="w-full p-2 border rounded bg-gray-200 text-gray-500 cursor-not-allowed" type="email" value={email} readOnly />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-semibold">Name</label>
              <input
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-semibold">New Password</label>
              <input
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
                type="password"
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-md" type="submit">
                Update Profile
              </button>
              <button onClick={() => signOut()} type="button" className="flex items-center gap-2 text-blue-600 hover:underline">
                <FaSignOutAlt /> Sign Out
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
