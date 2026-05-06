import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function WorkerMyApplicationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);


  const startChat = async (shiftId) => {
    try {
      const res = await api.post(`/chat/start/${shiftId}/${user.id}`);
      navigate(`/messages/${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to start chat");
    }
  };

  if (user?.role !== "worker") {
    return <Navigate to="/redirect-by-role" replace />;
  }

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/applications/my");
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const performAction = async (applicationId, action) => {
    try {
      await api.post(`/applications/${applicationId}/${action}`);
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.detail || `Failed to ${action} application`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-slate-400 mt-2">Track the status of all your shift applications.</p>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-400">
          You have not applied to any shifts yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((item) => (
            <div key={item.application_id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">{item.shift.title}</h2>
                  <p className="text-slate-400 mt-1">
                    {item.shift.location} • {item.shift.shift_date}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/20 text-sm">
                    {item.application_status}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 text-sm">
                    Shift: {item.shift.status}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-3 mt-5 text-sm text-slate-300">
                <p>Time: {item.shift.start_time} - {item.shift.end_time}</p>
                <p>Pay: ${item.shift.pay_rate}</p>
                <p>Applied At: {new Date(item.applied_at).toLocaleString()}</p>
              </div>

              {item.message && (
                <div className="mt-4 rounded-2xl bg-slate-900/50 p-4 text-slate-300">
                  <p className="text-sm text-slate-400 mb-1">Your message</p>
                  <p>{item.message}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={() => navigate(`/shifts/${item.shift_id}`)}
                  className="rounded-2xl border border-white/10 px-4 py-2 hover:border-white/30"
                >
                  View Shift
                </button>

                {item.application_status === "applied" && (
                  <button
                    onClick={() => performAction(item.application_id, "withdraw")}
                    className="rounded-2xl border border-red-400/30 text-red-300 hover:bg-red-400/10 px-4 py-2"
                  >
                    Withdraw
                  </button>
                )}

                {item.application_status === "client_approved" && (
                  <>
                    <button
                      onClick={() => performAction(item.application_id, "confirm")}
                      className="rounded-2xl bg-green-600 hover:bg-green-500 px-4 py-2"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => performAction(item.application_id, "decline")}
                      className="rounded-2xl border border-red-400/30 text-red-300 hover:bg-red-400/10 px-4 py-2"
                    >
                      Decline
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => startChat(item.shift_id)}
                className="rounded-2xl border border-white/10 px-4 py-2 hover:border-white/30">
                Chat
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}