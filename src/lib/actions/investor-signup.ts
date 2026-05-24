"use server";

import { createAdminServiceClient } from "@/lib/supabase/admin-server";
import {
  INVESTOR_KYC_BUCKET,
  storageObjectPath,
  validateKycFile,
} from "@/lib/auth/investor-status";

export type RegisterInvestorResult =
  | { ok: true; userId: string }
  | { ok: false; error: string };

async function uploadKycFile(
  admin: ReturnType<typeof createAdminServiceClient>,
  userId: string,
  kind: "kyc" | "income",
  file: File,
): Promise<{ path: string } | { error: string }> {
  const validation = validateKycFile(file);
  if (validation) return { error: validation };

  const path = storageObjectPath(userId, kind, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage.from(INVESTOR_KYC_BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return { error: error.message };
  return { path };
}

/** Creates investor auth user, uploads KYC docs, and sets profile to pending_approval. */
export async function registerInvestorWithKyc(formData: FormData): Promise<RegisterInvestorResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const investmentInterest = String(formData.get("investment_interest") ?? "").trim();
  const budgetRange = String(formData.get("budget_range") ?? "").trim();
  const kycFile = formData.get("kyc_document");
  const incomeFile = formData.get("income_certificate");

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  if (!fullName) {
    return { ok: false, error: "Full name is required." };
  }
  if (!(kycFile instanceof File) || kycFile.size === 0) {
    return { ok: false, error: "KYC document is required." };
  }
  if (!(incomeFile instanceof File) || incomeFile.size === 0) {
    return { ok: false, error: "Income certificate is required." };
  }

  const kycValidation = validateKycFile(kycFile);
  if (kycValidation) return { ok: false, error: kycValidation };
  const incomeValidation = validateKycFile(incomeFile);
  if (incomeValidation) return { ok: false, error: incomeValidation };

  let admin: ReturnType<typeof createAdminServiceClient>;
  try {
    admin = createAdminServiceClient();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server configuration error.";
    return { ok: false, error: message };
  }

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: "investor",
      full_name: fullName,
      investment_interest: investmentInterest,
      budget_range: budgetRange,
    },
  });

  if (authError || !authData.user) {
    return { ok: false, error: authError?.message ?? "Unable to create account." };
  }

  const userId = authData.user.id;

  const kycUpload = await uploadKycFile(admin, userId, "kyc", kycFile);
  if ("error" in kycUpload) {
    await admin.auth.admin.deleteUser(userId);
    return { ok: false, error: kycUpload.error };
  }

  const incomeUpload = await uploadKycFile(admin, userId, "income", incomeFile);
  if ("error" in incomeUpload) {
    await admin.storage.from(INVESTOR_KYC_BUCKET).remove([kycUpload.path]);
    await admin.auth.admin.deleteUser(userId);
    return { ok: false, error: incomeUpload.error };
  }

  const now = new Date().toISOString();

  const profileRes = await admin.from("profiles").upsert(
    {
      id: userId,
      email,
      full_name: fullName,
      role: "investor",
      investor_status: "pending_approval",
      kyc_document_url: kycUpload.path,
      income_certificate_url: incomeUpload.path,
      approved_by: null,
      approved_at: null,
      rejection_reason: null,
      created_at: now,
    },
    { onConflict: "id" },
  );

  if (profileRes.error) {
    await admin.storage
      .from(INVESTOR_KYC_BUCKET)
      .remove([kycUpload.path, incomeUpload.path]);
    await admin.auth.admin.deleteUser(userId);
    return { ok: false, error: profileRes.error.message };
  }

  await admin.from("users").upsert(
    {
      id: userId,
      email,
      full_name: fullName,
      role: "investor",
      created_at: now,
    },
    { onConflict: "id" },
  );

  return { ok: true, userId };
}
