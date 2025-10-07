"use client";

import { useState } from "react";

export default function CreateAdminForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create user");
      }

      setSuccess("Admin user creato con successo!");
      setEmail("");
      setPassword("");
      setName("");
      
      setTimeout(() => {
        setSuccess("");
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Errore durante la creazione");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded text-sm">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-black/20 dark:border-white/20 rounded bg-white dark:bg-black/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-black/20 dark:border-white/20 rounded bg-white dark:bg-black/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-3 py-2 border border-black/20 dark:border-white/20 rounded bg-white dark:bg-black/20"
        />
        <p className="text-xs text-black/60 dark:text-white/60 mt-1">
          Minimo 6 caratteri
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn w-full"
      >
        {loading ? "Creazione..." : "Crea Admin User"}
      </button>
    </form>
  );
}

