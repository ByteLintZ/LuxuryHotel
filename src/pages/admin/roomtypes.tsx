import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Hotel {
  id: string;
  name: string;
}

interface RoomType {
  id: string;
  name: string;
  price: number;
  hotelId: string;
  hotel?: Hotel;
}

export default function AdminRoomTypes() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [form, setForm] = useState({ name: "", price: "", hotelId: "" });
  const [editing, setEditing] = useState<RoomType | null>(null);

  useEffect(() => {
    fetchRoomTypes();
    fetchHotels();
  }, []);

  const fetchRoomTypes = async () => {
    const res = await fetch("/api/roomtypes");
    const data = await res.json();
    setRoomTypes(data);
  };

  const fetchHotels = async () => {
    const res = await fetch("/api/hotels");
    const data = await res.json();
    setHotels(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.hotelId) {
      toast.error("All fields required");
      return;
    }
    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      hotelId: form.hotelId,
    };
    let res;
    if (editing) {
      res = await fetch(`/api/roomtypes/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch("/api/roomtypes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    if (res.ok) {
      toast.success(editing ? "Room type updated" : "Room type created");
      setForm({ name: "", price: "", hotelId: "" });
      setEditing(null);
      fetchRoomTypes();
    } else {
      toast.error("Failed to save room type");
    }
  };

  const handleEdit = (rt: RoomType) => {
    setEditing(rt);
    setForm({ name: rt.name, price: String(rt.price), hotelId: rt.hotelId });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this room type?")) return;
    const res = await fetch(`/api/roomtypes/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Room type deleted");
      fetchRoomTypes();
    } else {
      toast.error("Failed to delete room type");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-cyan-400 to-blue-600 p-8 text-white">
      <ToastContainer position="top-right" />
      <h1 className="text-3xl font-bold mb-6">Room Types Admin</h1>
      <form onSubmit={handleSubmit} className="bg-white text-gray-900 p-6 rounded-lg shadow-lg mb-8 max-w-md">
        <h2 className="text-xl font-bold mb-4">{editing ? "Edit Room Type" : "Add Room Type"}</h2>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Room Type Name" className="w-full p-2 mb-3 border rounded" />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Price per night" type="number" className="w-full p-2 mb-3 border rounded" />
        <select name="hotelId" value={form.hotelId} onChange={handleChange} className="w-full p-2 mb-3 border rounded">
          <option value="">Select Hotel</option>
          {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mr-2">{editing ? "Update" : "Add"}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: "", price: "", hotelId: "" }); }} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>}
      </form>
      <div className="bg-white text-gray-900 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Room Types</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Name</th>
              <th className="text-left">Price</th>
              <th className="text-left">Hotel</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {roomTypes.map(rt => (
              <tr key={rt.id}>
                <td>{rt.name}</td>
                <td>${rt.price}</td>
                <td>{hotels.find(h => h.id === rt.hotelId)?.name || ""}</td>
                <td>
                  <button onClick={() => handleEdit(rt)} className="text-blue-600 mr-2">Edit</button>
                  <button onClick={() => handleDelete(rt.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
