import { UserTable } from "@/components/admin/user-table";
import { fetchAdminUsersData } from "@/lib/admin/queries";

export default async function AdminUsersPage() {
  const data = await fetchAdminUsersData();

  if (!Array.isArray(data)) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-900">
        {data.error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage founders, investors, and platform roles.
        </p>
      </div>
      <UserTable users={data} />
    </div>
  );
}
