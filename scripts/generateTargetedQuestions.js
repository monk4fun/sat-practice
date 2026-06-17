/**
 * Batch generation script for targeted SAT questions
 * Run: node scripts/generateTargetedQuestions.js
 *
 * Generates 410 high-quality SAT questions tailored to San's weak areas:
 * - Information & Ideas (R&W - 26% of section)
 * - Standard English Conventions (R&W - 26% of section)
 * - Problem-Solving & Data Analysis (Math - 15% of section)
 */

const fs = require('fs');
const path = require('path');

const CLAUDE_API_KEY = process.env.VITE_CLAUDE_API_KEY;

if (!CLAUDE_API_KEY) {
  console.error(
    '❌ Error: VITE_CLAUDE_API_KEY environment variable not set\n' +
    'Please set it before running: export VITE_CLAUDE_API_KEY="sk-ant-..."\n'
  );
  process.exit(1);
}

// Generation plan (from batchGenerateTargeted.ts)
const GENERATION_PLAN = [
  // PRIORITY 1: Information & Ideas (weakest R&W, 26% of section)
  { topic: 'information-and-ideas', difficulty: 'easy', count: 50 },
  { topic: 'information-and-ideas', difficulty: 'medium', count: 75 },
  { topic: 'information-and-ideas', difficulty: 'hard', count: 50 },

  // PRIORITY 1: Standard English Conventions (weakest R&W, 26% of section)
  { topic: 'standard-english-conventions', difficulty: 'easy', count: 50 },
  { topic: 'standard-english-conventions', difficulty: 'medium', count: 75 },
  { topic: 'standard-english-conventions', difficulty: 'hard', count: 50 },

  // PRIORITY 2: Problem-Solving & Data Analysis (weak Math, 15% of section)
  { topic: 'problem-solving-data-analysis', difficulty: 'easy', count: 30 },
  { topic: 'problem-solving-data-analysis', difficulty: 'medium', count: 45 },
  { topic: 'problem-solving-data-analysis', difficulty: 'hard', count: 25 },

  // PRIORITY 3: Average R&W subareas (maintain)
  { topic: 'craft-and-structure', difficulty: 'easy', count: 20 },
  { topic: 'craft-and-structure', difficulty: 'medium', count: 30 },
  { topic: 'craft-and-structure', difficulty: 'hard', count: 20 },
  { topic: 'expression-of-ideas', difficulty: 'easy', count: 20 },
  { topic: 'expression-of-ideas', difficulty: 'medium', count: 30 },
  { topic: 'expression-of-ideas', difficulty: 'hard', count: 20 },

  // PRIORITY 4: Strong math areas (medium/hard only, no easy)
  { topic: 'algebra', difficulty: 'medium', count: 20 },
  { topic: 'algebra', difficulty: 'hard', count: 20 },
  { topic: 'advanced-math', difficulty: 'medium', count: 20 },
  { topic: 'advanced-math', difficulty: 'hard', count: 20 },
  { topic: 'geometry-trigonometry', difficulty: 'medium', count: 20 },
  { topic: 'geometry-trigonometry', difficulty: 'hard', count: 20 },
];

const PROMPTS = {
  'information-and-ideas': (count, difficulty) => `Generate ${count} HIGH-QUALITY SAT Reading Comprehension questions for "Information & Ideas" at ${difficulty} difficulty.

Student profile: Scored 420-480 on this domain (needs improvement). These questions must test:
1. Main idea and central purpose of passages
2. Supporting details and evidence
3. Textual inference and implication
4. Author's intent and tone nuance

Passages MUST be:
- 25-150 words (authentic SAT length)
- Grade 11-12 appropriate (literature, history, science)
- Clear but require careful reading
- Include subtle wrong answers

DISTRACTORS must reflect COMMON STUDENT ERRORS:
- Partially true but incomplete answers
- Misreading scope of question
- Confusing author's tone with content
- Selecting answers from wrong section
- Over-generalizing specific details

Return ONLY valid JSON array (no markdown, no code blocks):
[{"id":"gen-info-ideas","section":"reading-writing","topic":"information-and-ideas","difficulty":"${difficulty}","stimulus":"passage text","stem":"question","choices":[{"id":"A","text":"answer A"},{"id":"B","text":"answer B"},{"id":"C","text":"answer C"},{"id":"D","text":"answer D"}],"correctAnswer":"A","explanation":"why A correct and why others wrong"}]`,

  'standard-english-conventions': (count, difficulty) =>
    `Generate ${count} HIGH-QUALITY SAT Grammar questions for "Standard English Conventions" at ${difficulty} difficulty.

Student profile: Scored 420-480 (needs improvement). Test:
1. Subject-verb agreement and pronoun usage
2. Comma placement and punctuation
3. Verb tense consistency and parallelism
4. Modifier placement and fragments
5. Clause relationships and conjunctions

Format: Sentence with underlined section, 4 options (A=original, B/C/D=corrections)

DISTRACTORS reflect COMMON ERRORS:
- Incorrect pronouns
- Wrong tense or agreement
- Over-correcting
- Breaking parallelism
- Creating comma splices

Return ONLY valid JSON array (no markdown):
[{"id":"gen-conv","section":"reading-writing","topic":"standard-english-conventions","difficulty":"${difficulty}","stem":"Sentence with [A) option / B) option / C) option / D) option]","choices":[{"id":"A","text":"A"},{"id":"B","text":"B"},{"id":"C","text":"C"},{"id":"D","text":"D"}],"correctAnswer":"A","explanation":"explanation"}]`,

  'problem-solving-data-analysis': (count, difficulty) =>
    `Generate ${count} HIGH-QUALITY SAT Math questions for "Problem-Solving & Data Analysis" at ${difficulty} difficulty.

Student profile: Scored 550-600 (weak area). Test:
1. Percentages, ratios, proportions
2. Statistical reasoning (mean, median, mode)
3. Data interpretation from tables/graphs
4. Probability and experimental design
5. Unit conversions and dimensional analysis
6. Linear and quadratic relationships

Include: Real-world context, some with graphs/tables, reading + math

DISTRACTORS reflect COMMON ERRORS:
- Misreading graph scales
- Forgetting units
- Wrong data set from table
- Computational errors
- Off-by-one or percentage misinterpretation
- Inverting fractions

Return ONLY valid JSON array (no markdown):
[{"id":"gen-psda","section":"math","topic":"problem-solving-data-analysis","difficulty":"${difficulty}","stem":"problem text","choices":[{"id":"A","text":"answer"},{"id":"B","text":"answer"},{"id":"C","text":"answer"},{"id":"D","text":"answer"}],"correctAnswer":"A","explanation":"explanation"}]`,

  'craft-and-structure': (count, difficulty) =>
    `Generate ${count} SAT "Craft & Structure" questions at ${difficulty} difficulty.
Student performing adequately (550-600). Maintain skills: Author's word choice, tone, text structure, rhetoric.
Return ONLY valid JSON array: [{"id":"gen-craft","section":"reading-writing","topic":"craft-and-structure","difficulty":"${difficulty}","stimulus":"passage","stem":"question","choices":[...],"correctAnswer":"A","explanation":"..."}]`,

  'expression-of-ideas': (count, difficulty) =>
    `Generate ${count} SAT "Expression of Ideas" questions at ${difficulty} difficulty.
Student performing adequately (550-600). Maintain skills: Clarity, concision, coherence, style.
Return ONLY valid JSON array: [{"id":"gen-expr","section":"reading-writing","topic":"expression-of-ideas","difficulty":"${difficulty}","stem":"question","choices":[...],"correctAnswer":"A","explanation":"..."}]`,

  'algebra': (count, difficulty) =>
    `Generate ${count} SAT Algebra questions at ${difficulty} difficulty.
Student is strong (680-800). Generate maintenance: Linear equations, systems, functions, transformations.
Return ONLY valid JSON array: [{"id":"gen-alg","section":"math","topic":"algebra","difficulty":"${difficulty}","stem":"question","choices":[...],"correctAnswer":"A","explanation":"..."}]`,

  'advanced-math': (count, difficulty) =>
    `Generate ${count} SAT Advanced Math questions at ${difficulty} difficulty.
Student is strong (680-800). Generate maintenance: Quadratics, exponentials, polynomials, complex numbers.
Return ONLY valid JSON array: [{"id":"gen-adv","section":"math","topic":"advanced-math","difficulty":"${difficulty}","stem":"question","choices":[...],"correctAnswer":"A","explanation":"..."}]`,

  'geometry-trigonometry': (count, difficulty) =>
    `Generate ${count} SAT Geometry/Trigonometry questions at ${difficulty} difficulty.
Student is strong (680-800). Generate maintenance: Right triangles, trig, coordinate geometry, circles, area/volume.
Return ONLY valid JSON array: [{"id":"gen-geo","section":"math","topic":"geometry-trigonometry","difficulty":"${difficulty}","stem":"question","choices":[...],"correctAnswer":"A","explanation":"..."}]`,
};

async function generateBatch(topic, difficulty, count) {
  const prompt = PROMPTS[topic](count, difficulty);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0]?.text || '';

  // Parse JSON
  let json = text.trim();
  if (json.startsWith('```json')) json = json.slice(7);
  if (json.startsWith('```')) json = json.slice(3);
  if (json.endsWith('```')) json = json.slice(0, -3);
  json = json.trim();

  const parsed = JSON.parse(json);
  const questions = Array.isArray(parsed) ? parsed : [parsed];

  // Validate and transform
  return questions
    .filter((q) => q.stem && q.choices?.length === 4 && q.correctAnswer)
    .map((q, i) => ({
      id: `targeted-${topic}-${difficulty}-${Date.now()}-${i}`,
      section: q.section || (topic.startsWith('algebra') || topic.includes('math') ? 'math' : 'reading-writing'),
      topic: q.topic || topic,
      difficulty: q.difficulty || difficulty,
      stem: q.stem,
      stimulus: q.stimulus,
      choices: q.choices,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      qualityScore: 5,
      source: 'ai-targeted',
    }));
}

async function main() {
  console.log('🚀 Starting generation of 410 targeted SAT questions...\n');

  const allQuestions = [];
  let totalGenerated = 0;
  let totalFailed = 0;

  // Group by priority
  const byPriority = new Map();
  GENERATION_PLAN.forEach((item, idx) => {
    const priority = idx < 6 ? 1 : idx < 9 ? 2 : idx < 15 ? 3 : 4;
    if (!byPriority.has(priority)) byPriority.set(priority, []);
    byPriority.get(priority).push(item);
  });

  // Generate
  for (const [priority, items] of byPriority) {
    console.log(
      `\n📊 Priority ${priority} (${items.length} batches)`
    );

    for (const { topic, difficulty, count } of items) {
      try {
        console.log(
          `  Generating ${count.toString().padStart(2)} ${difficulty.padEnd(6)} ${topic.padEnd(35)}...`
        );
        const questions = await generateBatch(topic, difficulty, count);

        if (questions.length > 0) {
          allQuestions.push(...questions);
          totalGenerated += questions.length;
          console.log(`    ✓ ${questions.length} questions`);
        } else {
          totalFailed++;
          console.log(`    ✗ No questions parsed`);
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (error) {
        totalFailed++;
        console.log(`    ✗ Error: ${error.message}`);
      }
    }
  }

  console.log(`\n✅ Generation complete!`);
  console.log(`   Total generated: ${totalGenerated} questions`);
  console.log(`   Failed batches: ${totalFailed}`);

  // Save to file
  if (allQuestions.length > 0) {
    const outputPath = path.join(__dirname, '../public/generated-questions.json');
    fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2));
    console.log(`\n💾 Saved to public/generated-questions.json`);
    console.log(`   Next: Import these into the app via the admin panel`);
  }

  return allQuestions;
}

main().catch(console.error);
