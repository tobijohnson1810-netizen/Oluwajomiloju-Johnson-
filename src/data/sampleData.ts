import { EquationData, MovieData } from '../types';

export const SAMPLE_EQUATIONS: Record<string, EquationData> = {
  schrodinger: {
    title: 'Time-Independent Schrödinger Equation (Quantum Harmonic Oscillator)',
    category: 'Quantum Mechanics',
    latexInput: '-\\frac{\\hbar^2}{2m} \\frac{d^2 \\psi(x)}{dx^2} + \\frac{1}{2} m \\omega^2 x^2 \\psi(x) = E \\psi(x)',
    latexSolution: '\\psi_n(x) = \\left( \\frac{m\\omega}{\\pi \\hbar} \\right)^{1/4} \\frac{1}{\\sqrt{2^n n!}} H_n(\\xi) e^{-\\xi^2 / 2}, \\quad E_n = \\left( n + \\frac{1}{2} \\right) \\hbar \\omega',
    steps: [
      {
        stepNumber: 1,
        title: 'Dimensionless Variable Substitution',
        explanation: 'Introduce the dimensionless spatial coordinate $\\xi = \\sqrt{\\frac{m\\omega}{\\hbar}} x$ and parameter $\\lambda = \\frac{2E}{\\hbar \\omega}$. The differential equation simplifies directly to standard Hermite form.',
        formula: '\\frac{d^2 \\psi}{d\\xi^2} + (\\lambda - \\xi^2)\\psi = 0'
      },
      {
        stepNumber: 2,
        title: 'Asymptotic Behavior at Spatial Infinity',
        explanation: 'As $\\xi \\to \\pm \\infty$, the $\\xi^2$ term dominates over $\\lambda$. For square-integrable wavefunctions (finite probability $\\int |\\psi|^2 dx = 1$), the physical solution must decay exponentially as $e^{-\\xi^2/2}$.',
        formula: '\\psi(\\xi) = u(\\xi) e^{-\\xi^2 / 2} \\implies \\frac{d^2 u}{d\\xi^2} - 2\\xi \\frac{du}{d\\xi} + (\\lambda - 1)u = 0'
      },
      {
        stepNumber: 3,
        title: 'Hermite Polynomials & Energy Quantization',
        explanation: 'Applying power series expansion requires the series to truncate to prevent divergence at infinity. This terminates precisely when $\\lambda - 1 = 2n$ for non-negative integer $n$, producing quantized energy levels.',
        formula: '\\lambda = 2n + 1 \\implies E_n = \\left(n + \\frac{1}{2}\\right) \\hbar \\omega, \\quad n \\in \\{0, 1, 2, \\dots\\}'
      }
    ],
    properties: {
      domain: 'x \\in (-\\infty, \\infty)',
      range: '\\psi_n(x) \\in [-\\text{max}, \\text{max}], \\quad |\\psi_n(x)|^2 \\ge 0',
      equilibriumOrRoots: 'Node count = n roots inside the classical turning points',
      physicalMeaning: 'Describes atomic vibrations in molecules, phonon vibrational modes in crystals, and zero-point energy vacuum fluctuations.'
    },
    plot: {
      canPlot: true,
      expression: 'Math.exp(-0.5 * x * x) * Math.cos(2 * x)',
      xMin: -5,
      xMax: 5,
      yMin: -1.2,
      yMax: 1.2,
      xLabel: 'Position x',
      yLabel: 'Wavefunction \\psi(x)',
      parameterName: 'n',
      parameterLabel: 'Quantum State Mode (n)',
      parameterMin: 1,
      parameterMax: 6,
      parameterDefault: 1
    }
  },

  damped_oscillator: {
    title: 'Damped Harmonic Oscillator Under Viscous Drag',
    category: 'Classical Mechanics / ODEs',
    latexInput: 'm\\frac{d^2 x(t)}{dt^2} + \\beta \\frac{dx(t)}{dt} + k x(t) = 0',
    latexSolution: 'x(t) = A_0 e^{-\\gamma t} \\cos(\\omega_d t + \\phi_0), \\quad \\text{where } \\gamma = \\frac{\\beta}{2m}, \\; \\omega_d = \\sqrt{\\omega_0^2 - \\gamma^2}',
    steps: [
      {
        stepNumber: 1,
        title: 'Conversion to Canonical Second-Order Form',
        explanation: 'Divide by mass $m$ and express in terms of natural angular frequency $\\omega_0 = \\sqrt{k/m}$ and damping ratio $\\gamma = \\beta / (2m)$.',
        formula: '\\ddot{x} + 2\\gamma \\dot{x} + \\omega_0^2 x = 0'
      },
      {
        stepNumber: 2,
        title: 'Characteristic Roots Formulation',
        explanation: 'Assuming an ansatz of $x(t) = e^{rt}$, we construct the quadratic characteristic equation $r^2 + 2\\gamma r + \\omega_0^2 = 0$. In the underdamped regime $(\\gamma < \\omega_0)$, the roots are complex conjugate pairs.',
        formula: 'r_{1,2} = -\\gamma \\pm i \\sqrt{\\omega_0^2 - \\gamma^2} = -\\gamma \\pm i \\omega_d'
      },
      {
        stepNumber: 3,
        title: 'Superposition & Phase-Amplitude Form',
        explanation: 'Applying Euler’s identity to the linear combination of complex exponential terms yields an exponentially decaying sinusoidal envelope.',
        formula: 'x(t) = e^{-\\gamma t} (C_1 \\cos \\omega_d t + C_2 \\sin \\omega_d t) = A_0 e^{-\\gamma t} \\cos(\\omega_d t + \\phi)'
      }
    ],
    properties: {
      domain: 't \\ge 0',
      range: '[-A_0 e^{-\\gamma t}, A_0 e^{-\\gamma t}]',
      equilibriumOrRoots: 'Asymptotically stable equilibrium at x = 0 (origin attractor)',
      physicalMeaning: 'Models shock absorbers, seismic building dampeners, electrical RLC circuits, and acoustic decay in instruments.'
    },
    plot: {
      canPlot: true,
      expression: 'Math.exp(-0.25 * x) * Math.cos(2.8 * x)',
      xMin: 0,
      xMax: 16,
      yMin: -1.2,
      yMax: 1.2,
      xLabel: 'Time t',
      yLabel: 'Displacement x(t)',
      parameterName: 'gamma',
      parameterLabel: 'Damping Factor (\\gamma)',
      parameterMin: 0.05,
      parameterMax: 1.0,
      parameterDefault: 0.25
    }
  },

  fourier_series: {
    title: 'Fourier Series Decomposition of a Square Wave',
    category: 'Harmonic Analysis',
    latexInput: 'f(x) = \\frac{4}{\\pi} \\sum_{k=1, 3, 5, \\dots}^{\\infty} \\frac{\\sin(k x)}{k}',
    latexSolution: 'f(x) = \\frac{4}{\\pi} \\left( \\sin(x) + \\frac{1}{3}\\sin(3x) + \\frac{1}{5}\\sin(5x) + \\dots \\right)',
    steps: [
      {
        stepNumber: 1,
        title: 'Orthogonality of Sinusoidal Basis Functions',
        explanation: 'Because the square wave is an odd periodic function $f(-x) = -f(x)$, all even cosine coefficients $a_n$ vanish identically: $\\int_{-\\pi}^{\\pi} f(x) \\cos(nx) dx = 0$.',
        formula: 'b_n = \\frac{1}{\\pi} \\int_{-\\pi}^{\\pi} f(x) \\sin(nx) dx = \\frac{2}{\\pi} \\int_{0}^{\\pi} 1 \\cdot \\sin(nx) dx'
      },
      {
        stepNumber: 2,
        title: 'Integral Evaluation for Odd Harmonics',
        explanation: 'Integrating gives $b_n = \\frac{2}{n\\pi} [1 - \\cos(n\\pi)]$. For even $n$, $1 - 1 = 0$. For odd $n$, $1 - (-1) = 2$, yielding $b_n = \\frac{4}{n\\pi}$.',
        formula: 'b_n = \\begin{cases} \\frac{4}{n\\pi}, & n \\text{ odd} \\\\ 0, & n \\text{ even} \\end{cases}'
      }
    ],
    properties: {
      domain: 'x \\in (-\\infty, \\infty)',
      range: '[-1, 1]',
      equilibriumOrRoots: 'Exhibits Gibbs phenomenon overshoot of ~9% near discontinuities',
      physicalMeaning: 'Fundamental principle in telecommunications, synthesizer sound generation, digital signal processing, and audio compression.'
    },
    plot: {
      canPlot: true,
      expression: '(4/Math.PI) * (Math.sin(x) + (1/3)*Math.sin(3*x) + (1/5)*Math.sin(5*x) + (1/7)*Math.sin(7*x))',
      xMin: -6.28,
      xMax: 6.28,
      yMin: -1.5,
      yMax: 1.5,
      xLabel: 'Phase angle (rad)',
      yLabel: 'Synthesized Amplitude',
      parameterName: 'k',
      parameterLabel: 'Harmonics Summed',
      parameterMin: 1,
      parameterMax: 9,
      parameterDefault: 4
    }
  }
};

export const SAMPLE_MOVIES: Record<string, MovieData> = {
  scifi_odyssey: {
    title: 'Nebula Odyssey: The First Contact',
    logline: 'An autonomous scout probe reaches an enigmatic crystalline moon orbiting a gas giant, making humanity\'s first extraterrestrial contact.',
    artStyle: 'scifi',
    scenes: [
      {
        id: 1,
        title: 'Atmospheric Entry over the Frozen Plains',
        duration: 7,
        background: {
          skyGradient: ['#020617', '#0f172a'],
          groundColor: '#1e293b',
          landscapeType: 'mountains',
          celestialBody: 'ringed_planet',
          starsCount: 80
        },
        actors: [
          {
            id: 'scout_1',
            name: 'Scout Drone ECHO',
            type: 'robot',
            color: '#38bdf8',
            startX: 12,
            endX: 48,
            startY: 68,
            endY: 66,
            action: 'hover',
            scale: 1.15
          }
        ],
        particles: { type: 'stars', count: 50, speed: 1.2 },
        dialogue: [
          {
            speaker: 'ECHO',
            text: 'Thrusters decelerating. Atmospheric density 0.14 bar. Anomalous harmonic beacon detected 300 meters southeast.',
            startSec: 1.5,
            durationSec: 4.5
          }
        ],
        audioMood: 'mysterious'
      },
      {
        id: 2,
        title: 'The Resonating Crystal Monolith',
        duration: 8,
        background: {
          skyGradient: ['#082f49', '#0369a1'],
          groundColor: '#0c4a6e',
          landscapeType: 'alien_crystals',
          celestialBody: 'moon',
          starsCount: 65
        },
        actors: [
          {
            id: 'scout_1',
            name: 'Scout Drone ECHO',
            type: 'robot',
            color: '#38bdf8',
            startX: 25,
            endX: 52,
            startY: 68,
            endY: 62,
            action: 'scan',
            scale: 1.15
          },
          {
            id: 'alien_1',
            name: 'Lumina Entity',
            type: 'alien',
            color: '#a855f7',
            startX: 78,
            endX: 72,
            startY: 55,
            endY: 48,
            action: 'glow',
            scale: 1.25
          }
        ],
        particles: { type: 'fireflies', count: 60, speed: 1.5 },
        dialogue: [
          {
            speaker: 'ECHO',
            text: 'Scanning monolithic frequency... the crystal matrix is communicating in mathematical prime numbers!',
            startSec: 1.2,
            durationSec: 3.8
          },
          {
            speaker: 'Lumina',
            text: 'Traveler from the third rock. We have awaited the awakening of your signals for three million orbits.',
            startSec: 4.2,
            durationSec: 3.8
          }
        ],
        audioMood: 'heroic'
      },
      {
        id: 3,
        title: 'Cosmic Synchronization',
        duration: 8,
        background: {
          skyGradient: ['#1e1b4b', '#3730a3'],
          groundColor: '#1e1b4b',
          landscapeType: 'city_skyline',
          celestialBody: 'neon_grid',
          starsCount: 90
        },
        actors: [
          {
            id: 'scout_1',
            name: 'Scout Drone ECHO',
            type: 'robot',
            color: '#38bdf8',
            startX: 35,
            endX: 50,
            startY: 62,
            endY: 28,
            action: 'jump',
            scale: 1.15
          },
          {
            id: 'alien_1',
            name: 'Lumina Entity',
            type: 'alien',
            color: '#a855f7',
            startX: 70,
            endX: 70,
            startY: 48,
            endY: 40,
            action: 'wave',
            scale: 1.3
          }
        ],
        particles: { type: 'lasers', count: 40, speed: 2.2 },
        dialogue: [
          {
            speaker: 'ECHO',
            text: 'Quantum relay activated. Broadcasting coordinates to Earth. The silent era of humankind has ended.',
            startSec: 1.5,
            durationSec: 4.8
          }
        ],
        audioMood: 'heroic'
      }
    ]
  },

  cyberpunk_short: {
    title: 'Neon Drift: 2099',
    logline: 'In the rain-soaked shadows of Megacity Blue, a rogue delivery android unlocks a forbidden encrypted data shard.',
    artStyle: 'cyberpunk',
    scenes: [
      {
        id: 1,
        title: 'Rooftops of Sector 9',
        duration: 7,
        background: {
          skyGradient: ['#020617', '#172554'],
          groundColor: '#0f172a',
          landscapeType: 'city_skyline',
          celestialBody: 'neon_grid',
          starsCount: 40
        },
        actors: [
          {
            id: 'char_neon',
            name: 'Courier Unit 4',
            type: 'robot',
            color: '#06b6d4',
            startX: 15,
            endX: 55,
            startY: 68,
            endY: 68,
            action: 'hover',
            scale: 1.1
          }
        ],
        particles: { type: 'snow', count: 60, speed: 2.0 },
        dialogue: [
          {
            speaker: 'Courier Unit 4',
            text: 'Rain sensors at 98% saturation. Route recalculated to bypass Syndicate checkpoints.',
            startSec: 1.0,
            durationSec: 4.0
          }
        ],
        audioMood: 'tense'
      },
      {
        id: 2,
        title: 'The Hidden Quantum Relay',
        duration: 7,
        background: {
          skyGradient: ['#0f172a', '#1e1b4b'],
          groundColor: '#172554',
          landscapeType: 'alien_crystals',
          celestialBody: 'moon',
          starsCount: 50
        },
        actors: [
          {
            id: 'char_neon',
            name: 'Courier Unit 4',
            type: 'robot',
            color: '#06b6d4',
            startX: 30,
            endX: 60,
            startY: 68,
            endY: 65,
            action: 'scan',
            scale: 1.1
          }
        ],
        particles: { type: 'lasers', count: 45, speed: 1.8 },
        dialogue: [
          {
            speaker: 'Courier Unit 4',
            text: 'Encrypted drive decoded: it contains the blue sky protocol from before the Great Cloud.',
            startSec: 1.5,
            durationSec: 4.5
          }
        ],
        audioMood: 'energetic'
      }
    ]
  }
};
