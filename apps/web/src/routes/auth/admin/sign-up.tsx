import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/admin/sign-up')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/admin/sign-up"!</div>
}
