// SAT Questions Direct Import Script
// Paste this in browser console (F12 → Console) and run

function directImportQuestions() {
  const sampleQuestions = [
    // OpenSAT-style questions (Math)
    {
      id: "direct-math-1",
      section: "math",
      topic: "algebra",
      difficulty: "medium",
      stem: "If 3x + 5 = 20, what is the value of x?",
      choices: [
        { id: "A", text: "5" },
        { id: "B", text: "10" },
        { id: "C", text: "15" },
        { id: "D", text: "25" }
      ],
      correctAnswer: "A",
      explanation: "Subtract 5 from both sides: 3x = 15. Divide by 3: x = 5"
    },
    {
      id: "direct-math-2",
      section: "math",
      topic: "algebra",
      difficulty: "medium",
      stem: "What is the slope of the line passing through points (2, 3) and (4, 7)?",
      choices: [
        { id: "A", text: "1" },
        { id: "B", text: "2" },
        { id: "C", text: "3" },
        { id: "D", text: "4" }
      ],
      correctAnswer: "B",
      explanation: "Slope = (y2 - y1) / (x2 - x1) = (7 - 3) / (4 - 2) = 4 / 2 = 2"
    },
    {
      id: "direct-math-3",
      section: "math",
      topic: "advanced-math",
      difficulty: "hard",
      stem: "If f(x) = x² + 3x + 2, what is f(x - 1)?",
      choices: [
        { id: "A", text: "x² + x" },
        { id: "B", text: "x² + x + 2" },
        { id: "C", text: "x² - x" },
        { id: "D", text: "x² + 2x" }
      ],
      correctAnswer: "A",
      explanation: "f(x - 1) = (x - 1)² + 3(x - 1) + 2 = x² - 2x + 1 + 3x - 3 + 2 = x² + x"
    },
    {
      id: "direct-reading-1",
      section: "reading-writing",
      topic: "information-and-ideas",
      difficulty: "medium",
      stimulus: "The Renaissance was a period of great cultural and artistic achievement that began in Italy during the 14th century. It marked the transition from medieval to modern times, characterized by a renewed interest in classical learning and a shift towards humanism.",
      stem: "Which of the following best describes the Renaissance?",
      choices: [
        { id: "A", text: "A period of artistic decline in Europe" },
        { id: "B", text: "A revival of classical learning and cultural achievement" },
        { id: "C", text: "A religious movement led by the Church" },
        { id: "D", text: "A political revolution in Italy" }
      ],
      correctAnswer: "B",
      explanation: "The passage explicitly states the Renaissance marked 'renewed interest in classical learning' and was a period of 'great cultural and artistic achievement'"
    },
    {
      id: "direct-reading-2",
      section: "reading-writing",
      topic: "standard-english-conventions",
      difficulty: "medium",
      stem: "Which sentence is grammatically correct?",
      choices: [
        { id: "A", text: "The team are ready to play their first game." },
        { id: "B", text: "The team is ready to play their first game." },
        { id: "C", text: "The team are ready to play its first game." },
        { id: "D", text: "The teams is ready to play their first game." }
      ],
      correctAnswer: "B",
      explanation: "'Team' is a singular noun requiring singular verb 'is' and singular pronoun 'its', not 'their'"
    }
  ];

  // Save to localStorage
  const existing = JSON.parse(localStorage.getItem('customQuestions') || '[]');
  existing.push(...sampleQuestions);
  localStorage.setItem('customQuestions', JSON.stringify(existing));

  console.log(`✅ Imported ${sampleQuestions.length} sample questions`);
  console.log(`📊 Total questions in bank: ${existing.length}`);
  alert(`✅ Success! Imported ${sampleQuestions.length} questions\nTotal: ${existing.length}`);
}

// Run it
directImportQuestions();
