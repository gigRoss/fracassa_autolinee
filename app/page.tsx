import { redirect } from 'next/navigation';

/**
 * Root page - Redirects to mobile splash screen
 * This ensures the app starts with the splash screen experience
 */
export default function RootPage() {
  redirect('/splash');
}
