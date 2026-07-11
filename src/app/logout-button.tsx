import { getTranslations } from "next-intl/server";
import { signOut } from "@/lib/auth/sign-out";

/**
 * Outlined sign-out control. A form bound to the signOut server action, so it
 * works without client JavaScript.
 */
export async function LogoutButton() {
  const t = await getTranslations("common");
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="inline-flex h-9 items-center rounded-full border border-hairline bg-surface-1 px-4 text-sm font-medium text-ink transition-colors hover:border-hairline-strong"
      >
        {t("signOut")}
      </button>
    </form>
  );
}
