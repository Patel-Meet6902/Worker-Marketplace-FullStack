import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const currentUser = await login(email, password);

      if (!currentUser) {
        setError("Login failed");
        return;
      }

      if (currentUser.role === "client") {
        try {
          await api.get("/profiles/client/me");
          navigate("/client/dashboard");
        } catch (err) {
          if (err.response?.status === 404) {
            navigate("/create-client-profile");
          } else {
            setError("Unable to load client profile");
          }
        }
      }

      if (currentUser.role === "worker") {
        try {
          await api.get("/profiles/worker/me");
          navigate("/worker/dashboard");
        } catch (err) {
          if (err.response?.status === 404) {
            navigate("/create-worker-profile");
          } else {
            setError("Unable to load worker profile");
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_30%)]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl">
        <div className="mb-8">
          <p className="text-blue-400 font-medium mb-2">Welcome back</p>
          <h1 className="text-3xl font-bold text-white">Sign in to your account</h1>
          <p className="text-slate-400 mt-2">Access your dashboard, shifts, and profile.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 text-white px-4 py-3 outline-none focus:border-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 text-white px-4 py-3 outline-none focus:border-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white py-3 font-semibold transition"
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}