"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="select-journey">
      {/* Header bar with back button */}
      <div className="header-bar">
        <button className="back-button" onClick={handleBack} aria-label="Indietro">
          <svg 
            width="18" 
            height="16" 
            viewBox="0 0 23 18" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M9.93086 17.1115C9.63081 17.4115 9.22392 17.58 8.79966 17.58C8.3754 17.58 7.9685 17.4115 7.66846 17.1115L0.468459 9.91154C0.168505 9.61149 7.322e-07 9.2046 7.69291e-07 8.78034C8.06381e-07 8.35608 0.168506 7.94918 0.468459 7.64914L7.66846 0.449139C7.97022 0.157687 8.37439 -0.00358318 8.7939 6.18039e-05C9.21342 0.00370678 9.61472 0.171977 9.91137 0.468631C10.208 0.765284 10.3763 1.16658 10.3799 1.5861C10.3836 2.00561 10.2223 2.40978 9.93086 2.71154L5.59966 7.18034L20.7997 7.18034C21.224 7.18034 21.631 7.34891 21.931 7.64897C22.2311 7.94903 22.3997 8.35599 22.3997 8.78034C22.3997 9.20469 22.2311 9.61165 21.931 9.91171C21.631 10.2118 21.224 10.3803 20.7997 10.3803L5.59966 10.3803L9.93086 14.8491C10.2308 15.1492 10.3993 15.5561 10.3993 15.9803C10.3993 16.4046 10.2308 16.8115 9.93086 17.1115Z" 
              fill="#FFFFFF"
            />
          </svg>
        </button>
        <div className="header-title">UTENTI</div>
        <div className="header-spacer" />
      </div>

      {/* Content area */}
      <div className="content-area">
        {loading ? (
          <div className="loading-message">Caricamento...</div>
        ) : (
          <>
            {/* Form creazione */}
            <div className="card">
              <div className="card-header">Crea nuovo admin user</div>
              <div className="card-content">
                <CreateAdminForm onSuccess={() => fetchUsers()} />
              </div>
            </div>

            {/* Lista admin users */}
            <div className="card">
              <div className="card-header">Admin users esistenti ({users.length})</div>
              <AdminUsersList
                initialUsers={users}
                onRefresh={() => fetchUsers()}
              />
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .select-journey,
        .select-journey * {
          box-sizing: border-box;
        }

        .select-journey {
          background: #ffffff;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          width: 100%;
          max-width: 393px;
          margin: 0 auto;
        }

        .header-bar {
          width: 100%;
          height: 91px;
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          top: 0;
          max-width: 393px;
          background: linear-gradient(135deg, rgba(255,169,37,1) 0%, rgba(250,159,19,1) 57%, rgba(244,148,1,1) 75%);
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
          border-bottom-right-radius: 20px;
          border-bottom-left-radius: 20px;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 21px;
        }

        .back-button {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 8px;
          border: none;
          background: transparent;
        }

        .back-button:hover {
          opacity: 0.8;
        }

        .back-button:active {
          transform: scale(0.95);
        }

        .header-title {
          color: #ffffff;
          font-size: 20px;
          font-family: Inter, sans-serif;
          font-weight: 400;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .header-spacer {
          width: 34px;
        }

        .content-area {
          padding-top: 111px;
          padding-left: 20px;
          padding-right: 20px;
          padding-bottom: 30px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .card {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.17);
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .card-header {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #000000;
        }

        .card-content {
          padding: 16px;
        }

        .loading-message {
          text-align: center;
          font-family: "Inter-Medium", sans-serif;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.6);
          padding: 40px 20px;
        }
      `}</style>
    </div>
  );
}

