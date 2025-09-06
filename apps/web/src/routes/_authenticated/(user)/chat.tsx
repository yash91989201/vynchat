import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/(user)/chat')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/(user)/chat"!</div>
}
