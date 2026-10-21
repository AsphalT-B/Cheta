import { DashboardShell } from "./components";
import { DashboardSessionGuard } from "./session-guard";
import { PushPermissionPrompt } from "./push-permission";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardSessionGuard><DashboardShell>{children}</DashboardShell><PushPermissionPrompt /></DashboardSessionGuard>;
}
