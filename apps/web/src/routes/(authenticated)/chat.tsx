import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)/chat")({
  component: RouteComponent,
});

function RouteComponent() {
  return <p>test</p>;
}
