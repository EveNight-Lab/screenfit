export const createDemoSilhouette = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 682;
  const ctx = canvas.getContext('2d');

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 0, 682);
  gradient.addColorStop(0, '#0f172a'); // slate-900
  gradient.addColorStop(1, '#1e1b4b'); // indigo-950
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 682);

  // Drawing sci-fi grid
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)'; // indigo-500/10
  ctx.lineWidth = 1;
  for (let i = 0; i < 512; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 682);
    ctx.stroke();
  }
  for (let j = 0; j < 682; j += 40) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(512, j);
    ctx.stroke();
  }

  // Draw human silhouette outline with cyber glow
  ctx.shadowColor = '#6366f1';
  ctx.shadowBlur = 15;
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
  ctx.fillStyle = 'rgba(99, 102, 241, 0.05)';
  ctx.lineWidth = 3;

  ctx.beginPath();
  // Head
  ctx.arc(256, 102, 35, 0, Math.PI * 2);
  // Neck & Shoulders
  ctx.moveTo(256, 137);
  ctx.lineTo(256, 170);
  ctx.lineTo(215, 170); // left shoulder
  ctx.lineTo(194, 272); // left arm
  ctx.lineTo(184, 375); // left hand
  ctx.moveTo(256, 170);
  ctx.lineTo(297, 170); // right shoulder
  ctx.lineTo(318, 272); // right arm
  ctx.lineTo(328, 375); // right hand
  // Torso
  ctx.moveTo(215, 170);
  ctx.lineTo(225, 341); // left hip
  ctx.lineTo(287, 341); // right hip
  ctx.lineTo(297, 170);
  // Legs
  ctx.moveTo(225, 341);
  ctx.lineTo(225, 477); // left knee
  ctx.lineTo(225, 613); // left ankle
  ctx.moveTo(287, 341);
  ctx.lineTo(287, 477); // right knee
  ctx.lineTo(287, 613); // right ankle
  ctx.stroke();
  ctx.fill();

  // Reset shadow
  ctx.shadowBlur = 0;

  // Add scanning overlay text
  ctx.fillStyle = 'rgba(99, 102, 241, 0.8)';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('SYSTEM: DETECTING_POSE...', 20, 35);
  ctx.fillText('TARGET_HEIGHT: 176.0 CM', 20, 55);
  ctx.fillText('MODE: ON-DEVICE_R&D_DEMO', 20, 75);

  return canvas.toDataURL('image/jpeg', 0.95);
};
