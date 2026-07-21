import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  redirect(session ? "/dashboard" : "/login");
}
