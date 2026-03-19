export type RealtimeChannel = 'menu-publication' | 'availability' | 'campaigns' | 'platform-status';

export interface RealtimeMessage<TPayload = unknown> {
  channel: RealtimeChannel;
  event: string;
  payload: TPayload;
  occurredAt: string;
}
