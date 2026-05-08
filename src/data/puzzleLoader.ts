import { PuzzleSeedFile } from '../domain/puzzleTypes';

const rawPuzzleModules = import.meta.glob('../../data/puzzles/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

function readMetadata(rawPuzzle: unknown): Pick<PuzzleSeedFile, 'puzzleId' | 'publishDate' | 'status'> {
  if (typeof rawPuzzle !== 'object' || rawPuzzle === null || Array.isArray(rawPuzzle)) {
    return {};
  }

  const record = rawPuzzle as Record<string, unknown>;

  return {
    puzzleId: typeof record.puzzleId === 'string' ? record.puzzleId : undefined,
    publishDate: typeof record.publishDate === 'string' ? record.publishDate : undefined,
    status: typeof record.status === 'string' ? record.status : undefined,
  };
}

export function formatLocalPuzzleDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function loadPuzzleSeeds(): PuzzleSeedFile[] {
  return Object.entries(rawPuzzleModules)
    .map(([sourcePath, rawPuzzle]) => ({
      sourcePath,
      rawPuzzle,
      ...readMetadata(rawPuzzle),
    }))
    .sort((left, right) => (left.publishDate ?? '').localeCompare(right.publishDate ?? ''));
}

export function selectPuzzleSeedForDate(
  date: Date,
  seeds: PuzzleSeedFile[] = loadPuzzleSeeds(),
): PuzzleSeedFile | undefined {
  const targetDate = formatLocalPuzzleDate(date);
  const exactMatch = seeds.find((seed) => seed.publishDate === targetDate);

  if (exactMatch) {
    return exactMatch;
  }

  const publishedSeeds = seeds.filter((seed) => seed.status === 'published');

  if (publishedSeeds.length > 0) {
    return publishedSeeds[publishedSeeds.length - 1];
  }

  return seeds[seeds.length - 1];
}
