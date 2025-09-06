import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/(admin)/dashboard/blogs/slug/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/blogs/slug/"!</div>
}
