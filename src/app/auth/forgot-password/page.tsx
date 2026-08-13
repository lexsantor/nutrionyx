import { ForgotPasswordForm } from "./forgot-form";

export const metadata = {
  title: "Recuperar contraseña",
  alternates: { canonical: "/auth/forgot-password" },
  description:
    "Recupera el acceso a tu cuenta de Nutrionyx.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
