import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "nutrilife-super-secret-jwt-key-32chars!";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export interface TokenPayload {
  userId: string;
  nik: string;
  name: string;
  role: "SUPER_USER" | "GM" | "HR" | "FINANCE" | "EMPLOYEE";
  division: string;
  jobPosition: string;
}

/**
 * Buat JWT token untuk session user.
 */
export async function signJwt(payload: TokenPayload, expiresIn = "7d"): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

/**
 * Verifikasi token JWT dan ekstrak data payload.
 */
export async function verifyJwt(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Hash password menggunakan Web Crypto API (Edge-compatible).
 */
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = "nutrilife-salt-2026";
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password + salt),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const key = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 10000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  return Array.from(new Uint8Array(key))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Validasi kecocokan password.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

/**
 * Middleware helper untuk validasi otorisasi RBAC dari Request.
 */
export async function authenticateRequest(
  request: Request,
  allowedRoles?: Array<TokenPayload["role"]>
): Promise<{ user: TokenPayload | null; errorResponse?: Response }> {
  let token: string | null = null;

  // 1. Cek Header Authorization: Bearer <token> (dari mobile Flutter)
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // 2. Cek Cookie jika request berasal dari Web Browser
  if (!token) {
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(/nutrilife_session=([^;]+)/);
      if (match) token = match[1];
    }
  }

  if (!token) {
    return {
      user: null,
      errorResponse: new Response(
        JSON.stringify({ error: "Unauthorized: Token tidak ditemukan" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      ),
    };
  }

  const user = await verifyJwt(token);
  if (!user) {
    return {
      user: null,
      errorResponse: new Response(
        JSON.stringify({ error: "Unauthorized: Token tidak valid atau kedaluwarsa" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      ),
    };
  }

  // Validasi peran (RBAC)
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      user,
      errorResponse: new Response(
        JSON.stringify({
          error: `Forbidden: Role '${user.role}' tidak memiliki izin mengakses endpoint ini.`,
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      ),
    };
  }

  return { user };
}
