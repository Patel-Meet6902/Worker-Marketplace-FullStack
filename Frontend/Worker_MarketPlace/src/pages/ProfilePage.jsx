import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      const endpoint = user?.role === "client" ? "/profiles/client/me" : "/profiles/worker/me";
      const res = await api.get(endpoint);
      setFormData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load profile");
    }
  };

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const endpoint = user?.role === "client" ? "/profiles/client/me" : "/profiles/worker/me";
      const payload =
        user?.role === "worker"
          ? {
              ...formData,
              hourly_rate: formData.hourly_rate ? Number(formData.hourly_rate) : null,
            }
          : formData;

      const res = await api.put(endpoint, payload);
      setFormData(res.data);
      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update profile");
    }
  };

  if (!formData) return <div className="text-slate-400">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-slate-400 mt-2">View and update your profile details.</p>
          </div>

          <button
            onClick={() => setEditing((prev) => !prev)}
            className="rounded-2xl bg-blue-500 hover:bg-blue-400 px-4 py-2"
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {error && <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-red-300">{error}</div>}
        {success && <div className="mb-4 rounded-2xl border border-green-400/20 bg-green-400/10 p-3 text-green-300">{success}</div>}

        <form onSubmit={handleUpdate} className="grid md:grid-cols-2 gap-4">
          {user?.role === "client" ? (
            <>
              <input name="company_name" value={formData.company_name || ""} onChange={handleChange} disabled={!editing} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />
              <input name="contact_name" value={formData.contact_name || ""} onChange={handleChange} disabled={!editing} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />
              <input name="phone" value={formData.phone || ""} onChange={handleChange} disabled={!editing} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />
              <input name="location" value={formData.location || ""} onChange={handleChange} disabled={!editing} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />
              <textarea name="bio" value={formData.bio || ""} onChange={handleChange} disabled={!editing} rows="5" className="md:col-span-2 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />
            </>
          ) : (
            <>
              <input name="full_name" value={formData.full_name || ""} onChange={handleChange} disabled={!editing} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />
              <input name="phone" value={formData.phone || ""} onChange={handleChange} disabled={!editing} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />
              <input name="location" value={formData.location || ""} onChange={handleChange} disabled={!editing} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />
              <input name="experience_level" value={formData.experience_level || ""} onChange={handleChange} disabled={!editing} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />
              <input name="hourly_rate" type="number" value={formData.hourly_rate || ""} onChange={handleChange} disabled={!editing} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />
              <select name="availability_status" value={formData.availability_status || "available"} onChange={handleChange} disabled={!editing} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="busy">Busy</option>
              </select>
              <textarea name="bio" value={formData.bio || ""} onChange={handleChange} disabled={!editing} rows="5" className="md:col-span-2 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />
            </>
          )}

          {editing && (
            <div className="md:col-span-2 pt-2">
              <button type="submit" className="w-full rounded-2xl bg-blue-500 hover:bg-blue-400 py-3 font-semibold">
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}