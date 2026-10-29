import React, { useState } from 'react';
import { RpgStat } from '../types/assessment';

interface RadarChartProps {
  stats: Record<'STR' | 'INT' | 'VIT' | 'DEX' | 'DRAIN', RpgStat>;
  size?: number;
  interactive?: boolean;
}

export const RadarChartComponent: React.FC<RadarChartProps> = ({
  stats,
  size = 360,
  interactive = true
}) => {
  const [activeStatKey, setActiveStatKey] = useState<string | null>(null);

  // Center coordinate and radius
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) - 48; // Leave margin for labels

  // 5 axes configuration in order around pentagon (starting top 12 o'clock)
  const axes: Array<{
    key: 'STR' | 'INT' | 'VIT' | 'DEX' | 'DRAIN';
    label: string;
    thaiLabel: string;
    icon: string;
    color: string;
    angleDeg: number;
  }> = [
    { key: 'STR', label: 'STR', thaiLabel: 'การแก้ปัญหาเชิงรุก', icon: '⚔️', color: '#06B6D4', angleDeg: -90 },
    { key: 'INT', label: 'INT', thaiLabel: 'เครือข่าย & ปรึกษา', icon: '🔮', color: '#3B82F6', angleDeg: -18 },
    { key: 'VIT', label: 'VIT', thaiLabel: 'ความยืดหยุ่นจิตใจ', icon: '🛡️', color: '#10B981', angleDeg: 54 },
    { key: 'DEX', label: 'DEX', thaiLabel: 'พักฟื้น & อารมณ์ขัน', icon: '⚡', color: '#F59E0B', angleDeg: 126 },
    { key: 'DRAIN', label: 'DRAIN', thaiLabel: 'ภาระความเครียดสะสม', icon: '🚩', color: '#F43F5E', angleDeg: 198 }
  ];

  // Helper to convert polar coordinates to Cartesian
  const getCoordinates = (angleDeg: number, distance: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + distance * Math.cos(rad),
      y: cy + distance * Math.sin(rad)
    };
  };

  // Concentric pentagon rings (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Calculate points for the Adaptive polygon (STR, INT, VIT, DEX)
  const adaptivePolygonPoints = axes.map((axis) => {
    const statVal = stats[axis.key];
    // For adaptive polygon, we scale DRAIN to baseline or lower to show dual-layer contrast
    const percent = axis.key === 'DRAIN' ? 15 : Math.max(15, statVal.percentage);
    const dist = (percent / 100) * radius;
    const { x, y } = getCoordinates(axis.angleDeg, dist);
    return `${x},${y}`;
  }).join(' ');

  // Calculate points for the Full Status Polygon (including true DRAIN)
  const fullPolygonPoints = axes.map((axis) => {
    const statVal = stats[axis.key];
    const percent = Math.max(15, statVal.percentage);
    const dist = (percent / 100) * radius;
    const { x, y } = getCoordinates(axis.angleDeg, dist);
    return `${x},${y}`;
  }).join(' ');

  // Calculate coordinates for vertices to render interactive points
  const vertexPoints = axes.map((axis) => {
    const statVal = stats[axis.key];
    const percent = Math.max(15, statVal.percentage);
    const dist = (percent / 100) * radius;
    const { x, y } = getCoordinates(axis.angleDeg, dist);
    return { ...axis, x, y, percent, rawScore: statVal.score, maxScore: statVal.maxScore };
  });

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible drop-shadow-[0_4px_24px_rgba(6,182,212,0.12)]"
      >
        <defs>
          {/* Cyan Glow for Adaptive Polygon */}
          <linearGradient id="adaptiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.25" />
          </linearGradient>

          {/* Rose/Coral Glow for DRAIN Stress Warning */}
          <linearGradient id="drainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FB7185" stopOpacity="0.1" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Background Concentric Pentagon Rings */}
        {gridLevels.map((lvl, idx) => {
          const ringPoints = axes.map((a) => {
            const { x, y } = getCoordinates(a.angleDeg, radius * lvl);
            return `${x},${y}`;
          }).join(' ');

          const isOuter = idx === gridLevels.length - 1;

          return (
            <polygon
              key={idx}
              points={ringPoints}
              fill={idx % 2 === 0 ? 'rgba(30, 41, 59, 0.4)' : 'rgba(15, 23, 42, 0.2)'}
              stroke={isOuter ? 'rgba(148, 163, 184, 0.35)' : 'rgba(148, 163, 184, 0.15)'}
              strokeWidth={isOuter ? 1.5 : 0.8}
              strokeDasharray={isOuter ? 'none' : '2,2'}
            />
          );
        })}

        {/* 2. Radial Axis Spokes radiating from center */}
        {axes.map((a, i) => {
          const { x, y } = getCoordinates(a.angleDeg, radius);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="rgba(148, 163, 184, 0.25)"
              strokeWidth={1}
            />
          );
        })}

        {/* 3. Layer 1: Adaptive Polygon (Green/Cyan Glow) */}
        <polygon
          points={adaptivePolygonPoints}
          fill="url(#adaptiveGradient)"
          stroke="#06B6D4"
          strokeWidth={2}
          filter="url(#neonGlow)"
          className="transition-all duration-700 ease-out"
        />

        {/* 4. Layer 2: True Full Polygon overlay highlighting DRAIN stress */}
        <polygon
          points={fullPolygonPoints}
          fill="none"
          stroke="rgba(244, 63, 94, 0.7)"
          strokeWidth={1.5}
          strokeDasharray="4,3"
          className="transition-all duration-700 ease-out"
        />

        {/* 5. Vertices / Status Nodes */}
        {vertexPoints.map((v) => {
          const isSelected = activeStatKey === v.key;
          const isDrain = v.key === 'DRAIN';

          return (
            <g
              key={v.key}
              className="cursor-pointer transition-transform"
              onMouseEnter={() => interactive && setActiveStatKey(v.key)}
              onMouseLeave={() => interactive && setActiveStatKey(null)}
              onClick={() => interactive && setActiveStatKey(activeStatKey === v.key ? null : v.key)}
            >
              {/* Outer Pulse Ring */}
              <circle
                cx={v.x}
                cy={v.y}
                r={isSelected ? 9 : 6}
                fill={isDrain ? '#F43F5E' : v.color}
                fillOpacity={0.3}
                className={isSelected ? 'animate-ping' : ''}
              />
              {/* Core Vertex Dot */}
              <circle
                cx={v.x}
                cy={v.y}
                r={isSelected ? 5.5 : 4}
                fill={isDrain ? '#F43F5E' : '#FFFFFF'}
                stroke={v.color}
                strokeWidth={2}
              />
            </g>
          );
        })}

        {/* 6. Axis Labels & Stat Badges around Perimeter */}
        {axes.map((a) => {
          const labelDist = radius + 28;
          const { x, y } = getCoordinates(a.angleDeg, labelDist);
          const statVal = stats[a.key];
          const isSelected = activeStatKey === a.key;
          const isDrain = a.key === 'DRAIN';

          return (
            <g
              key={a.key}
              transform={`translate(${x}, ${y})`}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => interactive && setActiveStatKey(a.key)}
              onMouseLeave={() => interactive && setActiveStatKey(null)}
              onClick={() => interactive && setActiveStatKey(activeStatKey === a.key ? null : a.key)}
            >
              <rect
                x="-36"
                y="-18"
                width="72"
                height="36"
                rx="8"
                fill={isSelected ? (isDrain ? '#881337' : '#0F766E') : 'rgba(15, 23, 42, 0.85)'}
                stroke={isSelected ? (isDrain ? '#FB7185' : '#2DD4BF') : 'rgba(148, 163, 184, 0.3)'}
                strokeWidth={isSelected ? 1.5 : 1}
                className="transition-colors"
              />
              <text
                x="0"
                y="-3"
                textAnchor="middle"
                className={`font-mono text-[11px] font-extrabold ${isDrain ? 'fill-rose-400' : 'fill-cyan-300'}`}
              >
                {a.label} {a.icon}
              </text>
              <text
                x="0"
                y="11"
                textAnchor="middle"
                className="font-mono text-[10px] font-bold fill-slate-300"
              >
                {statVal.percentage}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* Interactive Detail Box on Hover / Tap */}
      {activeStatKey && (
        <div className="mt-3 p-3 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-left max-w-xs shadow-xl animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-300 mb-1">
            <span className="flex items-center gap-1.5">
              <span>{stats[activeStatKey as keyof typeof stats].key}</span>
              <span className="text-slate-400 font-normal">({stats[activeStatKey as keyof typeof stats].thaiName})</span>
            </span>
            <span className="font-mono text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {stats[activeStatKey as keyof typeof stats].score}/{stats[activeStatKey as keyof typeof stats].maxScore} ({stats[activeStatKey as keyof typeof stats].percentage}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {stats[activeStatKey as keyof typeof stats].description}
          </p>
        </div>
      )}
    </div>
  );
};
