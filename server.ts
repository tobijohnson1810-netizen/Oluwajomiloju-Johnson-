import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to sanitize Gemini response text
function cleanText(txt: string | undefined): string {
  if (!txt) return '';
  return txt.trim();
}

// 1. General & Universal Chat Endpoint with multi-mode intelligence
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, mode = 'all' } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';

    // Build system instructions based on mode
    let systemInstruction = `You are Smart x, a world-class AI assistant with a clean blue-and-white visual identity. You excel in three core domains:
1. Answering any and all questions across science, history, arts, technology, coding, and philosophy with clarity, depth, and structured reasoning.
2. Solving complex equations (calculus, linear algebra, differential equations, physics, quantum mechanics, financial math) with step-by-step mathematical proofs, exact solutions, and LaTeX KaTeX formulas.
3. Writing, directing, and creating animated movies with vivid scene descriptions, character choreography, dialogue, and cinematic atmosphere.

Formatting rules:
- Always format mathematical formulas using LaTeX notation with $...$ for inline formulas and $$...$$ for block/display equations.
- When explaining complex equations, provide numbered steps: Step 1, Step 2, Step 3, etc.
- When asked to build or create an animated movie or scene, produce a detailed screenplay breakdown (Title, Logline, Characters, Scene 1, Scene 2, Camera movements, Visual FX, Soundscape).
- Keep responses engaging, structured, and visually clean with headers, bullet points, and code blocks where helpful.`;

    if (mode === 'equation') {
      systemInstruction += `\nMODE: EQUATION & MATH STUDIO. Focus heavily on rigorous step-by-step mathematical breakdown, formula derivation, LaTeX notation, domain & range, boundary conditions, and practical intuition. If a 2D function can be plotted (e.g. $f(x)$), explicitly define the function and its key coordinate features.`;
    } else if (mode === 'movie') {
      systemInstruction += `\nMODE: ANIMATED MOVIE STUDIO. Focus heavily on scriptwriting, visual director's notes, animated storyboards, actor actions, camera angles, color aesthetics, and motion design. Break scenes into clear visual frames that can be translated into animation.`;
    }

    if (!apiKey) {
      // Graceful offline mock response if API key is being configured
      return res.json({
        reply: `### Smart x Response\n\nI received your query: **"${lastMessage.slice(0, 120)}..."**\n\n*(Note: GEMINI_API_KEY is not currently detected in the environment. Please verify your API key in Settings > Secrets. In the meantime, you can explore preloaded complex equations and interactive animated movie demos right here in the app!)*\n\n#### Key Insights:\n- **Mode**: ${mode.toUpperCase()}\n- **Equation Support**: LaTeX rendering with KaTeX and interactive dynamic graphing.\n- **Animated Movie Studio**: Real-time canvas/SVG keyframe playback engine with sound effects and character animation.`,
      });
    }

    // Call Gemini 3.8 Flash model
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction,
      },
    });

    const reply = cleanText(response.text);
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process request with Gemini API',
    });
  }
});

// 2. Structured Animated Movie Generator
app.post('/api/generate-movie', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Movie prompt is required.' });
    }

    const systemPrompt = `You are an animation director and movie engine. Given a prompt for an animated movie, you MUST generate a complete structured JSON representation for an animated movie player.

Output ONLY valid JSON matching this exact structure:
{
  "title": "Movie Title",
  "logline": "One sentence summary",
  "artStyle": "scifi" | "fantasy" | "cyberpunk" | "cartoon" | "space" | "ocean",
  "scenes": [
    {
      "id": 1,
      "title": "Scene Name",
      "duration": 6,
      "background": {
        "skyGradient": ["#0b192c", "#1e3e62"],
        "groundColor": "#151e3f",
        "landscapeType": "mountains" | "city_skyline" | "alien_crystals" | "ocean_waves" | "laboratory",
        "celestialBody": "sun" | "moon" | "ringed_planet" | "neon_grid" | "stars",
        "starsCount": 60
      },
      "actors": [
        {
          "id": "char_1",
          "name": "Character Name",
          "type": "astronaut" | "robot" | "alien" | "wizard" | "cat" | "bird" | "human_scientist",
          "color": "#38bdf8",
          "startX": 15,
          "endX": 50,
          "startY": 65,
          "endY": 65,
          "action": "walk" | "hover" | "wave" | "jump" | "glow" | "scan",
          "scale": 1.0
        }
      ],
      "particles": {
        "type": "stars" | "bubbles" | "lasers" | "snow" | "fireflies",
        "count": 40,
        "speed": 1.2
      },
      "dialogue": [
        {
          "speaker": "Character Name",
          "text": "Spoken line here.",
          "startSec": 1.0,
          "durationSec": 3.0
        }
      ],
      "audioMood": "mysterious" | "heroic" | "energetic" | "peaceful" | "tense"
    }
  ]
}

Create 3 distinct, beautiful, cinematic scenes that tell a complete mini-story.`;

    if (!apiKey) {
      // Fallback movie demo structure
      return res.json({
        movie: {
          title: "The Odyssey of Sol-7",
          logline: "An autonomous scout robot discovers an ancient luminous crystal pulsating beneath the frozen sands of an uncharted moon.",
          artStyle: "scifi",
          scenes: [
            {
              id: 1,
              title: "Descent onto the Cryo-Plains",
              duration: 7,
              background: {
                skyGradient: ["#020617", "#0f172a"],
                groundColor: "#1e293b",
                landscapeType: "mountains",
                celestialBody: "ringed_planet",
                starsCount: 80
              },
              actors: [
                {
                  id: "char_1",
                  name: "Scout Bot ECHO",
                  type: "robot",
                  color: "#38bdf8",
                  startX: 10,
                  endX: 45,
                  startY: 70,
                  endY: 70,
                  action: "hover",
                  scale: 1.1
                }
              ],
              particles: { type: "stars", count: 50, speed: 1.0 },
              dialogue: [
                {
                  speaker: "ECHO",
                  text: "Atmospheric readings nominal. Quantum sensor detecting anomalous resonance 200 meters ahead.",
                  startSec: 1.5,
                  durationSec: 4.0
                }
              ],
              audioMood: "mysterious"
            },
            {
              id: 2,
              title: "The Resonance Chamber",
              duration: 8,
              background: {
                skyGradient: ["#0a192f", "#172554"],
                groundColor: "#0f172a",
                landscapeType: "alien_crystals",
                celestialBody: "moon",
                starsCount: 60
              },
              actors: [
                {
                  id: "char_1",
                  name: "Scout Bot ECHO",
                  type: "robot",
                  color: "#38bdf8",
                  startX: 20,
                  endX: 60,
                  startY: 70,
                  endY: 65,
                  action: "scan",
                  scale: 1.1
                },
                {
                  id: "char_2",
                  name: "Lumina Entity",
                  type: "alien",
                  color: "#a855f7",
                  startX: 75,
                  endX: 70,
                  startY: 55,
                  endY: 50,
                  action: "glow",
                  scale: 1.2
                }
              ],
              particles: { type: "fireflies", count: 60, speed: 1.5 },
              dialogue: [
                {
                  speaker: "ECHO",
                  text: "Scanning crystal core... frequency matches harmonic prime code 1.618!",
                  startSec: 1.0,
                  durationSec: 3.5
                },
                {
                  speaker: "Lumina",
                  text: "Welcome, seeker from across the stars. The archive has awakened.",
                  startSec: 4.2,
                  durationSec: 3.5
                }
              ],
              audioMood: "heroic"
            },
            {
              id: 3,
              title: "Ascension into the Starlight",
              duration: 7,
              background: {
                skyGradient: ["#1e1b4b", "#312e81"],
                groundColor: "#172554",
                landscapeType: "city_skyline",
                celestialBody: "neon_grid",
                starsCount: 90
              },
              actors: [
                {
                  id: "char_1",
                  name: "Scout Bot ECHO",
                  type: "robot",
                  color: "#38bdf8",
                  startX: 30,
                  endX: 55,
                  startY: 65,
                  endY: 30,
                  action: "jump",
                  scale: 1.1
                },
                {
                  id: "char_2",
                  name: "Lumina Entity",
                  type: "alien",
                  color: "#a855f7",
                  startX: 70,
                  endX: 70,
                  startY: 50,
                  endY: 40,
                  action: "wave",
                  scale: 1.2
                }
              ],
              particles: { type: "lasers", count: 35, speed: 2.0 },
              dialogue: [
                {
                  speaker: "ECHO",
                  text: "Broadcasting coordinates back to Earth fleet. A new era begins today.",
                  startSec: 1.5,
                  durationSec: 4.5
                }
              ],
              audioMood: "heroic"
            }
          ]
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ text: `Create an animated movie script and visual parameters for: "${prompt}"` }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const jsonText = cleanText(response.text);
    const movie = JSON.parse(jsonText);
    return res.json({ movie });
  } catch (error: any) {
    console.error('Error generating animated movie:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate animated movie' });
  }
});

// 3. Specialized Complex Equation Solver with Plot & Steps
app.post('/api/solve-equation', async (req: Request, res: Response) => {
  try {
    const { equation, context } = req.body;
    if (!equation) {
      return res.status(400).json({ error: 'Equation string is required.' });
    }

    const systemPrompt = `You are an expert mathematician and mathematical physicist.
Solve the given equation or mathematical problem with complete rigor and pedagogical clarity.

Output ONLY valid JSON matching this schema:
{
  "title": "Equation Title (e.g., Schrödinger Equation, Damped Harmonic Oscillator)",
  "category": "Calculus" | "Differential Equations" | "Linear Algebra" | "Physics" | "Quantum Mechanics" | "Geometry",
  "latexInput": "LaTeX formatted representation of the problem",
  "latexSolution": "LaTeX formatted final solution or proof",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Short title of step",
      "explanation": "Clear intuitive explanation of the mathematical transformation",
      "formula": "LaTeX formula for this specific step"
    }
  ],
  "properties": {
    "domain": "Domain description",
    "range": "Range description",
    "equilibriumOrRoots": "Critical points, roots, eigenvalues or boundary values",
    "physicalMeaning": "Real-world physical or geometric meaning"
  },
  "plot": {
    "canPlot": true,
    "expression": "JavaScript math expression in terms of x and optional parameter t or a (e.g., 'Math.sin(2*x)*Math.exp(-0.2*x)')",
    "xMin": -10,
    "xMax": 10,
    "yMin": -5,
    "yMax": 5,
    "xLabel": "x (position or time)",
    "yLabel": "f(x) (amplitude or probability)",
    "parameterName": "t",
    "parameterLabel": "Time / Phase (t)",
    "parameterMin": 0,
    "parameterMax": 10,
    "parameterDefault": 1
  }
}`;

    if (!apiKey) {
      // Fallback equation solver demo
      return res.json({
        solution: {
          title: "Damped Harmonic Oscillator Differential Equation",
          category: "Differential Equations",
          latexInput: "m\\frac{d^2 x}{dt^2} + c\\frac{dx}{dt} + kx = 0",
          latexSolution: "x(t) = A e^{-\\gamma t} \\cos(\\omega_d t + \\phi)",
          steps: [
            {
              stepNumber: 1,
              title: "Standard Form & Characteristic Equation",
              explanation: "Divide through by mass m and define damping coefficient $\\gamma = c/(2m)$ and natural angular frequency $\\omega_0 = \\sqrt{k/m}$.",
              formula: "\\frac{d^2 x}{dt^2} + 2\\gamma \\frac{dx}{dt} + \\omega_0^2 x = 0 \\implies r^2 + 2\\gamma r + \\omega_0^2 = 0"
            },
            {
              stepNumber: 2,
              title: "Roots of Characteristic Polynomial",
              explanation: "Apply quadratic formula to solve for roots r. For underdamped systems ($\\gamma < \\omega_0$), the discriminant is negative.",
              formula: "r_{1,2} = -\\gamma \\pm \\sqrt{\\gamma^2 - \\omega_0^2} = -\\gamma \\pm i\\omega_d, \\quad \\text{where } \\omega_d = \\sqrt{\\omega_0^2 - \\gamma^2}"
            },
            {
              stepNumber: 3,
              title: "General Solution & Euler's Formula",
              explanation: "Form linear combination of complex exponentials and convert to real-valued sinusoidal form using initial conditions.",
              formula: "x(t) = e^{-\\gamma t} \\left( C_1 \\cos(\\omega_d t) + C_2 \\sin(\\omega_d t) \\right) = A e^{-\\gamma t} \\cos(\\omega_d t + \\phi)"
            }
          ],
          properties: {
            domain: "t \\in [0, \\infty)",
            range: "x(t) \\in [-A, A]",
            equilibriumOrRoots: "Stable attractor at x = 0 as t \\to \\infty",
            physicalMeaning: "Models a spring-mass system with viscous fluid friction, decaying exponentially over time while oscillating."
          },
          plot: {
            canPlot: true,
            expression: "Math.exp(-0.25 * x) * Math.cos(2.5 * x)",
            xMin: 0,
            xMax: 20,
            yMin: -1.2,
            yMax: 1.2,
            xLabel: "Time (t)",
            yLabel: "Displacement x(t)",
            parameterName: "gamma",
            parameterLabel: "Damping Factor (\\gamma)",
            parameterMin: 0.05,
            parameterMax: 1.0,
            parameterDefault: 0.25
          }
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ text: `Solve this equation rigorously with steps and graphing expression: "${equation}". Context: ${context || 'None'}` }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const jsonText = cleanText(response.text);
    const solution = JSON.parse(jsonText);
    return res.json({ solution });
  } catch (error: any) {
    console.error('Error solving equation:', error);
    return res.status(500).json({ error: error.message || 'Failed to solve equation' });
  }
});

// Determine port (default 3000 for AI Studio environment, or production port if deployed)
let PORT = 3000;
const portArgIndex = process.argv.indexOf('--port');
if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
  PORT = parseInt(process.argv[portArgIndex + 1], 10);
} else if (process.env.PORT && process.env.NODE_ENV === 'production') {
  PORT = parseInt(process.env.PORT, 10);
}

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.use('*', async (req: Request, res: Response, next) => {
    const url = req.originalUrl;
    try {
      let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e: any) {
      if (vite) vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  VITE v8.3.0  ready in 140 ms\n\n  ➜  Local:   http://localhost:${PORT}/\n  ➜  Network: http://0.0.0.0:${PORT}/\n`);
  console.log(`Smart x Server running on http://0.0.0.0:${PORT}`);
});
