import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ChatListPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/chat/conversations");
        setConversations(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-slate-400 mt-2">View your conversations with clients and workers.</p>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading conversations...</div>
      ) : conversations.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-400">
          No conversations yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {conversations.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/messages/${item.id}`)}
              className="w-full text-left rounded-3xl border border-white/10 bg-white/5 p-6 hover:border-blue-400/30 transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">{item.other_user_name}</h2>
                  <p className="text-slate-400 mt-1">{item.shift_title}</p>
                </div>

                {item.unread_count > 0 && (
                  <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm border border-red-400/20">
                    {item.unread_count} unread
                  </span>
                )}
              </div>

              <p className="text-slate-300 mt-4">
                {item.last_message || "No messages yet"}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}