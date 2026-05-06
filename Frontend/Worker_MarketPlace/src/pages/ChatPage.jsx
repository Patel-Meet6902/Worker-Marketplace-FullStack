import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function ChatPage() {
  const { conversationId } = useParams();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const fetchConversation = async () => {
    try {
      const [conversationRes, messagesRes] = await Promise.all([
        api.get(`/chat/conversations/${conversationId}`),
        api.get(`/chat/conversations/${conversationId}/messages`),
      ]);

      setConversation(conversationRes.data);
      setMessages(messagesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversation();
  }, [conversationId]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://127.0.0.1:8000/chat/ws/chat/${conversationId}?token=${token}`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setSocketConnected(true);
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);

      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });
    };

    socket.onclose = () => {
      setSocketConnected(false);
      console.log("WebSocket disconnected");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error", error);
    };

    return () => {
      socket.close();
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          content,
        })
      );
      setContent("");
    }
  };

  if (loading) return <div className="text-slate-400">Loading chat...</div>;
  if (!conversation) return <div className="text-red-400">Conversation not found.</div>;

  return (
    <div className="h-[75vh] flex flex-col rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{conversation.other_user_name}</h1>
          <p className="text-slate-400 text-sm mt-1">{conversation.shift_title}</p>
        </div>

        <span
          className={`text-sm px-3 py-1 rounded-full border ${
            socketConnected
              ? "border-green-400/20 text-green-300 bg-green-400/10"
              : "border-red-400/20 text-red-300 bg-red-400/10"
          }`}
        >
          {socketConnected ? "Live" : "Offline"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-slate-400">No messages yet. Start the conversation.</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-2xl bg-slate-900/60 px-4 py-3"
            >
              <p className="text-sm text-blue-400 mb-1">{msg.sender_name}</p>
              <p className="text-white">{msg.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-white/10 p-4 flex gap-3">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 outline-none"
        />

        <button
          type="submit"
          disabled={!socketConnected}
          className="rounded-2xl bg-blue-500 hover:bg-blue-400 disabled:opacity-50 px-6 py-3 font-semibold"
        >
          Send
        </button>
      </form>
    </div>
  );
}