import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">
      <p className="text-slate-400 text-sm">{title}</p>
      <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
      {subtitle && <p className="text-slate-500 text-sm mt-2">{subtitle}</p>}
    </div>
  );
}

export function ClientDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard/client");
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load client dashboard");
      }
    };

    fetchDashboard();
  }, []);

  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  if (!data) {
    return <div className="text-white">Loading client dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-blue-400 font-medium">Client Panel</p>
        <h1 className="text-4xl font-bold mt-1">Dashboard</h1>
        <p className="text-slate-400 mt-2">Manage shifts, staffing, and recent activity.</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Shifts" value={data.total_shifts} />
        <StatCard title="Open Shifts" value={data.open_shifts} />
        <StatCard title="Assigned Shifts" value={data.assigned_shifts} />
        <StatCard title="Applications Received" value={data.total_applications_received} />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-semibold">Recent Shifts</h2>
            <p className="text-slate-400 text-sm mt-1">Latest shifts posted by you</p>
          </div>
        </div>

        <div className="space-y-4">
          {data.recent_shifts?.length > 0 ? (
            data.recent_shifts.map((item) => (
              <div
                key={item.shift_id}
                className="rounded-2xl border border-white/10 bg-slate-900/50 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="text-slate-400 mt-1">
                      {item.location} • {item.shift_date}
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full text-sm bg-blue-500/15 text-blue-300 border border-blue-400/20">
                    {item.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-3 mt-4 text-sm text-slate-300">
                  <p>Workers Needed: {item.workers_needed}</p>
                  <p>Applications: {item.application_count}</p>
                  <p>Confirmed: {item.confirmed_workers_count}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400">No recent shifts found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function WorkerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard/worker");
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load worker dashboard");
      }
    };

    fetchDashboard();
  }, []);

  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  if (!data) {
    return <div className="text-white">Loading worker dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-blue-400 font-medium">Worker Panel</p>
        <h1 className="text-4xl font-bold mt-1">Dashboard</h1>
        <p className="text-slate-400 mt-2">Track your applications, approvals, and assignments.</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Applications" value={data.total_applications} />
        <StatCard title="Approved" value={data.client_approved_applications} />
        <StatCard title="Confirmed" value={data.confirmed_applications} />
        <StatCard title="Assigned Shifts" value={data.assigned_shifts_count} />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-semibold">Recent Applications</h2>
            <p className="text-slate-400 text-sm mt-1">Your latest activity</p>
          </div>
        </div>

        <div className="space-y-4">
          {data.recent_applications?.length > 0 ? (
            data.recent_applications.map((item) => (
              <div
                key={item.application_id}
                className="rounded-2xl border border-white/10 bg-slate-900/50 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="text-slate-400 mt-1">
                      {item.location} • {item.shift_date}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="px-3 py-1 rounded-full text-sm bg-blue-500/15 text-blue-300 border border-blue-400/20">
                      {item.application_status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm bg-white/5 text-slate-300 border border-white/10">
                      Shift: {item.shift_status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400">No recent applications found.</p>
          )}
        </div>
      </div>
    </div>
  );
}