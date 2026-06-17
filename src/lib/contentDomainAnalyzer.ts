import type { Question, Topic } from '../types';
import { OFFICIAL_SAT_DISTRIBUTION, READING_WRITING_DOMAINS, MATH_CONTENT_AREAS } from '../data/satSpecifications';

export interface ContentDomainStats {
  domain: Topic;
  count: number;
  percentage: number;
  targetPercentage: number;
  status: 'under' | 'aligned' | 'over';
}

export interface QuestionBankAnalysis {
  total: number;
  readingWriting: ContentDomainStats[];
  math: ContentDomainStats[];
  coverage: number; // 0-100, how well coverage matches official distribution
  gaps: string[];
  recommendations: string[];
}

export function analyzeQuestionBank(questions: Question[]): QuestionBankAnalysis {
  const rwQuestions = questions.filter(q => q.section === 'reading-writing');
  const mathQuestions = questions.filter(q => q.section === 'math');

  const rwStats = analyzeReadingWriting(rwQuestions);
  const mathStats = analyzeMath(mathQuestions);

  const coverage = calculateCoverage(rwStats, mathStats);
  const gaps = identifyGaps(rwStats, mathStats);
  const recommendations = generateRecommendations(rwStats, mathStats, gaps);

  return {
    total: questions.length,
    readingWriting: rwStats,
    math: mathStats,
    coverage,
    gaps,
    recommendations,
  };
}

function analyzeReadingWriting(questions: Question[]): ContentDomainStats[] {
  const domainCounts = new Map<Topic, number>();
  (READING_WRITING_DOMAINS as readonly Topic[]).forEach(domain => {
    domainCounts.set(domain, 0);
  });

  questions.forEach(q => {
    const count = domainCounts.get(q.topic) || 0;
    domainCounts.set(q.topic, count + 1);
  });

  return (READING_WRITING_DOMAINS as readonly Topic[]).map(domain => {
    const count = domainCounts.get(domain) || 0;
    const percentage = questions.length > 0 ? count / questions.length : 0;
    const targetPercentage =
      OFFICIAL_SAT_DISTRIBUTION.readingWriting.domains[domain as keyof typeof OFFICIAL_SAT_DISTRIBUTION.readingWriting.domains]?.target || 0;
    const tolerance = 0.03; // 3% tolerance from target

    let status: 'under' | 'aligned' | 'over' = 'aligned';
    if (percentage < targetPercentage - tolerance) status = 'under';
    if (percentage > targetPercentage + tolerance) status = 'over';

    return {
      domain,
      count,
      percentage,
      targetPercentage,
      status,
    };
  });
}

function analyzeMath(questions: Question[]): ContentDomainStats[] {
  const areaCounts = new Map<Topic, number>();
  (MATH_CONTENT_AREAS as readonly Topic[]).forEach(area => {
    areaCounts.set(area, 0);
  });

  questions.forEach(q => {
    const count = areaCounts.get(q.topic) || 0;
    areaCounts.set(q.topic, count + 1);
  });

  return (MATH_CONTENT_AREAS as readonly Topic[]).map(area => {
    const count = areaCounts.get(area) || 0;
    const percentage = questions.length > 0 ? count / questions.length : 0;
    const targetPercentage =
      OFFICIAL_SAT_DISTRIBUTION.math.contentAreas[area as keyof typeof OFFICIAL_SAT_DISTRIBUTION.math.contentAreas]?.target || 0;
    const tolerance = 0.03; // 3% tolerance

    let status: 'under' | 'aligned' | 'over' = 'aligned';
    if (percentage < targetPercentage - tolerance) status = 'under';
    if (percentage > targetPercentage + tolerance) status = 'over';

    return {
      domain: area,
      count,
      percentage,
      targetPercentage,
      status,
    };
  });
}

function calculateCoverage(
  rwStats: ContentDomainStats[],
  mathStats: ContentDomainStats[]
): number {
  const allStats = [...rwStats, ...mathStats];
  const aligned = allStats.filter(s => s.status === 'aligned').length;
  return Math.round((aligned / allStats.length) * 100);
}

function identifyGaps(
  rwStats: ContentDomainStats[],
  mathStats: ContentDomainStats[]
): string[] {
  const gaps: string[] = [];

  rwStats.forEach(stat => {
    if (stat.status === 'under') {
      gaps.push(
        `Reading & Writing: ${stat.domain} is ${(stat.targetPercentage - stat.percentage).toFixed(1)}% below target (${stat.count} questions, need ~${Math.ceil(stat.targetPercentage * 54)} total)`
      );
    }
  });

  mathStats.forEach(stat => {
    if (stat.status === 'under') {
      gaps.push(
        `Math: ${stat.domain} is ${(stat.targetPercentage - stat.percentage).toFixed(1)}% below target (${stat.count} questions, need ~${Math.ceil(stat.targetPercentage * 44)} total)`
      );
    }
  });

  return gaps;
}

function generateRecommendations(
  rwStats: ContentDomainStats[],
  mathStats: ContentDomainStats[],
  gaps: string[]
): string[] {
  const recommendations: string[] = [];

  if (gaps.length > 0) {
    recommendations.push(
      `Generate ${gaps.length} new question batches to fill content domain gaps`
    );
  }

  const rwUnder = rwStats.filter(s => s.status === 'under');
  rwUnder.forEach(stat => {
    const needed = Math.ceil(OFFICIAL_SAT_DISTRIBUTION.readingWriting.domains[stat.domain as keyof typeof OFFICIAL_SAT_DISTRIBUTION.readingWriting.domains].target * 54) - stat.count;
    recommendations.push(`Add ${needed} questions to ${stat.domain} (Reading & Writing)`);
  });

  const mathUnder = mathStats.filter(s => s.status === 'under');
  mathUnder.forEach(stat => {
    const needed = Math.ceil(OFFICIAL_SAT_DISTRIBUTION.math.contentAreas[stat.domain as keyof typeof OFFICIAL_SAT_DISTRIBUTION.math.contentAreas].target * 44) - stat.count;
    recommendations.push(`Add ${needed} questions to ${stat.domain} (Math)`);
  });

  if (recommendations.length === 0) {
    recommendations.push(
      'Question bank is well-aligned with official SAT distribution. Continue monitoring as questions are added.'
    );
  }

  return recommendations;
}

export function getContentDomainBalance(question: Question): { domain: string; percentage: number } | null {
  if (question.section === 'reading-writing' && READING_WRITING_DOMAINS.includes(question.topic as any)) {
    return {
      domain: question.topic,
      percentage: 1 / 4 * 100, // Each domain is ~25%
    };
  }

  if (question.section === 'math' && MATH_CONTENT_AREAS.includes(question.topic as any)) {
    const distribution =
      OFFICIAL_SAT_DISTRIBUTION.math.contentAreas[question.topic as keyof typeof OFFICIAL_SAT_DISTRIBUTION.math.contentAreas];
    return {
      domain: question.topic,
      percentage: distribution?.target || 0,
    };
  }

  return null;
}
