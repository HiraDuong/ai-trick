import { RegisterForm } from "@/components/auth/register-form";
import { redirectAuthenticatedUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

interface RegisterPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readString(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const resolvedSearchParams = await searchParams;
  const redirectTo = readString(resolvedSearchParams.redirectTo) || "/";
  await redirectAuthenticatedUser(redirectTo);

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <RegisterForm redirectTo={redirectTo} />
      </div>
    </main>
  );
}
