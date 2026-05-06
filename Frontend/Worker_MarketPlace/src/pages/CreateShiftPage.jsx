import { useState, useEffect} from "react";
import { useNavigate, Navigate, useParams} from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export function CreateShiftPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shift_date: "",
    start_time: "",
    end_time: "",
    location: "",
    pay_rate: "",
    workers_needed: 1,
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user?.role !== "client") {
    return <Navigate to="/redirect-by-role" replace />;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.end_time <= formData.start_time) {
      setError("End time must be after start time");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/shifts", {
        ...formData,
        pay_rate: Number(formData.pay_rate),
        workers_needed: Number(formData.workers_needed),
      });

      navigate("/client/shifts");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create shift");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h1 className="text-3xl font-bold mb-2">Create Shift</h1>
        <p className="text-slate-400 mb-8">Post a new shift for workers to apply.</p>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Title</label>
            <input
              type="text"
              name="title"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Description</label>
            <textarea
              name="description"
              rows="5"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Shift Date</label>
            <input
              type="date"
              name="shift_date"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
              value={formData.shift_date}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Location</label>
            <input
              type="text"
              name="location"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Start Time</label>
            <input
              type="time"
              name="start_time"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
              value={formData.start_time}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">End Time</label>
            <input
              type="time"
              name="end_time"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
              value={formData.end_time}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Pay Rate</label>
            <input
              type="number"
              name="pay_rate"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
              value={formData.pay_rate}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Workers Needed</label>
            <input
              type="number"
              name="workers_needed"
              min="1"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
              value={formData.workers_needed}
              onChange={handleChange}
              required
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-blue-500 hover:bg-blue-400 disabled:opacity-60 py-3 font-semibold"
            >
              {submitting ? "Creating shift..." : "Create Shift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


export function EditShift() {
  const { shiftId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shift_date: "",
    start_time: "",
    end_time: "",
    location: "",
    pay_rate: "",
    workers_needed: 1,
    status: "open",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (user?.role !== "client") {
    return <Navigate to="/redirect-by-role" replace />;
  }

  useEffect(() => {
    const fetchShift = async () => {
      try {
        const res = await api.get(`/shifts/${shiftId}`);
        const shift = res.data;

        setFormData({
          title: shift.title,
          description: shift.description,
          shift_date: shift.shift_date,
          start_time: shift.start_time?.slice(0, 5),
          end_time: shift.end_time?.slice(0, 5),
          location: shift.location,
          pay_rate: shift.pay_rate,
          workers_needed: shift.workers_needed,
          status: shift.status,
        });
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load shift");
      } finally {
        setLoading(false);
      }
    };

    fetchShift();
  }, [shiftId]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.end_time <= formData.start_time) {
      setError("End time must be after start time");
      return;
    }

    setSubmitting(true);

    try {
      await api.put(`/shifts/${shiftId}`, {
        ...formData,
        pay_rate: Number(formData.pay_rate),
        workers_needed: Number(formData.workers_needed),
      });

      navigate("/client/shifts");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update shift");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-slate-400">Loading shift...</div>;

  if (formData.status === "completed" || formData.status === "cancelled") {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-2xl font-bold mb-2">Shift cannot be edited</h1>
        <p className="text-slate-400">
          Completed or cancelled shifts can no longer be edited.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold mb-2">Edit Shift</h1>
        <p className="text-slate-400 mb-8">Update your shift details.</p>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input name="title" value={formData.title} onChange={handleChange} className="md:col-span-2 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />
          <textarea name="description" value={formData.description} onChange={handleChange} rows="5" className="md:col-span-2 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />
          <input type="date" name="shift_date" value={formData.shift_date} onChange={handleChange} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />
          <input name="location" value={formData.location} onChange={handleChange} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />
          <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />
          <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />
          <input type="number" name="pay_rate" value={formData.pay_rate} onChange={handleChange} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />
          <input type="number" name="workers_needed" min="1" value={formData.workers_needed} onChange={handleChange} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3" />

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-blue-500 hover:bg-blue-400 disabled:opacity-60 py-3 font-semibold"
            >
              {submitting ? "Updating shift..." : "Update Shift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}