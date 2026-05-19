import { redirect } from "next/navigation";

export default function LegacyRoleRedirectPage() {
  redirect("/auth/select-role");
}
