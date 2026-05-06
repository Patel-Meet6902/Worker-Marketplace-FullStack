import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handlelogout = ()=>{
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.18),_transparent_30%)]" />

      <div className="relative z-10">
        <header className="flex items-center justify-between px-6 md:px-10 py-6 border-b border-white/10">
          <div className="text-2xl font-bold tracking-tight">
            Worker<span className="text-blue-400">Market</span>
          </div>

          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 rounded-xl border border-white/15 hover:border-white/30 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 transition font-medium"
                >
                  Get Started
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/redirect-by-role")}
                  className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 transition font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={handlelogout}
                  className="px-4 py-2 rounded-xl border border-red-400/30 text-red-300 hover:bg-red-400/10 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </header>

        <section className="px-6 md:px-10 py-20 md:py-28">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 mb-6">
                Smarter shift hiring for clients and workers
              </div>

              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Hire faster.
                <br />
                <span className="text-blue-400">Work smarter.</span>
              </h1>

              <p className="mt-6 text-slate-300 text-lg leading-8 max-w-xl">
                Clients can post shifts, review applicants, approve workers, and manage staffing.
                Workers can apply to shifts, confirm jobs, and track opportunities in one place.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                {!user ? (
                  <>
                    <button
                      onClick={() => navigate("/register")}
                      className="px-6 py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 transition font-semibold"
                    >
                      Create Account
                    </button>
                    <button
                      onClick={() => navigate("/login")}
                      className="px-6 py-3 rounded-2xl border border-white/15 hover:border-white/30 transition"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/redirect-by-role")}
                    className="px-6 py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 transition font-semibold"
                  >
                    Continue to Dashboard
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl">
                <p className="text-sm text-slate-400 mb-2">For Clients</p>
                <h3 className="text-2xl font-semibold mb-3">Post shifts and manage applicants</h3>
                <p className="text-slate-300 leading-7">
                  Create shifts, review applications, approve the right workers, and manage confirmations.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl">
                <p className="text-sm text-slate-400 mb-2">For Workers</p>
                <h3 className="text-2xl font-semibold mb-3">Discover shifts and confirm faster</h3>
                <p className="text-slate-300 leading-7">
                  Build your profile, apply to shifts, track approvals, and confirm assignments with ease.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 md:px-10 pb-20">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Role-based flow",
                desc: "Separate client and worker journeys with clean redirects and protected routes.",
              },
              {
                title: "Shift lifecycle",
                desc: "From post → apply → approve → confirm → assign → complete.",
              },
              {
                title: "Dashboard insights",
                desc: "View recent shifts, applications, approvals, and confirmations quickly.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
              >
                <h4 className="text-xl font-semibold mb-3">{item.title}</h4>
                <p className="text-slate-300 leading-7">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}



