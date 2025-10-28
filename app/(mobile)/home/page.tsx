import { redirect } from 'next/navigation';

/**
 * Home route - Redirects to search page
 * The app flow is now: Splash → Search (no intermediate home page)
 */
export default function HomePage() {
  redirect('/search');
}



