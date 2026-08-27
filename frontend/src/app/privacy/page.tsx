import { PageLayout } from '@/components/ToolShell';

export default function PrivacyPage() {
  return (
    <PageLayout title="Privacy" description="Your privacy is the foundation of QuikDrop.">
      <div className="mx-auto max-w-2xl space-y-6 text-sm leading-relaxed text-neutral-600">
        <section className="rounded-2xl border border-neutral-200/80 bg-white p-6">
          <h2 className="mb-2 text-base font-semibold text-neutral-900">What QuikDrop stores</h2>
          <p>Only anonymous processing metadata — which tool was used, when, and whether it succeeded. Never document content.</p>
        </section>
        <section className="rounded-2xl border border-neutral-200/80 bg-white p-6">
          <h2 className="mb-2 text-base font-semibold text-neutral-900">What QuikDrop does not store</h2>
          <p>Your files are uploaded to a temporary directory, processed, and the result made available for download. Both the input and output are automatically deleted — by default within 30 minutes of processing completing.</p>
        </section>
        <section className="rounded-2xl border border-neutral-200/80 bg-white p-6">
          <h2 className="mb-2 text-base font-semibold text-neutral-900">File deletion</h2>
          <p>Uploaded files and generated results are removed automatically. They are never kept in a permanent library, database blob, archive, or backup repository.</p>
        </section>
        <section className="rounded-2xl border border-neutral-200/80 bg-white p-6">
          <h2 className="mb-2 text-base font-semibold text-neutral-900">AI</h2>
          <p>QuikDrop does not send your documents to generative AI services. Processing is done by our own servers and, where possible, directly in your browser.</p>
        </section>
      </div>
    </PageLayout>
  );
}