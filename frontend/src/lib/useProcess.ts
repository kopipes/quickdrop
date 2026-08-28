'use client';

import { useCallback, useRef, useState } from 'react';
import { createJob, getDownloadUrl, pollJobStatus, formatBytes } from '@/lib/api';
import type { JobStatus } from '@/lib/types';

type Stage = 'idle' | 'processing' | 'completed' | 'error';

export interface ProcessState {
  stage: Stage;
  message?: string;
  code?: string | null;
  job?: JobStatus;
}

export function useProcess(tool: string) {
  const [state, setState] = useState<ProcessState>({ stage: 'idle' });
  const pollRef = useRef<{ cancel: () => void } | null>(null);

  const run = useCallback(
    (files: File[], options: Record<string, unknown> = {}) => {
      pollRef.current?.cancel();
      setState({ stage: 'processing', message: 'Uploading' });

      createJob(tool, files, options)
        .then(({ job_id }) => {
          setState({ stage: 'processing', message: 'Processing' });
          pollRef.current = pollJobStatus(
            job_id,
            (s) => {
              if (s.status === 'processing') setState({ stage: 'processing', message: 'Processing' });
            },
            (s) => {
              if (s.status === 'completed') {
                setState({ stage: 'completed', job: s });
              } else {
                setState({ stage: 'error', message: s.error_message || 'Processing failed.', code: s.error_code });
              }
            },
            (e) => setState({ stage: 'error', message: e.message, code: null }),
          );
        })
        .catch((e) => setState({ stage: 'error', message: (e as Error).message, code: null }));
    },
    [tool],
  );

  const reset = useCallback(() => {
    pollRef.current?.cancel();
    setState({ stage: 'idle' });
  }, []);

  const result = state.stage === 'completed' && state.job
    ? {
        downloadUrl: state.job.output_files[0] ? getDownloadUrl(state.job.id, state.job.output_files[0].name) : '#',
        filename: state.job.output_files[0]?.name || 'result',
        outputSize: state.job.output_size || 0,
      }
    : null;

  return { state, run, reset, result };
}

export { formatBytes };