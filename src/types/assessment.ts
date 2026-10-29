/**
 * ResiCope - Types & Schemas
 * Residency Psychological Assessment System & Committee Dashboard
 */

export type OptionKey = 'A' | 'B' | 'C' | 'D';

export type SelectionState = 'MOST' | 'LEAST' | null; // MOST = Blue (+2), LEAST = Red (0), null = Unselected (+1)

export interface QuestionOption {
  id: OptionKey;
  text: string; // The candidate prompt (WITHOUT psychological tag)
  dimensionName: string; // E.g. "Active Coping"
  dimensionId: number; // 1 to 14
  dimensionLabel: string; // E.g. "Active Coping 1"
  isRedFlag: boolean;
  domainId: 1 | 2 | 3 | 4;
}

export interface QuestionSet {
  id: number; // 1 to 7
  title: string;
  scenario: string;
  options: QuestionOption[];
}

export interface QuestionAnswer {
  most: OptionKey | null;
  least: OptionKey | null;
}

export interface DimensionDefinition {
  id: number;
  name: string;
  thaiName: string;
  domainId: 1 | 2 | 3 | 4;
  isRedFlag: boolean;
  itemLocations: string[]; // E.g. ["ชุดที่ 1 (A)", "ชุดที่ 4 (B)"]
  fullScore: number; // 4
  description: string;
}

export interface DimensionResult {
  id: number;
  name: string;
  thaiName: string;
  domainId: 1 | 2 | 3 | 4;
  isRedFlag: boolean;
  itemLocations: string[];
  score: number; // 0 to 4
  maxScore: number;
  details: {
    item1: { location: string; points: number; text: string };
    item2: { location: string; points: number; text: string };
  };
}

export interface DomainResult {
  id: 1 | 2 | 3 | 4;
  name: string;
  thaiName: string;
  description: string;
  subDimensions: string[];
  itemCount: number; // 6, 10, 2, 10
  score: number;
  percentage: number; // (score / 28) * 100
  color: string;
  glowColor: string;
}

export type RiskTier = 'LOW' | 'MODERATE' | 'HIGH';

export interface RedFlagAnalysis {
  score: number; // 0 to 20
  maxScore: number; // 20
  tier: RiskTier;
  tierLabel: string;
  thaiLabel: string;
  clinicalInterpretation: string;
  color: string;
  recommendations: string[];
}

export type ArchetypeKey = 'TACTICAL_MASTER' | 'RESILIENT_GUARDIAN' | 'TEAM_CONNECTOR' | 'OVERLOADED_CRUSADER';

export interface CopingArchetype {
  key: ArchetypeKey;
  badge: string;
  title: string;
  thaiTitle: string;
  description: string;
  subtext: string;
  color: string;
  glowColor: string;
}

export interface RpgStat {
  key: 'STR' | 'INT' | 'VIT' | 'DEX' | 'DRAIN';
  name: string;
  thaiName: string;
  score: number;
  maxScore: number;
  percentage: number;
  description: string;
  color: string;
}

export interface ActiveBuff {
  id: string;
  name: string;
  icon: string;
  level: string;
  dimensionName: string;
  score: number;
  effectDescription: string;
  clinicalBenefit: string;
}

export interface EnergyDrain {
  id: string;
  name: string;
  icon: string;
  dimensionName: string;
  score: number;
  reframedTitle: string;
  reframedAdvice: string;
  severity: 'MILD' | 'ELEVATED' | 'HIGH';
}

export interface MicroHabitQuest {
  id: string;
  title: string;
  category: string;
  timeEstimate: string;
  instruction: string;
}

export interface RpgProfile {
  archetype: CopingArchetype;
  stats: Record<'STR' | 'INT' | 'VIT' | 'DEX' | 'DRAIN', RpgStat>;
  activeBuffs: ActiveBuff[];
  energyDrains: EnergyDrain[];
  microHabits: MicroHabitQuest[];
  overallResilienceIndex: number; // 0 to 100
}

export interface CandidateAssessmentResult {
  id: string;
  candidateName: string;
  specialty?: string;
  hospitalOrSchool?: string;
  submittedAt: string;
  answers: Record<number, { most: OptionKey; least: OptionKey }>;
  optionPointBreakdown: Record<string, number>; // "1_A": 2, "1_B": 1, etc.
  dimensionResults: DimensionResult[];
  domainResults: DomainResult[];
  redFlagAnalysis: RedFlagAnalysis;
  totalScore: number; // Always 28
  primaryDominantDomain: string;
  rpgProfile?: RpgProfile;
  candidateContextNote?: string; // Optional context note written by candidate for interviewers
  institutionalCarePlan?: string[]; // Action items selected by committee for resident care commitment
  committeeNotes?: string;
  committeeStatus?: 'UNREVIEWED' | 'SHORTLISTED' | 'NEEDS_INTERVIEW_PROBE' | 'APPROVED' | 'CONCERN';
  interviewerRating?: number; // 1 to 5
}

