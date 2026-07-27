import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";

export const metadata = {
  title: "C2Talents Admin Manager Portal | Enterprise CMS",
  description: "Dynamic CMS for managing colleges, courses, news, categories and role-based permissions.",
};

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}
