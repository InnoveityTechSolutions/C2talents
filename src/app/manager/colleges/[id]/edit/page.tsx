import EditCollegePage from "@/app/admin/colleges/[id]/edit/page";

export default function ManagerEditCollegePage({ params }: { params: Promise<{ id: string }> }) {
  return <EditCollegePage params={params} />;
}
