import { ApplyJobForm } from '@/components/apply-job-form';

export default async function ApplyPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<React.JSX.Element> {
  const { locale, id } = await params;
  return <ApplyJobForm locale={locale} jobId={id} />;
}

