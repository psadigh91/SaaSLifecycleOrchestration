import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to dashboard (middleware will redirect to login if not authenticated)
  redirect('/dashboard');
}
