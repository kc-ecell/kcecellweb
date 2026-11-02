import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/instagram",
        destination:
          "https://www.instagram.com/kcecell_?utm_source=ig_web_button_share_sheet&obrf=ZDNlZDc0MzIxNw==",
        permanent: false,
      },
      {
        source: "/linkedin",
        destination: "https://www.linkedin.com/company/kcecell",
        permanent: false,
      },
      {
        source: "/github",
        destination: "https://github.com/kc-ecell",
        permanent: false,
      },
      {
        source: "/email",
        destination: "mailto:kcecell@kccemsr.edu.in",
        permanent: false,
      },
      {
        source: "/mail",
        destination: "mailto:kcecell@kccemsr.edu.in",
        permanent: false,
      },
      {
        source: "/singularity",
        destination: "/events#singularity-2027",
        permanent: false,
      },
      {
        source: "/detroits",
        destination: "/events#detroits",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
