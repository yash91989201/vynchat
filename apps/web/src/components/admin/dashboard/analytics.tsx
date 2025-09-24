import { useSuspenseQuery } from "@tanstack/react-query";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryUtils } from "@/utils/orpc";

const csvConfig = mkConfig({
  useKeysAsHeaders: true,
  filename: "Vynchat Dashboard Metrics",
});

function AnalyticsCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-bold text-3xl">{value}</p>
      </CardContent>
    </Card>
  );
}

const analyticsMetrics = [
  { key: "totalBlogs", title: "Total Blogs" },
  { key: "totalComments", title: "Total Comments" },
  { key: "totalUsers", title: "Total Users" },
  { key: "activeNow", title: "Active Now" },
  { key: "totalLoggedInUsers", title: "Total Logged-in Users" },
  { key: "totalGuestUsers", title: "Total Guest Users" },
] as const;

function AnalyticsCards() {
  const { data: metrics } = useSuspenseQuery(
    queryUtils.admin.getDashboardMetrics.queryOptions({})
  );

  const handleDownload = () => {
    if (metrics) {
      const reportData = analyticsMetrics.map((metric) => ({
        Metric: metric.title,
        Value: metrics[metric.key],
      }));
      const csv = generateCsv(csvConfig)(reportData);
      download(csvConfig)(csv);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-2xl tracking-tight">
          Dashboard Analytics
        </h2>
        <Button onClick={handleDownload}>Download Report</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {analyticsMetrics.map((metric) => (
          <AnalyticsCard
            key={metric.key}
            title={metric.title}
            value={metrics[metric.key]}
          />
        ))}
      </div>
    </div>
  );
}

export function DashboardAnalytics() {
  return <AnalyticsCards />;
}

export function AnalyticsFallback() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-2xl tracking-tight">
          Dashboard Analytics
        </h2>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {analyticsMetrics.map((metric) => (
          <Card key={metric.key}>
            <CardHeader>
              <CardTitle className="font-normal">{metric.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
