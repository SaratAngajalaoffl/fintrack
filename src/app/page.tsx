import { LandingHero } from "@/components/landing/landing-hero";
import { getSession } from "@/lib/auth/session";

export default async function Home() {
  const session = await getSession();
  return <LandingHero isAuthenticated={!!session} />;
}
