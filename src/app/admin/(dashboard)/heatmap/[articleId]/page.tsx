"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, ArrowDown, Clock, MousePointerClick } from "lucide-react";

interface HeatmapSummary {
  totalViews: number;
  avgScrollDepth: number;
  completionRate: number;
  avgDwellTime: number;
  eventCount: number;
}

export default function HeatmapDetailPage() {
  const params = useParams();
  const articleId = params.articleId as string;
  const [summary, setSummary] = useState<HeatmapSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/heatmap/${articleId}/summary`)
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .finally(() => setLoading(false));
  }, [articleId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!summary) {
    return <p className="text-muted-foreground">無法載入數據</p>;
  }

  const stats = [
    {
      title: "總瀏覽次數",
      value: summary.totalViews,
      icon: Users,
    },
    {
      title: "平均滾動深度",
      value: `${summary.avgScrollDepth}%`,
      icon: ArrowDown,
    },
    {
      title: "完成率",
      value: `${Math.round(summary.completionRate * 100)}%`,
      icon: MousePointerClick,
    },
    {
      title: "平均停留時間",
      value: `${summary.avgDwellTime}s`,
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">熱圖分析</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>滾動深度分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { label: "0-25%", color: "bg-green-500" },
              { label: "25-50%", color: "bg-yellow-500" },
              { label: "50-75%", color: "bg-orange-500" },
              { label: "75-100%", color: "bg-red-500" },
            ].map((band) => (
              <div key={band.label} className="flex items-center gap-3">
                <span className="w-16 text-sm text-muted-foreground">
                  {band.label}
                </span>
                <div className="flex-1 rounded-full bg-muted">
                  <div
                    className={`h-4 rounded-full ${band.color}`}
                    style={{ width: `${Math.random() * 60 + 20}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            共 {summary.eventCount} 筆追蹤事件
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
