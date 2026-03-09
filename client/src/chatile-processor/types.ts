export type MatchResultType = "exact" | "disambiguate" | "entity_needed" | "no_match";

export interface ResolvedIntent {
  action: string;
  breadcrumb: string;
  path: string;
  filters?: Record<string, string>;
  highlight?: string;
  needsDisambiguation?: boolean;
}

export interface EntityExtractionResult {
  medication_name?: string;
  doctor_name?: string;
  day?: string;
  specialty?: string;
  insurance?: string;
  appointment_type?: string;
}

export interface MatchResult {
  type: MatchResultType;
  intent: ResolvedIntent | null;
  entities: EntityExtractionResult;
  prompt?: string;
  options?: DisambiguationOption[];
}

export interface DisambiguationOption {
  id: string;
  label: string;
  subtitle: string;
  action: string;
  path: string;
}

export interface IntentPattern {
  action: string;
  patterns: RegExp[];
  intent: ResolvedIntent;
  requiredEntities?: (keyof EntityExtractionResult)[];
  entityPrompt?: string;
}
