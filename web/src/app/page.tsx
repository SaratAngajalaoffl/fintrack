import { LandingHero } from "@/components/ui/landing";
import { getSession } from "@/lib/auth/session";

export default async function Home() {
  const session = await getSession();
  return <LandingHero isAuthenticated={!!session} />;
}
