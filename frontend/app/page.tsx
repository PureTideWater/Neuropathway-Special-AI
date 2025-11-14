import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to dashboard - in production this would check auth first
  redirect('/dashboard');
}
