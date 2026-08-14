'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FolderKanban, CreditCard, Settings, User, LogOut, Coins } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getCurrentUser, onAuthStateChange, signOut } from '@/lib/auth';
// Balance comes from the core ledger, not a local `wallets` table that never
// existed on this project.
import { CentralCredits } from '@/lib/central-services';
import { supabase } from '@/lib/supabase/client';

async function fetchBalance(): Promise<number> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return 0;
  try {
    const { balance } = await CentralCredits.getBalance(session.access_token);
    return balance;
  } catch {
    // A balance we cannot read is shown as zero rather than crashing the shell.
    return 0;
  }
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, balance, setUser, setBalance } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const userBalance = await fetchBalance();
        setBalance(userBalance);
      } else {
        router.push('/sign-in');
      }
    };

    checkAuth();

    const { data: { subscription } } = onAuthStateChange((newUser) => {
      if (newUser) {
        setUser(newUser);
        void fetchBalance().then(setBalance);
      } else {
        setUser(null);
        setBalance(0);
        router.push('/sign-in');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, setUser, setBalance]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/projects" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">javari Logo Studio</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/projects"
                className={`text-sm font-medium ${
                  pathname === '/projects' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                } transition-colors`}
              >
                Projects
              </Link>
              <Link
                href="/templates"
                className={`text-sm font-medium ${
                  pathname === '/templates' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                } transition-colors`}
              >
                Templates
              </Link>
              <Link
                href="/brand"
                className={`text-sm font-medium ${
                  pathname === '/brand' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                } transition-colors`}
              >
                Brand toolkit
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/billing">
              <Button variant="outline" size="sm" className="gap-2">
                <Coins className="h-4 w-4" />
                {balance} Credits
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {user.name || user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.name || 'Account'}</span>
                    <span className="text-xs text-slate-500 font-normal">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/projects" className="cursor-pointer">
                    <FolderKanban className="mr-2 h-4 w-4" />
                    Projects
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing" className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
