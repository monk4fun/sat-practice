import type { Question, Topic, Difficulty } from '../types';

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;

/**
 * Generates highly targeted SAT questions for specific weak areas
 * Optimized for maximum score improvement
 */
export async function generateTargetedQuestions(
  topic: Topic,
  difficulty: Difficulty,
  count: number
): Promise<Question[]> {
  if (!CLAUDE_API_KEY) {
    console.error('Claude API key not configured');
    return [];
  }

  try {
    const prompt = buildTargetedPrompt(topic, difficulty, count);

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
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Claude API error:', response.status);
      return [];
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';

    return parseGeneratedQuestions(content, topic, difficulty);
  } catch (error) {
    console.error('Targeted question generation failed:', error);
    return [];
  }
}

function buildTargetedPrompt(topic: Topic, difficulty: Difficulty, count: number): string {
  // Specialized prompts for weak areas based on real SAT performance data
  const prompts: Record<Topic, string> = {
    'information-and-ideas': `Generate ${count} HIGH-QUALITY SAT Reading Comprehension questions for the "Information & Ideas" domain.

CRITICAL: Student struggled here (420-480 range). Generate questions that test:
1. Main idea and central purpose of passages
2. Supporting details and evidence
3. Textual inference and implication
4. Author's intent and tone nuance

Passages MUST be:
- 25-150 words (authentic SAT length)
- Grade 11-12 appropriate (literature, history/social studies, science)
- Clear but require careful reading (not obvious answers)
- Include subtle wrong answers that misinterpret or oversimplify

DISTRACTORS must reflect COMMON STUDENT ERRORS:
- Choosing partially true but incomplete answers
- Misreading the scope of the question
- Confusing author's tone with content
- Selecting answers from the wrong paragraph
- Over-generalizing specific details

RETURN ONLY valid JSON array (no markdown):
[
  {
    "id": "gen-info-ideas-${difficulty}-N",
    "section": "reading-writing",
    "topic": "information-and-ideas",
    "difficulty": "${difficulty}",
    "stimulus": "25-150 word passage",
    "stem": "question about main idea, details, or inference",
    "choices": [
      {"id": "A", "text": "correct answer with clear basis in text"},
      {"id": "B", "text": "common distractor - partially true but incomplete"},
      {"id": "C", "text": "common distractor - misinterprets or oversimplifies"},
      {"id": "D", "text": "common distractor - from wrong section or too literal"}
    ],
    "correctAnswer": "A",
    "explanation": "Why A is correct and why B/C/D fail"
  }
]`,

    'standard-english-conventions': `Generate ${count} HIGH-QUALITY SAT Grammar questions for "Standard English Conventions" domain.

CRITICAL: Student struggled here (420-480 range). Generate questions testing:
1. Subject-verb agreement and pronoun usage
2. Comma placement and punctuation rules
3. Verb tense consistency and parallelism
4. Modifier placement and sentence fragments
5. Clause relationships and conjunctions

Question FORMAT:
- Sentence has ONE underlined section with 4 options (A-D)
- A is ALWAYS the original text (no change option)
- B/C/D are different corrections
- Multiple choice: select the BEST version

DISTRACTORS must reflect COMMON ERRORS:
- Changing to incorrect pronoun reference
- Wrong verb tense or agreement
- Over-correcting with unnecessary changes
- Breaking parallel structure
- Creating comma splices or fragments

RETURN ONLY valid JSON array (no markdown):
[
  {
    "id": "gen-conventions-${difficulty}-N",
    "section": "reading-writing",
    "topic": "standard-english-conventions",
    "difficulty": "${difficulty}",
    "stem": "The students [A) is / B) are / C) will be / D) being] ready for the exam.",
    "choices": [
      {"id": "A", "text": "is"},
      {"id": "B", "text": "are"},
      {"id": "C", "text": "will be"},
      {"id": "D", "text": "being"}
    ],
    "correctAnswer": "B",
    "explanation": "'Students' is plural, requiring plural verb 'are'. Option A (is) disagrees. C/D change tense/form incorrectly."
  }
]`,

    'problem-solving-data-analysis': `Generate ${count} HIGH-QUALITY SAT Math questions for "Problem-Solving & Data Analysis" domain.

CRITICAL: Student struggled here (550-600 range). Generate questions testing:
1. Percentages, ratios, and proportional relationships
2. Statistical reasoning (mean, median, mode, standard deviation)
3. Data interpretation from tables, graphs, and charts
4. Probability and experimental design
5. Unit conversions and dimensional analysis
6. Linear and quadratic relationships in context

Question STYLE:
- Real-world context (budget, science, population data)
- Some include graphs, tables, or visual data
- Require reading comprehension + math
- Multiple steps to solution

DISTRACTORS must reflect COMMON ERRORS:
- Misreading the scale or axis on graphs
- Forgetting units in calculations
- Using the wrong data set from table
- Computational errors (order of operations)
- Off-by-one or percentage misinterpretation
- Inverting the ratio or fraction

RETURN ONLY valid JSON array (no markdown):
[
  {
    "id": "gen-psda-${difficulty}-N",
    "section": "math",
    "topic": "problem-solving-data-analysis",
    "difficulty": "${difficulty}",
    "stem": "A store sells 200 items per week. If demand increases by 15%, how many items will be sold per week?",
    "choices": [
      {"id": "A", "text": "215"},
      {"id": "B", "text": "230"},
      {"id": "C", "text": "230"},
      {"id": "D", "text": "330"}
    ],
    "correctAnswer": "B",
    "explanation": "15% of 200 = 30. New total = 200 + 30 = 230. Common error: choosing 215 (adding 15 instead of 15%). Choosing 330 = multiplying by 1.65."
  }
]`,

    // For strong areas, generate lighter questions (easier)
    'algebra': `Generate ${count} SAT Algebra questions for maintenance practice.

Student is already strong (680-800 range). Generate variety of algebraic problems:
- Linear equations and systems
- Polynomial and rational expressions
- Function transformations

Keep difficulty moderate. Focus on authentic SAT format.

RETURN ONLY valid JSON array:
[{"id": "gen-alg-${difficulty}-N", "section": "math", "topic": "algebra", "difficulty": "${difficulty}", "stem": "...", "choices": [...], "correctAnswer": "A", "explanation": "..."}]`,

    'advanced-math': `Generate ${count} SAT Advanced Math questions for maintenance.

Student is strong (680-800 range). Generate authentic practice:
- Quadratic equations and functions
- Exponential and logarithmic functions
- Complex numbers and polynomials

Keep balanced difficulty.

RETURN ONLY valid JSON array:
[{"id": "gen-adv-${difficulty}-N", "section": "math", "topic": "advanced-math", "difficulty": "${difficulty}", "stem": "...", "choices": [...], "correctAnswer": "A", "explanation": "..."}]`,

    'geometry-trigonometry': `Generate ${count} SAT Geometry/Trigonometry questions for maintenance.

Student is strong (680-800 range). Generate practice covering:
- Right triangle trigonometry
- Coordinate geometry
- Circle properties and angles
- Area and volume

Maintain quality SAT format.

RETURN ONLY valid JSON array:
[{"id": "gen-geo-${difficulty}-N", "section": "math", "topic": "geometry-trigonometry", "difficulty": "${difficulty}", "stem": "...", "choices": [...], "correctAnswer": "A", "explanation": "..."}]`,

    'craft-and-structure': `Generate ${count} SAT Reading questions for "Craft & Structure".

Student performing adequately (550-600 range). Focus on:
- Author's word choice and tone
- Text structure and organization
- Rhetorical strategies

Maintain SAT quality.

RETURN ONLY valid JSON array:
[{"id": "gen-craft-${difficulty}-N", "section": "reading-writing", "topic": "craft-and-structure", "difficulty": "${difficulty}", "stimulus": "...", "stem": "...", "choices": [...], "correctAnswer": "A", "explanation": "..."}]`,

    'expression-of-ideas': `Generate ${count} SAT Grammar/Style questions for "Expression of Ideas".

Student performing adequately (550-600 range). Focus on:
- Sentence clarity and concision
- Eliminating redundancy
- Improving coherence and flow

Authentic SAT format.

RETURN ONLY valid JSON array:
[{"id": "gen-expr-${difficulty}-N", "section": "reading-writing", "topic": "expression-of-ideas", "difficulty": "${difficulty}", "stem": "...", "choices": [...], "correctAnswer": "A", "explanation": "..."}]`,
  };

  return (
    prompts[topic] ||
    `Generate ${count} SAT questions for topic ${topic}. Return ONLY valid JSON array.`
  );
}

function parseGeneratedQuestions(
  jsonText: string,
  topic: Topic,
  difficulty: Difficulty
): Question[] {
  try {
    let cleaned = jsonText.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);
    const questions = Array.isArray(parsed) ? parsed : [parsed];

    return questions
      .filter(q => {
        return (
          q.id &&
          q.section &&
          q.topic === topic &&
          q.difficulty === difficulty &&
          q.stem &&
          q.choices?.length === 4 &&
          q.correctAnswer &&
          q.explanation
        );
      })
      .map((q: any, index: number) => ({
        id: `targeted-${topic}-${difficulty}-${Date.now()}-${index}`,
        section: q.section,
        topic: q.topic,
        difficulty: q.difficulty,
        stem: q.stem,
        stimulus: q.stimulus,
        choices: q.choices.map((c: any) => ({ id: c.id, text: c.text })),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        qualityScore: 5, // Targeted questions are high-quality by design
        source: 'ai-targeted',
      }));
  } catch (error) {
    console.error('Failed to parse targeted questions:', error);
    return [];
  }
}
