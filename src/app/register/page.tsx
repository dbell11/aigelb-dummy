"use client";

import React from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "@/components/RegisterForm";
import { setCookie } from "cookies-next";

export default function RegisterPage() {
  const router = useRouter();

  const handleRegisterSuccess = (token: string) => {
    console.log("Registrierung erfolgreich");
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
          Registrierung
        </h2>
      </div>

      <RegisterForm onRegisterSuccess={handleRegisterSuccess} />

      <p className="mt-10 text-center text-sm text-gray-500">
        Bereits registriert?{" "}
        <a
          href="/login"
          className="font-semibold leading-6 text-afnb-blue-400 hover:opacity-75"
        >
          Hier anmelden!
        </a>
      </p>
    </div>
  );
}
