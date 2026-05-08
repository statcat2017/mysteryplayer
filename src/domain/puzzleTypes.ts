export type PuzzleStatus = 'draft' | 'reviewed' | 'published';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type MatchType = 'club' | 'international';
export type TeamSide = 'home' | 'away';
export type Confidence = 'high' | 'medium' | 'low';
export type AnswerAliasType =
  | 'fullName'
  | 'surname'
  | 'commonName'
  | 'shirtName'
  | 'unaccented'
  | 'transliteration'
  | 'other';
export type HintType =
  | 'alsoPlayedFor'
  | 'nationality'
  | 'clubAtMatchTime'
  | 'firstName'
  | 'other';
export type SourceType =
  | 'official'
  | 'database'
  | 'matchReport'
  | 'archive'
  | 'book'
  | 'other';

export interface ReviewMetadata {
  reviewer?: string;
  reviewedDate?: string;
  notes?: string;
}

export interface MatchScore {
  home: number;
  away: number;
}

export interface SourceReference {
  id: string;
  title: string;
  url: string;
  publisher: string;
  accessedDate: string;
  sourceType: SourceType;
  confidence: Confidence;
  publishedDate?: string;
  notes?: string;
}

export interface AnswerAlias {
  value: string;
  type: AnswerAliasType;
  locale?: string;
  notes?: string;
}

export interface Hint {
  order: number;
  type: HintType;
  text: string;
  sources: string[];
  confidence: Confidence;
  penaltyPoints?: number;
  notes?: string;
}

export interface PlayerRecord {
  id: string;
  displayName: string;
  answerAliases: AnswerAlias[];
  sources: string[];
  confidence: Confidence;
  fullName?: string;
  shirtName?: string;
  nationality?: string;
  clubAtMatchTime?: string;
  dateOfBirth?: string;
  notes?: string;
}

export interface TeamRecord {
  id: string;
  name: string;
  side: TeamSide;
  sources: string[];
  confidence: Confidence;
  shortName?: string;
  country?: string;
  crestKey?: string;
  manager?: string;
}

export interface MatchRecord {
  id: string;
  date: string;
  competition: string;
  matchType: MatchType;
  homeTeamId: string;
  awayTeamId: string;
  score: MatchScore;
  sources: string[];
  confidence: Confidence;
  stage?: string;
  venue?: string;
  city?: string;
  country?: string;
  attendance?: number;
  extraTime?: boolean;
  penalties?: MatchScore;
  context?: string;
  notes?: string;
}

export interface LineupEntry {
  id: string;
  teamId: string;
  playerId: string;
  role: 'starter';
  displayOrder: number;
  sources: string[];
  confidence: Confidence;
  shirtNumber?: number;
  positionLabel?: string;
  lineupGroup?: string;
  formationSlot?: string;
  captain?: boolean;
  notes?: string;
}

export interface GuessableSlot {
  id: string;
  lineupEntryId: string;
  playerId: string;
  hiddenAtLaunch: true;
  hints: Hint[];
  scoring?: Record<string, unknown>;
  difficultyNotes?: string;
}

export interface PuzzleRecord {
  schemaVersion: string;
  puzzleId: string;
  publishDate: string;
  status: PuzzleStatus;
  match: MatchRecord;
  teams: TeamRecord[];
  players: PlayerRecord[];
  lineups: LineupEntry[];
  guessableSlots: GuessableSlot[];
  sources: SourceReference[];
  puzzleNumber?: number;
  difficulty?: Difficulty;
  editorNotes?: string;
  review?: ReviewMetadata;
}

export interface PuzzleSeedFile {
  sourcePath: string;
  rawPuzzle: unknown;
  puzzleId?: string;
  publishDate?: string;
  status?: string;
}
