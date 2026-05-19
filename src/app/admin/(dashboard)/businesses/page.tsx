import { BusinessesManagementView } from "@/components/admin/businesses-management-view";
import { fetchAdminBusinessesData } from "@/lib/admin/queries";

export default async function AdminBusinessesPage() {
  const data = await fetchAdminBusinessesData();

  if ("error" in data) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-900">
        {data.error}
      </div>
    );
  }

  return <BusinessesManagementView startups={data.startups} founders={data.founders} />;
}
