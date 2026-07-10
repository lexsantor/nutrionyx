import { getTranslations } from "next-intl/server";
import { signOut } from "@/lib/auth/sign-out";

/**
 * Server-rendered sign-out control. Uses a form bound to the signOut server
 * action so it works without client JavaScript.
 */
export async function LogoutButton() {
  const t = await getTranslations("common");
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-sm text-ink-subtle underline underline-offset-2 hover:text-ink"
      >
        {t("signOut")}
      </button>
    </form>
  );
}
