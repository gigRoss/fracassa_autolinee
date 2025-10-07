import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { findAdminByEmail, verifyPassword, createSession, SESSION_COOKIE, verifySession, updateLastAccess } from "@/app/lib/auth";

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const errors: Record<string, string> = {};
  if (!email) errors.email = "Email obbligatoria";
  if (!password) errors.password = "Password obbligatoria";
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const user = await findAdminByEmail(email);
  if (!user || !verifyPassword(password, user)) {
    return { ok: false, errors: { form: "Credenziali non valide" } };
  }

  // Update last access timestamp in database
  await updateLastAccess(email);

  const token = createSession(user.email);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  redirect("/admin/dashboard");
}

export default async function AdminLoginPage() {
  // Redirect away if already authenticated
  const existing = (await cookies()).get(SESSION_COOKIE)?.value;
  if (verifySession(existing)) {
    redirect("/admin/dashboard");
  }
  return (
    <div className="max-w-sm w-full mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Login amministratore</h1>
        <Link 
          href="/" 
          className="text-sm text-black hover:text-black dark:text-black dark:hover:text-black transition-colors"
        >
          ← Torna alla home
        </Link>
      </div>
      {/* @ts-expect-error Server Action passed to form */}
      <form action={loginAction} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            className="w-full h-10 px-3 rounded-md border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/20"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            name="password"
            className="w-full h-10 px-3 rounded-md border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/20"
            required
          />
        </div>
        <button
          type="submit"
          className="h-10 px-3 rounded-md border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/20"
        >
          Accedi
        </button>
      </form>
    </div>
  );
}


