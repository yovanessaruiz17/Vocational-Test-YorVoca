/**
 * @project YorVoca - Orientación Vocacional y Exploración Académica en Colombia
 * @author Yordev
 * @description Servidor Express y endpoints de API académica e interpretación vocacional.
 */
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import {
  buildInterpretationPrompt,
  SYSTEM_INSTRUCTION_INTERPRETATION,
} from './src/services/ai/prompts.ts';
import { validateAIInterpretation } from './src/services/ai/schemas.ts';
import { defaultAcademicRepository } from './src/services/academic/AcademicRepository.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '100kb' }));

  app.post('/api/ai/interpret', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || !apiKey.trim()) {
      res.status(200).json({
        available: false,
        message: 'Esta función requiere conexión con la fuente correspondiente.',
      });
      return;
    }

    try {
      const payload = req.body?.payload;
      if (!payload || typeof payload !== 'object') {
        res.status(400).json({
          available: false,
          message: 'Payload de interpretación inválido.',
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: buildInterpretationPrompt(payload),
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_INTERPRETATION,
          temperature: 0.4,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description:
                  'Párrafo breve y orientativo que conecta las dimensiones destacadas con las familias y el Top 5.',
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Lista de 3 fortalezas o afinidades observadas en el perfil.',
              },
              explorationAdvice: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  'Lista de 3 recomendaciones prácticas para explorar las carreras compatibles.',
              },
              reflectionQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  'Lista de 3 preguntas abiertas para la reflexión personal del estudiante.',
              },
            },
            required: [
              'summary',
              'strengths',
              'explorationAdvice',
              'reflectionQuestions',
            ],
          },
        },
      });

      const textOutput = response.text ?? '';
      const validation = validateAIInterpretation(textOutput);

      if (!validation.isValid || !validation.data) {
        res.status(200).json({
          available: false,
          message: 'Respuesta fuera del esquema esperado; usando síntesis determinista.',
        });
        return;
      }

      res.status(200).json({
        available: true,
        interpretation: validation.data,
      });
    } catch (error) {
      console.error('Error en /api/ai/interpret:', error);
      res.status(200).json({
        available: false,
        message: 'Esta función requiere conexión con la fuente correspondiente.',
      });
    }
  });

  // Endpoints internos de consulta académica verificada (Sección 21)
  app.get('/api/academic/institutions', (_req, res) => {
    res.status(200).json({
      institutions: defaultAcademicRepository.getAllInstitutions(),
      lastVerifiedAt: defaultAcademicRepository.getLastVerifiedAt(),
    });
  });

  app.get('/api/academic/programs', (_req, res) => {
    res.status(200).json({
      programs: defaultAcademicRepository.getAllPrograms(),
      lastVerifiedAt: defaultAcademicRepository.getLastVerifiedAt(),
    });
  });

  app.get('/api/academic/programs/:id', (req, res) => {
    const program = defaultAcademicRepository.getProgramById(req.params.id);
    if (!program) {
      res.status(404).json({ error: 'Programa académico no encontrado.' });
      return;
    }
    const institution = defaultAcademicRepository.getInstitutionById(
      program.institutionId
    );
    const officialContent = defaultAcademicRepository.getOfficialContentByProgramId(
      program.programId
    );
    res.status(200).json({
      program,
      institution,
      officialContent,
    });
  });

  app.get('/api/academic/sources/:id', (req, res) => {
    const source = defaultAcademicRepository.getSourceById(req.params.id);
    if (!source) {
      res.status(404).json({ error: 'Fuente académica no encontrada.' });
      return;
    }
    res.status(200).json({ source });
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use('/@vite/client', (_req, res, next) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      next();
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`YorVoca server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
