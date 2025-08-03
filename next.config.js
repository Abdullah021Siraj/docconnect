module.exports = {
  'output': 'standalone',
  typescript: {
    ignoreBuildErrors: true, // ✅ Skip all TypeScript errors
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Skip ESLint during build
  }
};
