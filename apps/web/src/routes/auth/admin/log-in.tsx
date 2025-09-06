import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/admin/log-in')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/admin/log-in"!</div>
}
