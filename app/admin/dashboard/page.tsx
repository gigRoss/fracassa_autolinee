import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, SESSION_COOKIE } from "@/app/lib/auth";
import { logoutAction } from "@/app/lib/authActions";
import Link from "next/link";
import Image from "next/image";

export default async function AdminDashboardPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = verifySession(token);
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="amministrazione-page">
      {/* Bottom vector line */}
      <Image
        className="vector-3"
        src="/mobile/search/vector-30.svg"
        alt=""
        width={90}
        height={1}
      />

      {/* Menu cards */}
      <div className="frame-157">
        <div className="frame-64">
          <Link href="/admin/driver/rides" className="frame-49">
            <div className="corse">Corse</div>
          </Link>
        </div>

        <div className="frame-62">
          <div className="frame-492">
            <div className="documenti">Documenti</div>
          </div>
        </div>

        <div className="frame-45">
          <Link href="/admin/users" className="frame-493">
            <div className="gestione">Gestione</div>
          </Link>
        </div>

        <div className="frame-63">
          <div className="frame-493">
            <div className="contabilit">Contabilità</div>
          </div>
        </div>
      </div>

      {/* Crea nuova corsa */}
      <div className="frame-494">
        <div className="crea-nuova-corsa">Crea nuova corsa</div>
      </div>

      {/* Orange header */}
      <header className="frame-256">
        <div className="frame-161">
          <Link href="/search" className="frame-back" aria-label="Torna alla pagina principale">
            <div className="back-arrow-wrapper">
              <Image
                className="back-arrow"
                src="/mobile/search/frame-410.svg"
                alt=""
                width={18}
                height={16}
              />
            </div>
          </Link>
          <div className="acquista">ADMIN</div>
          <form action={logoutAction}>
            <button type="submit" aria-label="Logout" className="close-button">
              <Image
                className="close-icon"
                src="/mobile/search/frame-580.svg"
                alt=""
                width={16}
                height={16}
              />
            </button>
          </form>
        </div>
      </header>
    </div>
  );
}
