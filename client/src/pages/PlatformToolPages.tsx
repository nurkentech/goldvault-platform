import PageLayout from "@/components/PageLayout";
import GoldMiningPartners from "@/components/GoldMiningPartners";
import SocialHub from "@/components/SocialHub";

export function MiningExplorerPage() {
  return (
    <PageLayout
      title="Gold Mining Explorer"
      subtitle="Research mining companies and connect to the investment tools actually available in your account."
      badge="Mining research"
      breadcrumb="Mining Explorer"
    >
      <GoldMiningPartners />
    </PageLayout>
  );
}

export function CommunitySocialPage() {
  return (
    <PageLayout
      title="GoldVaults Social Hub"
      subtitle="Read real community posts, share useful market insights, and earn eligible engagement rewards."
      badge="Community"
      breadcrumb="Social Hub"
    >
      <SocialHub />
    </PageLayout>
  );
}
