import {
  CandidateAssessmentResult,
  DimensionResult,
  DomainResult,
  OptionKey,
  RedFlagAnalysis,
  RiskTier
} from '../types/assessment';
import { DIMENSIONS, QUESTION_SETS } from '../data/assessmentData';

export function calculateCandidateResult(
  candidateName: string,
  answers: Record<number, { most: OptionKey; least: OptionKey }>,
  metadata?: { specialty?: string; hospitalOrSchool?: string }
): CandidateAssessmentResult {
  const optionPointBreakdown: Record<string, number> = {};

  // 1. Calculate raw option scores (2 for most, 0 for least, 1 for unselected)
  for (const set of QUESTION_SETS) {
    const ans = answers[set.id];
    for (const opt of set.options) {
      const key = `${set.id}_${opt.id}`;
      if (ans && ans.most === opt.id) {
        optionPointBreakdown[key] = 2;
      } else if (ans && ans.least === opt.id) {
        optionPointBreakdown[key] = 0;
      } else {
        optionPointBreakdown[key] = 1; // Unselected
      }
    }
  }

  // 2. Calculate 14 Dimension scores
  const dimensionResults: DimensionResult[] = DIMENSIONS.map((dim) => {
    // Parse item locations: e.g. "ชุดที่ 1 (A)", "ชุดที่ 4 (B)"
    const item1Loc = dim.itemLocations[0];
    const item2Loc = dim.itemLocations[1];

    const parseLoc = (loc: string) => {
      const setMatch = loc.match(/ชุดที่\s*(\d+)/);
      const optMatch = loc.match(/\(([A-D])\)/);
      const setId = setMatch ? parseInt(setMatch[1], 10) : 1;
      const optId = (optMatch ? optMatch[1] : 'A') as OptionKey;
      return { setId, optId };
    };

    const loc1 = parseLoc(item1Loc);
    const loc2 = parseLoc(item2Loc);

    const key1 = `${loc1.setId}_${loc1.optId}`;
    const key2 = `${loc2.setId}_${loc2.optId}`;

    const p1 = optionPointBreakdown[key1] ?? 1;
    const p2 = optionPointBreakdown[key2] ?? 1;
    const score = p1 + p2;

    const set1Obj = QUESTION_SETS.find((s) => s.id === loc1.setId);
    const opt1Obj = set1Obj?.options.find((o) => o.id === loc1.optId);

    const set2Obj = QUESTION_SETS.find((s) => s.id === loc2.setId);
    const opt2Obj = set2Obj?.options.find((o) => o.id === loc2.optId);

    return {
      id: dim.id,
      name: dim.name,
      thaiName: dim.thaiName,
      domainId: dim.domainId,
      isRedFlag: dim.isRedFlag,
      itemLocations: dim.itemLocations,
      score,
      maxScore: 4,
      details: {
        item1: {
          location: item1Loc,
          points: p1,
          text: opt1Obj?.text || ''
        },
        item2: {
          location: item2Loc,
          points: p2,
          text: opt2Obj?.text || ''
        }
      }
    };
  });

  // 3. Calculate 4 Coping Domains
  // Domain 1: Active Coping (1), Planning (2), Instrumental Support (3) -> 6 items, max 12
  const d1Score = dimensionResults
    .filter((d) => d.id === 1 || d.id === 2 || d.id === 3)
    .reduce((acc, curr) => acc + curr.score, 0);

  // Domain 2: Positive Reframing (4), Acceptance (5), Emotional Support (6), Humor (7), Religion (8) -> 10 items, max 20
  const d2Score = dimensionResults
    .filter((d) => d.id === 4 || d.id === 5 || d.id === 6 || d.id === 7 || d.id === 8)
    .reduce((acc, curr) => acc + curr.score, 0);

  // Domain 3: Self-distraction (9) -> 2 items, max 4
  const d3Score = dimensionResults
    .filter((d) => d.id === 9)
    .reduce((acc, curr) => acc + curr.score, 0);

  // Domain 4: Denial (10), Venting (11), Substance Use (12), Behavioral Disengagement (13), Self-blame (14) -> 10 items, max 20
  const d4Score = dimensionResults
    .filter((d) => d.id >= 10 && d.id <= 14)
    .reduce((acc, curr) => acc + curr.score, 0);

  const domainResults: DomainResult[] = [
    {
      id: 1,
      name: 'Task-Focused Coping',
      thaiName: 'การแก้ปัญหาเชิงรุกและวางแผนงาน',
      description: 'เน้นการลงมือทำ การวางแผนล่วงหน้า และการขอความช่วยเหลือทางเทคนิคการแพทย์',
      subDimensions: ['Active Coping', 'Planning', 'Instrumental Support'],
      itemCount: 6,
      score: d1Score,
      percentage: Number(((d1Score / 28) * 100).toFixed(1)),
      color: '#00E5FF',
      glowColor: 'rgba(0, 229, 255, 0.4)'
    },
    {
      id: 2,
      name: 'Adaptive Emotion Coping',
      thaiName: 'การปรับอารมณ์และสร้างพลังใจเชิงบวก',
      description: 'การมองโลกเชิงบวก ยอมรับความจริง กำลังใจจากคนใกล้ชิด อารมณ์ขัน และหลักยึดจิตใจ',
      subDimensions: ['Positive Reframing', 'Acceptance', 'Emotional Support', 'Humor', 'Religion'],
      itemCount: 10,
      score: d2Score,
      percentage: Number(((d2Score / 28) * 100).toFixed(1)),
      color: '#A855F7',
      glowColor: 'rgba(168, 85, 247, 0.4)'
    },
    {
      id: 3,
      name: 'Avoidance & Distraction',
      thaiName: 'การเบี่ยงเบนความสนใจและพักฟื้นระยะสั้น',
      description: 'การพักผ่อนสมอง กาแฟ หรือกิจกรรมผ่อนคลายเพื่อรีเซ็ตสมาธิ',
      subDimensions: ['Self-distraction'],
      itemCount: 2,
      score: d3Score,
      percentage: Number(((d3Score / 28) * 100).toFixed(1)),
      color: '#3B82F6',
      glowColor: 'rgba(59, 130, 246, 0.4)'
    },
    {
      id: 4,
      name: 'Maladaptive & Red Flags 🚩',
      thaiName: 'กลไกเชิงลบและความเสี่ยงทางจิตวิทยา',
      description: 'การปฏิเสธปัญหา ระบายอารมณ์ซ้ำซาก สาร/แอลกอฮอล์ ถอดใจทิ้งงาน และการโทษตนเอง',
      subDimensions: ['Denial', 'Venting', 'Substance Use', 'Behavioral Disengagement', 'Self-blame'],
      itemCount: 10,
      score: d4Score,
      percentage: Number(((d4Score / 28) * 100).toFixed(1)),
      color: '#EF4444',
      glowColor: 'rgba(239, 68, 68, 0.4)'
    }
  ];

  // 4. Red Flag Risk Score calculation (Items 10-14, max 20)
  const redFlagScore = d4Score;
  let tier: RiskTier = 'LOW';
  let tierLabel = 'Low Risk';
  let thaiLabel = 'ความเสี่ยงต่ำ (Low Risk)';
  let clinicalInterpretation = 'ทนทานต่อความกดดันและมีกลไกรับมือทางอารมณ์ที่ดี มีแนวโน้มปรับตัวกับการฝึกอบรมแพทย์ประจำบ้านได้ราบรื่น';
  let riskColor = '#10B981'; // Green
  let recommendations: string[] = [
    'มีความพร้อมด้านวุฒิภาวะทางอารมณ์สูง',
    'แนะนำสนับสนุนให้เป็นแกนนำทีมเพื่อช่วยสนับสนุนเพื่อนร่วมรุ่น',
    'รักษาจังหวะการทำงานและการดูแลสุขอนามัยส่วนบุคคล'
  ];

  if (redFlagScore >= 13) {
    tier = 'HIGH';
    tierLabel = 'High Risk 🚩';
    thaiLabel = 'ความเสี่ยงสูง 🚩 (High Risk)';
    clinicalInterpretation = 'เสี่ยงสูงต่อภาวะ Burnout หรือการปรับตัวล้มเหลวระหว่างการเทรน ควรได้รับการดูแลทางจิตวิทยาเพิ่มเติม และติดตามอย่างใกล้ชิด';
    riskColor = '#EF4444'; // Red
    recommendations = [
      'สัมภาษณ์เจาะลึกกลไกการรับมือกับภาวะแทรกซ้อนและการถูกตำหนิในที่สาธารณะ',
      'ประเมินประวัติการพึ่งพาสาร/แอลกอฮอล์เพื่อการนอนหลับ และการรับมือกับอาการซึมเศร้า',
      'หากรับเข้าฝึกอบรม จำเป็นต้องจัดระบบ Mentor ประกบดูแลและประเมินสุขภาพจิตทุกไตรมาส'
    ];
  } else if (redFlagScore >= 7) {
    tier = 'MODERATE';
    tierLabel = 'Moderate Risk';
    thaiLabel = 'ความเสี่ยงปานกลาง (Moderate Risk)';
    clinicalInterpretation = 'พบพฤติกรรมรับมือเชิงลบปานกลาง ควรให้คำแนะนำเรื่อง Stress Management และมี Mentor คอยดูแลแนะนำ';
    riskColor = '#F59E0B'; // Amber
    recommendations = [
      'มีแนวโน้มระบายอารมณ์หรือโทษตนเองเมื่อเกิดข้อผิดพลาดในการรักษา',
      'แนะนำปฐมนิเทศเน้นทักษะ Resiliency & Stress Coping Skills',
      'จัดให้อยู่ในกลุ่มที่ได้รับการติดตามจากอาจารย์ที่ปรึกษาอย่างสม่ำเสมอ'
    ];
  }

  const redFlagAnalysis: RedFlagAnalysis = {
    score: redFlagScore,
    maxScore: 20,
    tier,
    tierLabel,
    thaiLabel,
    clinicalInterpretation,
    color: riskColor,
    recommendations
  };

  // Determine Primary Dominant Domain
  const sortedDomains = [...domainResults].sort((a, b) => b.percentage - a.percentage);
  const primaryDominantDomain = sortedDomains[0].name;

  return {
    id: `CAND-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`,
    candidateName,
    specialty: metadata?.specialty || 'โสต ศอ นาสิกวิทยา (ENT / Otolaryngology)',
    hospitalOrSchool: metadata?.hospitalOrSchool || 'ผู้สมัครแพทย์ประจำบ้าน',
    submittedAt: new Date().toISOString(),
    answers,
    optionPointBreakdown,
    dimensionResults,
    domainResults,
    redFlagAnalysis,
    totalScore: 28,
    primaryDominantDomain,
    committeeStatus: tier === 'HIGH' ? 'NEEDS_INTERVIEW_PROBE' : 'UNREVIEWED'
  };
}

export function generateInterviewProbingQuestions(result?: CandidateAssessmentResult): string[] {
  const fallbackQuestions = [
    'ในการฝึกอบรมแพทย์ประจำบ้านที่มีภาระงานหนักทั้งเวรฉุกเฉินและงานวิจัย หากเกิดความเหนื่อยล้าสะสมขั้นวิกฤต ท่านมีกลไกใดที่เป็น Support System สำคัญที่สุด?',
    'เมื่อเกิดข้อคิดเห็นไม่ตรงกันกับอาจารย์ผู้ดูแลเคสในห้องผ่าตัด ท่านมีแนวทางในการสื่อสารและรักษาบรรยากาศการทำงานเป็นทีมอย่างไร?',
    'หากในอนาคตเกิดภาวะแทรกซ้อนจากการผ่าตัดที่ไม่คาดคิด ท่านมีขั้นตอนในการจัดการจิตใจและสื่อสารกับญาติผู้ป่วยอย่างไร?'
  ];

  if (!result || !result.dimensionResults || !Array.isArray(result.dimensionResults)) {
    return fallbackQuestions;
  }

  const questions: string[] = [];
  const dimMap = new Map(result.dimensionResults.map((d) => [d.id, d.score]));

  // Check specific elevated red flags
  if ((dimMap.get(12) ?? 0) >= 2) {
    // Substance Use
    questions.push(
      'ในชุดคำถามที่ 4 และ 7 ท่านระบุถึงการใช้เครื่องดื่มหรือตัวช่วยในการนอนหลับเพื่อคลายเครียดหลังเวร ในชีวิตจริงเมื่อเผชิญเวรหนักติดกัน ท่านมีวิธีดูแลสุขอนามัยการนอนหลับอย่างไร?'
    );
  }

  if ((dimMap.get(14) ?? 0) >= 3) {
    // Self-blame
    questions.push(
      'คะแนนในส่วน Self-blame ค่อนข้างเด่นชัด หากในอนาคตเกิดภาวะแทรกซ้อนจากการรักษาที่สร้างความวิตกกังวล ท่านมีวิธีจัดการกับความรู้สึกผิดและความเชื่อมั่นในตนเองอย่างไร?'
    );
  }

  if ((dimMap.get(13) ?? 0) >= 2) {
    // Behavioral Disengagement
    questions.push(
      'เมื่อต้องเผชิญกับเคสที่ถูกนำเข้า M&M Conference หรือเกิดข้อขัดแย้งในหอผู้ป่วย มีครั้งใดที่ท่านรู้สึกอยากถอยหนี และท่านพาตนเองกลับมาแก้ปัญหาได้อย่างไร?'
    );
  }

  if ((dimMap.get(10) ?? 0) >= 3) {
    // Denial
    questions.push(
      'ท่านมีแนวโน้มจะแยกเรื่องงานและความเครียดโดยการพยายามมองข้ามปัญหา หากความเครียดเริ่มส่งผลกระทบ ท่านสังเกตสัญญาณเตือนแรกของตนเองได้อย่างไร?'
    );
  }

  if ((dimMap.get(1) ?? 0) >= 3 && (dimMap.get(2) ?? 0) >= 3) {
    // High Active + High Planning
    questions.push(
      'ท่านมีทักษะ Task-Focused ที่โดดเด่นมาก หากตกอยู่ในสถานการณ์ที่ผลลัพธ์ไม่เป็นไปตามแผนและอยู่นอกเหนือการควบคุมอย่างสิ้นเชิง ท่านจะปรับสภาพจิตใจอย่างไร?'
    );
  }

  if (questions.length < 3) {
    questions.push(...fallbackQuestions);
  }

  return questions.slice(0, 4);
}

export function ensureCandidateData(cand: CandidateAssessmentResult): CandidateAssessmentResult {
  if (!cand) {
    return calculateCandidateResult('ผู้สมัคร', {});
  }

  // Check if dimensions, domains, or redFlagAnalysis are missing or invalid
  const needsRecalculation =
    !cand.dimensionResults ||
    !Array.isArray(cand.dimensionResults) ||
    cand.dimensionResults.length === 0 ||
    !cand.domainResults ||
    !Array.isArray(cand.domainResults) ||
    cand.domainResults.length === 0 ||
    !cand.redFlagAnalysis ||
    typeof cand.redFlagAnalysis.score !== 'number';

  const answers = cand.answers || {};

  if (needsRecalculation) {
    const recomputed = calculateCandidateResult(cand.candidateName || 'ผู้สมัคร', answers, {
      specialty: cand.specialty,
      hospitalOrSchool: cand.hospitalOrSchool
    });
    return {
      ...recomputed,
      id: cand.id || recomputed.id,
      candidateName: cand.candidateName || recomputed.candidateName,
      submittedAt: cand.submittedAt || recomputed.submittedAt,
      committeeNotes: cand.committeeNotes || '',
      committeeStatus: cand.committeeStatus || recomputed.committeeStatus,
      interviewerRating: cand.interviewerRating || 0,
      answers: answers
    };
  }

  return {
    ...cand,
    answers: answers,
    committeeNotes: cand.committeeNotes || '',
    committeeStatus: cand.committeeStatus || 'UNREVIEWED',
    interviewerRating: cand.interviewerRating || 0,
    specialty: cand.specialty || 'แพทย์ประจำบ้าน',
    hospitalOrSchool: cand.hospitalOrSchool || ''
  };
}
