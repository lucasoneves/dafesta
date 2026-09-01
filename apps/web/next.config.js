/** @type {import('next').NextConfig} */
import path from "node:path";

const nextConfig = {
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  transpilePackages: [
    "react-native",
    "react-native-web",
    "nativewind",
    "react-native-css-interop",
    "@dafesta/ui",
    "@dafesta/types",
    "@dafesta/utils",
    "@dafesta/database",
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native$": "react-native-web",
    };
    config.resolve.extensions = [
      ".web.ts",
      ".web.tsx",
      ".web.js",
      ...config.resolve.extensions,
    ];
    return config;
  },
};

export default nextConfig;
