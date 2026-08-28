import { API_BASE, JobStatus } from './types';

export async function createJob(tool: string, files: File[], options: Record<string, unknown> = {}): Promise<{ job_id: string }> {
  const form = new FormData();
  form.append('tool', tool);
  form.append('options', JSON.stringify(options));
  for (const f of files) {
    form.append('files', f);
  }
  const res = await fetch(`${API_BASE}/api/jobs`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}`);
  if (!res.ok) throw new Error('Failed to get job status');
  return res.json();
}

export function getDownloadUrl(jobId: string, filename: string): string {
  return `${API_BASE}/api/jobs/${jobId}/download/${filename}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function pollJobStatus(jobId: string, onUpdate: (status: JobStatus) => void, onDone: (status: JobStatus) => void, onError: (err: Error) => void): { cancel: () => void } {
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout>;

  const tick = async () => {
    if (cancelled) return;
    try {
      const status = await getJobStatus(jobId);
      if (cancelled) return;
      onUpdate(status);
      if (status.status === 'completed' || status.status === 'failed' || status.status === 'expired') {
        onDone(status);
        return;
      }
      timer = setTimeout(tick, 1000);
    } catch (e) {
      if (cancelled) return;
      onError(e as Error);
    }
  };

  timer = setTimeout(tick, 1000);
  return { cancel: () => { cancelled = true; clearTimeout(timer); } };
}