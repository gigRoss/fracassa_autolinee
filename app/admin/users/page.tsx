"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CreateAdminForm from "./CreateAdminForm";
import AdminUsersList from "./AdminUsersList";

type AdminUserListItem = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean | null;
  lastAccess: Date | null;
  createdAt: Date | null;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl w-full mx-auto p-6">
        <div className="text-center py-12 text-black/50 dark:text-white/50">
          Caricamento...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl w-full mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Gestione Admin Users</h1>
          <p className="text-sm text-black/70 dark:text-white/70">
            Crea ed elimina utenti amministratori
          </p>
        </div>
        <Link href="/admin/dashboard" className="text-sm hover:underline">
          ← Torna alla dashboard
        </Link>
      </div>

      {/* Form creazione */}
      <div className="card">
        <div className="p-4 border-b border-black/10 dark:border-white/10 font-medium">
          Crea nuovo admin user
        </div>
        <div className="p-4">
          <CreateAdminForm onSuccess={() => fetchUsers()} />
        </div>
      </div>

      {/* Lista admin users */}
      <div className="card">
        <div className="p-4 border-b border-black/10 dark:border-white/10 font-medium">
          Admin users esistenti ({users.length})
        </div>
        <AdminUsersList
          initialUsers={users}
          onRefresh={() => fetchUsers()}
        />
      </div>
    </div>
  );
}

