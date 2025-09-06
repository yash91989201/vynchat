import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/blogs/slug/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/blogs/slug/"!</div>
}
