import { useState, useEffect, ChangeEvent } from "react";
import { FaPlus, FaTrash, FaHotel, FaSearch, FaEdit, FaExclamationTriangle } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Hotel {
  id: string;
  name: string;
  location: string;
  description: string;
  price: number;
  image: string;
}

interface RoomTypeForm {
  name: string;
  price: string;
}

export default function AdminHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState<string | null>(null);
  const [editHotel, setEditHotel] = useState<Hotel | null>(null);
  const [hotelForm, setHotelForm] = useState({ name: "", location: "", description: "", price: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roomTypesForm, setRoomTypesForm] = useState<RoomTypeForm[]>([{ name: "", price: "" }]);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const res = await fetch("/api/hotels");
      const data = await res.json();
      setHotels(data);
      setFilteredHotels(data);
    } catch (error) {
      toast.error("Failed to fetch hotels.");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setHotelForm({ ...hotelForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    const filtered = hotels.filter((hotel) =>
      hotel.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredHotels(filtered);
  };

  const handleRoomTypeChange = (idx: number, field: keyof RoomTypeForm, value: string) => {
    setRoomTypesForm((prev) => prev.map((rt, i) => i === idx ? { ...rt, [field]: value } : rt));
  };

  const addRoomTypeField = () => {
    if (roomTypesForm.length < 5) setRoomTypesForm([...roomTypesForm, { name: "", price: "" }]);
  };

  const removeRoomTypeField = (idx: number) => {
    setRoomTypesForm((prev) => prev.filter((_, i) => i !== idx));
  };

  const openModal = (hotel?: Hotel) => {
    if (hotel) {
      setEditHotel(hotel);
      setHotelForm({
        name: hotel.name,
        location: hotel.location,
        description: hotel.description,
        price: String(hotel.price),
      });
    } else {
      setEditHotel(null);
      setHotelForm({ name: "", location: "", description: "", price: "" });
      setImageFile(null);
    }
    setShowModal(true);
  };

  const createHotel = async () => {
    const formData = new FormData();
    formData.append("name", hotelForm.name);
    formData.append("location", hotelForm.location);
    formData.append("description", hotelForm.description);
    formData.append("price", hotelForm.price);
    if (imageFile) formData.append("image", imageFile);
    formData.append("roomTypes", JSON.stringify(roomTypesForm.filter(rt => rt.name && rt.price)));

    const res = await fetch("/api/hotels", { method: "POST", body: formData });

    if (res.ok) {
      toast.success("Hotel added successfully!");
      fetchHotels();
      setShowModal(false);
    } else {
      toast.error("Failed to add hotel.");
    }
  };

  const updateHotel = async () => {
    if (!editHotel) return;
    const formData = new FormData();
    let hasChange = false;
    if (hotelForm.name !== editHotel.name) { formData.append("name", hotelForm.name); hasChange = true; }
    if (hotelForm.location !== editHotel.location) { formData.append("location", hotelForm.location); hasChange = true; }
    if (hotelForm.description !== editHotel.description) { formData.append("description", hotelForm.description); hasChange = true; }
    if (hotelForm.price !== String(editHotel.price)) { formData.append("price", hotelForm.price); hasChange = true; }
    if (imageFile) { formData.append("image", imageFile); hasChange = true; }
    // Room types editing for update is not supported in this version
    if (!hasChange) {
      toast.info("No changes to update.");
      return;
    }
    const res = await fetch(`/api/hotels/${editHotel.id}`, { method: "PUT", body: formData });
    if (res.ok) {
      toast.success("Hotel updated successfully!");
      fetchHotels();
      setShowModal(false);
    } else {
      toast.error("Failed to update hotel.");
    }
  };

  const confirmDeleteHotel = (id: string) => {
    setHotelToDelete(id);
    setShowDeleteModal(true);
  };

  const deleteHotel = async () => {
    if (!hotelToDelete) return;

    const res = await fetch(`/api/hotels/${hotelToDelete}`, { method: "DELETE" });

    if (res.ok) {
      toast.success("Hotel deleted successfully!");
      fetchHotels();
    } else {
      toast.error("Failed to delete hotel.");
    }

    setShowDeleteModal(false);
    setHotelToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-cyan-400 to-blue-600 p-8 text-white">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <h1 className="text-5xl font-extrabold mb-10 text-center tracking-tight drop-shadow-xl flex justify-center items-center gap-4">
        <FaHotel className="text-yellow-300 animate-pulse" /> Hotel Management
      </h1>

      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-lg">
          <input
            type="text"
            placeholder="Search hotels..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full p-3 pl-12 rounded-lg text-gray-900 focus:ring-4 focus:ring-cyan-300"
          />
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
        </div>
      </div>

      <div className="flex justify-center mb-10">
        <button
          onClick={() => openModal()}
          className="flex items-center gap-3 bg-gradient-to-r from-yellow-200 to-yellow-400 text-blue-900 px-6 py-3 rounded-full shadow-lg hover:scale-105 transform transition font-semibold"
        >
          <FaPlus /> Add Hotel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredHotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white text-gray-900 rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition"
          >
            <img src={hotel.image} alt={hotel.name} className="w-full h-56 object-cover" />
            <div className="p-6 space-y-2">
              <h2 className="text-2xl font-bold text-blue-800">{hotel.name}</h2>
              <p className="text-cyan-700 font-semibold">{hotel.location}</p>
              <p>{hotel.description}</p>
              <p className="text-lg font-bold text-blue-800">${hotel.price}/night</p>
              <div className="mt-4 flex gap-6">
                <button onClick={() => openModal(hotel)} className="flex items-center gap-2 text-blue-600 font-semibold">
                  <FaEdit /> Edit
                </button>
                <button onClick={() => confirmDeleteHotel(hotel.id)} className="flex items-center gap-2 text-red-600 font-semibold">
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-gray-900 w-full max-w-md animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-blue-800">
              <FaHotel /> {editHotel ? "Edit Hotel" : "Add New Hotel"}
            </h2>
            <div className="space-y-4">
              <input type="text" name="name" placeholder="Hotel Name" value={hotelForm.name} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
              <input type="text" name="location" placeholder="Location" value={hotelForm.location} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
              <textarea name="description" placeholder="Description" value={hotelForm.description} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
              <input type="number" name="price" placeholder="Price per night" value={hotelForm.price} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
              {!editHotel && (
                <div>
                  <label className="block font-semibold mb-2">Room Types (max 5):</label>
                  {roomTypesForm.map((rt, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input type="text" placeholder="Type (e.g. Deluxe)" value={rt.name} onChange={e => handleRoomTypeChange(idx, 'name', e.target.value)} className="flex-1 p-2 border rounded" />
                      <input type="number" placeholder="Price" value={rt.price} onChange={e => handleRoomTypeChange(idx, 'price', e.target.value)} className="w-24 p-2 border rounded" />
                      {roomTypesForm.length > 1 && <button type="button" onClick={() => removeRoomTypeField(idx)} className="text-red-500 font-bold">×</button>}
                    </div>
                  ))}
                  {roomTypesForm.length < 5 && (
                    <button type="button" onClick={addRoomTypeField} className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded">+ Add Room Type</button>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button onClick={() => setShowModal(false)} className="bg-gray-300 px-5 py-2 rounded-full font-semibold">Cancel</button>
              <button onClick={editHotel ? updateHotel : createHotel} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-full font-bold shadow-md hover:scale-105 transition">
                {editHotel ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl text-gray-900 w-full max-w-sm animate-fade-in-up">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-red-600 mb-3">
              <FaExclamationTriangle /> Confirm Delete
            </h2>
            <p className="text-gray-700">Are you sure you want to delete this hotel?</p>
            <div className="mt-6 flex justify-end gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="bg-gray-300 px-5 py-2 rounded-full font-semibold">Cancel</button>
              <button onClick={deleteHotel} className="bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-2 rounded-full font-bold shadow-md hover:scale-105 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
