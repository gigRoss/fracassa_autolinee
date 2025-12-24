import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE, createAdminUser, listAdminUsers, deleteAdminUser } from "@/app/lib/auth";

/**
 * GET /api/admin/users - Lista tutti gli admin users
 */
export async function GET(req: NextRequest) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = verifySession(token);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const users = await listAdminUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

/**
 * POST /api/admin/users - Crea nuovo admin user
 */
export async function POST(req: NextRequest) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = verifySession(token);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const { email, password, name, isAdmin } = body;
    
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password and name are required" },
        { status: 400 }
      );
    }
    
    const newUser = await createAdminUser(email, password, name, isAdmin ?? true);
    
    // Non restituire la password hash
    const { passwordHash, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users?id=xxx - Elimina admin user
 */
export async function DELETE(req: NextRequest) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = verifySession(token);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const id = req.nextUrl.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    
    await deleteAdminUser(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting admin user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

