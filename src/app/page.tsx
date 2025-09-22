import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirect the root URL to the dashboard landing page
  redirect('/dashboard')
}
