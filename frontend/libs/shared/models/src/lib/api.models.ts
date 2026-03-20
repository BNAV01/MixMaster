export interface ApiEnvelope<T> {
  data: T;
  meta?: ApiMeta;
}

export interface ApiMeta {
  correlationId?: string;
  tenantId?: string;
  branchId?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface NormalizedApiError {
  code: string;
  message: string;
  status: number;
  kind: 'network' | 'unauthorized' | 'forbidden' | 'validation' | 'server' | 'unexpected';
  details?: Record<string, unknown>;
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';
