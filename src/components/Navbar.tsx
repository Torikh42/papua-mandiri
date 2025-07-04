// components/Navbar.tsx
"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import LogOutButton from "./LogOutButton";

const navItemsNotLoggedIn = [
  { href: "/", label: "Home" },
  { href: "/materi", label: "Materi" },
  { href: "/kategori-materi", label: "Kategori" },
  { href: "/faq", label: "FAQ" },
];

const navItemsLoggedIn = [
  { href: "/", label: "Home" },
  { href: "/materi", label: "Materi" },
  { href: "/kategori-materi", label: "Kategori" },
  { href: "/paman-ai", label: "Paman AI" },
  { href: "/faq", label: "FAQ" },
];

export type UserRole = "user" | "admin_komunitas" | "admin_pemerintah" | "super_admin";

type User = {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole | "unknown";
} | null;

export default function Navbar({ user }: { user: User }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  let dashboardHref = "/dashboard";
  if (user?.role === "admin_komunitas") {
    dashboardHref = "/dashboard-admin-komunitas";
  } else if (user?.role === "admin_pemerintah") {
    dashboardHref = "/dashboard-admin-pemerintah";
  } else if (user?.role === "super_admin") {
    dashboardHref = "/dashboard-superadmin";
  } else if (user?.role === "user") {
    dashboardHref = "/dashboard-user";
  }

  const firstName = user?.name ? user.name.split(" ")[0] : null;

  const currentNavItems = user ? navItemsLoggedIn : navItemsNotLoggedIn;

  return (
    <header
  className="text-white py-1 px-2 sm:px-3"
  style={{
    background: "var(--Gradasi-Hijau-Biru, linear-gradient(90deg, #6EA57C 0%, #8FC2D1 100%))",
  }}
>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          className="flex flex-shrink-0 items-center gap-2 sm:gap-3"
          href="/"
        >
          <Image
            src="/PAMAN.png"
            height={40}
            width={50}
            alt="Paman Logo"
            priority
            className="sm:h-[50px] sm:w-[50px]"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-sm leading-tight font-bold text-white sm:text-lg lg:text-xl">
              Paman
            </h1>
            <span className="hidden text-xs text-white sm:block">
              Papua Mandiri
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {currentNavItems.map((item) => (
            <Button
              asChild
              key={item.href}
              variant="link"
              className={`text-white hover:text-blue-200 text-base font-semibold ${
                isActive(item.href) ? "underline" : ""
              }`}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="hidden flex-shrink-0 items-center gap-2 md:flex">
          {user ? (
            <>
              {firstName && (
                <span className="text-sm font-semibold text-white">
                  Hey, {firstName}!
                </span>
              )}
              {/* --- PERBAIKAN DI SINI --- */}
              {/* Menampilkan tombol Dashboard untuk SEMUA role yang valid (termasuk 'user') */}
              {user.role && user.role !== "unknown" && (
                <Button asChild variant="secondary" className="bg-white text-blue-500 hover:bg-gray-100">
                  <Link href={dashboardHref}>Dashboard</Link>
                </Button>
              )}
              <LogOutButton />
            </>
          ) : (
            <>
              <Button asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-500">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-white text-blue-500 hover:bg-gray-100">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex-shrink-0 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 text-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="text-white py-1 px-2 sm:px-3"
          style={{
            background: "var(--Gradasi-Hijau-Biru, linear-gradient(90deg, #6EA57C 0%, #8FC2D1 100%))",
          }}
        >
          <nav className="flex flex-col gap-1 px-4 py-3">
            {currentNavItems.map((item) => (
              <Button
                asChild
                key={item.href}
                variant="ghost"
                className={`w-full justify-start transition-all duration-200 text-white hover:bg-white hover:text-blue-500 ${
                  isActive(item.href) ? "bg-white/20" : ""
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            <div className="flex flex-col gap-2 border-t border-gray-200 pt-2">
              {user ? (
                <>
                  {/* --- PERBAIKAN DI SINI (VERSI MOBILE) --- */}
                  {user.role && user.role !== "unknown" && (
                    <Button
                      asChild
                      variant="ghost"
                      className={`w-full justify-start transition-all duration-200 text-white hover:bg-white hover:text-blue-500 ${
                        isActive(dashboardHref) ? "bg-white/20" : ""
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Link href={dashboardHref}>Dashboard</Link>
                    </Button>
                  )}
                  <div onClick={() => setMobileOpen(false)}>
                    <LogOutButton/>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full bg-white text-blue-500 hover:bg-gray-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full bg-white text-blue-500 hover:bg-gray-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}