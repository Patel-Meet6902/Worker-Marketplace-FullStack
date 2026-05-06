import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ClientMyShiftsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  if (user?.role !== "client") {
    return <Navigate to="/redirect-by-role" replace />;
  }

  const fetchMyShifts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/shifts/my");
      setShifts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyShifts();
  }, []);

  const handleCancel = async (shiftId) => {
    try {
      await api.post(`/shifts/${shiftId}/cancel`);
      fetchMyShifts();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to cancel shift");
    }
  };

  const handleComplete = async (shiftId) => {
    try {
      await api.post(`/shifts/${shiftId}/complete`);
      fetchMyShifts();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to complete shift");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4 items-center">
        <div>
          <h1 className="text-3xl font-bold">My Shifts</h1>
          <p className="text-slate-400 mt-2">Manage your posted shifts and applicants.</p>
        </div>

        <button
          onClick={() => navigate("/client/shifts/create")}
          className="rounded-2xl bg-blue-500 hover:bg-blue-400 px-5 py-3 font-semibold"
        >
          Create New Shift
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading shifts...</div>
      ) : shifts.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-400">
          No shifts created yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {shifts.map((item) => (
            <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">{item.title}</h2>
                  <p className="text-slate-400 mt-1">{item.location} • {item.shift_date}</p>
                </div>

                <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/20 h-fit">
                  {item.status}
                </span>
              </div>

              <p className="text-slate-300 mt-4">{item.description}</p>

              <div className="grid md:grid-cols-4 gap-3 mt-5 text-sm text-slate-300">
                <p>Applications: {item.application_count}</p>
                <p>Confirmed: {item.confirmed_workers_count}</p>
                <p>Pay: ${item.pay_rate}</p>
                <p>Needed: {item.workers_needed}</p>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={() => navigate(`/client/shifts/${item.id}/applicants`)}
                  className="rounded-2xl border border-white/10 px-4 py-2 hover:border-white/30"
                >
                  View Applicants
                </button>

                {item.status === "assigned" && (
                  <button
                    onClick={() => handleComplete(item.id)}
                    className="rounded-2xl bg-green-600 hover:bg-green-500 px-4 py-2"
                  >
                    Mark Complete
                  </button>
                )}

                {!["completed", "cancelled"].includes(item.status) && (
                  <button
                    onClick={() => handleCancel(item.id)}
                    className="rounded-2xl border border-red-400/30 text-red-300 hover:bg-red-400/10 px-4 py-2"
                  >
                    Cancel Shift
                  </button>
                )}

                {!["completed", "cancelled"].includes(item.status) && (
                  <button
                    onClick={() => navigate(`/client/shifts/${item.id}/edit`)}
                    className="rounded-2xl bg-blue-500 hover:bg-blue-400 px-4 py-2"
                  >
                    Edit Shift
                  </button>
                )}
                
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}