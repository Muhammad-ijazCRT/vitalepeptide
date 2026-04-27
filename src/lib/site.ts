export function siteLabel(): string {
  return (process.env.NEXT_PUBLIC_SITE_NAME ?? "your account").trim();
}
