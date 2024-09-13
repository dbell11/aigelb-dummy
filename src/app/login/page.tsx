"use client";

import React from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { setCookie } from "cookies-next";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = (token: string) => {
    setCookie("token", token, {
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    router.push("/chat");
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8 items-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 text-gray-800 xl:text-4xl tracking-wide">
          Anmeldung
        </h2>
      </div>

      <LoginForm onLoginSuccess={handleLoginSuccess} />

      <p className="mt-10 text-center text-sm text-gray-500">
        Noch nicht registriert?{" "}
        <a
          href="/register"
          className="font-semibold leading-6 text-afnb-blue-400 hover:opacity-75"
        >
          Hier anmelden!
        </a>
      </p>
    </div>
  );
}
