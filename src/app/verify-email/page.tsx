import { Suspense } from "react";

import VerifyEmailClient from "./verify-email-client";

type VerifyEmailPageProps = {
  searchParams?: Promise<{
    email?: string;
  }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const resolvedSearchParams = await searchParams;
  const email = resolvedSearchParams?.email?.trim() ?? "";

  return (
    <Suspense fallback={null}>
      <VerifyEmailClient email={email} />
    </Suspense>
  );
}
