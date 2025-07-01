import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Panggil fungsi updateSession untuk menangani refresh session Supabase dan redirect
  return await updateSession(request);
}

// Konfigurasi matcher untuk middleware
// Ini memastikan middleware berjalan untuk semua rute kecuali yang tercantum
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes, jika Anda punya API routes yang tidak perlu otentikasi middleware)
     * - .*(?:svg|png|jpg|jpeg|gif|webp)$ (file media)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

// Fungsi utama untuk memperbarui sesi dan menangani logika autentikasi
export async function updateSession(request: NextRequest) {
  // Inisialisasi NextResponse untuk respons default
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Buat Supabase client di middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // Menggunakan setAll untuk menulis cookie ke respons NextResponse
        setAll(cookiesToSet) {
          // Pertama, set cookie ke request.cookies (untuk dibaca oleh server action/component selanjutnya di request yang sama)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          // Kemudian, perbarui supabaseResponse untuk menulis cookie ke header respons yang dikirim ke browser
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Dapatkan user dari sesi Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Tentukan apakah rute saat ini adalah rute autentikasi (login/sign-up)
  const isAuthRoute =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/sign-up";

  // LOGIKA REDIRECT:

  // Skenario 1: User sudah login (ada 'user')
  if (user) {
    // Jika user sudah login dan mencoba mengakses rute autentikasi, redirect ke halaman utama.
    // Ini mencegah user yang sudah login untuk melihat/mengakses halaman login/sign-up lagi.
    if (isAuthRoute) {
      return NextResponse.redirect(
        new URL("/", request.url) // Gunakan request.url untuk base URL yang dinamis
      );
    }
    // Jika user sudah login dan akses rute non-auth, biarkan dia lewat (lanjutkan ke response default)
  }
  // Skenario 2: User belum login (tidak ada 'user')
  else {
    // Jika user belum login dan mencoba mengakses rute yang BUKAN rute autentikasi, redirect ke halaman login.
    // Ini melindungi rute aplikasi yang membutuhkan otentikasi.
    if (!isAuthRoute) {
      // Pastikan SITE_URL diatur di .env
      return NextResponse.redirect(
        new URL("/login", request.url) // Gunakan request.url untuk base URL yang dinamis
      );
    }
    // Jika user belum login dan mencoba mengakses rute autentikasi (login/sign-up), biarkan dia lewat (lanjutkan ke response default)
  }

  // Jika tidak ada redirect yang terjadi, kembalikan respons Supabase (dengan cookie yang sudah diperbarui)
  return supabaseResponse;
}
