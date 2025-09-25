import { useSuspenseQuery } from "@tanstack/react-query";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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

type TrendSeries = Array<{ date: string; count: number }>;

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
};

function TrendChartCard({
  title,
  subtitle,
  data,
  dataKey,
  colorToken,
}: {
  title: string;
  subtitle: string;
  data: TrendSeries;
  dataKey: string;
  colorToken: string;
}) {
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
      }),
    []
  );

  const chartData = useMemo(
    () =>
      data.map((entry) => ({
        date: entry.date,
        [dataKey]: entry.count,
      })),
    [data, dataKey]
  );

  const latestValue = data.at(-1)?.count ?? 0;
  const gradientId = `fill-${dataKey}`;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 space-y-0">
        <div className="flex items-center justify-between">
          <CardTitle className="font-normal">{title}</CardTitle>
          <span className="font-semibold text-2xl tabular-nums">
            {latestValue.toLocaleString()}
          </span>
        </div>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <ChartContainer
          className="h-[240px] w-full"
          config={{
            [dataKey]: {
              label: title,
              color: `hsl(var(--chart-${colorToken}))`,
            },
          }}
          id={dataKey}
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={`var(--color-${dataKey})`}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={`var(--color-${dataKey})`}
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              tickFormatter={(value: string) =>
                formatter.format(parseDateKey(value))
              }
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(label) =>
                    typeof label === "string"
                      ? formatter.format(parseDateKey(label))
                      : label
                  }
                />
              }
              cursor={{ strokeDasharray: "4 4" }}
            />
            <Area
              dataKey={dataKey}
              fill={`url(#${gradientId})`}
              stroke={`var(--color-${dataKey})`}
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function EngagementCharts() {
  const { data: trends } = useSuspenseQuery(
    queryUtils.admin.getEngagementTrends.queryOptions({})
  );

  const subtitle = `Last ${trends.range.days} days`;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <TrendChartCard
        colorToken="1"
        data={trends.activeUsersPerDay}
        dataKey="activeUsers"
        subtitle={subtitle}
        title="Active Users Per Day"
      />
      <TrendChartCard
        colorToken="2"
        data={trends.messagesPerDay}
        dataKey="messages"
        subtitle={subtitle}
        title="Messages Sent Per Day"
      />
    </div>
  );
}

export function DashboardAnalytics() {
  return (
    <div className="space-y-6">
      <AnalyticsCards />
      <EngagementCharts />
    </div>
  );
}

export function AnalyticsFallback() {
  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {["Active Users Per Day", "Messages Sent Per Day"].map((title) => (
          <Card key={title}>
            <CardHeader>
              <div className="flex flex-col gap-1">
                <CardTitle className="font-normal">{title}</CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-24" />
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[240px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
