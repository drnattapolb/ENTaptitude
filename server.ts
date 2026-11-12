import http from 'http';
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { calculateCandidateResult } from './src/utils/scoring';
import { QUESTION_SETS } from './src/data/assessmentData';

// Load environment variables (.env.local takes precedence)
dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // JSON Body Parser with security size boundaries
  app.use(express.json({ limit: '2mb' }));

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // 1. Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'ResiCope Assessment Engine',
      timestamp: new Date().toISOString()
    });
  });

  // 2. Server-Authoritative Evaluation & Answer Verification Endpoint
  // Validates answers securely and calculates 14 dimensions, 4 domains, and Red Flag analysis on backend
  app.post('/api/assessment/evaluate', (req: Request, res: Response) => {
    try {
      const { candidateName, answers, metadata } = req.body;

      // 1. Input Sanitization & Validation
      if (!candidateName || typeof candidateName !== 'string' || !candidateName.trim()) {
        return res.status(400).json({
          success: false,
          error: 'ชื่อ-นามสกุลของผู้สมัครเป็นข้อมูลจำเป็น (Candidate name is required)'
        });
      }

      if (candidateName.trim().length > 120) {
        return res.status(400).json({
          success: false,
          error: 'ชื่อ-นามสกุลยาวเกิน 120 ตัวอักษร (Candidate name exceeds maximum length)'
        });
      }

      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'ข้อมูลคำตอบไม่ถูกต้อง (Invalid assessment answers payload)'
        });
      }

      // 2. Validate all 7 Question Sets
      const validOptions = ['A', 'B', 'C', 'D'];
      for (const set of QUESTION_SETS) {
        const setAnswer = answers[set.id];
        if (!setAnswer) {
          return res.status(400).json({
            success: false,
            error: `ยังตอบชุดคำถามที่ ${set.id} ไม่ครบถ้วน (Missing answers for question set #${set.id})`
          });
        }

        const { most, least } = setAnswer;
        if (!validOptions.includes(most) || !validOptions.includes(least)) {
          return res.status(400).json({
            success: false,
            error: `ตัวเลือกในชุดที่ ${set.id} ไม่ถูกต้อง (Invalid option key in set #${set.id})`
          });
        }

        if (most === least) {
          return res.status(400).json({
            success: false,
            error: `ชุดที่ ${set.id}: ตัวเลือก 'มากที่สุด' และ 'น้อยที่สุด' ต้องไม่ซ้ำกัน (Duplicate option in set #${set.id})`
          });
        }
      }

      // 3. Server-side authoritative evaluation (Cannot be tampered with by client state)
      const sanitizedMetadata = {
        specialty: metadata?.specialty ? String(metadata.specialty).slice(0, 100) : undefined,
        hospitalOrSchool: metadata?.hospitalOrSchool ? String(metadata.hospitalOrSchool).slice(0, 150) : undefined,
        candidateContextNote: metadata?.candidateContextNote ? String(metadata.candidateContextNote).slice(0, 1000) : undefined
      };

      const verifiedResult = calculateCandidateResult(
        candidateName.trim(),
        answers,
        sanitizedMetadata
      );

      // 4. Return server-verified result
      return res.json({
        success: true,
        verified: true,
        evaluatedAt: new Date().toISOString(),
        result: verifiedResult
      });
    } catch (err: any) {
      console.error('Server evaluation error:', err);
      return res.status(500).json({
        success: false,
        error: 'เกิดข้อผิดพลาดในการประมวลผลผลประเมินบนเซิร์ฟเวอร์',
        details: err?.message
      });
    }
  });

  // 3. Vite middleware for development; Static file handler for production
  if (!isProd) {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`ResiCope Server running on http://0.0.0.0:${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
