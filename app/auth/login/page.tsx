import { redirect } from 'next/navigation'

export default function Page() {
  // Redirect to the main login page for consistency
  redirect('/login')
}
