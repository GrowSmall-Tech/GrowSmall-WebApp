import { AuthLayout } from "@/components/auth/auth-layout";
import {
  FounderSignupLeftPanel,
  FounderSignupForm,
} from "@/components/auth/signup-form";

export default function FounderSignupPage() {
  return (
    <AuthLayout variant="split" leftPanel={<FounderSignupLeftPanel />}>
      <div className="lg:hidden">
        <FounderSignupLeftPanel />
      </div>
      <FounderSignupForm />
    </AuthLayout>
  );
}
