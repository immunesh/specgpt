import { redirect } from 'next/navigation'

// Root page redirects based on auth — handled client-side in layout
export default function RootPage() {
  redirect('/chat')
}
