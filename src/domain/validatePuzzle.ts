import { normalizeAnswer } from './normalizeAnswer';
import {
  Confidence,
  GuessableSlot,
  MatchRecord,
  MatchScore,
  PlayerRecord,
  PuzzleRecord,
} from './puzzleTypes';

const PUZZLE_STATUSES = new Set(['draft', 'reviewed', 'published']);
const DIFFICULTIES = new Set(['easy', 'medium', 'hard']);
const TEAM_SIDES = new Set(['home', 'away']);
const MATCH_TYPES = new Set(['club', 'international']);
const CONFIDENCE_LEVELS = new Set(['high', 'medium', 'low']);
const ANSWER_ALIAS_TYPES = new Set([
  'fullName',
  'surname',
  'commonName',
  'shirtName',
  'unaccented',
  'transliteration',
  'other',
]);
const HINT_TYPES = new Set([
  'alsoPlayedFor',
  'nationality',
  'clubAtMatchTime',
  'firstName',
  'other',
]);
const SOURCE_TYPES = new Set([
  'official',
  'database',
  'matchReport',
  'archive',
  'book',
  'other',
]);

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface PuzzleValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  puzzle?: PuzzleRecord;
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function hasConfidence(value: unknown): value is Confidence {
  return typeof value === 'string' && CONFIDENCE_LEVELS.has(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateRequiredString(
  issues: ValidationIssue[],
  value: unknown,
  path: string,
): value is string {
  if (!isNonEmptyString(value)) {
    issues.push({ path, message: 'Expected a non-empty string.' });
    return false;
  }

  return true;
}

function validateDateString(
  issues: ValidationIssue[],
  value: unknown,
  path: string,
): value is string {
  if (!validateRequiredString(issues, value, path)) {
    return false;
  }

  if (!isIsoDate(value)) {
    issues.push({ path, message: 'Expected an ISO date in YYYY-MM-DD format.' });
    return false;
  }

  return true;
}

function validateSourceRefs(
  errors: ValidationIssue[],
  refs: unknown,
  sourceIds: Set<string>,
  path: string,
): refs is string[] {
  if (!isStringArray(refs) || refs.length === 0) {
    errors.push({ path, message: 'Expected a non-empty array of source IDs.' });
    return false;
  }

  refs.forEach((ref, index) => {
    if (!sourceIds.has(ref)) {
      errors.push({
        path: `${path}[${index}]`,
        message: `Unknown source reference "${ref}".`,
      });
    }
  });

  return true;
}

function validateScoreObject(
  errors: ValidationIssue[],
  value: unknown,
  path: string,
): value is MatchScore {
  if (!isRecord(value)) {
    errors.push({ path, message: 'Expected a score object.' });
    return false;
  }

  const sides = ['home', 'away'] as const;

  for (const side of sides) {
    if (!Number.isInteger(value[side]) || Number(value[side]) < 0) {
      errors.push({
        path: `${path}.${side}`,
        message: 'Expected a non-negative integer score.',
      });
    }
  }

  return true;
}

function validateHintStructure(
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  slot: GuessableSlot,
  player: PlayerRecord,
  match: MatchRecord,
  teamNames: string[],
  sourceIds: Set<string>,
  status: string,
): void {
  if (slot.hints.length !== 3) {
    errors.push({
      path: `guessableSlots.${slot.id}.hints`,
      message: 'Each slot must have exactly three hints.',
    });
    return;
  }

  const expectedSecondHint = match.matchType === 'club' ? 'nationality' : 'clubAtMatchTime';

  slot.hints.forEach((hint, index) => {
    const hintPath = `guessableSlots.${slot.id}.hints[${index}]`;

    if (!Number.isInteger(hint.order) || hint.order !== index + 1) {
      errors.push({
        path: `${hintPath}.order`,
        message: 'Hints must be ordered 1, 2, 3.',
      });
    }

    if (!HINT_TYPES.has(hint.type)) {
      errors.push({
        path: `${hintPath}.type`,
        message: `Unexpected hint type "${String(hint.type)}".`,
      });
    }

    if (!isNonEmptyString(hint.text)) {
      errors.push({
        path: `${hintPath}.text`,
        message: 'Hint text must be a non-empty string.',
      });
    }

    validateSourceRefs(errors, hint.sources, sourceIds, `${hintPath}.sources`);

    if (!hasConfidence(hint.confidence)) {
      errors.push({
        path: `${hintPath}.confidence`,
        message: 'Hint confidence must be high, medium, or low.',
      });
    } else if (hint.confidence === 'low') {
      warnings.push({
        path: `${hintPath}.confidence`,
        message: 'Low-confidence hints should be reviewed before publication.',
      });
    }
  });

  const [firstHint, secondHint, thirdHint] = slot.hints;

  if (firstHint.type !== 'alsoPlayedFor') {
    errors.push({
      path: `guessableSlots.${slot.id}.hints[0].type`,
      message: 'Hint 1 must be alsoPlayedFor.',
    });
  }

  if (secondHint.type !== expectedSecondHint) {
    errors.push({
      path: `guessableSlots.${slot.id}.hints[1].type`,
      message: `Hint 2 must be ${expectedSecondHint} for a ${match.matchType} match.`,
    });
  }

  if (thirdHint.type !== 'firstName') {
    errors.push({
      path: `guessableSlots.${slot.id}.hints[2].type`,
      message: 'Hint 3 must be firstName.',
    });
  }

  const visibleTeamNames = teamNames.map((name) => normalizeAnswer(name));
  const firstHintText = normalizeAnswer(firstHint.text);

  for (const teamName of visibleTeamNames) {
    if (teamName.length > 0 && firstHintText.includes(teamName)) {
      errors.push({
        path: `guessableSlots.${slot.id}.hints[0].text`,
        message: 'Hint 1 must not repeat either team from the visible puzzle context.',
      });
      break;
    }
  }

  const playerName = normalizeAnswer(player.displayName);

  slot.hints.forEach((hint, index) => {
    if (playerName.length > 0 && normalizeAnswer(hint.text).includes(playerName)) {
      errors.push({
        path: `guessableSlots.${slot.id}.hints[${index}].text`,
        message: 'Hints must not reveal the player display name.',
      });
    }
  });

  if (
    status === 'published' &&
    slot.hints.some((hint) => hint.confidence === 'low')
  ) {
    errors.push({
      path: `guessableSlots.${slot.id}.hints`,
      message: 'Published puzzles cannot ship with low-confidence hints.',
    });
  }
}

function validateAliasStructure(
  errors: ValidationIssue[],
  player: PlayerRecord,
  aliasUsage: Map<string, string>,
): void {
  if (player.answerAliases.length === 0) {
    errors.push({
      path: `players.${player.id}.answerAliases`,
      message: 'Each player needs at least one accepted alias.',
    });
    return;
  }

  const playerAliasSet = new Set<string>();

  player.answerAliases.forEach((alias, index) => {
    const aliasPath = `players.${player.id}.answerAliases[${index}]`;

    if (!isNonEmptyString(alias.value)) {
      errors.push({
        path: `${aliasPath}.value`,
        message: 'Alias value must be a non-empty string.',
      });
      return;
    }

    if (!ANSWER_ALIAS_TYPES.has(alias.type)) {
      errors.push({
        path: `${aliasPath}.type`,
        message: `Unexpected alias type "${String(alias.type)}".`,
      });
    }

    const normalized = normalizeAnswer(alias.value);

    if (normalized.length === 0) {
      errors.push({
        path: `${aliasPath}.value`,
        message: 'Alias must normalize to a non-empty value.',
      });
      return;
    }

    if (playerAliasSet.has(normalized)) {
      return;
    }

    playerAliasSet.add(normalized);

    const existingPlayerId = aliasUsage.get(normalized);

    if (existingPlayerId && existingPlayerId !== player.id) {
      errors.push({
        path: `${aliasPath}.value`,
        message: `Alias "${alias.value}" collides with player "${existingPlayerId}".`,
      });
      return;
    }

    aliasUsage.set(normalized, player.id);
  });

  if (!playerAliasSet.has(normalizeAnswer(player.displayName))) {
    errors.push({
      path: `players.${player.id}.answerAliases`,
      message: 'Accepted aliases must include the canonical display name.',
    });
  }
}

export function validatePuzzle(rawPuzzle: unknown): PuzzleValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (!isRecord(rawPuzzle)) {
    return {
      valid: false,
      errors: [{ path: 'puzzle', message: 'Puzzle must be a JSON object.' }],
      warnings,
    };
  }

  if (!validateRequiredString(errors, rawPuzzle.schemaVersion, 'schemaVersion')) {
    return { valid: false, errors, warnings };
  }

  validateRequiredString(errors, rawPuzzle.puzzleId, 'puzzleId');
  validateDateString(errors, rawPuzzle.publishDate, 'publishDate');

  if (!isNonEmptyString(rawPuzzle.status) || !PUZZLE_STATUSES.has(rawPuzzle.status)) {
    errors.push({
      path: 'status',
      message: 'Status must be draft, reviewed, or published.',
    });
  }

  if (
    rawPuzzle.difficulty !== undefined &&
    (!isNonEmptyString(rawPuzzle.difficulty) || !DIFFICULTIES.has(rawPuzzle.difficulty))
  ) {
    errors.push({
      path: 'difficulty',
      message: 'Difficulty must be easy, medium, or hard when present.',
    });
  }

  if (!Array.isArray(rawPuzzle.sources) || rawPuzzle.sources.length === 0) {
    errors.push({
      path: 'sources',
      message: 'Puzzle must include at least one source.',
    });
  }

  const sourceIds = new Set<string>();

  if (Array.isArray(rawPuzzle.sources)) {
    rawPuzzle.sources.forEach((source, index) => {
      const sourcePath = `sources[${index}]`;

      if (!isRecord(source)) {
        errors.push({ path: sourcePath, message: 'Each source must be an object.' });
        return;
      }

      if (!validateRequiredString(errors, source.id, `${sourcePath}.id`)) {
        return;
      }

      if (sourceIds.has(source.id)) {
        errors.push({
          path: `${sourcePath}.id`,
          message: `Duplicate source ID "${source.id}".`,
        });
      } else {
        sourceIds.add(source.id);
      }

      validateRequiredString(errors, source.title, `${sourcePath}.title`);
      validateRequiredString(errors, source.url, `${sourcePath}.url`);
      validateRequiredString(errors, source.publisher, `${sourcePath}.publisher`);
      validateDateString(errors, source.accessedDate, `${sourcePath}.accessedDate`);

      if (
        source.publishedDate !== undefined &&
        !validateDateString(errors, source.publishedDate, `${sourcePath}.publishedDate`)
      ) {
        return;
      }

      if (!isNonEmptyString(source.sourceType) || !SOURCE_TYPES.has(source.sourceType)) {
        errors.push({
          path: `${sourcePath}.sourceType`,
          message: 'Unexpected source type.',
        });
      }

      if (!hasConfidence(source.confidence)) {
        errors.push({
          path: `${sourcePath}.confidence`,
          message: 'Source confidence must be high, medium, or low.',
        });
      }
    });
  }

  if (!isRecord(rawPuzzle.match)) {
    errors.push({ path: 'match', message: 'Match must be an object.' });
  }

  if (!Array.isArray(rawPuzzle.teams)) {
    errors.push({ path: 'teams', message: 'Teams must be an array.' });
  }

  if (!Array.isArray(rawPuzzle.players)) {
    errors.push({ path: 'players', message: 'Players must be an array.' });
  }

  if (!Array.isArray(rawPuzzle.lineups)) {
    errors.push({ path: 'lineups', message: 'Lineups must be an array.' });
  }

  if (!Array.isArray(rawPuzzle.guessableSlots)) {
    errors.push({
      path: 'guessableSlots',
      message: 'Guessable slots must be an array.',
    });
  }

  if (
    errors.some((issue) =>
      ['match', 'teams', 'players', 'lineups', 'guessableSlots'].includes(issue.path),
    )
  ) {
    return { valid: false, errors, warnings };
  }

  const puzzle = rawPuzzle as unknown as PuzzleRecord;
  const teamIds = new Set<string>();
  const playerIds = new Set<string>();
  const lineupIds = new Set<string>();
  const guessableIds = new Set<string>();
  const aliasUsage = new Map<string, string>();
  const startersPerTeam = new Map<string, number>();
  const lineupEntriesById = new Map<string, PuzzleRecord['lineups'][number]>();
  const playersById = new Map<string, PuzzleRecord['players'][number]>();

  if (puzzle.teams.length !== 2) {
    errors.push({ path: 'teams', message: 'Puzzle must contain exactly two teams.' });
  }

  puzzle.teams.forEach((team, index) => {
    const teamPath = `teams[${index}]`;

    validateRequiredString(errors, team.id, `${teamPath}.id`);
    validateRequiredString(errors, team.name, `${teamPath}.name`);

    if (!TEAM_SIDES.has(team.side)) {
      errors.push({
        path: `${teamPath}.side`,
        message: 'Team side must be home or away.',
      });
    }

    validateSourceRefs(errors, team.sources, sourceIds, `${teamPath}.sources`);

    if (!hasConfidence(team.confidence)) {
      errors.push({
        path: `${teamPath}.confidence`,
        message: 'Team confidence must be high, medium, or low.',
      });
    } else if (team.confidence === 'low' && puzzle.status === 'published') {
      errors.push({
        path: `${teamPath}.confidence`,
        message: 'Published puzzles cannot ship with low-confidence teams.',
      });
    }

    if (teamIds.has(team.id)) {
      errors.push({
        path: `${teamPath}.id`,
        message: `Duplicate team ID "${team.id}".`,
      });
    } else {
      teamIds.add(team.id);
    }
  });

  if (
    puzzle.teams.filter((team) => team.side === 'home').length !== 1 ||
    puzzle.teams.filter((team) => team.side === 'away').length !== 1
  ) {
    errors.push({
      path: 'teams',
      message: 'Teams must include exactly one home side and one away side.',
    });
  }

  const match = puzzle.match;
  validateRequiredString(errors, match.id, 'match.id');
  validateDateString(errors, match.date, 'match.date');
  validateRequiredString(errors, match.competition, 'match.competition');

  if (!MATCH_TYPES.has(match.matchType)) {
    errors.push({
      path: 'match.matchType',
      message: 'Match type must be club or international.',
    });
  }

  validateRequiredString(errors, match.homeTeamId, 'match.homeTeamId');
  validateRequiredString(errors, match.awayTeamId, 'match.awayTeamId');
  validateSourceRefs(errors, match.sources, sourceIds, 'match.sources');

  if (!hasConfidence(match.confidence)) {
    errors.push({
      path: 'match.confidence',
      message: 'Match confidence must be high, medium, or low.',
    });
  } else if (match.confidence === 'low' && puzzle.status === 'published') {
    errors.push({
      path: 'match.confidence',
      message: 'Published puzzles cannot ship with low-confidence match metadata.',
    });
  }

  validateScoreObject(errors, match.score, 'match.score');

  if (match.penalties !== undefined) {
    validateScoreObject(errors, match.penalties, 'match.penalties');
  }

  if (!teamIds.has(match.homeTeamId)) {
    errors.push({
      path: 'match.homeTeamId',
      message: 'Match homeTeamId must reference one of the teams.',
    });
  }

  if (!teamIds.has(match.awayTeamId)) {
    errors.push({
      path: 'match.awayTeamId',
      message: 'Match awayTeamId must reference one of the teams.',
    });
  }

  if (match.homeTeamId === match.awayTeamId) {
    errors.push({
      path: 'match',
      message: 'homeTeamId and awayTeamId must be different.',
    });
  }

  puzzle.players.forEach((player, index) => {
    const playerPath = `players[${index}]`;

    validateRequiredString(errors, player.id, `${playerPath}.id`);
    validateRequiredString(errors, player.displayName, `${playerPath}.displayName`);
    validateSourceRefs(errors, player.sources, sourceIds, `${playerPath}.sources`);

    if (!hasConfidence(player.confidence)) {
      errors.push({
        path: `${playerPath}.confidence`,
        message: 'Player confidence must be high, medium, or low.',
      });
    } else if (player.confidence === 'low' && puzzle.status === 'published') {
      errors.push({
        path: `${playerPath}.confidence`,
        message: 'Published puzzles cannot ship with low-confidence players.',
      });
    }

    if (playerIds.has(player.id)) {
      errors.push({
        path: `${playerPath}.id`,
        message: `Duplicate player ID "${player.id}".`,
      });
    } else {
      playerIds.add(player.id);
      playersById.set(player.id, player);
    }

    validateAliasStructure(errors, player, aliasUsage);
  });

  if (puzzle.players.length < 22) {
    errors.push({
      path: 'players',
      message: 'Puzzle must include player records for all 22 starters.',
    });
  }

  puzzle.lineups.forEach((lineup, index) => {
    const lineupPath = `lineups[${index}]`;

    validateRequiredString(errors, lineup.id, `${lineupPath}.id`);

    if (lineupIds.has(lineup.id)) {
      errors.push({
        path: `${lineupPath}.id`,
        message: `Duplicate lineup ID "${lineup.id}".`,
      });
    } else {
      lineupIds.add(lineup.id);
      lineupEntriesById.set(lineup.id, lineup);
    }

    if (!teamIds.has(lineup.teamId)) {
      errors.push({
        path: `${lineupPath}.teamId`,
        message: `Unknown team "${lineup.teamId}" in lineup entry.`,
      });
    }

    if (!playerIds.has(lineup.playerId)) {
      errors.push({
        path: `${lineupPath}.playerId`,
        message: `Unknown player "${lineup.playerId}" in lineup entry.`,
      });
    }

    if (lineup.role !== 'starter') {
      errors.push({
        path: `${lineupPath}.role`,
        message: 'Every lineup entry must be a starter in the first prototype.',
      });
    }

    if (!Number.isInteger(lineup.displayOrder) || lineup.displayOrder < 1 || lineup.displayOrder > 11) {
      errors.push({
        path: `${lineupPath}.displayOrder`,
        message: 'displayOrder must be an integer from 1 to 11 within each team.',
      });
    }

    validateSourceRefs(errors, lineup.sources, sourceIds, `${lineupPath}.sources`);

    if (!hasConfidence(lineup.confidence)) {
      errors.push({
        path: `${lineupPath}.confidence`,
        message: 'Lineup confidence must be high, medium, or low.',
      });
    } else if (lineup.confidence === 'low' && puzzle.status === 'published') {
      errors.push({
        path: `${lineupPath}.confidence`,
        message: 'Published puzzles cannot ship with low-confidence lineup entries.',
      });
    }

    startersPerTeam.set(lineup.teamId, (startersPerTeam.get(lineup.teamId) ?? 0) + 1);
  });

  if (puzzle.lineups.length !== 22) {
    errors.push({
      path: 'lineups',
      message: 'Puzzle must contain exactly 22 lineup entries.',
    });
  }

  for (const team of puzzle.teams) {
    if ((startersPerTeam.get(team.id) ?? 0) !== 11) {
      errors.push({
        path: 'lineups',
        message: `Team "${team.id}" must have exactly 11 starters.`,
      });
    }

    const displayOrders = puzzle.lineups
      .filter((lineup) => lineup.teamId === team.id)
      .map((lineup) => lineup.displayOrder)
      .sort((left, right) => left - right);

    const expectedOrders = Array.from({ length: displayOrders.length }, (_, entry) => entry + 1);
    const hasCompleteOrderRange =
      displayOrders.length === expectedOrders.length &&
      displayOrders.every((value, orderIndex) => value === expectedOrders[orderIndex]);

    if (!hasCompleteOrderRange) {
      errors.push({
        path: 'lineups',
        message: `Team "${team.id}" must use each display order from 1 to 11 exactly once.`,
      });
    }
  }

  const usedPlayerIds = new Set<string>();

  puzzle.lineups.forEach((lineup) => {
    if (usedPlayerIds.has(lineup.playerId)) {
      errors.push({
        path: `lineups.${lineup.id}.playerId`,
        message: `Player "${lineup.playerId}" appears in more than one lineup slot.`,
      });
    } else {
      usedPlayerIds.add(lineup.playerId);
    }
  });

  if (usedPlayerIds.size !== 22) {
    errors.push({
      path: 'lineups',
      message: 'Lineups must reference 22 unique players.',
    });
  }

  const slotsPerLineup = new Map<string, number>();

  puzzle.guessableSlots.forEach((slot, index) => {
    const slotPath = `guessableSlots[${index}]`;

    validateRequiredString(errors, slot.id, `${slotPath}.id`);

    if (guessableIds.has(slot.id)) {
      errors.push({
        path: `${slotPath}.id`,
        message: `Duplicate guessable slot ID "${slot.id}".`,
      });
    } else {
      guessableIds.add(slot.id);
    }

    if (!lineupEntriesById.has(slot.lineupEntryId)) {
      errors.push({
        path: `${slotPath}.lineupEntryId`,
        message: `Unknown lineup entry "${slot.lineupEntryId}".`,
      });
    }

    if (!playerIds.has(slot.playerId)) {
      errors.push({
        path: `${slotPath}.playerId`,
        message: `Unknown player "${slot.playerId}".`,
      });
    }

    if (slot.hiddenAtLaunch !== true) {
      errors.push({
        path: `${slotPath}.hiddenAtLaunch`,
        message: 'Every guessable slot must be hidden at launch in the prototype.',
      });
    }

    if (!Array.isArray(slot.hints)) {
      errors.push({
        path: `${slotPath}.hints`,
        message: 'Each guessable slot must include a hints array.',
      });
      return;
    }

    const lineupEntry = lineupEntriesById.get(slot.lineupEntryId);

    if (lineupEntry && lineupEntry.playerId !== slot.playerId) {
      errors.push({
        path: `${slotPath}`,
        message: 'Guessable slot playerId must match its lineup entry playerId.',
      });
    }

    slotsPerLineup.set(slot.lineupEntryId, (slotsPerLineup.get(slot.lineupEntryId) ?? 0) + 1);

    const player = playersById.get(slot.playerId);

    if (player) {
      validateHintStructure(
        errors,
        warnings,
        slot,
        player,
        match,
        puzzle.teams.map((team) => team.name),
        sourceIds,
        puzzle.status,
      );
    }
  });

  if (puzzle.guessableSlots.length !== 22) {
    errors.push({
      path: 'guessableSlots',
      message: 'Puzzle must contain exactly 22 guessable slots.',
    });
  }

  puzzle.lineups.forEach((lineup) => {
    if ((slotsPerLineup.get(lineup.id) ?? 0) !== 1) {
      errors.push({
        path: `lineups.${lineup.id}`,
        message: 'Every starter must have exactly one matching guessable slot.',
      });
    }
  });

  for (const player of puzzle.players) {
    if (!usedPlayerIds.has(player.id)) {
      warnings.push({
        path: `players.${player.id}`,
        message: 'Player is not referenced by the current starting lineup.',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    puzzle: errors.length === 0 ? puzzle : undefined,
  };
}
