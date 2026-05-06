import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ShiftListPage() {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth();
 
  const [filters, setFilters] = useState({
    location: "",
    shift_status: "",
    shift_date: "",
    min_pay: "",
    max_pay: "",
    sort_by: "created_at",
    sort_order: "desc",
  });

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const params = {};

      if (filters.location) params.location = filters.location;
      if (filters.shift_status) params.status = filters.shift_status;
      if (filters.shift_date) params.shift_date = filters.shift_date;
      if (filters.min_pay) params.min_pay = filters.min_pay;
      if (filters.max_pay) params.max_pay = filters.max_pay;
      params.sort_by = filters.sort_by;
      params.sort_order = filters.sort_order;

      const res = await api.get("/shifts", { params });
      let filteredshifts = res.data;

      filteredshifts = filteredshifts.filter((item)=>
        item.status!="completed" && item.stauts != "cancelled"
      );

      console.log(filteredshifts)

      if (user?.role === "worker") {
        const myAppsRes = await api.get("/applications/my");
        const appliedShiftIds = new Set(myAppsRes.data.map((app) => app.shift_id));
        console.log(appliedShiftIds);

        filteredshifts = filteredshifts.filter(
          (item) => !appliedShiftIds.has(item.id)
        );
      }

      console.log(filteredshifts)


      setShifts(filteredshifts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchShifts();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-bold mb-2">Browse Shifts</h1>
        <p className="text-slate-400">Find shifts that match your schedule and location.</p>
      </div>

      <form onSubmit={handleSearch} className="rounded-3xl border border-white/10 bg-white/5 p-4 grid md:grid-cols-3 xl:grid-cols-4 gap-3">
        <input
          type="text"
          name="location"
          placeholder="Location"
          className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm"
          value={filters.location}
          onChange={handleChange}
        />

        <select
          name="shift_status"
          className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
          value={filters.shift_status}
          onChange={handleChange}
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="pending_confirmation">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="date"
          name="shift_date"
          className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
          value={filters.shift_date}
          onChange={handleChange}
        />

        <input
          type="number"
          name="min_pay"
          placeholder="Min Pay"
          className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
          value={filters.min_pay}
          onChange={handleChange}
        />

        <input
          type="number"
          name="max_pay"
          placeholder="Max Pay"
          className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
          value={filters.max_pay}
          onChange={handleChange}
        />

        <select
          name="sort_by"
          className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
          value={filters.sort_by}
          onChange={handleChange}
        >
          <option value="created_at">Newest</option>
          <option value="shift_date">Shift Date</option>
          <option value="pay_rate">Pay Rate</option>
        </select>

        <select
          name="sort_order"
          className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
          value={filters.sort_order}
          onChange={handleChange}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>

        <button className="rounded-xl bg-blue-500 hover:bg-blue-400 px-4 py-2 text-sm font-semibold">
          Apply Filters
        </button>
      </form>

      {loading ? (
        <div className="text-slate-400">Loading shifts...</div>
      ) : shifts.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-400">
          No shifts found.
        </div>
      ) : (
        <div className="grid gap-4">
          {shifts.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:border-blue-400/30 transition cursor-pointer"
              onClick={() => navigate(`/shifts/${item.id}`)}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">{item.title}</h2>
                  <p className="text-slate-400 mt-1">{item.location}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/20 text-sm">
                  {item.status}
                </span>
              </div>

              <p className="text-slate-300 mt-4 line-clamp-2">{item.description}</p>

              <div className="grid md:grid-cols-4 gap-3 mt-5 text-sm text-slate-300">
                <p>Date: {item.shift_date}</p>
                <p>Time: {item.start_time} - {item.end_time}</p>
                <p>Pay: ${item.pay_rate}</p>
                <p>Workers Needed: {item.workers_needed}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}