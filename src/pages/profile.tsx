// pages/profile.tsx

import { useState, useEffect } from "react";
import Head from "next/head";
import { useSession, signOut } from "next-auth/react";
import { FaUserEdit, FaSignOutAlt } from "react-icons/fa";

export default function Profile() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session) {
      fetch("/api/auth/profile")
        .then((res) => res.json())
        .then((data) => {
          setName(data.name);
          setEmail(data.email);
        });
    }
  }, [session]);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });
    if (res.ok) {
      setMessage("Profile updated successfully!");
      setPassword("");
    } else {
      setMessage("Failed to update profile");
    }
  };

  if (!session) return <p>Please log in to view your profile.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-cyan-500 flex flex-col items-center justify-center p-8 text-white">
      <Head>
        <title>My Profile</title>
      </Head>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FaUserEdit /> My Profile
      </h1>
      {message && <p className="mb-4">{message}</p>}
      <form onSubmit={updateProfile} className="bg-white p-8 rounded-lg shadow-2xl w-96 text-gray-900">
        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input className="w-full p-2 border rounded" type="email" value={email} readOnly />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Name</label>
          <input
            className="w-full p-2 border rounded"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">New Password</label>
          <input
            className="w-full p-2 border rounded"
            type="password"
            placeholder="Leave blank to keep current"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-between items-center">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" type="submit">
            Update Profile
          </button>
          <button onClick={() => signOut()} type="button" className="flex items-center gap-2 text-blue-600 hover:underline">
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </form>
    </div>
  );
}
