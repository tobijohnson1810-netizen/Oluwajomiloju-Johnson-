import React, { useRef, useEffect, useState, useMemo } from 'react';
import { EquationPlotConfig } from '../types';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Sliders, Eye } from 'lucide-react';
import katex from 'katex';

interface EquationGrapherProps {
  plotConfig: EquationPlotConfig;
  title?: string;
  formulaLatex?: string;
}

export const EquationGrapher: React.FC<EquationGrapherProps> = ({
  plotConfig,
  title = 'Interactive Equation Visualizer',
  formulaLatex,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // View bounds
  const [xMin, setXMin] = useState(plotConfig.xMin ?? -10);
  const [xMax, setXMax] = useState(plotConfig.xMax ?? 10);
  const [yMin, setYMin] = useState(plotConfig.yMin ?? -5);
  const [yMax, setYMax] = useState(plotConfig.yMax ?? 5);

  // Dynamic Parameter (e.g. time t, damping, frequency)
  const paramName = plotConfig.parameterName || 't';
  const paramMin = plotConfig.parameterMin ?? 0;
  const paramMax = plotConfig.parameterMax ?? 10;
  const [paramVal, setParamVal] = useState<number>(plotConfig.parameterDefault ?? 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number; px: number; py: number } | null>(null);

  // Safe compiler for user/AI expression
  const evalFunc = useMemo(() => {
    try {
      let expr = plotConfig.expression;
      // Replace power ^ with **
      expr = expr.replace(/\^/g, '**');

      // Allow common names like sin, cos, tan, exp, sqrt, pi, abs, ln, log
      const compiled = new Function(
        'x',
        paramName,
        `
        const sin = Math.sin;
        const cos = Math.cos;
        const tan = Math.tan;
        const exp = Math.exp;
        const sqrt = Math.sqrt;
        const abs = Math.abs;
        const pi = Math.PI;
        const PI = Math.PI;
        const ln = Math.log;
        const log = Math.log;
        const pow = Math.pow;
        try {
          return (${expr});
        } catch (err) {
          return NaN;
        }
      `
      );
      return compiled;
    } catch (e) {
      return () => 0;
    }
  }, [plotConfig.expression, paramName]);

  // Animation frame loop for playing parameter
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      if (isPlaying) {
        const deltaSec = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        setParamVal((prev) => {
          let next = prev + deltaSec * ((paramMax - paramMin) * 0.15);
          if (next > paramMax) next = paramMin;
          return next;
        });

        animId = requestAnimationFrame(loop);
      }
    };

    if (isPlaying) {
      lastTime = performance.now();
      animId = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, paramMin, paramMax]);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Coordinate converters
    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Subtle blue background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#f8fafc');
    bgGrad.addColorStop(1, '#f0f9ff');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Draw Grid
    if (showGrid) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#e2e8f0';

      // X grid
      const xRange = xMax - xMin;
      const xStep = Math.pow(10, Math.floor(Math.log10(xRange))) / (xRange < 5 ? 2 : 1);
      const firstX = Math.ceil(xMin / xStep) * xStep;

      for (let x = firstX; x <= xMax; x += xStep) {
        const cx = toCanvasX(x);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.stroke();

        // Label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(Number(x.toFixed(2)).toString(), cx + 3, height - 6);
      }

      // Y grid
      const yRange = yMax - yMin;
      const yStep = Math.pow(10, Math.floor(Math.log10(yRange))) / (yRange < 5 ? 2 : 1);
      const firstY = Math.ceil(yMin / yStep) * yStep;

      for (let y = firstY; y <= yMax; y += yStep) {
        const cy = toCanvasY(y);
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(width, cy);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px JetBrains Mono, monospace';
        if (Math.abs(y) > 0.001) {
          ctx.fillText(Number(y.toFixed(2)).toString(), 6, cy - 3);
        }
      }
    }

    // Axes
    const zeroX = toCanvasX(0);
    const zeroY = toCanvasY(0);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#64748b';

    // X Axis
    if (zeroY >= 0 && zeroY <= height) {
      ctx.beginPath();
      ctx.moveTo(0, zeroY);
      ctx.lineTo(width, zeroY);
      ctx.stroke();
    }

    // Y Axis
    if (zeroX >= 0 && zeroX <= width) {
      ctx.beginPath();
      ctx.moveTo(zeroX, 0);
      ctx.lineTo(zeroX, height);
      ctx.stroke();
    }

    // Plot Curve
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#2563eb'; // Vibrant royal blue
    ctx.shadowColor = 'rgba(37, 99, 235, 0.35)';
    ctx.shadowBlur = 6;

    let hasStarted = false;
    const steps = 600;
    const dx = (xMax - xMin) / steps;

    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      const y = evalFunc(x, paramVal);

      if (!isNaN(y) && isFinite(y)) {
        const cx = toCanvasX(x);
        const cy = toCanvasY(y);

        if (!hasStarted) {
          ctx.moveTo(cx, cy);
          hasStarted = true;
        } else {
          ctx.lineTo(cx, cy);
        }
      } else {
        hasStarted = false;
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Plot Shaded Area below curve
    ctx.lineTo(toCanvasX(xMax), zeroY >= 0 && zeroY <= height ? zeroY : height);
    ctx.lineTo(toCanvasX(xMin), zeroY >= 0 && zeroY <= height ? zeroY : height);
    ctx.closePath();
    const areaGrad = ctx.createLinearGradient(0, 0, 0, height);
    areaGrad.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
    areaGrad.addColorStop(1, 'rgba(59, 130, 246, 0.01)');
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // Mouse coordinates inspection
    if (mouseCoord) {
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#3b82f6';

      // Vertical dashed line
      ctx.beginPath();
      ctx.moveTo(mouseCoord.px, 0);
      ctx.lineTo(mouseCoord.px, height);
      ctx.stroke();

      // Horizontal dashed line
      ctx.beginPath();
      ctx.moveTo(0, mouseCoord.py);
      ctx.lineTo(width, mouseCoord.py);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point circle
      ctx.beginPath();
      ctx.arc(mouseCoord.px, mouseCoord.py, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#1d4ed8';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [xMin, xMax, yMin, yMax, paramVal, evalFunc, showGrid, mouseCoord]);

  // Handle canvas mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const x = xMin + (px / canvas.width) * (xMax - xMin);
    const yVal = evalFunc(x, paramVal);
    const canvasY = canvas.height - ((yVal - yMin) / (yMax - yMin)) * canvas.height;

    if (!isNaN(yVal) && isFinite(yVal)) {
      setMouseCoord({ x, y: yVal, px, py: canvasY });
    } else {
      setMouseCoord(null);
    }
  };

  const handleZoom = (factor: number) => {
    const xMid = (xMin + xMax) / 2;
    const yMid = (yMin + yMax) / 2;
    const newHalfX = ((xMax - xMin) / 2) * factor;
    const newHalfY = ((yMax - yMin) / 2) * factor;
    setXMin(xMid - newHalfX);
    setXMax(xMid + newHalfX);
    setYMin(yMid - newHalfY);
    setYMax(yMid + newHalfY);
  };

  const handleReset = () => {
    setXMin(plotConfig.xMin ?? -10);
    setXMax(plotConfig.xMax ?? 10);
    setYMin(plotConfig.yMin ?? -5);
    setYMax(plotConfig.yMax ?? 5);
    setParamVal(plotConfig.parameterDefault ?? 1);
  };

  return (
    <div className="w-full my-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-blue-50/70 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/40">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
          <h4 className="text-sm font-semibold text-blue-950 dark:text-blue-100">{title}</h4>
        </div>

        {formulaLatex && (
          <div
            className="text-xs px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 font-mono"
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(formulaLatex, { displayMode: false, throwOnError: false }),
            }}
          />
        )}

        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <button
            onClick={() => handleZoom(0.8)}
            title="Zoom In"
            className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(1.25)}
            title="Zoom Out"
            className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid"
            className={`p-1.5 rounded-md transition-colors ${showGrid ? 'bg-blue-100 dark:bg-blue-900/70 text-blue-700 dark:text-blue-200' : 'hover:bg-white dark:hover:bg-slate-800'}`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            title="Reset View"
            className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full h-64 sm:h-80 bg-slate-50 dark:bg-slate-950">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMouseCoord(null)}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Hover Coordinate Tooltip */}
        {mouseCoord && (
          <div
            className="absolute pointer-events-none px-2.5 py-1 text-xs rounded-md bg-slate-900/90 text-white font-mono shadow-lg border border-slate-700 transform -translate-x-1/2 -translate-y-9"
            style={{
              left: `${(mouseCoord.px / 800) * 100}%`,
              top: `${(mouseCoord.py / 400) * 100}%`,
            }}
          >
            x: {mouseCoord.x.toFixed(3)}, y: {mouseCoord.y.toFixed(3)}
          </div>
        )}
      </div>

      {/* Parameter Animation Slider */}
      <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-blue-900/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Animate'}</span>
          </button>

          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
              {plotConfig.parameterLabel || `${paramName}`}: {paramVal.toFixed(2)}
            </span>
            <input
              type="range"
              min={paramMin}
              max={paramMax}
              step={(paramMax - paramMin) / 100}
              value={paramVal}
              onChange={(e) => {
                setParamVal(parseFloat(e.target.value));
                if (isPlaying) setIsPlaying(false);
              }}
              className="w-full h-1.5 bg-blue-100 dark:bg-blue-950 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
          f(x) = {plotConfig.expression}
        </div>
      </div>
    </div>
  );
};
