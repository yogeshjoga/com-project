import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import logo from "../../../../../public/brand/egire-logo.png";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Shop dashboard sign in", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper px-4 py-12">
      <div className="w-full max-w-sm">
        <Image src={logo} alt="EgireRobotics" priority className="mx-auto h-auto w-48" />
        <div className="mt-8 rounded-lg bg-white p-6 ring-1 ring-line">
          <h1 className="font-display text-[28px] font-semibold leading-none">Shop dashboard</h1>
          <p className="mt-2 text-sm text-muted">Sign in with your CRM account. Only admins and super admins can open the shop dashboard.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
