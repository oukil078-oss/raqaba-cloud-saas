import { AuthProvider } from '@/components/dashboard/AuthProvider';
import { DashboardShell } from '@/components/dashboard/Shell';
export default function Layout({children}:{children:React.ReactNode}){return <AuthProvider><DashboardShell>{children}</DashboardShell></AuthProvider>}
