import { supabase } from './supabase/client';
import { User } from './types';
import { CENTRAL_API_BASE, APP_ID } from './central-services';

export async function signUp(email: string, password: string, name?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) throw error;

  // Provisioning is the core's job. /api/auth/seed-credits is idempotent and
  // seeds the signup credits against the canonical ledger. This app used to
  // call a local /api/auth/setup that wrote to `users`, `wallets` and
  // `ledger_entries` — two of which do not exist — so every signup threw.
  if (data.session?.access_token) {
    try {
      await fetch(`${CENTRAL_API_BASE}/auth/seed-credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': APP_ID,
          Authorization: `Bearer ${data.session.access_token}`,
        },
      });
    } catch {
      // Seeding is not worth failing a signup over; the core is idempotent and
      // will seed on the next authenticated call.
    }
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return userData;
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => {
          callback(data);
        });
    } else {
      callback(null);
    }
  });
}
