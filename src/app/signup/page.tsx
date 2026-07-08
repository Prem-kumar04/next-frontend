"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const names = fullName.trim().split(" ");
    const firstName = names[0] || "";
    const lastName = names.slice(1).join(" ") || "User";

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: email.split("@")[0],
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password,
          }),
        }
      );

      if (response.ok) {
        alert("Account created successfully!");
        router.push("/login");
      } else {
        const data = await response.json();
        alert(data.detail || "Signup failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-3xl font-bold">
          Loading...
        </h1>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSignup();
      }}
      className="flex min-h-screen items-center justify-center bg-slate-100"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-9 shadow-2xl">
        <h1 className="text-center text-5xl font-bold text-slate-900">
          Create Account
        </h1>

        <p className="mt-3 text-center text-slate-500">
          Sign up to continue
        </p>

        <div className="mt-8">
          <label className="mb-2 block font-medium text-slate-700">
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none focus:border-blue-500"
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block font-medium text-slate-700">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none focus:border-blue-500"
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block font-medium text-slate-700">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none focus:border-blue-500"
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block font-medium text-slate-700">
            Confirm Password
          </label>

          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          className="mt-8 w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
        >
          Create Account
        </button>

        <p className="mt-6 text-center text-slate-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </form>
  );
}

