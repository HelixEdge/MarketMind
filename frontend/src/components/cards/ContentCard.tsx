"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, Linkedin, Twitter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { ContentResponse, Persona } from "@/types";

interface ContentCardProps {
  data: Record<Persona, ContentResponse> | null;
  isLoading: boolean;
  platform: "linkedin" | "twitter";
  onPlatformChange: (platform: "linkedin" | "twitter") => void;
}

const personaLabels: Record<Persona, { label: string; emoji: string }> = {
  calm_analyst: { label: "Calm Analyst", emoji: "" },
  data_nerd: { label: "Data Nerd", emoji: "" },
  trading_coach: { label: "Trading Coach", emoji: "" },
};

export function ContentCard({
  data,
  isLoading,
  platform,
  onPlatformChange,
}: ContentCardProps) {
  const [copiedPersona, setCopiedPersona] = useState<Persona | null>(null);

  const handleCopy = async (content: string, persona: Persona) => {
    await navigator.clipboard.writeText(content);
    setCopiedPersona(persona);
    setTimeout(() => setCopiedPersona(null), 2000);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Click &quot;Simulate 3% Drop&quot; to generate social posts
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Content Generator
          </span>
          <div className="flex gap-2">
            <Button
              variant={platform === "linkedin" ? "default" : "outline"}
              size="sm"
              onClick={() => onPlatformChange("linkedin")}
            >
              <Linkedin className="h-4 w-4 mr-1" />
              LinkedIn
            </Button>
            <Button
              variant={platform === "twitter" ? "default" : "outline"}
              size="sm"
              onClick={() => onPlatformChange("twitter")}
            >
              <Twitter className="h-4 w-4 mr-1" />
              Twitter
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calm_analyst">
          <TabsList className="w-full">
            {(Object.keys(personaLabels) as Persona[]).map((persona) => (
              <TabsTrigger
                key={persona}
                value={persona}
                className="flex-1 text-xs"
              >
                {personaLabels[persona].emoji} {personaLabels[persona].label}
              </TabsTrigger>
            ))}
          </TabsList>

          {(Object.keys(personaLabels) as Persona[]).map((persona) => (
            <TabsContent key={persona} value={persona}>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-gray-50 p-4 min-h-[120px]">
                  <p className="text-sm whitespace-pre-wrap">
                    {data[persona]?.content || "Content not available"}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {data[persona]?.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {data[persona]?.char_count || 0} chars
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopy(data[persona]?.content || "", persona)
                      }
                    >
                      {copiedPersona === persona ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
