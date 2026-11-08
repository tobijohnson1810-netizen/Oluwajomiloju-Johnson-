export type AIMode = 'all' | 'equation' | 'movie';

export interface DialogueLine {
  speaker: string;
  text: string;
  startSec: number;
  durationSec: number;
}

export interface ActorAnimation {
  id: string;
  name: string;
  type: 'astronaut' | 'robot' | 'alien' | 'wizard' | 'cat' | 'bird' | 'human_scientist';
  color: string;
  startX: number; // 0 to 100%
  endX: number;
  startY: number; // 0 to 100%
  endY: number;
  action: 'walk' | 'hover' | 'wave' | 'jump' | 'glow' | 'scan';
  scale: number;
}

export interface MovieScene {
  id: number;
  title: string;
  duration: number; // seconds
  background: {
    skyGradient: [string, string];
    groundColor?: string;
    landscapeType: 'mountains' | 'city_skyline' | 'alien_crystals' | 'ocean_waves' | 'laboratory';
    celestialBody?: 'sun' | 'moon' | 'ringed_planet' | 'neon_grid' | 'stars';
    starsCount?: number;
  };
  actors: ActorAnimation[];
  particles?: {
    type: 'stars' | 'bubbles' | 'lasers' | 'snow' | 'fireflies';
    count: number;
    speed: number;
  };
  dialogue: DialogueLine[];
  audioMood: 'mysterious' | 'heroic' | 'energetic' | 'peaceful' | 'tense';
}

export interface MovieData {
  title: string;
  logline: string;
  artStyle: 'scifi' | 'fantasy' | 'cyberpunk' | 'cartoon' | 'space' | 'ocean';
  scenes: MovieScene[];
}

export interface EquationStep {
  stepNumber: number;
  title: string;
  explanation: string;
  formula: string;
}

export interface EquationPlotConfig {
  canPlot: boolean;
  expression: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xLabel?: string;
  yLabel?: string;
  parameterName?: string;
  parameterLabel?: string;
  parameterMin?: number;
  parameterMax?: number;
  parameterDefault?: number;
}

export interface EquationData {
  title: string;
  category: string;
  latexInput: string;
  latexSolution: string;
  steps: EquationStep[];
  properties: {
    domain?: string;
    range?: string;
    equilibriumOrRoots?: string;
    physicalMeaning?: string;
  };
  plot?: EquationPlotConfig;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  mode?: AIMode;
  equationData?: EquationData;
  movieData?: MovieData;
  isGenerating?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  mode: AIMode;
  createdAt: number;
  messages: ChatMessage[];
}
