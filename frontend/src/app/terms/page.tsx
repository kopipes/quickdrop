import { PageLayout } from '@/components/ToolShell';

export default function TermsPage() {
  return (
    <PageLayout title="Terms of Use" description="Simple terms for a simple tool.">
      <div className="mx-auto max-w-2xl space-y-6 text-sm leading-relaxed text-neutral-600">
        <section className="rounded-2xl border border-neutral-200/80 bg-white p-6">
          <h2 className="mb-2 text-base font-semibold text-neutral-900">Use of the service</h2>
          <p>QuikDrop provides free file utilities. You agree not to upload files you do not have the right to process, or files that are illegal or harmful.</p>
        </section>
        <section className="rounded-2xl border border-neutral-200/80 bg-white p-6">
          <h2 className="mb-2 text-base font-semibold text-neutral-900">Temporary files</h2>
          <p>Files are processed temporarily and automatically deleted. Do not rely on QuikDrop as a storage service — always keep your own copies.</p>
        </section>
        <section className="rounded-2xl border border-neutral-200/80 bg-white p-6">
          <h2 className="mb-2 text-base font-semibold text-neutral-900">No warranty</h2>
          <p>The service is provided &quot;as is&quot;. We make no guarantees about the accuracy, reliability, or completeness of processed results.</p>
        </section>
      </div>
    </PageLayout>
  );
}