import { LoginForm } from "@/app/login/LoginForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/dashboard");

  return (
    <main className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm opacity-80">Use your username and password.</p>
      </div>
      <LoginForm />
    </main>
  );
}
