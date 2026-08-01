import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Claude's chat sandbox provides window.storage natively. Outside of Claude
// (i.e. once this is deployed for real), that API doesn't exist — this
// fallback keeps the app from breaking by using the browser's localStorage
// instead. IMPORTANT CAVEAT: localStorage is per-device, not shared between
// people the way Claude's storage was. That means the Employee Directory and
// Safety Checks modules (which still use window.storage) will NOT sync
// between different people's phones until they're migrated to Supabase too,
// the same way Inventory already has been. Each person's browser will have
// its own separate copy of that data.
if (typeof window !== "undefined" && !window.storage) {
  const prefix = "ab-portal:";
  window.storage = {
    async get(key) {
      const raw = localStorage.getItem(prefix + key);
      return raw ? { key, value: raw, shared: true } : null;
    },
    async set(key, value) {
      localStorage.setItem(prefix + key, value);
      return { key, value, shared: true };
    },
    async delete(key) {
      localStorage.removeItem(prefix + key);
      return { key, deleted: true, shared: true };
    },
    async list(p) {
      const all = Object.keys(localStorage)
        .filter((k) => k.startsWith(prefix + (p || "")))
        .map((k) => k.slice(prefix.length));
      return { keys: all, shared: true };
    },
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
