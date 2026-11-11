/** Access comes from the database RPC; email matching stays server-side. */
export function adminAccessReady(sessionUserId: string | undefined, verifiedUserId: string | null, rpcAllowed: boolean) {
  return Boolean(sessionUserId && sessionUserId === verifiedUserId && rpcAllowed);
}

export function advanceLogoClicks(previous: { count: number; at: number }, now: number) {
  const count = now - previous.at <= 600 ? previous.count + 1 : 1;
  return { count: count >= 5 ? 0 : count, at: now, openAdmin: count >= 5 };
}

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption { sitemap?: boolean }
}