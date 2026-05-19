import { AuthLayout } from "@/components/auth/auth-layout";
import {
  InvestorSignupLeftPanel,
  InvestorSignupForm,
} from "@/components/auth/signup-form";

export default function InvestorSignupPage() {
  return (
    <AuthLayout variant="split" leftPanel={<InvestorSignupLeftPanel />}>
      <div className="mb-6 overflow-hidden rounded-2xl lg:hidden">
        <InvestorSignupLeftPanel />
      </div>
      <InvestorSignupForm />
    </AuthLayout>
  );
}
