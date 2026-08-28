import { ReviewGate } from "@/components/ReviewGate";

export const dynamic = "force-dynamic";

function businessNameFromSlug(slug: string) {
  try {
    return decodeURIComponent(slug)
      .split(/[-_]+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  } catch {
    return slug;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = businessNameFromSlug(slug);
  return {
    title: `Rate ${name}`,
    description: `How was your visit to ${name}? Rate your experience.`,
  };
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const businessName = businessNameFromSlug(slug);
  const googleReviewLink = process.env.GOOGLE_REVIEW_LINK ?? "";

  return (
    <ReviewGate
      slug={slug}
      businessName={businessName || slug}
      googleReviewLink={googleReviewLink}
    />
  );
}
