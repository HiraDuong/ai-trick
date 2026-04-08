// Luvina
// Vu Huy Hoang - Dev2
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readString(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const redirectTo = readString(resolvedSearchParams.redirectTo) || "/";

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <LoginForm redirectTo={redirectTo} />
      </div>
    </main>
  );
}