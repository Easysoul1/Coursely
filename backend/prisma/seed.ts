import { PrismaClient, QuestionCategory, QuestionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEPARTMENTS = [
  {
    name: "Medicine & Surgery",
    faculty: "Medicine",
    description:
      "A highly competitive program that trains students to become medical doctors. Covers basic medical sciences, clinical medicine, and surgery.",
    cutoffMark: 300,
    requiredSubjects: JSON.stringify(["English", "Mathematics", "Biology", "Chemistry", "Physics"]),
    difficultyLevel: "Very High",
    careerPaths: JSON.stringify([
      "Medical Doctor",
      "Surgeon",
      "Public Health Specialist",
      "Medical Researcher",
      "Hospital Administrator",
    ]),
    studyDuration: "6 years",
    scoringRules: [
      { factor: "biology_strength", weight: 30 },
      { factor: "mathematics_strength", weight: 10 },
      { factor: "logical_reasoning", weight: 15 },
      { factor: "communication_skill", weight: 15 },
      { factor: "interest_alignment", weight: 20 },
      { factor: "study_tolerance", weight: 10 },
    ],
  },
  {
    name: "Computer Science",
    faculty: "Science",
    description:
      "Focuses on computational theory, programming, algorithms, and software development. Prepares students for careers in technology.",
    cutoffMark: 260,
    requiredSubjects: JSON.stringify(["English", "Mathematics", "Physics", "Chemistry"]),
    difficultyLevel: "Medium",
    careerPaths: JSON.stringify([
      "Software Engineer",
      "Data Scientist",
      "AI/ML Engineer",
      "Cybersecurity Analyst",
      "IT Consultant",
    ]),
    studyDuration: "4 years",
    scoringRules: [
      { factor: "mathematics_strength", weight: 30 },
      { factor: "logical_reasoning", weight: 25 },
      { factor: "biology_strength", weight: 5 },
      { factor: "communication_skill", weight: 10 },
      { factor: "interest_alignment", weight: 20 },
      { factor: "study_tolerance", weight: 10 },
    ],
  },
  {
    name: "Electrical & Electronics Engineering",
    faculty: "Engineering",
    description:
      "Covers electrical systems, electronics, telecommunications, and power generation. Prepares students for engineering practice.",
    cutoffMark: 270,
    requiredSubjects: JSON.stringify(["English", "Mathematics", "Physics", "Chemistry"]),
    difficultyLevel: "High",
    careerPaths: JSON.stringify([
      "Electrical Engineer",
      "Telecoms Engineer",
      "Power Systems Engineer",
      "Electronics Designer",
      "Control Systems Engineer",
    ]),
    studyDuration: "5 years",
    scoringRules: [
      { factor: "mathematics_strength", weight: 30 },
      { factor: "logical_reasoning", weight: 25 },
      { factor: "biology_strength", weight: 5 },
      { factor: "communication_skill", weight: 10 },
      { factor: "interest_alignment", weight: 20 },
      { factor: "study_tolerance", weight: 10 },
    ],
  },
  {
    name: "Biochemistry",
    faculty: "Science",
    description:
      "Studies chemical processes within living organisms. Combines biology and chemistry to understand molecular mechanisms.",
    cutoffMark: 250,
    requiredSubjects: JSON.stringify(["English", "Mathematics", "Biology", "Chemistry", "Physics"]),
    difficultyLevel: "High",
    careerPaths: JSON.stringify([
      "Biochemist",
      "Pharmaceutical Scientist",
      "Forensic Analyst",
      "Biotechnology Researcher",
      "Quality Control Analyst",
    ]),
    studyDuration: "4 years",
    scoringRules: [
      { factor: "biology_strength", weight: 25 },
      { factor: "mathematics_strength", weight: 10 },
      { factor: "logical_reasoning", weight: 20 },
      { factor: "communication_skill", weight: 10 },
      { factor: "interest_alignment", weight: 25 },
      { factor: "study_tolerance", weight: 10 },
    ],
  },
  {
    name: "Physiology",
    faculty: "Medicine",
    description:
      "Studies the functions and mechanisms of the human body. Foundation for medical and health science careers.",
    cutoffMark: 240,
    requiredSubjects: JSON.stringify(["English", "Mathematics", "Biology", "Chemistry", "Physics"]),
    difficultyLevel: "Medium",
    careerPaths: JSON.stringify([
      "Physiologist",
      "Medical Researcher",
      "Pharmacologist",
      "Clinical Scientist",
      "Health Educator",
    ]),
    studyDuration: "4 years",
    scoringRules: [
      { factor: "biology_strength", weight: 30 },
      { factor: "mathematics_strength", weight: 10 },
      { factor: "logical_reasoning", weight: 15 },
      { factor: "communication_skill", weight: 15 },
      { factor: "interest_alignment", weight: 20 },
      { factor: "study_tolerance", weight: 10 },
    ],
  },
  {
    name: "Anatomy",
    faculty: "Medicine",
    description:
      "Focuses on the structural organization of the human body. Essential for medical, dental, and health science education.",
    cutoffMark: 230,
    requiredSubjects: JSON.stringify(["English", "Mathematics", "Biology", "Chemistry", "Physics"]),
    difficultyLevel: "Medium",
    careerPaths: JSON.stringify([
      "Anatomist",
      "Medical Illustrator",
      "Forensic Scientist",
      "Medical Researcher",
      "Educator",
    ]),
    studyDuration: "4 years",
    scoringRules: [
      { factor: "biology_strength", weight: 30 },
      { factor: "mathematics_strength", weight: 10 },
      { factor: "logical_reasoning", weight: 15 },
      { factor: "communication_skill", weight: 15 },
      { factor: "interest_alignment", weight: 20 },
      { factor: "study_tolerance", weight: 10 },
    ],
  },
  {
    name: "Nursing",
    faculty: "Medicine",
    description:
      "Trains professional nurses to provide patient care, health promotion, and disease prevention in healthcare settings.",
    cutoffMark: 260,
    requiredSubjects: JSON.stringify(["English", "Mathematics", "Biology", "Chemistry", "Physics"]),
    difficultyLevel: "High",
    careerPaths: JSON.stringify([
      "Registered Nurse",
      "Nurse Practitioner",
      "Nurse Educator",
      "Public Health Nurse",
      "Midwife",
    ]),
    studyDuration: "5 years",
    scoringRules: [
      { factor: "biology_strength", weight: 25 },
      { factor: "mathematics_strength", weight: 10 },
      { factor: "logical_reasoning", weight: 15 },
      { factor: "communication_skill", weight: 20 },
      { factor: "interest_alignment", weight: 20 },
      { factor: "study_tolerance", weight: 10 },
    ],
  },
  {
    name: "Pharmacy",
    faculty: "Pharmacy",
    description:
      "Prepares students for careers in drug development, dispensing, and pharmaceutical care. Combines chemistry with healthcare.",
    cutoffMark: 270,
    requiredSubjects: JSON.stringify(["English", "Mathematics", "Biology", "Chemistry", "Physics"]),
    difficultyLevel: "High",
    careerPaths: JSON.stringify([
      "Pharmacist",
      "Pharmaceutical Researcher",
      "Drug Safety Officer",
      "Regulatory Affairs Specialist",
      "Clinical Pharmacist",
    ]),
    studyDuration: "5 years",
    scoringRules: [
      { factor: "biology_strength", weight: 20 },
      { factor: "mathematics_strength", weight: 15 },
      { factor: "logical_reasoning", weight: 20 },
      { factor: "communication_skill", weight: 10 },
      { factor: "interest_alignment", weight: 25 },
      { factor: "study_tolerance", weight: 10 },
    ],
  },
  {
    name: "Mechanical Engineering",
    faculty: "Engineering",
    description:
      "Deals with design, manufacturing, and maintenance of mechanical systems. Covers thermodynamics, mechanics, and materials science.",
    cutoffMark: 260,
    requiredSubjects: JSON.stringify(["English", "Mathematics", "Physics", "Chemistry"]),
    difficultyLevel: "High",
    careerPaths: JSON.stringify([
      "Mechanical Engineer",
      "Automotive Engineer",
      "Aerospace Engineer",
      "Manufacturing Engineer",
      "Energy Consultant",
    ]),
    studyDuration: "5 years",
    scoringRules: [
      { factor: "mathematics_strength", weight: 30 },
      { factor: "logical_reasoning", weight: 25 },
      { factor: "biology_strength", weight: 5 },
      { factor: "communication_skill", weight: 10 },
      { factor: "interest_alignment", weight: 20 },
      { factor: "study_tolerance", weight: 10 },
    ],
  },
  {
    name: "Statistics",
    faculty: "Science",
    description:
      "Focuses on data collection, analysis, interpretation, and presentation. Essential for data-driven decision making across industries.",
    cutoffMark: 220,
    requiredSubjects: JSON.stringify(["English", "Mathematics", "Physics", "Chemistry"]),
    difficultyLevel: "Medium",
    careerPaths: JSON.stringify([
      "Statistician",
      "Data Analyst",
      "Actuary",
      "Biostatistician",
      "Market Researcher",
    ]),
    studyDuration: "4 years",
    scoringRules: [
      { factor: "mathematics_strength", weight: 35 },
      { factor: "logical_reasoning", weight: 25 },
      { factor: "biology_strength", weight: 5 },
      { factor: "communication_skill", weight: 10 },
      { factor: "interest_alignment", weight: 15 },
      { factor: "study_tolerance", weight: 10 },
    ],
  },
];

const QUESTIONS = [
  // ACADEMIC (4 questions)
  {
    question: "How would you rate your performance in Mathematics?",
    category: "ACADEMIC" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 3,
  },
  {
    question: "How would you rate your performance in Biology?",
    category: "ACADEMIC" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 3,
  },
  {
    question: "How would you rate your performance in Physics?",
    category: "ACADEMIC" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 3,
  },
  {
    question: "How would you rate your performance in Chemistry?",
    category: "ACADEMIC" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 3,
  },

  // CAREER (4 questions)
  {
    question:
      "I am interested in a career that involves working with patients or improving health outcomes.",
    category: "CAREER" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 2,
  },
  {
    question: "I see myself working in a technology-related field like software or engineering.",
    category: "CAREER" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 2,
  },
  {
    question:
      "I prefer a career that involves research, laboratory work, and scientific discovery.",
    category: "CAREER" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 2,
  },
  {
    question: "I want a career that offers job stability and clear professional progression.",
    category: "CAREER" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 2,
  },

  // PERSONALITY (4 questions)
  {
    question: "I enjoy solving complex problems and puzzles.",
    category: "PERSONALITY" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 2,
  },
  {
    question: "I am detail-oriented and careful in my work.",
    category: "PERSONALITY" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 2,
  },
  {
    question: "I prefer working in teams rather than alone.",
    category: "PERSONALITY" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 1,
  },
  {
    question: "I handle stressful situations calmly and effectively.",
    category: "PERSONALITY" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 2,
  },

  // LEARNING_STYLE (4 questions)
  {
    question: "I learn best by reading and studying textbooks.",
    category: "LEARNING_STYLE" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 1,
  },
  {
    question: "I prefer hands-on practical work over theoretical lectures.",
    category: "LEARNING_STYLE" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 1,
  },
  {
    question: "I can study for long hours without losing concentration.",
    category: "LEARNING_STYLE" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 2,
  },
  {
    question: "I enjoy memorizing facts and recalling them accurately.",
    category: "LEARNING_STYLE" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 1,
  },

  // GOAL (4 questions)
  {
    question: "My goal is to become a medical doctor or work in the healthcare sector.",
    category: "GOAL" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 2,
  },
  {
    question: "I aspire to become an engineer or technology professional.",
    category: "GOAL" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 2,
  },
  {
    question: "I aim to pursue a career in scientific research or academia.",
    category: "GOAL" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 2,
  },
  {
    question: "I am willing to work hard and overcome challenges to get into my dream department.",
    category: "GOAL" as QuestionCategory,
    type: "SCALE" as QuestionType,
    weight: 2,
  },
];

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@coursely.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@coursely.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Created admin user (admin@coursely.com / admin123)");

  for (const dept of DEPARTMENTS) {
    const { scoringRules, ...deptData } = dept;

    const created = await prisma.department.upsert({
      where: { name: deptData.name },
      update: {},
      create: deptData,
    });

    for (const rule of scoringRules) {
      await prisma.scoringRule.upsert({
        where: {
          id: `${created.id}_${rule.factor}`,
        },
        update: {},
        create: {
          id: `${created.id}_${rule.factor}`,
          departmentId: created.id,
          factor: rule.factor,
          weight: rule.weight,
        },
      });
    }

    console.log(`Created department: ${deptData.name} (${deptData.faculty})`);
  }

  const existingQuestionCount = await prisma.question.count();
  if (existingQuestionCount === 0) {
    for (const q of QUESTIONS) {
      await prisma.question.create({ data: q });
    }
    console.log(`Created ${QUESTIONS.length} assessment questions`);
  } else {
    console.log(`Skipping questions — ${existingQuestionCount} already exist`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
