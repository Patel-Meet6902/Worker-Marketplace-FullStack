import { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ShiftApplicantsPage() {
  const { shiftId } = useParams();
  const { user } = useAuth();

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const startChat = async (workerId) => {
    try {
      const res = await api.post(`/chat/start/${shiftId}/${workerId}`);
      navigate(`/messages/${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to start chat");
    }
  };

  if (user?.role !== "client") {
    return <Navigate to="/redirect-by-role" replace />;
  }

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/applications/shift/${shiftId}`);
      setApplicants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [shiftId]);

  const handleAction = async (applicationId, action) => {
    try {
      await api.post(`/applications/${applicationId}/${action}`);
      fetchApplicants();
    } catch (err) {
      alert(err.response?.data?.detail || `Failed to ${action} application`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Applicants</h1>
        <p className="text-slate-400 mt-2">Review and manage worker applications for this shift.</p>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading applicants...</div>
      ) : applicants.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-400">
          No applicants found for this shift.
        </div>
      ) : (
        <div className="grid gap-4">
          {applicants.map((item) => (
            <div key={item.application_id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">{item.worker.full_name}</h2>
                  <p className="text-slate-400 mt-1">
                    {item.worker.location || "No location"} • {item.worker.experience_level || "No experience level"}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/20 h-fit">
                  {item.status}
                </span>
              </div>

              <div className="grid md:grid-cols-4 gap-3 mt-5 text-sm text-slate-300">
                <p>Hourly Rate: {item.worker.hourly_rate ? `$${item.worker.hourly_rate}` : "N/A"}</p>
                <p>Availability: {item.worker.availability_status || "N/A"}</p>
                <p>Applied: {new Date(item.applied_at).toLocaleString()}</p>
              </div>

              {item.message && (
                <div className="mt-4 rounded-2xl bg-slate-900/50 p-4 text-slate-300">
                  <p className="text-sm text-slate-400 mb-1">Worker message</p>
                  <p>{item.message}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-6">
                {item.status === "applied" && (
                  <>
                    <button
                      onClick={() => handleAction(item.application_id, "approve")}
                      className="rounded-2xl bg-green-600 hover:bg-green-500 px-4 py-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(item.application_id, "reject")}
                      className="rounded-2xl border border-red-400/30 text-red-300 hover:bg-red-400/10 px-4 py-2"
                    >
                      Reject
                    </button>
                  </>
                )}

                {item.status === "client_approved" && (
                  <button
                    onClick={() => handleAction(item.application_id, "reject")}
                    className="rounded-2xl border border-red-400/30 text-red-300 hover:bg-red-400/10 px-4 py-2"
                  >
                    Reject
                  </button>
                )}
              </div>

              <button
                onClick={() => startChat(item.worker_id)}
                className="rounded-2xl border border-white/10 px-4 py-2 hover:border-white/30"
              >
                Chat
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}