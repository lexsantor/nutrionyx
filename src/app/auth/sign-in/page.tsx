import { SignInForm } from "./sign-in-form";

export const metadata = {
  title: "Iniciar sesión",
  alternates: { canonical: "/auth/sign-in" },
  description:
    "Entra en tu consulta o en tu espacio de paciente.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; reset?: string }>;
}) {
  const { redirectTo, reset } = await searchParams;
  return <SignInForm redirectTo={redirectTo} resetDone={reset === "1"} />;
}
