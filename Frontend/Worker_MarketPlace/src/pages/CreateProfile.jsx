import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export function CreateClientProfile() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    phone: "",
    bio: "",
    location: "",
    profile_image: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await api.post("/profiles/client", formData);
      navigate("/client/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create client profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 md:p-10 shadow-2xl">
        <div className="mb-8">
          <p className="text-blue-400 font-medium mb-2">Complete your setup</p>
          <h1 className="text-3xl font-bold text-white">Create Client Profile</h1>
          <p className="text-slate-400 mt-2">Add your business details so you can start posting shifts.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Company Name</label>
            <input
              type="text"
              name="company_name"
              placeholder="Enter company name"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 text-white px-4 py-3 outline-none focus:border-blue-400"
              value={formData.company_name}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Contact Name</label>
            <input
              type="text"
              name="contact_name"
              placeholder="Enter contact name"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 text-white px-4 py-3 outline-none focus:border-blue-400"
              value={formData.contact_name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Phone</label>
            <input
              type="text"
              name="phone"
              placeholder="Phone number"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 text-white px-4 py-3 outline-none focus:border-blue-400"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Location</label>
            <input
              type="text"
              name="location"
              placeholder="City / Area"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 text-white px-4 py-3 outline-none focus:border-blue-400"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Bio</label>
            <textarea
              name="bio"
              rows="5"
              placeholder="Write a short description about your company"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 text-white px-4 py-3 outline-none focus:border-blue-400"
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white py-3 font-semibold transition"
            >
              {submitting ? "Creating profile..." : "Create Client Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CreateWorkerProfile() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    bio: "",
    location: "",
    experience_level: "",
    hourly_rate: "",
    availability_status: "available",
    profile_image: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        hourly_rate: formData.hourly_rate ? Number(formData.hourly_rate) : null,
      };

      await api.post("/profiles/worker", payload);
      navigate("/worker/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create worker profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 md:p-10 shadow-2xl">
        <div className="mb-8">
          <p className="text-blue-400 font-medium mb-2">Complete your setup</p>
          <h1 className="text-3xl font-bold text-white">Create Worker Profile</h1>
          <p className="text-slate-400 mt-2">Add your details so clients can match you to the right shifts.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Full Name</label>
            <input
              type="text"
              name="full_name"
              placeholder="Enter full name"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 text-white px-4 py-3 outline-none focus:border-blue-400"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Phone</label>
            <input
              type="text"
              name="phone"
              placeholder="Phone number"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 text-white px-4 py-3 outline-none focus:border-blue-400"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Location</label>
            <input
              type="text"
              name="location"
              placeholder="City / Area"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 text-white px-4 py-3 outline-none focus:border-blue-400"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Experience Level</label>
            <input
              type="text"
              name="experience_level"
              placeholder="Beginner / Intermediate / Expert"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 text-white px-4 py-3 outline-none focus:border-blue-400"
              value={formData.experience_level}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Hourly Rate</label>
            <input
              type="number"
              name="hourly_rate"
              placeholder="Enter hourly rate"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 text-white px-4 py-3 outline-none focus:border-blue-400"
              value={formData.hourly_rate}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Availability Status</label>
            <select
              name="availability_status"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 text-white px-4 py-3 outline-none focus:border-blue-400"
              value={formData.availability_status}
              onChange={handleChange}
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="busy">Busy</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Bio</label>
            <textarea
              name="bio"
              rows="5"
              placeholder="Tell clients a little about your experience"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 text-white px-4 py-3 outline-none focus:border-blue-400"
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white py-3 font-semibold transition"
            >
              {submitting ? "Creating profile..." : "Create Worker Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}