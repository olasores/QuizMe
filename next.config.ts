// next.config.ts
// Note: Removed the NextConfig type so we can use the experimental turbopack.root
// even if the current @types for this Next version don't expose it yet.

const nextConfig = {
  // Experimental root warning workaround:
  // The warning appears when multiple lockfiles are detected above this folder.
  // Current stable typings do not yet expose a turbopack.root option. Once available,
  // you can add:
  // experimental: { turbopack: { root: __dirname } }
  // For now, prefer cleaning up extra lockfiles or running with `NEXT_TURBOPACK_ROOT=. ` env.
};

export default nextConfig;
