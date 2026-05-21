import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Los errores de tipos no bloquean el build en producción
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
