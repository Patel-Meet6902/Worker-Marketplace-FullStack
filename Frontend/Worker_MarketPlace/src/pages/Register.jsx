import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    role: "worker",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await api.post("/auth/register", formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.18),_transparent_30%)]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl">
        <div className="mb-8">
          <p className="text-blue-400 font-medium mb-2">Get started</p>
          <h1 className="text-3xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 mt-2">Join as a worker or a client and start using the platform.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 text-white px-4 py-3 outline-none focus:border-blue-400"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 text-white px-4 py-3 outline-none focus:border-blue-400"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 text-white px-4 py-3 outline-none focus:border-blue-400"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Join as</label>
            <select
              name="role"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 text-white px-4 py-3 outline-none focus:border-blue-400"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="worker">Worker</option>
              <option value="client">Client</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white py-3 font-semibold transition"
          >
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}