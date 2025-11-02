"use client";

import { useState } from "react";
import Toast from "@/app/components/admin/Toast";

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
    <>
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError("")}
          duration={6000}
        />
      )}
      {success && (
        <Toast
          message={success}
          type="success"
          onClose={() => setSuccess("")}
          duration={3000}
        />
      )}
      <form onSubmit={handleSubmit} className="space-y-4">

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
    </>
  );
}

