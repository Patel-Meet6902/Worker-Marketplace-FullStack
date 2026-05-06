import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import LoadingScreen from "../pages/Loading";



export default function RoleRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      if (!user) return;

      if (user.role === "client") {
        try {
          await api.get("/profiles/client/me");
          navigate("/client/dashboard", { replace: true });
        } catch (err) {
          if (err.response?.status === 404) {
            navigate("/create-client-profile", { replace: true });
          }
        }
      }

      if (user.role === "worker") {
        try {
          await api.get("/profiles/worker/me");
          navigate("/worker/dashboard", { replace: true });
        } catch (err) {
          if (err.response?.status === 404) {
            navigate("/create-worker-profile", { replace: true });
          }
        }
      }
    };

    checkProfileAndRedirect();
  }, [user, navigate]);

  return <LoadingScreen />;
}