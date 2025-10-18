// app/dashboard/layout.tsx

import Sidebar from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({children}: {children: React.ReactNode;}) {


    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
            {/* Sidebar */}
            <Sidebar  />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}