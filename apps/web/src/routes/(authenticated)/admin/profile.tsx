import { createFileRoute } from "@tanstack/react-router";
import { ChangePasswordForm } from "@/components/shared/profile/change-password-form";
import { UpdateProfileForm } from "@/components/shared/profile/update-profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/(authenticated)/admin/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto space-y-8 p-8">
      <h1 className="font-bold text-2xl">Update Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
          <CardDescription>Update your name and bio.</CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateProfileForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Change your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
