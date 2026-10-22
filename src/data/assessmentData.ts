import { DimensionDefinition, QuestionSet } from '../types/assessment';

export const DIMENSIONS: DimensionDefinition[] = [
  {
    id: 1,
    name: 'Active Coping',
    thaiName: 'การแก้ปัญหาเชิงรุกและลงมือทำทันที',
    domainId: 1,
    isRedFlag: false,
    itemLocations: ['ชุดที่ 1 (A)', 'ชุดที่ 4 (B)'],
    fullScore: 4,
    description: 'การจัดการปัญหาโดยตรง มีความกระตือรือร้นในการแก้ไขวิกฤติตรงหน้าอย่างเป็นรูปธรรม'
  },
  {
    id: 2,
    name: 'Planning',
    thaiName: 'การวางแผนและจัดระบบงานล่วงหน้า',
    domainId: 1,
    isRedFlag: false,
    itemLocations: ['ชุดที่ 1 (B)', 'ชุดที่ 2 (A)'],
    fullScore: 4,
    description: 'การคิดเชิงกลยุทธ์ วางลำดับขั้นตอนเตรียมพร้อมรับมือปัญหา และจัดสรรทรัพยากรอย่างมีระบบ'
  },
  {
    id: 3,
    name: 'Instrumental Support',
    thaiName: 'การขอคำปรึกษาและขอความช่วยเหลือเชิงวิชาการ',
    domainId: 1,
    isRedFlag: false,
    itemLocations: ['ชุดที่ 1 (C)', 'ชุดที่ 2 (D)'],
    fullScore: 4,
    description: 'การตระหนักถึงขีดจำกัดตนเอง รีบขอคำชี้แนะจากอาจารย์หรือรุ่นพี่เพื่อความปลอดภัยของผู้ป่วย'
  },
  {
    id: 4,
    name: 'Positive Reframing',
    thaiName: 'การมองโลกเชิงบวกและปรับมุมมอง',
    domainId: 2,
    isRedFlag: false,
    itemLocations: ['ชุดที่ 1 (D)', 'ชุดที่ 2 (B)'],
    fullScore: 4,
    description: 'การมองวิกฤติเป็นโอกาสในการเรียนรู้ เพิ่มพูนความแข็งแกร่งทางจิตใจและประสบการณ์'
  },
  {
    id: 5,
    name: 'Acceptance',
    thaiName: 'การยอมรับความจริงและข้อจำกัด',
    domainId: 2,
    isRedFlag: false,
    itemLocations: ['ชุดที่ 2 (C)', 'ชุดที่ 5 (D)'],
    fullScore: 4,
    description: 'การยอมรับสภาพความเป็นจริงของระบบและข้อจำกัดของมนุษย์โดยไม่ต่อต้านอย่างไร้ประโยชน์'
  },
  {
    id: 6,
    name: 'Emotional Support',
    thaiName: 'การแสวงหากำลังใจและความเห็นอกเห็นใจ',
    domainId: 2,
    isRedFlag: false,
    itemLocations: ['ชุดที่ 5 (A)', 'ชุดที่ 6 (C)'],
    fullScore: 4,
    description: 'การเปิดใจขอพลังใจและความอบอุ่นจากครอบครัว คนรัก และเพื่อนร่วมวิชาชีพ'
  },
  {
    id: 7,
    name: 'Humor',
    thaiName: 'การใช้อารมณ์ขันคลายเครียด',
    domainId: 2,
    isRedFlag: false,
    itemLocations: ['ชุดที่ 3 (D)', 'ชุดที่ 5 (C)'],
    fullScore: 4,
    description: 'การคลี่คลายบรรยากาศตึงเครียดด้วยมุมมองขำขันและการหยอกล้อสร้างความผ่อนคลาย'
  },
  {
    id: 8,
    name: 'Religion',
    thaiName: 'การใช้หลักธรรมและที่พึ่งทางจิตวิญญาณ',
    domainId: 2,
    isRedFlag: false,
    itemLocations: ['ชุดที่ 5 (B)', 'ชุดที่ 7 (C)'],
    fullScore: 4,
    description: 'การทำสมาธิ สวดมนต์ ปล่อยวางตามหลักธรรม หรืออาศัยความสงบทางจิตใจ'
  },
  {
    id: 9,
    name: 'Self-distraction',
    thaiName: 'การเบี่ยงเบนความสนใจเพื่อประคองสมาธิ',
    domainId: 3,
    isRedFlag: false,
    itemLocations: ['ชุดที่ 4 (A)', 'ชุดที่ 6 (A)'],
    fullScore: 4,
    description: 'การใช้กิจกรรมสันทนาการ กาแฟ หรืองีบสั้นเพื่อพักสมองชั่วคราวก่อนกลับมาทำงาน'
  },
  {
    id: 10,
    name: 'Denial',
    thaiName: 'การปฏิเสธความจริงหรือเก็บกดปัญหา 🚩',
    domainId: 4,
    isRedFlag: true,
    itemLocations: ['ชุดที่ 3 (B)', 'ชุดที่ 7 (D)'],
    fullScore: 4,
    description: 'พยายามทำเหมือนไม่มีปัญหาเกิดขึ้น หลีกเลี่ยงการเผชิญหน้ากับความจริง'
  },
  {
    id: 11,
    name: 'Venting',
    thaiName: 'การระบายอารมณ์และบ่นความอึดอัด 🚩',
    domainId: 4,
    isRedFlag: true,
    itemLocations: ['ชุดที่ 3 (A)', 'ชุดที่ 7 (A)'],
    fullScore: 4,
    description: 'เน้นการระบายความรู้สึกเชิงลบหรือบ่นความยากลำบากบ่อยครั้งโดยไม่เข้าสู่การแก้ปัญหา'
  },
  {
    id: 12,
    name: 'Substance Use',
    thaiName: 'การพึ่งพาสาร/ยานอนหลับ/แอลกอฮอล์ 🚩',
    domainId: 4,
    isRedFlag: true,
    itemLocations: ['ชุดที่ 4 (D)', 'ชุดที่ 7 (B)'],
    fullScore: 4,
    description: 'การใช้ยาช่วยนอนหลับ แอลกอฮอล์ หรือสารเคมีเพื่อตัดขาดจากความกดดัน'
  },
  {
    id: 13,
    name: 'Behavioral Disengagement',
    thaiName: 'การถอดใจและถอยหนีภาระหน้าที่ 🚩',
    domainId: 4,
    isRedFlag: true,
    itemLocations: ['ชุดที่ 4 (C)', 'ชุดที่ 6 (D)'],
    fullScore: 4,
    description: 'การละทิ้งความพยายาม ลดการรับผิดชอบ หรือล้มเลิกเป้าหมายเมื่อเผชิญอุปสรรค'
  },
  {
    id: 14,
    name: 'Self-blame',
    thaiName: 'การตอกย้ำและโทษตนเองเกินควร 🚩',
    domainId: 4,
    isRedFlag: true,
    itemLocations: ['ชุดที่ 3 (C)', 'ชุดที่ 6 (B)'],
    fullScore: 4,
    description: 'การคิดวนเวียนซ้ำเติมความผิดพลาด วิตกกังวลในคุณค่าความสามารถของตนเอง'
  }
];

export const QUESTION_SETS: QuestionSet[] = [
  {
    id: 1,
    title: 'ชุดที่ 1: การเผชิญวิกฤติเฉียบพลันในห้องผ่าตัด',
    scenario: 'เมื่อต้องเข้าเคส Airway Emergency หรือเจอภาวะเลือดออกไม่หยุดในห้องผ่าตัด:',
    options: [
      {
        id: 'A',
        text: 'ประเมินสัญญาณชีพ จัดลำดับความสำคัญ และลงมือทำหัตถการห้ามเลือด/เปิดทางเดินหายใจทันที',
        dimensionName: 'Active Coping',
        dimensionId: 1,
        dimensionLabel: 'Active Coping 1',
        isRedFlag: false,
        domainId: 1
      },
      {
        id: 'B',
        text: 'ตั้งใจว่าจะทบทวนขั้นตอนการผ่าตัด วางแผนรับมือภาวะแทรกซ้อน และจัดเตรียมอุปกรณ์สำรองล่วงหน้าในครั้งถัดไป',
        dimensionName: 'Planning',
        dimensionId: 2,
        dimensionLabel: 'Planning 1',
        isRedFlag: false,
        domainId: 1
      },
      {
        id: 'C',
        text: 'รีบขอความช่วยเหลือหรือปรึกษาอาจารย์/แพทย์ประจำบ้านรุ่นพี่เพื่อร่วมกันตัดสินใจ',
        dimensionName: 'Instrumental Support',
        dimensionId: 3,
        dimensionLabel: 'Instrumental Support 1',
        isRedFlag: false,
        domainId: 1
      },
      {
        id: 'D',
        text: 'มองว่าภาวะกดดันนี้เป็นสถานการณ์ที่ช่วยฝึกทักษะการตัดสินใจในการผ่าตัดอย่างยิ่ง',
        dimensionName: 'Positive Reframing',
        dimensionId: 4,
        dimensionLabel: 'Positive Reframing 1',
        isRedFlag: false,
        domainId: 2
      }
    ]
  },
  {
    id: 2,
    title: 'ชุดที่ 2: การบริหารเวลาและภาระงานหลายด้าน',
    scenario: 'เมื่อต้องจัดสรรเวลาระหว่างงานดูแลผู้ป่วยในวอร์ด งานวิจัยประจำปี และการเตรียม Case Conference:',
    options: [
      {
        id: 'A',
        text: 'จัดทำตารางเวลา กำหนดวันส่งงาน และแบ่งช่วงเวลาการทำงานวิจัยอย่างเป็นระบบ',
        dimensionName: 'Planning',
        dimensionId: 2,
        dimensionLabel: 'Planning 2',
        isRedFlag: false,
        domainId: 1
      },
      {
        id: 'B',
        text: 'มองว่าภาระงานที่หนักหน่วงเป็นบทเรียนสำคัญที่ช่วยฝึกฝนความอดทนและการบริหารเวลา',
        dimensionName: 'Positive Reframing',
        dimensionId: 4,
        dimensionLabel: 'Positive Reframing 2',
        isRedFlag: false,
        domainId: 2
      },
      {
        id: 'C',
        text: 'ยอมรับความจริงว่าภาระงานที่มากเป็นธรรมชาติของการเทรน ENT และต้องค่อยๆ ทำไปตามกำลัง',
        dimensionName: 'Acceptance',
        dimensionId: 5,
        dimensionLabel: 'Acceptance 1',
        isRedFlag: false,
        domainId: 2
      },
      {
        id: 'D',
        text: 'รีบปรึกษาและขอคำแนะนำเชิงวิชาการ/สถิติวิจัยจากอาจารย์หรือผู้เชี่ยวชาญเพิ่มเติมตั้งแต่เนิ่นๆ',
        dimensionName: 'Instrumental Support',
        dimensionId: 3,
        dimensionLabel: 'Instrumental Support 2',
        isRedFlag: false,
        domainId: 1
      }
    ]
  },
  {
    id: 3,
    title: 'ชุดที่ 3: ภาวะแทรกซ้อนและความเหนื่อยล้าทางอารมณ์',
    scenario: 'เมื่อเกิดภาวะแทรกซ้อนจากการผ่าตัด หรือถูกกดดันจากอาจารย์/ผู้ป่วยจนรู้สึกเหนื่อยล้า คุณจะ:',
    options: [
      {
        id: 'A',
        text: 'พูดคุยระบายความอึดอัดใจหรือบ่นความเหน็ดเหนื่อยให้เพื่อนแพทย์หรือคนใกล้ชิดฟังเพื่อปลดปล่อย',
        dimensionName: 'Venting',
        dimensionId: 11,
        dimensionLabel: 'Venting 1',
        isRedFlag: true,
        domainId: 4
      },
      {
        id: 'B',
        text: 'พยายามพักสมองโดยไม่นำเรื่องผิดพลาดหรือความเครียดกลับมาคิดซ้ำที่บ้าน',
        dimensionName: 'Denial',
        dimensionId: 10,
        dimensionLabel: 'Denial 1',
        isRedFlag: true,
        domainId: 4
      },
      {
        id: 'C',
        text: 'รู้สึกเสียใจและคิดทบทวนกับตัวเองว่าตนเองรอบคอบหรือเก่งพอสำหรับการเป็นResidentหรือไม่',
        dimensionName: 'Self-blame',
        dimensionId: 14,
        dimensionLabel: 'Self-blame 1',
        isRedFlag: true,
        domainId: 4
      },
      {
        id: 'D',
        text: 'พยายามปรับ mood ด้วยการหาเรื่องขำขันหรือคุยหยอกล้อกับเพื่อนในห้องพักแพทย์',
        dimensionName: 'Humor',
        dimensionId: 7,
        dimensionLabel: 'Humor 1',
        isRedFlag: false,
        domainId: 2
      }
    ]
  },
  {
    id: 4,
    title: 'ชุดที่ 4: การอดนอนจากการอยู่เวรดึกและความล้าสะสม',
    scenario: 'เมื่อต้องอดนอนติดต่อกันจากการอยู่เวรดึก และเริ่มมีปัญหาเรื่องสมาธิไม่ดี หลับในตอนกลางวันบ่อยๆ :',
    options: [
      {
        id: 'A',
        text: 'ใช้กาแฟ เครื่องดื่มชูกำลัง หรือการงีบสั้นๆ เพื่อพยุงร่างกายให้ปฏิบัติหน้าที่ต่อได้',
        dimensionName: 'Self-distraction',
        dimensionId: 9,
        dimensionLabel: 'Self-distraction 1',
        isRedFlag: false,
        domainId: 3
      },
      {
        id: 'B',
        text: 'พยายามทุ่มเททำภาระงานตรงหน้าให้เสร็จตามหน้าที่แม้ร่างกายจะเหนื่อยล้ามาก',
        dimensionName: 'Active Coping',
        dimensionId: 1,
        dimensionLabel: 'Active Coping 2',
        isRedFlag: false,
        domainId: 1
      },
      {
        id: 'C',
        text: 'ลดการทำงานในวันนั้นลง เก้บไว้ทำวันอื่น ทำเฉพาะงานส่วนที่จำเป็นเพื่อประคองร่างกาย',
        dimensionName: 'Behavioral Disengagement',
        dimensionId: 13,
        dimensionLabel: 'Behavioral Disengagement 1',
        isRedFlag: true,
        domainId: 4
      },
      {
        id: 'D',
        text: 'ใช้ยาช่วยนอนหลับ หรือดื่มแอลกอฮอล์เล็กน้อยหลังเลิกเวรเพื่อช่วยให้หลับสนิทลงในเวลาอันจำกัด',
        dimensionName: 'Substance Use',
        dimensionId: 12,
        dimensionLabel: 'Substance Use 1',
        isRedFlag: true,
        domainId: 4
      }
    ]
  },
  {
    id: 5,
    title: 'ชุดที่ 5: ความขัดแย้งในทีมและความโดดเดี่ยวในการรับผิดชอบ',
    scenario: 'เมื่อเกิดความขัดแย้งกับเพื่อนร่วมงาน หรือรู้สึกโดดเดี่ยวในการแบกรับความรับผิดชอบ:',
    options: [
      {
        id: 'A',
        text: 'หาจังหวะพูดคุยเปิดใจ และขอพลังใจจากครอบครัว คนรัก หรือเพื่อนสนิท',
        dimensionName: 'Emotional Support',
        dimensionId: 6,
        dimensionLabel: 'Emotional Support 1',
        isRedFlag: false,
        domainId: 2
      },
      {
        id: 'B',
        text: 'สวดมนต์ ทำสมาธิ หรือใช้หลักธรรม/ที่พึ่งทางจิตวิญญาณเพื่อให้จิตใจสงบและมีสติ',
        dimensionName: 'Religion',
        dimensionId: 8,
        dimensionLabel: 'Religion 1',
        isRedFlag: false,
        domainId: 2
      },
      {
        id: 'C',
        text: 'มองข้อขัดแย้งด้วยอารมณ์ขันและไม่เก็บเอาคำพูดกระทบกระทั่งมาใส่ใจ',
        dimensionName: 'Humor',
        dimensionId: 7,
        dimensionLabel: 'Humor 2',
        isRedFlag: false,
        domainId: 2
      },
      {
        id: 'D',
        text: 'ยอมรับข้อจำกัดของระบบงานและคนรอบข้าง เพราะเราไม่สามารถเปลี่ยนแปลงสิ่งที่ไม่สามารถแก้ได้',
        dimensionName: 'Acceptance',
        dimensionId: 5,
        dimensionLabel: 'Acceptance 2',
        isRedFlag: false,
        domainId: 2
      }
    ]
  },
  {
    id: 6,
    title: 'ชุดที่ 6: การรับฟังคำวิจารณ์ใน M&M Conference',
    scenario: 'เมื่อคุณเป็นเจ้าของเคสที่ถูกพิจารณานำเข้า M&M Conference และต้องฟังคนวิจารณ์ การตัดสินใจที่ผิดพลาดของตน:',
    options: [
      {
        id: 'A',
        text: 'ถอนความสนใจจากความล้มเหลว หันไปทำกิจกรรมที่ชอบเพื่อพักผ่อนสมอง',
        dimensionName: 'Self-distraction',
        dimensionId: 9,
        dimensionLabel: 'Self-distraction 2',
        isRedFlag: false,
        domainId: 3
      },
      {
        id: 'B',
        text: 'รู้สึกตอกย้ำความบกพร่องและซ้ำเติมตนเองว่าตนเองเป็นสาเหตุหลักของปัญหา',
        dimensionName: 'Self-blame',
        dimensionId: 14,
        dimensionLabel: 'Self-blame 2',
        isRedFlag: true,
        domainId: 4
      },
      {
        id: 'C',
        text: 'ขอความเห็นอกเห็นใจและคำปลอบใจจากเพื่อนแพทย์รุ่นเดียวกันเพื่อให้ผ่านความรู้สึกแย่ไปได้',
        dimensionName: 'Emotional Support',
        dimensionId: 6,
        dimensionLabel: 'Emotional Support 2',
        isRedFlag: false,
        domainId: 2
      },
      {
        id: 'D',
        text: 'ถอดใจและถอยออกจากปัญหา ปล่อยให้เคสถูกวิจารณ์ไปโดยไม่พยายามหาทางแก้ไขหรือพัฒนาต่อ',
        dimensionName: 'Behavioral Disengagement',
        dimensionId: 13,
        dimensionLabel: 'Behavioral Disengagement 2',
        isRedFlag: true,
        domainId: 4
      }
    ]
  },
  {
    id: 7,
    title: 'ชุดที่ 7: ภาวะตึงเครียดสะสมนอกเวลางานและชีวิตส่วนตัว',
    scenario: 'เมื่อต้องรับมือกับความตึงเครียดสะสมนอกเวลางาน เช่น สุขภาพตนเองเสื่อมโทรม ภาระทางการเงิน หรือไม่มีเวลาให้คนรอบข้าง:',
    options: [
      {
        id: 'A',
        text: 'พูดคุยแลกเปลี่ยนหรือบ่นระบายความอึดอัดใจเรื่องระบบงานและภาระชีวิตให้คนใกล้ชิดฟังเพื่อปลดปล่อย',
        dimensionName: 'Venting',
        dimensionId: 11,
        dimensionLabel: 'Venting 2',
        isRedFlag: true,
        domainId: 4
      },
      {
        id: 'B',
        text: 'นัดสังสรรค์จิบเครื่องดื่มผ่อนคลายกับเพื่อนฝูงในช่วงสุดสัปดาห์ หรือใช้ตัวช่วย/ยาช่วยนอนหลับ เพื่อให้ตัดเรื่องงานและพักผ่อนได้เต็มที่ในวันหยุด',
        dimensionName: 'Substance Use',
        dimensionId: 12,
        dimensionLabel: 'Substance Use 2',
        isRedFlag: true,
        domainId: 4
      },
      {
        id: 'C',
        text: 'แสวงหาความสงบทางจิตใจ เชื่อมั่นในเรื่องโชคชะตา ทำบุญ หรือใช้หลักธรรมเพื่อปล่อยวาง',
        dimensionName: 'Religion',
        dimensionId: 8,
        dimensionLabel: 'Religion 2',
        isRedFlag: false,
        domainId: 2
      },
      {
        id: 'D',
        text: 'พยายามไม่พูดถึงปัญหาชีวิตที่มี และทำเหมือนว่าตนเองยังคงจัดการทุกอย่างในชีวิตได้เป็นปกติ',
        dimensionName: 'Denial',
        dimensionId: 10,
        dimensionLabel: 'Denial 2',
        isRedFlag: true,
        domainId: 4
      }
    ]
  }
];

export const COMMITTEE_PASSWORD = '9413';
