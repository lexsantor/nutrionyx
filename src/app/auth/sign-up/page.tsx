import { SignUpForm } from "./sign-up-form";

export const metadata = {
  title: "Crear cuenta",
  alternates: { canonical: "/auth/sign-up" },
  description:
    "Crea tu consulta en Nutrionyx con un código de invitación. Sin tarjeta.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  return <SignUpForm redirectTo={redirectTo} />;
}
