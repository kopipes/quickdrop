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

export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export function pollJobStatus(jobId: string, onUpdate: (status: JobStatus) => void, onDone: (status: JobStatus) => void, onError: (err: Error) => void): { cancel: () => void } {
  const interval = setInterval(async () => {
    try {
      const status = await getJobStatus(jobId);
      onUpdate(status);
      if (status.status === 'completed' || status.status === 'failed' || status.status === 'expired') {
        clearInterval(interval);
        onDone(status);
      }
    } catch (e) {
      clearInterval(interval);
      onError(e as Error);
    }
  }, 1000);
  return { cancel: () => clearInterval(interval) };
}

export function extension(mime: string): string[] {
  const map: Record<string, string[]> = {
    pdf: ['.pdf'],
    pptx: ['.pptx'],
    image: ['.jpg', '.jpeg', '.png', '.webp'],
  };
  return map[mime] || [];
}