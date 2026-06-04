import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { POSE_LANDMARKS } from '@mediapipe/pose';
import { 
  measurementStyles, 
  nodes, 
  limbDefinitions, 
  drawMeasurementLines 
} from './canvasHelpers';

const CanvasViewport = ({ 
  activeImage, 
  isAdjusting, 
  adjustablePoints, 
  calibration, 
  isCalibrated, 
  currentMeasurements, 
  onAdjustmentChange 
}) => {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const [draggedPointKey, setDraggedPointKey] = useState(null);
  const animationFrameId = useRef(null);

  const getCanvasDrawingParams = (canvas, img) => {
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.min(hRatio, vRatio);
    const centerShift_x = (canvas.width - img.width * ratio) / 2;
    const centerShift_y = (canvas.height - img.height * ratio) / 2;
    return { ratio, centerShift_x, centerShift_y };
  };

  useEffect(() => {
    if (activeImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = activeImage.resizedImageSrc;
      img.onload = () => {
        const { ratio, centerShift_x, centerShift_y } = getCanvasDrawingParams(canvas, img);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
        
        const pointsToDraw = {};
        if (isAdjusting && adjustablePoints) {
          Object.keys(adjustablePoints).forEach(key => {
            pointsToDraw[key] = {
              x: (adjustablePoints[key].x * (img.width * ratio)) + centerShift_x,
              y: (adjustablePoints[key].y * (img.height * ratio)) + centerShift_y
            };
          });
        } else {
          activeImage.landmarks.forEach((lm, idx) => {
            pointsToDraw[idx] = {
              x: (lm.x * (img.width * ratio)) + centerShift_x,
              y: (lm.y * (img.height * ratio)) + centerShift_y
            };
          });
        }

        const nodePoints = {};
        if (pointsToDraw[POSE_LANDMARKS.LEFT_SHOULDER]) {
          nodePoints['lShoulder'] = pointsToDraw[POSE_LANDMARKS.LEFT_SHOULDER];
          nodePoints['rShoulder'] = pointsToDraw[POSE_LANDMARKS.RIGHT_SHOULDER];
          nodePoints['lElbow'] = pointsToDraw[POSE_LANDMARKS.LEFT_ELBOW];
          nodePoints['rElbow'] = pointsToDraw[POSE_LANDMARKS.RIGHT_ELBOW];
          nodePoints['lWrist'] = pointsToDraw[POSE_LANDMARKS.LEFT_WRIST];
          nodePoints['rWrist'] = pointsToDraw[POSE_LANDMARKS.RIGHT_WRIST];
          nodePoints['lHip'] = pointsToDraw[POSE_LANDMARKS.LEFT_HIP];
          nodePoints['rHip'] = pointsToDraw[POSE_LANDMARKS.RIGHT_HIP];
          nodePoints['lKnee'] = pointsToDraw[POSE_LANDMARKS.LEFT_KNEE];
          nodePoints['rKnee'] = pointsToDraw[POSE_LANDMARKS.RIGHT_KNEE];
          nodePoints['lAnkle'] = pointsToDraw[POSE_LANDMARKS.LEFT_ANKLE];
          nodePoints['rAnkle'] = pointsToDraw[POSE_LANDMARKS.RIGHT_ANKLE];

          if (nodePoints['lShoulder'] && nodePoints['rShoulder']) {
            nodePoints['neck'] = {
              x: (nodePoints['lShoulder'].x + nodePoints['rShoulder'].x) / 2,
              y: (nodePoints['lShoulder'].y + nodePoints['rShoulder'].y) / 2
            };
          }
          if (nodePoints['neck'] && nodePoints['lShoulder'] && nodePoints['rShoulder']) {
            const shDist = Math.abs(nodePoints['lShoulder'].x - nodePoints['rShoulder'].x);
            nodePoints['head'] = {
              x: nodePoints['neck'].x,
              y: nodePoints['neck'].y - shDist * 0.45
            };
          }
        }

        // 3D mannequin cylinders - ONLY DRAW WHEN NOT CALIBRATED
        if (!isCalibrated && nodePoints['lShoulder'] && nodePoints['rShoulder'] && nodePoints['lHip'] && nodePoints['rHip']) {
          const cx = (nodePoints['lShoulder'].x + nodePoints['rShoulder'].x + nodePoints['lHip'].x + nodePoints['rHip'].x) / 4;
          const cy = (nodePoints['lShoulder'].y + nodePoints['rShoulder'].y + nodePoints['lHip'].y + nodePoints['rHip'].y) / 4;
          const dx = Math.max(20, Math.abs(nodePoints['lShoulder'].x - nodePoints['rShoulder'].x));
          const scaleX = dx / 0.44;

          const pitchRad = (calibration.pitch * Math.PI) / 180;
          const yawRad = (calibration.yaw * Math.PI) / 180;

          const projected3D = {};
          Object.keys(nodePoints).forEach(key => {
            const pt = nodePoints[key];
            if (!pt) return;
            const rx = pt.x - cx;
            const ry = cy - pt.y;
            const staticNode = nodes[key] || { z: 0 };
            const rz = staticNode.z * scaleX;

            const x1 = rx * Math.cos(yawRad) - rz * Math.sin(yawRad);
            const z1 = rx * Math.sin(yawRad) + rz * Math.cos(yawRad);
            const y1 = ry;

            const x2 = x1;
            const y2 = y1 * Math.cos(pitchRad) - z1 * Math.sin(pitchRad);
            const z2 = y1 * Math.sin(pitchRad) + z1 * Math.cos(pitchRad);

            const distance = 2.0;
            const perspectiveScale = distance / (distance + (z2 / scaleX));

            projected3D[key] = {
              x: cx + x2 * perspectiveScale,
              y: cy - y2 * perspectiveScale,
              depth: z2 / scaleX
            };
          });

          ctx.save();
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#6366f1';

          limbDefinitions.forEach(({ from, to, radFrom, radTo }) => {
            const p1 = projected3D[from];
            const p2 = projected3D[to];
            if (p1 && p2) {
              const r1 = radFrom * scaleX * (2.0 / (2.0 + p1.depth));
              const r2 = radTo * scaleX * (2.0 / (2.0 + p2.depth));
              const dx_limb = p2.x - p1.x;
              const dy_limb = p2.y - p1.y;
              const len = Math.sqrt(dx_limb * dx_limb + dy_limb * dy_limb);
              if (len < 1) return;

              const nx = -dy_limb / len;
              const ny = dx_limb / len;

              const a1 = { x: p1.x + nx * r1, y: p1.y + ny * r1 };
              const a2 = { x: p1.x - nx * r1, y: p1.y - ny * r1 };
              const b1 = { x: p2.x + nx * r2, y: p2.y + ny * r2 };
              const b2 = { x: p2.x - nx * r2, y: p2.y - ny * r2 };

              ctx.beginPath();
              ctx.moveTo(a1.x, a1.y);
              ctx.lineTo(b1.x, b1.y);
              ctx.lineTo(b2.x, b2.y);
              ctx.lineTo(a2.x, a2.y);
              ctx.closePath();

              const avgDepth = (p1.depth + p2.depth) / 2;
              const opacity = Math.min(0.45, Math.max(0.12, 0.35 - avgDepth * 0.15));
              ctx.fillStyle = 'rgba(99, 102, 241, 0.03)';
              ctx.fill();
              ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
              ctx.lineWidth = 1.5;
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(p1.x, p1.y, r1, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.8})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(p2.x, p2.y, r2, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.8})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();

              const ringIntervals = [0.25, 0.5, 0.75];
              ringIntervals.forEach(tVal => {
                const rx = p1.x + (p2.x - p1.x) * tVal;
                const ry = p1.y + (p2.y - p1.y) * tVal;
                const rr = r1 + (r2 - r1) * tVal;
                ctx.beginPath();
                const angle = Math.atan2(dy_limb, dx_limb);
                ctx.ellipse(rx, ry, rr, rr * 0.3, angle, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.85})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
              });
            }
          });
          ctx.restore();
        }

        // Draw measurement paths - ONLY DRAW WHEN CALIBRATED
        if (isCalibrated) {
          drawMeasurementLines(ctx, pointsToDraw, measurementStyles, activeImage.isUsedFor2D || activeImage.isUsedFor3D, currentMeasurements, t);
        }

        // Manual adjustment dots
        if (isAdjusting && pointsToDraw) {
          const relevantLandmarks = [
            POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER,
            POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST,
            POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP,
            POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE
          ];
          relevantLandmarks.forEach(index => {
            const point = pointsToDraw[index];
            if (point) {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
              ctx.fillStyle = draggedPointKey === String(index) ? '#10b981' : 'rgba(255, 255, 255, 0.85)';
              ctx.fill();
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 2.5;
              ctx.stroke();
            }
          });
        }
      };
    }
  }, [activeImage, isAdjusting, adjustablePoints, draggedPointKey, currentMeasurements, t, calibration, isCalibrated]);

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleCanvasMouseMove = useCallback((e) => {
    if (!draggedPointKey || !isAdjusting || !activeImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.src = activeImage.resizedImageSrc;
    const { ratio, centerShift_x, centerShift_y } = getCanvasDrawingParams(canvas, img);
    const pos = getCanvasCoordinates(e);

    const relX = (pos.x - centerShift_x) / (img.width * ratio);
    const relY = (pos.y - centerShift_y) / (img.height * ratio);

    const constrainedX = Math.max(0, Math.min(1, relX));
    const constrainedY = Math.max(0, Math.min(1, relY));

    const newPoints = { ...adjustablePoints, [draggedPointKey]: { x: constrainedX, y: constrainedY } };
    onAdjustmentChange(newPoints);
  }, [adjustablePoints, draggedPointKey, isAdjusting, activeImage, onAdjustmentChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isAdjusting) return;

    const handleMove = (e) => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = requestAnimationFrame(() => handleCanvasMouseMove(e));
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleMove);

    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('touchmove', handleMove);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isAdjusting, handleCanvasMouseMove]);

  const handleCanvasMouseDown = (e) => {
    if (!isAdjusting || !activeImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.src = activeImage.resizedImageSrc;
    const { ratio, centerShift_x, centerShift_y } = getCanvasDrawingParams(canvas, img);
    const pos = getCanvasCoordinates(e);
    let closestPointKey = null;
    let minDistance = 25;

    Object.keys(adjustablePoints).forEach(key => {
      const relPoint = adjustablePoints[key];
      if (relPoint) {
        const absPoint = {
          x: (relPoint.x * (img.width * ratio)) + centerShift_x,
          y: (relPoint.y * (img.height * ratio)) + centerShift_y
        };
        const distance = Math.sqrt(Math.pow(absPoint.x - pos.x, 2) + Math.pow(absPoint.y - pos.y, 2));
        if (distance < minDistance) {
          minDistance = distance;
          closestPointKey = key;
        }
      }
    });

    if (closestPointKey) {
      setDraggedPointKey(closestPointKey);
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggedPointKey(null);
  };

  return (
    <canvas 
      ref={canvasRef} 
      width="512" 
      height="682" 
      className="w-full h-full object-contain cursor-crosshair"
      onMouseDown={handleCanvasMouseDown}
      onMouseUp={handleCanvasMouseUp}
      onTouchStart={handleCanvasMouseDown}
      onTouchEnd={handleCanvasMouseUp}
      id="canvas-placeholder"
    />
  );
};

export default CanvasViewport;
