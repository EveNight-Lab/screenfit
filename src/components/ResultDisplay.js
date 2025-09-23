import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import { POSE_LANDMARKS } from '@mediapipe/pose';

const measurementStyles = {
  shoulderWidth: { color: '#ef4444', label: 'shoulder_width' },
  sleeve_length: { color: '#3b82f6', label: 'sleeve_length' },
  torso_length: { color: '#10b981', label: 'torso_length' },
  chest_circumference: { color: '#f97316', label: 'chest_circumference' },
  outseam: { color: '#8b5cf6', label: 'outseam' },
  waist_circumference: { color: '#f59e0b', label: 'waist_circumference' },
  hip_circumference: { color: '#ec4899', label: 'hip_circumference' },
};

const ConfidenceBadge = ({ score }) => {
  if (score === undefined || score === null) return null;
  const percentage = (score * 100).toFixed(1);
  const getColor = () => {
    if (score > 0.85) return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    if (score > 0.6) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
  };
  return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getColor()}`}>{percentage}%</span>;
};

const drawMeasurementLines = (ctx, landmarks, styles, isUsed) => {
    const getPoint = (index) => (landmarks[index] ? { x: landmarks[index].x, y: landmarks[index].y } : null);

    const drawLine = (p1, p2, color) => {
        if (!p1 || !p2) return;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        
        if (!isUsed) {
            ctx.setLineDash([10, 10]);
        }

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

    if(landmarks) {
        drawLine(getPoint(POSE_LANDMARKS.LEFT_SHOULDER), getPoint(POSE_LANDMARKS.RIGHT_SHOULDER), styles.shoulderWidth.color);
        const shoulderCenter = { x: (getPoint(POSE_LANDMARKS.LEFT_SHOULDER).x + getPoint(POSE_LANDMARKS.RIGHT_SHOULDER).x) / 2, y: (getPoint(POSE_LANDMARKS.LEFT_SHOULDER).y + getPoint(POSE_LANDMARKS.RIGHT_SHOULDER).y) / 2 };
        const hipCenter = { x: (getPoint(POSE_LANDMARKS.LEFT_HIP).x + getPoint(POSE_LANDMARKS.RIGHT_HIP).x) / 2, y: (getPoint(POSE_LANDMARKS.LEFT_HIP).y + getPoint(POSE_LANDMARKS.RIGHT_HIP).y) / 2 };
        drawLine(shoulderCenter, hipCenter, styles.torso_length.color);
        drawLine(getPoint(POSE_LANDMARKS.LEFT_SHOULDER), getPoint(POSE_LANDMARKS.LEFT_WRIST), styles.sleeve_length.color);
        drawLine(getPoint(POSE_LANDMARKS.LEFT_HIP), getPoint(POSE_LANDMARKS.LEFT_ANKLE), styles.outseam.color);
    }
};

const MeasurementCard = ({ item }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold" style={{ color: item.color }}>{item.label}</h3>
                    <p className="text-2xl font-light text-slate-900 dark:text-white mt-1">{item.value} cm</p>
                </div>
                <ConfidenceBadge score={item.confidence} />
            </div>
            {item.recommendations && (
                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{t('fit_guide_title')}</h4>
                    {item.recommendations.map(rec => (
                        <div key={rec.label} className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400">{rec.label}</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-gray-700/50 px-2 py-0.5 rounded">{rec.value} cm</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const ResultDisplay = ({ measurements, processedImages, onReset }) => {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const [notification, setNotification] = useState('');
  const [canShare, setCanShare] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = processedImages[activeIndex];

  const measurementItems = useMemo(() => {
    if (!measurements) return [];
    const { shoulderWidth, armLength, torsoLength, chestCircumference, waistCircumference, hipCircumference, outseam, confidenceShoulder, confidenceArm, confidenceLeg, confidence } = measurements;
    
    return [
        {
            label: t('torso_length'),
            value: torsoLength?.toFixed(1),
            confidence: confidence,
            color: measurementStyles.torso_length.color,
        },
        {
            label: t('shoulder_width'),
            value: shoulderWidth?.toFixed(1),
            confidence: confidenceShoulder,
            color: measurementStyles.shoulderWidth.color,
            recommendations: [
                { label: t('fit_style_shoulder_regular'), value: (shoulderWidth + 1).toFixed(1) },
                { label: t('fit_style_shoulder_semi_over'), value: (shoulderWidth + 5).toFixed(1) },
                { label: t('fit_style_shoulder_over'), value: (shoulderWidth + 10).toFixed(1) },
            ]
        },
        {
            label: t('sleeve_length'),
            value: armLength?.toFixed(1),
            confidence: confidenceArm,
            color: measurementStyles.sleeve_length.color,
            recommendations: [
                { label: t('fit_style_sleeve_wrist'), value: (armLength - 2).toFixed(1) },
                { label: t('fit_style_sleeve_hand'), value: (armLength + 2).toFixed(1) },
                { label: t('fit_style_sleeve_long'), value: (armLength + 5).toFixed(1) },
            ]
        },
        {
            label: t('outseam'),
            value: outseam?.toFixed(1),
            confidence: confidenceLeg,
            color: measurementStyles.outseam.color,
            recommendations: [
                { label: t('fit_style_pants_ankle'), value: (outseam - 10).toFixed(1) },
                { label: t('fit_style_pants_standard'), value: (outseam - 5).toFixed(1) },
                { label: t('fit_style_pants_long'), value: outseam.toFixed(1) },
            ]
        },
        {
            label: t('chest_circumference'),
            value: chestCircumference?.toFixed(1),
            confidence: confidence,
            color: measurementStyles.chest_circumference.color,
        },
        {
            label: t('waist_circumference'),
            value: waistCircumference?.toFixed(1),
            confidence: confidence,
            color: measurementStyles.waist_circumference.color,
        },
        {
            label: t('hip_circumference'),
            value: hipCircumference?.toFixed(1),
            confidence: confidence,
            color: measurementStyles.hip_circumference.color,
        },
    ].filter(item => item.value);
  }, [measurements, t]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  useEffect(() => {
    if (navigator.share) setCanShare(true);

    if (activeImage && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = URL.createObjectURL(activeImage.originalFile);
        img.onload = () => {
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const ratio = Math.min(hRatio, vRatio);
            const centerShift_x = (canvas.width - img.width * ratio) / 2;
            const centerShift_y = (canvas.height - img.height * ratio) / 2;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
            
            const scaledLandmarks = activeImage.landmarks.map(lm => ({
                x: (lm.x * (img.width * ratio)) + centerShift_x,
                y: (lm.y * (img.height * ratio)) + centerShift_y
            }));

            drawMeasurementLines(ctx, scaledLandmarks, measurementStyles, activeImage.isUsedFor2D || activeImage.isUsedFor3D);
            URL.revokeObjectURL(img.src);
        }
    }
  }, [activeImage]);

  const handleNextImage = () => setActiveIndex((prev) => (prev + 1) % processedImages.length);
  const handlePrevImage = () => setActiveIndex((prev) => (prev - 1 + processedImages.length) % processedImages.length);

  const handleCopy = () => {
    const lines = [];
    lines.push(t('result_title'));
    lines.push(''); // For a blank line

    measurementItems.forEach(item => {
        lines.push(`[${item.label}]`);
        lines.push(`${t('result_measurement')}: ${item.value} cm`);
        if (item.recommendations) {
            lines.push(`${t('fit_guide_title')}:`);
            item.recommendations.forEach(rec => {
                lines.push(`- ${rec.label}: ${rec.value} cm`);
            });
        }
        lines.push(''); // For a blank line
    });

    const resultText = lines.join('\n');
    navigator.clipboard.writeText(resultText.trim());
    showNotification(t('copied_success'));
  };

  const handleSaveOrShare = async (action) => {
    const canvas = document.getElementById('result-capture-wrapper');
    if (!canvas) return;
  
    const resultCanvas = await html2canvas(canvas, {
        useCORS: true,
        scale: 2,
        backgroundColor: window.getComputedStyle(document.body).backgroundColor,
    });

    if (action === 'save') {
        const image = resultCanvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = image;
        link.download = 'screanfit_results.png';
        link.click();
        showNotification(t('saved_success'));
    } else if (action === 'share') {
        resultCanvas.toBlob(async (blob) => {
            if (!blob) return showNotification(t('share_error'));
            const file = new File([blob], 'screanfit_results.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({ files: [file], title: t('result_title'), text: t('fit_guide_intro') });
                    showNotification(t('share_success'));
                } catch (error) {
                    console.error('Share error:', error);
                    showNotification(t('share_error'));
                }
            } else {
                showNotification(t('share_not_supported'));
            }
        }, 'image/png');
    }
  };

  return (
    <div className="animate-fade-in">
      {notification && <div className="fixed top-5 right-5 bg-green-600 text-white px-5 py-3 rounded-full shadow-lg z-50 animate-fade-in-down">{notification}</div>}
      
      <div id="result-capture-wrapper" className="bg-slate-50 dark:bg-gray-900/70 p-4 sm:p-6 lg:p-8 rounded-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 text-center lg:text-left break-keep">{t('result_title')}</h2>
            <div className="relative w-full aspect-[3/4] bg-slate-100 dark:bg-gray-900/50 rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-gray-700">
              <canvas ref={canvasRef} width="512" height="682" className="w-full h-full object-contain"></canvas>
              {processedImages.length > 1 && (
                  <>
                    <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">&lt;</button>
                    <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">&gt;</button>
                  </>
              )}
            </div>
            {measurements && measurements.confidence < 0.75 && <p className="text-yellow-600 dark:text-yellow-400 text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">{t('accuracy_warning')}</p>}
          </div>
          <div className="space-y-4">
              {measurementItems.map(item => <MeasurementCard key={item.label} item={item} />)}
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-slate-200 dark:border-gray-700 flex flex-wrap gap-3 justify-center">
        <button onClick={handleCopy} className="flex items-center justify-center gap-2 flex-1 min-w-[120px] bg-slate-600 text-white font-bold py-3 px-4 rounded-full hover:bg-slate-700 transition-transform hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2h-1a1 1 0 110-2h1a4 4 0 014 4v11a4 4 0 01-4 4H6a4 4 0 01-4-4V5a4 4 0 014-4h1a1 1 0 110 2H6z" /></svg>
            {t('copy_button')}
        </button>
        <button onClick={() => handleSaveOrShare('save')} className="flex items-center justify-center gap-2 flex-1 min-w-[120px] bg-green-600 text-white font-bold py-3 px-4 rounded-full hover:bg-green-700 transition-transform hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            {t('save_button')}
        </button>
        {canShare && (
            <button onClick={() => handleSaveOrShare('share')} className="flex items-center justify-center gap-2 flex-1 min-w-[120px] bg-sky-500 text-white font-bold py-3 px-4 rounded-full hover:bg-sky-600 transition-transform hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                {t('share_button')}
            </button>
        )}
        <button onClick={onReset} className="flex items-center justify-center gap-2 flex-1 min-w-[120px] bg-blue-600 text-white font-bold py-3 px-4 rounded-full hover:bg-blue-700 transition-transform hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
            {t('try_again_button')}
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;
