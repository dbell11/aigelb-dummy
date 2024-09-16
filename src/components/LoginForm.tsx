import React, { useState, useEffect } from "react";
import { Mail, Lock, LogIn } from "lucide-react";
import { loginUser } from "@/api";

interface LoginFormProps {
  onLoginSuccess: (token: string) => void;
}

interface ValidationErrors {
  email: string;
  password: string;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({
    email: "",
    password: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 820);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors: ValidationErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "E-Mail-Adresse ist erforderlich";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Ungültige E-Mail-Adresse";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Passwort ist erforderlich";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (validateForm()) {
      setIsLoading(true);
      try {
        const data = await loginUser(email, password);
        onLoginSuccess(data.token);
      } catch (err) {
        setSubmitError("Ungültige E-Mail-Adresse oder Passwort");
        setShake(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      setShake(true);
    }
  };

  return (
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
      <div
        className={`bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12 ${
          shake ? "animate-shake" : ""
        }`}
      >
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900/90"
            >
              E-Mail-Adresse
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className={`block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset transition-all ${
                    errors.email ? "ring-red-300" : "ring-gray-300"
                  } placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-afnb-blue-400 sm:text-sm sm:leading-6`}
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>

              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium leading-6 text-gray-900/90"
            >
              Passwort
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  className={`block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset transition-all ${
                    errors.password ? "ring-red-300" : "ring-gray-300"
                  } placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-afnb-blue-400 sm:text-sm sm:leading-6`}
                  disabled={isLoading}
                />
              </div>

              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          {submitError && (
            <div className="text-red-600 text-sm mt-2">{submitError}</div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              className={`flex w-full justify-center items-center rounded-md bg-purple-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-afnb-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-afnb-blue-400 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Anmeldung läuft...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" aria-hidden="true" />
                  Anmelden
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
