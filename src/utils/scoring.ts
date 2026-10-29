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
  metadata?: { specialty?: string; hospitalOrSchool?: string; candidateContextNote?: string }
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
      name: 'Personal Support Needs (พื้นที่เพื่อการดูแลสนับสนุน)',
      thaiName: 'พื้นที่ที่ต้องการการดูแลและสนับสนุน (Personal Support Needs)',
      description: 'สัญญาณเตือนความเหนื่อยล้าสะสม สุขอนามัยการนอนหลับ และจุดที่ต้องการการประคับประคองจากอาจารย์ที่ปรึกษา',
      subDimensions: ['Denial', 'Venting', 'Substance Use', 'Behavioral Disengagement', 'Self-blame'],
      itemCount: 10,
      score: d4Score,
      percentage: Number(((d4Score / 28) * 100).toFixed(1)),
      color: '#F43F5E',
      glowColor: 'rgba(244, 63, 94, 0.4)'
    }
  ];

  // 4. Support Needs Score calculation (Items 10-14, max 20)
  const redFlagScore = d4Score;
  let tier: RiskTier = 'LOW';
  let tierLabel = 'Self-Sustaining Resilience';
  let thaiLabel = 'มีความพร้อมในการพึ่งพาตนเองสูง (Self-Sustaining)';
  let clinicalInterpretation = 'มีกลไกรับมือทางอารมณ์ที่สมดุล ปรับตัวต่อภาระงานฝึกอบรมได้ราบรื่น แนะนำสนับสนุนให้เป็น Buddy คอยสนับสนุนเพื่อนร่วมรุ่น';
  let riskColor = '#10B981'; // Green
  let recommendations: string[] = [
    'มีความตระหนักรู้และวุฒิภาวะทางอารมณ์สูง',
    'แนะนำสนับสนุนให้เป็นแกนนำทีมเพื่อช่วยสนับสนุนเพื่อนร่วมรุ่น',
    'รักษาจังหวะการทำงานและการดูแลสุขภาพส่วนบุคคล'
  ];

  if (redFlagScore >= 13) {
    tier = 'HIGH';
    tierLabel = 'Priority Mentorship Support 🤝';
    thaiLabel = 'แนะนำระบบ Mentor ดูแลใกล้ชิด (Priority Support)';
    clinicalInterpretation = 'ผู้สมัครมีความรับผิดชอบสูงแต่อาจแบกรับความกดดันไว้มาก แนะนำให้อาจารย์เปิดบทสนทนาอย่างอบอุ่นเรื่องสุขอนามัยการนอนหลับและการระบายความตึงเครียด เพื่อจัดระบบประคับประคองที่ตรงจุด';
    riskColor = '#F43F5E'; // Rose
    recommendations = [
      'ใช้บทสนทนาเชิงบวกเพื่อทำความเข้าใจบริบทการเผชิญความเหนื่อยล้าสะสมในเวร',
      'วางแผนจัดระบบอาจารย์ที่ปรึกษา (Mentor) และ Buddy ประกบคู่ดูแลตั้งแต่วันแรกของการเทรน',
      'ส่งเสริมการจัดสมดุลการนอนหลับ (Sleep Hygiene) และสนับสนุนพื้นที่ปลอดภัยในการปรึกษาปัญหา'
    ];
  } else if (redFlagScore >= 7) {
    tier = 'MODERATE';
    tierLabel = 'Standard Mentorship Support';
    thaiLabel = 'ความต้องการการสนับสนุนระดับมาตรฐาน (Standard Support)';
    clinicalInterpretation = 'พบจุดที่สามารถพัฒนาและส่งเสริมได้ เช่น เทคนิคผ่อนคลายความเครียดหลังเวร แนะนำจัดอาจารย์ที่ปรึกษา (Mentor) พูดคุยอย่างสม่ำเสมอ';
    riskColor = '#F59E0B'; // Amber
    recommendations = [
      'มีศักยภาพในการเรียนรู้สูงและสะท้อนตนเองได้ดี',
      'แนะนำให้คำปรึกษาเรื่อง Stress Coping & Time Management ในช่วงปรับตัวปี 1',
      'จัดให้อยู่ในกลุ่มที่ได้รับการติดตามจากอาจารย์ที่ปรึกษาอย่างต่อเนื่อง'
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

  // Generate RPG Profile (Ragnarok Infographic Engine)
  const rpgProfile = generateRpgProfile(dimensionResults, redFlagAnalysis);

  return {
    id: `CAND-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`,
    candidateName,
    specialty: metadata?.specialty || 'โสต ศอ นาสิกวิทยา (ENT / Otolaryngology)',
    hospitalOrSchool: metadata?.hospitalOrSchool || 'ผู้สมัครแพทย์ประจำบ้าน',
    candidateContextNote: metadata?.candidateContextNote || '',
    submittedAt: new Date().toISOString(),
    answers,
    optionPointBreakdown,
    dimensionResults,
    domainResults,
    redFlagAnalysis,
    totalScore: 28,
    primaryDominantDomain,
    rpgProfile,
    committeeStatus: tier === 'HIGH' ? 'NEEDS_INTERVIEW_PROBE' : 'UNREVIEWED'
  };
}

export function generateRpgProfile(
  dimensionResults: DimensionResult[],
  redFlagAnalysis: RedFlagAnalysis
) {
  const dimMap = new Map(dimensionResults.map((d) => [d.id, d.score]));

  // 1. Calculate 5 RPG Stats
  // STR: Active Coping (1) + Planning (2) -> max 8
  const strScore = (dimMap.get(1) ?? 0) + (dimMap.get(2) ?? 0);
  const strPercent = Math.min(100, Math.round((strScore / 8) * 100));

  // INT: Instrumental Support (3) -> max 4
  const intScore = dimMap.get(3) ?? 0;
  const intPercent = Math.min(100, Math.round((intScore / 4) * 100));

  // VIT: Positive Reframing (4) + Acceptance (5) + Emotional Support (6) -> max 12
  const vitScore = (dimMap.get(4) ?? 0) + (dimMap.get(5) ?? 0) + (dimMap.get(6) ?? 0);
  const vitPercent = Math.min(100, Math.round((vitScore / 12) * 100));

  // DEX: Humor (7) + Religion (8) + Self-distraction (9) -> max 12
  const dexScore = (dimMap.get(7) ?? 0) + (dimMap.get(8) ?? 0) + (dimMap.get(9) ?? 0);
  const dexPercent = Math.min(100, Math.round((dexScore / 12) * 100));

  // DRAIN: Denial (10) + Venting (11) + Substance (12) + Disengagement (13) + Self-blame (14) -> max 20
  const drainScore = redFlagAnalysis.score;
  const drainPercent = Math.min(100, Math.round((drainScore / 20) * 100));

  const stats = {
    STR: {
      key: 'STR' as const,
      name: 'Strength (Task Execution)',
      thaiName: 'การแก้ปัญหาเชิงรุก & วางแผน (STR)',
      score: strScore,
      maxScore: 8,
      percentage: strPercent,
      description: 'พลังในการลงมือแก้ปัญหาเฉพาะหน้า การวางแผนขั้นตอนผ่าตัด และความเด็ดขาดในภาวะวิกฤต',
      color: '#06B6D4'
    },
    INT: {
      key: 'INT' as const,
      name: 'Intelligence (Team Network)',
      thaiName: 'การแสวงหาคำปรึกษา & เครือข่าย (INT)',
      score: intScore,
      maxScore: 4,
      percentage: intPercent,
      description: 'ทักษะการขอคำปรึกษาทางวิชาชีพ การประสานงาน และความร่วมมือกับทีมแพทย์ในห้องผ่าตัด',
      color: '#3B82F6'
    },
    VIT: {
      key: 'VIT' as const,
      name: 'Vitality (Emotional Shield)',
      thaiName: 'เกราะยืดหยุ่น & ปรับมุมมองบวก (VIT)',
      score: vitScore,
      maxScore: 12,
      percentage: vitPercent,
      description: 'ความยืดหยุ่นทางอารมณ์ การมองอุปสรรคเป็นโอกาสเรียนรู้ และการยอมรับความเป็นจริง',
      color: '#10B981'
    },
    DEX: {
      key: 'DEX' as const,
      name: 'Dexterity (Rest & Morale)',
      thaiName: 'อารมณ์ขัน & การพักฟื้นจิตใจ (DEX)',
      score: dexScore,
      maxScore: 12,
      percentage: dexPercent,
      description: 'ความว่องไวในการสลับโหมดพักสมอง การใช้อารมณ์ขันคลายตึงเครียด และจุดยึดเหนี่ยวใจ',
      color: '#F59E0B'
    },
    DRAIN: {
      key: 'DRAIN' as const,
      name: 'Energy Drain (Stress Indicator)',
      thaiName: 'ดัชนีภาระความเครียดสะสม (DRAIN 🚩)',
      score: drainScore,
      maxScore: 20,
      percentage: drainPercent,
      description: 'สัญญาณเตือนของภาวะเหนื่อยล้าสะสม การโทษตนเอง หรือความเสี่ยงต่อภาวะหมดไฟ (Burnout)',
      color: '#F43F5E'
    }
  };

  // 2. Determine Archetype
  let archetype;
  if (drainScore >= 13) {
    archetype = {
      key: 'OVERLOADED_CRUSADER' as const,
      badge: '⚡',
      title: 'The Overloaded Crusader',
      thaiTitle: 'นักรบภาวะล้าสะสม',
      description: 'มีความมุ่งมั่นทุ่มเทสูงและแบกรับความรับผิดชอบไว้เต็มกำลัง แม้มีศักยภาพสูงแต่เริ่มมีสัญญาณเตือนของพลังงานที่ลดลง',
      subtext: 'จิตแพทย์แนะนำ: เป็นผู้ที่มีไฟในการทำงานสูงมาก แต่จำเป็นต้องจัดเวลาพักฟื้นและลดการแบกรับปัญหาไว้เพียงลำพัง',
      color: '#F43F5E',
      glowColor: 'rgba(244, 63, 94, 0.4)'
    };
  } else if (strPercent >= intPercent && strPercent >= vitPercent && strPercent >= dexPercent) {
    archetype = {
      key: 'TACTICAL_MASTER' as const,
      badge: '🎖️',
      title: 'The Tactical Master',
      thaiTitle: 'นักวางแผนเชิงรุก',
      description: 'เน้นการวิเคราะห์อย่างเป็นระบบ มีสติในการตัดสินใจฉุกเฉิน และเตรียมแผนสำรองสำหรับสถานการณ์ผ่าตัดที่คาดเดาไม่ได้',
      subtext: 'จิตแพทย์แนะนำ: โดดเด่นด้านความเป็นผู้นำในห้องผ่าตัด มีความนิ่งและมุ่งเป้าสู่ความสำเร็จอย่างมั่นคง',
      color: '#06B6D4',
      glowColor: 'rgba(6, 182, 212, 0.4)'
    };
  } else if (vitPercent >= intPercent && vitPercent >= dexPercent) {
    archetype = {
      key: 'RESILIENT_GUARDIAN' as const,
      badge: '🛡️',
      title: 'The Resilient Guardian',
      thaiTitle: 'อัศวินแห่งความยืดหยุ่น',
      description: 'มีเกราะป้องกันใจที่ยืดหยุ่นสูง ปรับมุมมองบวกและยอมรับข้อผิดพลาดเป็นโอกาสเรียนรู้ ฟื้นตัวจากแรงกดดันได้อย่างยอดเยี่ยม',
      subtext: 'จิตแพทย์แนะนำ: เหมาะสมกับงานที่มีความกดดันสูงและระยะยาว สามารถเป็นหลักยึดเหนี่ยวทางอารมณ์ให้เพื่อนร่วมงาน',
      color: '#10B981',
      glowColor: 'rgba(16, 185, 129, 0.4)'
    };
  } else {
    archetype = {
      key: 'TEAM_CONNECTOR' as const,
      badge: '🤝',
      title: 'The Team Connector',
      thaiTitle: 'ผู้แสวงหาเครือข่าย',
      description: 'เชี่ยวชาญการสร้างบรรยากาศการทำงานเป็นทีม กล้าปรึกษาอาจารย์และขอคำแนะนำทางเทคนิคเพื่อความปลอดภัยสูงสุดของผู้ป่วย',
      subtext: 'จิตแพทย์แนะนำ: มีทักษะ Interpersonal สูงมาก ช่วยให้การประสานงานข้ามแผนกและทีมพยาบาลใน OR ราบรื่น',
      color: '#3B82F6',
      glowColor: 'rgba(59, 130, 246, 0.4)'
    };
  }

  // 3. Active Buffs (Top strengths among adaptive coping dimensions 1-9)
  const candidateBuffs = [
    {
      id: 'active_coping',
      dimId: 1,
      name: 'Active Execution',
      icon: '⚡',
      score: dimMap.get(1) ?? 0,
      effectDescription: 'ลงมือแก้ปัญหาเฉพาะหน้าทันที ตัดสินใจเด็ดขาดในภาวะฉุกเฉิน',
      clinicalBenefit: 'ลดความลังเลในห้องผ่าตัด ควบคุมสถานการณ์วิกฤตได้ดี'
    },
    {
      id: 'planning',
      dimId: 2,
      name: 'Strategic Planning Shield',
      icon: '🧠',
      score: dimMap.get(2) ?? 0,
      effectDescription: 'คิดวิเคราะห์ล่วงหน้า เตรียมขั้นตอนและแผนสำรองอย่างเป็นระบบ',
      clinicalBenefit: 'ลดภาวะแทรกซ้อนที่ป้องกันได้ และบริหารเวลาการผ่าตัดแม่นยำ'
    },
    {
      id: 'instrumental_support',
      dimId: 3,
      name: 'Alliance Call Link',
      icon: '🤝',
      score: dimMap.get(3) ?? 0,
      effectDescription: 'แสวงหาคำปรึกษาและความรู้ทางเทคนิคจากอาจารย์ผู้เชี่ยวชาญ',
      clinicalBenefit: 'ยกระดับ Patient Safety ผ่านการแลกเปลี่ยนความรู้ในทีม'
    },
    {
      id: 'positive_reframing',
      dimId: 4,
      name: 'Positive Refraction Aegis',
      icon: '🔮',
      score: dimMap.get(4) ?? 0,
      effectDescription: 'เปลี่ยนอุปสรรคและคำวิจารณ์เป็นพลังขับเคลื่อนการเรียนรู้',
      clinicalBenefit: 'ป้องกันภาวะท้อแท้ มี Growth Mindset ต่อการฝึกอบรม'
    },
    {
      id: 'acceptance',
      dimId: 5,
      name: 'Reality Grounding Core',
      icon: '⚖️',
      score: dimMap.get(5) ?? 0,
      effectDescription: 'ยอมรับผลลัพธ์ที่อยู่นอกเหนือการควบคุมโดยไม่เสียกำลังใจ',
      clinicalBenefit: 'คงความเยือกเย็นเมื่อเผชิญภาวะแทรกซ้อนที่หลีกเลี่ยงไม่ได้'
    },
    {
      id: 'emotional_support',
      dimId: 6,
      name: 'Heart Resonance Beacon',
      icon: '💖',
      score: dimMap.get(6) ?? 0,
      effectDescription: 'มีช่องทางแบ่งปันความรู้สึกและรับกำลังใจจากคนใกล้ชิด',
      clinicalBenefit: 'ช่วยระบายความเครียดสะสม ลดความรู้สึกโดดเดี่ยวในการเทรนนิ่ง'
    },
    {
      id: 'humor',
      dimId: 7,
      name: 'Morale Boost Spark',
      icon: '🎭',
      score: dimMap.get(7) ?? 0,
      effectDescription: 'ใช้อารมณ์ขันเพื่อคลายความตึงเครียดของตนเองและเพื่อนร่วมงาน',
      clinicalBenefit: 'สร้างบรรยากาศการเรียนรู้ที่ผ่อนคลายและลดฮอร์โมนความเครียด'
    },
    {
      id: 'mindful_distraction',
      dimId: 9,
      name: 'Mindful Reset Focus',
      icon: '☕',
      score: dimMap.get(9) ?? 0,
      effectDescription: 'จัดสรรช่วงเวลาพักสมองสั้นๆ เพื่อรีเซ็ตสมาธิและความจำ',
      clinicalBenefit: 'ป้องกันข้อผิดพลาดจากอาการล้าสายตาและสมองอ่อนเพลีย'
    }
  ];

  const activeBuffs = candidateBuffs
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((b) => ({
      id: b.id,
      name: b.name,
      icon: b.icon,
      level: b.score >= 4 ? 'Lv. MAX' : b.score >= 3 ? 'Lv. 3' : 'Lv. 2',
      dimensionName: dimensionResults.find((d) => d.id === b.dimId)?.thaiName || b.name,
      score: b.score,
      effectDescription: b.effectDescription,
      clinicalBenefit: b.clinicalBenefit
    }));

  // 4. Energy Drains (Debuffs / Red flags reframed empathetically)
  const energyDrains = [];

  const selfBlameScore = dimMap.get(14) ?? 0;
  if (selfBlameScore >= 2) {
    energyDrains.push({
      id: 'drain_self_blame',
      name: 'Self-Blame Loop',
      icon: '🌀',
      dimensionName: 'การกล่าวโทษตนเอง (Self-blame)',
      score: selfBlameScore,
      reframedTitle: '🌀 Self-Blame Loop: สมองกำลังคิดวนซ้ำเรื่องความผิดพลาด',
      reframedAdvice: 'ควรฝึก Self-Compassion แยกแยะระหว่าง "ความรับผิดชอบอย่างมืออาชีพ" กับ "การลงโทษจิตใจตนเอง" และพูดคุยกับที่ปรึกษา',
      severity: selfBlameScore >= 3 ? ('HIGH' as const) : ('ELEVATED' as const)
    });
  }

  const substanceScore = dimMap.get(12) ?? 0;
  if (substanceScore >= 2) {
    energyDrains.push({
      id: 'drain_substance',
      name: 'Chemical Dependency Risk',
      icon: '☕',
      dimensionName: 'การพึ่งพาสาร/เครื่องดื่ม (Substance Use)',
      score: substanceScore,
      reframedTitle: '☕ Chemical Dependency Risk: สัญญาณเตือนเรื่อง Circadian Rhythm',
      reframedAdvice: 'เป็นสัญญาณเตือนเรื่องสุขอนามัยการนอนหลับ ควรปรับเวลาพักผ่อนและจัดวงจรการนอนแทนการพึ่งพากาแฟปริมาณสูงหรือยานอนหลับ',
      severity: substanceScore >= 3 ? ('HIGH' as const) : ('ELEVATED' as const)
    });
  }

  const disengagementScore = dimMap.get(13) ?? 0;
  if (disengagementScore >= 2) {
    energyDrains.push({
      id: 'drain_disengagement',
      name: 'Battery Low Status',
      icon: '🛑',
      dimensionName: 'การถอดใจหรือหลีกหนีปัญหา (Behavioral Disengagement)',
      score: disengagementScore,
      reframedTitle: '🛑 Battery Low Status: พลังใจเริ่มเข้าสู่ภาวะล้าสะสม',
      reframedAdvice: 'สะท้อนว่าภาระงานเกินขีดจำกัดที่สมองจะรับไหว ควรแบ่งปันงานร่วมกับทีม แจ้งอาจารย์ที่ปรึกษา และขอช่วงเวลาพักฟื้น',
      severity: disengagementScore >= 3 ? ('HIGH' as const) : ('ELEVATED' as const)
    });
  }

  const denialScore = dimMap.get(10) ?? 0;
  if (denialScore >= 2) {
    energyDrains.push({
      id: 'drain_denial',
      name: 'Denial Shield',
      icon: '🌫️',
      dimensionName: 'การปฏิเสธความจริง (Denial)',
      score: denialScore,
      reframedTitle: '🌫️ Denial Shield: กลไกหลีกเลี่ยงเพื่อปกป้องจิตใจชั่วคราว',
      reframedAdvice: 'การมองข้ามปัญหาช่วยลดความเจ็บปวดระยะสั้น แต่ควรเปิดใจรับฟังข้อเท็จจริงเพื่อวางแผนร่วมกับทีมอย่างยั่งยืน',
      severity: denialScore >= 3 ? ('HIGH' as const) : ('MILD' as const)
    });
  }

  const ventingScore = dimMap.get(11) ?? 0;
  if (ventingScore >= 2) {
    energyDrains.push({
      id: 'drain_venting',
      name: 'Pressure Release Valve',
      icon: '💥',
      dimensionName: 'การระบายอารมณ์ (Venting)',
      score: ventingScore,
      reframedTitle: '💥 Pressure Release Valve: การระบายอารมณ์เพื่อลดแรงกดดันเร่งด่วน',
      reframedAdvice: 'ช่วยลดความอึดอัดเฉพาะหน้า แต่ควรพัฒนาเป็นการ Debriefing เชิงสร้างสรรค์ที่ช่วยหาทางออกอย่างสร้างสรรค์',
      severity: ventingScore >= 3 ? ('HIGH' as const) : ('MILD' as const)
    });
  }

  // 5. Micro-Habit Quests
  const microHabits = [
    {
      id: 'quest_1',
      title: '☕ 2-Minute Surgical Debrief',
      category: 'Self-Reset',
      timeEstimate: '2 นาที',
      instruction: 'หลังเสร็จเคสผ่าตัด หายใจเข้า-ออกลึกๆ 4 รอบก่อนเริ่มเขียนชาร์ต เพื่อรีเซ็ตคลื่นสมองจากโหมดผ่าตัด'
    },
    {
      id: 'quest_2',
      title: '🤝 Peer Check-In Signal',
      category: 'Team Support',
      timeEstimate: '3 นาที',
      instruction: 'ส่งข้อความหรือถามไถ่เพื่อนร่วมรุ่น 1 คนในวันที่เวรหนัก เพื่อยืนยันว่าเราไม่ได้เผชิญความกดดันเพียงลำพัง'
    },
    {
      id: 'quest_3',
      title: '🧘 Self-Compassion Protocol',
      category: 'Emotional Care',
      timeEstimate: '1 นาที',
      instruction: 'เมื่อเกิดความผิดพลาดในการทำงาน ให้พูดกับตัวเองด้วยคำแนะนำเดียวกับที่เราจะพูดปลอบโยนเพื่อนสนิท'
    }
  ];

  // Overall Resilience Index (0-100)
  const adaptiveWeighted = strPercent * 0.3 + intPercent * 0.2 + vitPercent * 0.3 + dexPercent * 0.2;
  const drainPenalty = drainPercent * 0.35;
  const overallResilienceIndex = Math.max(15, Math.min(100, Math.round(adaptiveWeighted - drainPenalty + 15)));

  return {
    archetype,
    stats,
    activeBuffs,
    energyDrains,
    microHabits,
    overallResilienceIndex
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
      hospitalOrSchool: cand.hospitalOrSchool,
      candidateContextNote: cand.candidateContextNote
    });
    return {
      ...recomputed,
      id: cand.id || recomputed.id,
      candidateName: cand.candidateName || recomputed.candidateName,
      submittedAt: cand.submittedAt || recomputed.submittedAt,
      candidateContextNote: cand.candidateContextNote || recomputed.candidateContextNote || '',
      institutionalCarePlan: cand.institutionalCarePlan || [],
      committeeNotes: cand.committeeNotes || '',
      committeeStatus: cand.committeeStatus || recomputed.committeeStatus,
      interviewerRating: cand.interviewerRating || 0,
      answers: answers
    };
  }

  const rpgProfile =
    cand.rpgProfile || generateRpgProfile(cand.dimensionResults, cand.redFlagAnalysis);

  return {
    ...cand,
    answers: answers,
    rpgProfile,
    candidateContextNote: cand.candidateContextNote || '',
    institutionalCarePlan: cand.institutionalCarePlan || [],
    committeeNotes: cand.committeeNotes || '',
    committeeStatus: cand.committeeStatus || 'UNREVIEWED',
    interviewerRating: cand.interviewerRating || 0,
    specialty: cand.specialty || 'แพทย์ประจำบ้าน',
    hospitalOrSchool: cand.hospitalOrSchool || ''
  };
}
