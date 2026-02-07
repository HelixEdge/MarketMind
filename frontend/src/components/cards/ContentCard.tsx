"use client";

import { useState, useEffect } from "react";
import { Sparkles, Copy, Check, Linkedin, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { ContentResponse, Persona } from "@/types";

// X Icon Component
function XIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-label="X"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.694L2.896 21.75H-1.08l7.73-8.835L-1.08 2.25h6.514l4.888 6.469L15.939 2.25h.305zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface ContentCardProps {
  data: Record<Persona, ContentResponse> | null;
  isLoading: boolean;
  platform: "linkedin" | "x";
  onPlatformChange: (platform: "linkedin" | "x") => void;
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
  const [activeTab, setActiveTab] = useState<Persona>("calm_analyst");

  const handleCopy = async (content: string, persona: Persona) => {
    await navigator.clipboard.writeText(content);
    setCopiedPersona(persona);
    setTimeout(() => setCopiedPersona(null), 2000);
  };

  const handleShareX = (content: string) => {
    window.open(
      "https://x.com/intent/tweet?text=" + encodeURIComponent(content),
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleShareLinkedin = (content: string) => {
    window.open(
      "https://www.linkedin.com/feed/?shareActive=true&text=" + encodeURIComponent(content),
      "_blank",
      "noopener,noreferrer"
    );
  };

  // Re-render tabs when platform changes to show updated content
  useEffect(() => {
    // Force re-render of tabs by keeping activeTab valid
    setActiveTab((prev) => {
      const validPersonas = Object.keys(personaLabels) as Persona[];
      return validPersonas.includes(prev) ? prev : "calm_analyst";
    });
  }, [platform]);

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
              variant={platform === "x" ? "default" : "outline"}
              size="sm"
              onClick={() => onPlatformChange("x")}
            >
              <XIcon className="h-4 w-4 mr-1" />
              X
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs key={`${platform}`} value={activeTab} onValueChange={(v) => setActiveTab(v as Persona)}>
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
                <div className="rounded-lg bg-gray-50 p-4 min-h-[120px] dark:bg-gray-800">
                  <p className="text-sm whitespace-pre-wrap dark:text-gray-200">
                    {data[persona]?.content || "Content not available"}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {data[persona]?.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          platform === "linkedin"
                            ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950"
                            : "text-white bg-black dark:text-gray-100 dark:bg-gray-700 border border-black dark:border-gray-600"
                        }`}
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

                {/* Share buttons */}
                <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Share2 className="h-4 w-4 text-gray-400 mt-1.5" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShareX(data[persona]?.content || "")}
                  >
                    <XIcon className="h-4 w-4 mr-1" />
                    Share to X
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShareLinkedin(data[persona]?.content || "")}
                  >
                    <Linkedin className="h-4 w-4 mr-1" />
                    Share to LinkedIn
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
