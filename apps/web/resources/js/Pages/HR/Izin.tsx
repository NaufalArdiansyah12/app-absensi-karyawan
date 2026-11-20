import DashboardLayout from "@/Layouts/DashboardLayout";
import ApprovalPage from "@/components/gm-approval";

export default function Page() {
  return (
    <DashboardLayout>
      <ApprovalPage kind="izin" tier="HR" />
    </DashboardLayout>
  );
}
