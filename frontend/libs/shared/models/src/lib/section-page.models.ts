export interface QuickLink {
  label: string;
  route: string;
}

export interface SummaryMetric {
  label: string;
  value: string;
  tone?: 'neutral' | 'accent' | 'warning';
}

export interface SectionPageContent {
  pageId?: string;
  eyebrow: string;
  title: string;
  description: string;
  actions: string[];
  quickLinks?: QuickLink[];
  metrics?: SummaryMetric[];
}
