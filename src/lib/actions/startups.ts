"use server";

import {
  createStartupAction,
  deleteStartupAction,
  updateStartupAction,
  updateStartupStatusAction,
} from "@/lib/admin/actions";

export async function approveStartup(id: string) {
  await updateStartupStatusAction(id, "live");
}

export { createStartupAction as createStartup, updateStartupAction as updateStartup, deleteStartupAction as deleteStartup };
