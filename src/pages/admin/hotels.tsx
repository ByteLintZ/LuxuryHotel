import { useState, useEffect, ChangeEvent } from "react";
import { FaPlus, FaTrash, FaHotel } from "react-icons/fa";

interface Hotel {
  id: string;
  name: string;
  location: string;
  description: string;
  price: number;
  image: string;
}

export default function AdminHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newHotel, setNewHotel] = useState({
    name: "",
    location: "",
    description: "",
    price: "",
  });
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    const res = await fetch("/api/hotels");
    const data = await res.json();
    setHotels(data);
  };

  const createHotel = async () => {
    const formData = new FormData();
    formData.append("name", newHotel.name);
    formData.append("location", newHotel.location);
    formData.append("description", newHotel.description);
    formData.append("price", newHotel.price);
    if (newImageFile) {
      formData.append("image", newImageFile);
    }

    const res = await fetch("/api/hotels", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      fetchHotels();
      setShowModal(false);
      setNewHotel({ name: "", location: "", description: "", price: "" });
      setNewImageFile(null);
    } else {
      alert("Failed to create hotel");
    }
  };

  const deleteHotel = async (id: string) => {
    await fetch(`/api/hotels/${id}`, { method: "DELETE" });
    fetchHotels();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewHotel({ ...newHotel, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImageFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 via-cyan-300  to-cyan-600 p-8 text-white">
      <h1 className="text-4xl font-bold mb-6 text-center drop-shadow-lg flex justify-center items-center gap-3">
        <FaHotel className="text-3xl text-yellow-200" /> Manage Hotels
      </h1>
      
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-white text-blue-900 px-6 py-3 rounded-md shadow-lg hover:bg-gray-200 transition-transform transform hover:scale-105"
      >
        <FaPlus /> Add Hotel
      </button>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white text-gray-900 rounded-lg shadow-xl overflow-hidden transform transition hover:scale-105 border-t-4 border-yellow-200"
          >
            <img src={hotel.image} alt={hotel.name} className="w-full h-56 object-cover" />
            <div className="p-4">
              <h2 className="text-2xl font-bold">{hotel.name}</h2>
              <p className="text-sm text-gray-600">{hotel.location}</p>
              <p className="mt-2 text-gray-700">{hotel.description}</p>
              <p className="font-bold mt-3 text-blue-900">${hotel.price}/night</p>
              <button
                onClick={() => deleteHotel(hotel.id)}
                className="mt-4 inline-flex items-center gap-1 text-red-500 hover:text-red-700 transition"
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-96 text-gray-900 animate-fadeIn border border-yellow-200">
            <h2 className="text-2xl font-bold mb-6 text-center">Add New Hotel</h2>
            <input
              className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
              name="name"
              placeholder="Name"
              value={newHotel.name}
              onChange={handleInputChange}
            />
            <input
              className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
              name="location"
              placeholder="Location"
              value={newHotel.location}
              onChange={handleInputChange}
            />
            <textarea
              className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
              name="description"
              placeholder="Description"
              value={newHotel.description}
              onChange={handleInputChange}
            />
            <input
              className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
              name="price"
              placeholder="Price"
              type="number"
              value={newHotel.price}
              onChange={handleInputChange}
            />
            <input
              className="w-full p-3 border border-gray-300 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-300"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={createHotel}
                className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
