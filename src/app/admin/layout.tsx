import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";

export const metadata = {
  title: "Admin CMS | C2Talents College Portal",
  description: "Manage colleges, courses, placements, and AI automated data population.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}
