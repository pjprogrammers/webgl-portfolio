import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site.config";

const lastModified = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl("/"),
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: siteUrl("/work"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: siteUrl("/about"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
