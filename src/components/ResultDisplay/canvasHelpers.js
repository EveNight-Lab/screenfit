import { POSE_LANDMARKS } from '@mediapipe/pose';

export const measurementStyles = {
  shoulderWidth: { color: '#ef4444', label: 'shoulder_width' },
  sleeve_length: { color: '#3b82f6', label: 'sleeve_length' },
  torso_length: { color: '#10b981', label: 'torso_length' },
  chest_circumference: { color: '#f97316', label: 'chest_circumference' },
  outseam: { color: '#8b5cf6', label: 'outseam' },
  waist_circumference: { color: '#f59e0b', label: 'waist_circumference' },
  hip_circumference: { color: '#ec4899', label: 'hip_circumference' },
};

export const nodes = {
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

export const limbDefinitions = [
  { from: 'neck', to: 'head', radFrom: 0.045, radTo: 0.11 },
  { from: 'lShoulder', to: 'rShoulder', radFrom: 0.065, radTo: 0.065 },
  { from: 'lShoulder', to: 'lElbow', radFrom: 0.045, radTo: 0.04 },
  { from: 'lElbow', to: 'lWrist', radFrom: 0.04, radTo: 0.035 },
  { from: 'rShoulder', to: 'rElbow', radFrom: 0.045, radTo: 0.04 },
  { from: 'rElbow', to: 'rWrist', radFrom: 0.04, radTo: 0.035 },
  { from: 'lShoulder', to: 'lHip', radFrom: 0.065, radTo: 0.06 },
  { from: 'rShoulder', to: 'rHip', radFrom: 0.065, radTo: 0.06 },
  { from: 'lHip', to: 'rHip', radFrom: 0.06, radTo: 0.06 },
  { from: 'lHip', to: 'lKnee', radFrom: 0.055, radTo: 0.045 },
  { from: 'lKnee', to: 'lAnkle', radFrom: 0.045, radTo: 0.035 },
  { from: 'rHip', to: 'rKnee', radFrom: 0.055, radTo: 0.045 },
  { from: 'rKnee', to: 'rAnkle', radFrom: 0.045, radTo: 0.035 }
];

export const drawMeasurementLines = (ctx, landmarks, styles, isUsed, measurements, t) => {
  const getPoint = (index) => (landmarks[index] ? { x: landmarks[index].x, y: landmarks[index].y } : null);

  const drawLine = (p1, p2, color) => {
    if (!p1 || !p2) return;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    if (!isUsed) ctx.setLineDash([10, 10]);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawPolyline = (points, color) => {
    if (points.some(p => !p)) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  if (landmarks) {
    const shoulderL = getPoint(POSE_LANDMARKS.LEFT_SHOULDER);
    const shoulderR = getPoint(POSE_LANDMARKS.RIGHT_SHOULDER);
    const elbowL = getPoint(POSE_LANDMARKS.LEFT_ELBOW);
    const wristL = getPoint(POSE_LANDMARKS.LEFT_WRIST);
    const hipL = getPoint(POSE_LANDMARKS.LEFT_HIP);
    const hipR = getPoint(POSE_LANDMARKS.RIGHT_HIP);
    const kneeL = getPoint(POSE_LANDMARKS.LEFT_KNEE);
    const ankleL = getPoint(POSE_LANDMARKS.LEFT_ANKLE);

    if (shoulderL && shoulderR) {
      drawLine(shoulderL, shoulderR, styles.shoulderWidth.color);
    }

    if (shoulderL && shoulderR && hipL && hipR) {
      const shoulderCenter = { x: (shoulderL.x + shoulderR.x) / 2, y: (shoulderL.y + shoulderR.y) / 2 };
      const hipCenter = { x: (hipL.x + hipR.x) / 2, y: (hipL.y + hipR.y) / 2 };
      drawLine(shoulderCenter, hipCenter, styles.torso_length.color);
    }

    if (shoulderL && elbowL && wristL) {
      drawPolyline([shoulderL, elbowL, wristL], styles.sleeve_length.color);
    }

    if (hipL && kneeL && ankleL) {
      drawPolyline([hipL, kneeL, ankleL], styles.outseam.color);
    }
  }
};
