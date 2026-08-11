import { SignInForm } from "./sign-in-form";

export const metadata = { title: "Iniciar sesión" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; reset?: string }>;
}) {
  const { redirectTo, reset } = await searchParams;
  return <SignInForm redirectTo={redirectTo} resetDone={reset === "1"} />;
}
