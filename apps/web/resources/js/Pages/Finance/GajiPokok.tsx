import DashboardLayout from "@/Layouts/DashboardLayout";
import { FinanceSectionPage } from "@/components/finance-shared";

export default function Page() {
  return (
    <DashboardLayout>
      <FinanceSectionPage mode="gaji-pokok" />
    </DashboardLayout>
  );
}
