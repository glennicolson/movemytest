import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MoveMyTest',
  description: 'Swap your driving test with another learner',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
