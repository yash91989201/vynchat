import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { AccountLinkDialog } from "@/components/user/account-link-dialog";
import { queryUtils } from "@/utils/orpc";

export function FollowingList() {
  const { session } = useRouteContext({ from: "/(authenticated)" });
  const isAnonymous = !!session?.user?.isAnonymous;

  const { data } = useSuspenseQuery(
    queryUtils.user.userFollowing.queryOptions({})
  );

  const following = data?.followings ?? [];

  if (isAnonymous) {
    return <AccountLinkDialog initialOpen={true} />;
  }

  if (following.length === 0) {
    return (
      <div className="p-4">
        <h2 className="mb-2 font-semibold text-lg">Following</h2>
        <p className="text-muted-foreground">
          You are not following anyone yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-2 font-semibold text-lg">Following</h2>
      <ul className="space-y-2">
        {following.map((u) => (
          <li
            className="flex items-center justify-between rounded-md p-2 hover:bg-muted"
            key={u.id}
          >
            <div className="flex items-center">
              <div className="mr-3 h-8 w-8 rounded-full bg-gray-200" />
              <div>
                <div className="font-medium">
                  {u.name ?? u.name ?? u.email ?? "Unknown"}
                </div>
                {u.bio && (
                  <div className="text-muted-foreground text-sm">{u.bio}</div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
