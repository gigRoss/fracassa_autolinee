"use client";

import { useState } from "react";
import { formatItalianDate } from "@/app/lib/dateUtils";

type AdminUserListItem = {
  id: string;
  email: string;
  name: string;
  lastAccess: Date | null;
  createdAt: Date | null;
};

export default function AdminUsersList({
  initialUsers,
  onRefresh,
}: {
  initialUsers: AdminUserListItem[];
  onRefresh: () => void;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Sei sicuro di voler eliminare l'admin user: ${email}?`)) {
      return;
    }

    setDeleting(id);

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers(users.filter((u) => u.id !== id));
      onRefresh();
    } catch (err) {
      alert("Errore durante l'eliminazione");
    } finally {
      setDeleting(null);
    }
  }

  function formatDate(date: Date | null): string {
    return formatItalianDate(date, true);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-black/10 dark:border-white/10">
          <tr>
            <th className="text-left p-3 font-medium">Email</th>
            <th className="text-left p-3 font-medium">Nome</th>
            <th className="text-left p-3 font-medium">Ultimo accesso</th>
            <th className="text-left p-3 font-medium">Creato il</th>
            <th className="text-right p-3 font-medium">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <td className="p-3">{user.email}</td>
              <td className="p-3">{user.name}</td>
              <td className="p-3 text-black/70 dark:text-white/70">
                {formatDate(user.lastAccess)}
              </td>
              <td className="p-3 text-black/70 dark:text-white/70">
                {formatDate(user.createdAt)}
              </td>
              <td className="p-3 text-right">
                <button
                  onClick={() => handleDelete(user.id, user.email)}
                  disabled={deleting === user.id}
                  className="text-xs px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-900/40 disabled:opacity-50"
                >
                  {deleting === user.id ? "..." : "Elimina"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="text-center py-8 text-black/50 dark:text-white/50">
          Nessun admin user trovato
        </div>
      )}
    </div>
  );
}

