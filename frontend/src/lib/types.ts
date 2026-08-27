export interface JobStatus {
  id: string;
  tool: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'expired';
  input_size: number;
  output_size: number;
  input_format: string | null;
  output_format: string | null;
  error_code: string | null;
  error_message: string | null;
  expires_at: string | null;
  processing_time_ms: number;
  output_files: { name: string; size: number; url: string }[];
}

export interface ToolCategory {
  [slug: string]: string;
}

export interface ToolData {
  categories: Record<string, ToolCategory>;
}

export type ToolId = string;

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';