"use client";

import { useState } from "react";
import Toast from "@/app/components/admin/Toast";

export default function CreateAdminForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isDriver, setIsDriver] = useState(false);
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
        body: JSON.stringify({ email, password, name, isAdmin: !isDriver }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create user");
      }

      setSuccess(isDriver ? "Utente autista creato con successo!" : "Admin user creato con successo!");
      setEmail("");
      setPassword("");
      setName("");
      setIsDriver(false);
      
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

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isDriver}
            onChange={(e) => setIsDriver(e.target.checked)}
            className="w-4 h-4 rounded border-black/20 dark:border-white/20"
          />
          <span className="text-sm font-medium">Autista</span>
        </label>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>Se si crea un utente autista selezionare questo campo</span>
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

