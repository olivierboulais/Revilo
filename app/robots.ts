import { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://revilo.design";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/signup", "/login", "/upgrade"],
        disallow: ["/api/", "/dashboard/", "/scan/", "/connect/", "/reset-password/", "/forgot-password/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
