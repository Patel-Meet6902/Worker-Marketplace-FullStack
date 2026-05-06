import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ShiftDetailPage() {
  const { shiftId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shift, setShift] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [error, setError] = useState("");

  const fetchShift = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/shifts/${shiftId}`);
      setShift(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load shift");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShift();
  }, [shiftId]);

  const handleApply = async () => {
    setActionMessage("");
    try {
      await api.post(`/applications/${shiftId}`, { message });
      setActionMessage("Applied successfully.");
    } catch (err) {
      setActionMessage(err.response?.data?.detail || "Failed to apply");
    }
  };

  if (loading) return <div className="text-slate-400">Loading shift...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!shift) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{shift.title}</h1>
            <p className="text-slate-400 mt-2">{shift.location}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/20 h-fit">
            {shift.status}
          </span>
        </div>

        <p className="text-slate-300 mt-6 leading-7">{shift.description}</p>

        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <div className="rounded-2xl bg-slate-900/50 p-4">
            <p className="text-slate-400 text-sm">Date</p>
            <p className="font-medium mt-1">{shift.shift_date}</p>
          </div>
          <div className="rounded-2xl bg-slate-900/50 p-4">
            <p className="text-slate-400 text-sm">Time</p>
            <p className="font-medium mt-1">{shift.start_time} - {shift.end_time}</p>
          </div>
          <div className="rounded-2xl bg-slate-900/50 p-4">
            <p className="text-slate-400 text-sm">Pay Rate</p>
            <p className="font-medium mt-1">${shift.pay_rate}</p>
          </div>
          <div className="rounded-2xl bg-slate-900/50 p-4">
            <p className="text-slate-400 text-sm">Workers Needed</p>
            <p className="font-medium mt-1">{shift.workers_needed}</p>
          </div>
        </div>
      </div>

      {user?.role === "worker" && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold mb-4">Apply for this shift</h2>

          {actionMessage && (
            <div className="mb-4 rounded-2xl bg-slate-900/60 p-3 text-slate-300">
              {actionMessage}
            </div>
          )}

          <textarea
            rows="4"
            placeholder="Optional message for client"
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            onClick={handleApply}
            className="mt-4 rounded-2xl bg-blue-500 hover:bg-blue-400 px-6 py-3 font-semibold"
          >
            Apply Now
          </button>
        </div>
      )}

      {user?.role === "client" && (
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/client/shifts/${shiftId}/applicants`)}
            className="rounded-2xl bg-blue-500 hover:bg-blue-400 px-6 py-3 font-semibold"
          >
            View Applicants
          </button>
        </div>
      )}
    </div>
  );
}