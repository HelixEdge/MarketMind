"use client";

import { HeartHandshake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { InsightResponse } from "@/types";

interface InsightCardProps {
  data: InsightResponse | null;
  isLoading: boolean;
}

export function InsightCard({ data, isLoading }: InsightCardProps) {
  if (isLoading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950 dark:via-orange-950 dark:to-rose-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5" />
            Your Trading Coach
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950 dark:via-orange-950 dark:to-rose-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Your Trading Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">
            Click &quot;Simulate 3% Drop&quot; to get a personalized coaching insight
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950 dark:via-orange-950 dark:to-rose-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <span className="text-orange-900 dark:text-orange-200">Your Trading Coach</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg leading-relaxed text-orange-900 dark:text-orange-100">
          {data.coaching_insight}
        </p>
      </CardContent>
    </Card>
  );
}
