import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const nodes = {
  head: { x: 0, y: 0.75, z: 0 },
  neck: { x: 0, y: 0.55, z: 0 },
  lShoulder: { x: -0.22, y: 0.5, z: 0 },
  rShoulder: { x: 0.22, y: 0.5, z: 0 },
  lElbow: { x: -0.25, y: 0.2, z: -0.05 },
  rElbow: { x: 0.25, y: 0.2, z: -0.05 },
  lWrist: { x: -0.27, y: -0.1, z: -0.1 },
  rWrist: { x: 0.27, y: -0.1, z: -0.1 },
  lHip: { x: -0.13, y: 0.05, z: 0 },
  rHip: { x: 0.13, y: 0.05, z: 0 },
  lKnee: { x: -0.13, y: -0.35, z: -0.02 },
  rKnee: { x: 0.13, y: -0.35, z: -0.02 },
  lAnkle: { x: -0.13, y: -0.75, z: 0 },
  rAnkle: { x: 0.13, y: -0.75, z: 0 }
};

const edges = [
  ['neck', 'head'],
  ['lShoulder', 'rShoulder'],
  ['lShoulder', 'lElbow'],
  ['lElbow', 'lWrist'],
  ['rShoulder', 'rElbow'],
  ['rElbow', 'rWrist'],
  ['lShoulder', 'lHip'],
  ['rShoulder', 'rHip'],
  ['lHip', 'rHip'],
  ['lHip', 'lKnee'],
  ['lKnee', 'lAnkle'],
  ['rHip', 'rKnee'],
  ['rKnee', 'rAnkle']
];

const CameraCalibrator = ({ onChange }) => {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const [pitch, setPitch] = useState(0); // 상하 각도 (-30 ~ 30도)
  const [yaw, setYaw] = useState(0);     // 좌우 회전 (-45 ~ 45도)

  useEffect(() => {
    onChange({ pitch, yaw });
  }, [pitch, yaw, onChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const scale = 140; // 3D -> 2D 픽셀 배율
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 격자 그리기 (Sci-fi 3D grid)
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 각도 라디안 계산
    const pitchRad = (pitch * Math.PI) / 180;
    const yawRad = (yaw * Math.PI) / 180;

    // 3D 회전 행렬 투영 연산
    const projected = {};
    Object.keys(nodes).forEach(key => {
      const node = nodes[key];

      // 1. Yaw 회전 (Y축 기준 좌우 회전)
      const x1 = node.x * Math.cos(yawRad) - node.z * Math.sin(yawRad);
      const z1 = node.x * Math.sin(yawRad) + node.z * Math.cos(yawRad);
      const y1 = node.y;

      // 2. Pitch 회전 (X축 기준 상하 회전)
      const x2 = x1;
      const y2 = y1 * Math.cos(pitchRad) - z1 * Math.sin(pitchRad);
      const z2 = y1 * Math.sin(pitchRad) + z1 * Math.cos(pitchRad);

      // 3. 원근 투영 (Perspective projection)
      const distance = 2.0; // 카메라 관찰 거리
      const perspectiveScale = distance / (distance + z2);

      projected[key] = {
        x: cx + x2 * scale * perspectiveScale,
        y: cy - y2 * scale * perspectiveScale,
        depth: z2
      };
    });

    // 3D 엣지 렌더링 (사이버네틱 네온 와이어프레임)
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#6366f1';
    ctx.lineWidth = 2.5;

    edges.forEach(([n1, n2]) => {
      const p1 = projected[n1];
      const p2 = projected[n2];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        
        // 깊이에 따라 알파 효과 다르게 설정 (3D 실재감 극대화)
        const avgDepth = (p1.depth + p2.depth) / 2;
        const opacity = Math.min(1.0, Math.max(0.2, 1.0 - avgDepth * 0.5));
        ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
        ctx.stroke();
      }
    });

    // 머리 구체 렌더링
    const head = projected['head'];
    if (head) {
      ctx.beginPath();
      ctx.arc(head.x, head.y, 20 * (2.0 / (2.0 + head.depth)), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
      ctx.stroke();
    }

    // 주요 랜드마크 마디 구체 렌더링
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#10b981';
    Object.keys(projected).forEach(key => {
      if (key === 'head') return;
      const pt = projected[key];
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
    });

    // 그림자 초기화
    ctx.shadowBlur = 0;

    // 왜곡 보정 인디케이터 표시
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '11px monospace';
    const vCorr = (1 / Math.cos(pitchRad)).toFixed(2);
    const hCorr = (1 / Math.cos(yawRad)).toFixed(2);
    ctx.fillText(`V-CORRECTION: x${vCorr}`, 12, 20);
    ctx.fillText(`H-CORRECTION: x${hCorr}`, 12, 35);
  }, [pitch, yaw]);

  return (
    <div className="bg-slate-50 dark:bg-gray-800 p-5 rounded-xl border border-slate-200 dark:border-gray-700 space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Mannequin viewport */}
        <div className="relative bg-slate-900 dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-300 dark:border-gray-800 p-1 flex justify-center items-center shadow-inner">
          <canvas ref={canvasRef} width="220" height="260" className="w-[180px] h-[210px] sm:w-[220px] sm:h-[260px]" />
          <div className="absolute top-2 right-2 bg-indigo-600/80 text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
            3D Calibrator
          </div>
        </div>

        {/* Sliders panel */}
        <div className="flex-1 w-full space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="pitch" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t('pitch_label')}
              </label>
              <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                {pitch > 0 ? `+${pitch}` : pitch}°
              </span>
            </div>
            <input
              type="range"
              id="pitch"
              min="-30"
              max="30"
              step="1"
              value={pitch}
              onChange={(e) => setPitch(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="yaw" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t('yaw_label')}
              </label>
              <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                {yaw > 0 ? `+${yaw}` : yaw}°
              </span>
            </div>
            <input
              type="range"
              id="yaw"
              min="-45"
              max="45"
              step="1"
              value={yaw}
              onChange={(e) => setYaw(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-500"
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-100 dark:bg-gray-900/50 p-2.5 rounded border-l-2 border-indigo-500">
            {t('calibration_desc')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CameraCalibrator;
