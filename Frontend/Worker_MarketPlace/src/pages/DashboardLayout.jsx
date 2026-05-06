import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./notification";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const clientLinks = [
    { to: "/client/dashboard", label: "Dashboard" },
    { to: "/client/shifts", label: "My Shifts" },
    { to: "/client/shifts/create", label: "Create Shift" },
    { to: "/messages", label: "Messages" },

  ];

  const workerLinks = [
    { to: "/worker/dashboard", label: "Dashboard" },
    { to: "/shifts", label: "Browse Shifts" },
    { to: "/worker/applications", label: "My Applications" },
    { to: "/messages", label: "Messages" },
  ];

  const links = user?.role === "client" ? clientLinks : workerLinks;

  return (
    <div className="h-screen bg-slate-950 text-white flex overflow-hidden">
      <aside className="w-64 border-r border-white/10 p-6 hidden md:flex md:flex-col h-screen sticky top-0 shrink-0">
        <div className="text-2xl font-bold mb-8">
          Worker<span className="text-blue-400">Market</span>
        </div>

        <nav className="space-y-3">
          {links.map((item) => {
            const active = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`block rounded-xl px-3 py-2 transition ${
                  active
                    ? "bg-blue-500 text-white"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>


        <button onClick={()=>{navigate("/profile")}} className="mt-auto px-4 py-2 rounded-xl border border-green-400/30 text-green-300 hover:bg-green-400/10">
          profile
        </button>

        <button
          onClick={handleLogout}
          className="mt-auto px-4 py-2 rounded-xl border border-red-400/30 text-red-300 hover:bg-red-400/10"
        >
          Logout
        </button>
      </aside>

      <div className="flex-1 h-screen overflow-y-auto">
        <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-slate-950 z-10">
          <h1 className="text-xl font-semibold">
            {user?.role === "client" ? "Client Panel" : "Worker Panel"}
          </h1>

          <div className="flex items-center gap-3">
            <NotificationBell />

            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/30 transition"
            >
              Home
            </button>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}