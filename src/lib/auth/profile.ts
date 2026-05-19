import type { SupabaseClient, User } from "@supabase/supabase-js";

import { getRoleFromUser, isUserRole, type UserRole } from "@/lib/auth/constants";

export async function resolveRoleForUser(
  supabase: SupabaseClient,
  user: User,
): Promise<UserRole | null> {
  const profileResult = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (isUserRole(profileResult.data?.role)) {
    return profileResult.data.role;
  }

  const jwtRole = getRoleFromUser(user);
  if (jwtRole) return jwtRole;

  const usersResult = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return isUserRole(usersResult.data?.role) ? usersResult.data.role : null;
}

export async function upsertProfileFromUser(
  supabase: SupabaseClient,
  user: User,
  preferredRole?: UserRole | null,
): Promise<UserRole | null> {
  const resolvedRole = (await resolveRoleForUser(supabase, user)) ?? preferredRole ?? null;
  if (!resolvedRole) return null;

  const userMeta = user.user_metadata as Record<string, unknown> | undefined;
  const fullName =
    typeof userMeta?.full_name === "string" && userMeta.full_name.trim().length > 0
      ? userMeta.full_name.trim()
      : null;

  const upsertResult = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? "",
      full_name: fullName,
      avatar_url: userMeta?.avatar_url ?? null,
      role: resolvedRole,
    },
    { onConflict: "id" },
  );

  if (upsertResult.error) return resolvedRole;

  await supabase
    .from("users")
    .upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name: fullName ?? user.email ?? "GrowSmall User",
        avatar_url: userMeta?.avatar_url ?? null,
        role: resolvedRole,
      },
      { onConflict: "id" },
    );

  return resolvedRole;
}
