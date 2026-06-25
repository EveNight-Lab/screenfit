import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import { POSE_LANDMARKS } from '@mediapipe/pose';

import CanvasViewport from './CanvasViewport';
import MeasurementCards from './MeasurementCards';
import ActionButtons from './ActionButtons';
import CalibrationModal from './CalibrationModal';
import { measurementStyles } from './canvasHelpers';

const ResultDisplay = ({ measurements, processedImages, onReset }) => {
  const { t } = useTranslation();
  const [notification, setNotification] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  // Initialize calibration states
  const [calibration, setCalibration] = useState({ pitch: 0, yaw: 0 });
  const [isCalibrated, setIsCalibrated] = useState(() => {
    return measurements?.isFrontFacing !== false;
  });

  const [adjustmentStates, setAdjustmentStates] = useState({});

  const activeImage = processedImages[activeIndex];
  const { isAdjusting, adjustablePoints, pixelToCmRatio } = adjustmentStates[activeIndex] || {};

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleNextImage = () => setActiveIndex((prev) => (prev + 1) % processedImages.length);
  const handlePrevImage = () => setActiveIndex((prev) => (prev - 1 + processedImages.length) % processedImages.length);

  const onAdjustmentChange = useCallback((newPoints) => {
    setAdjustmentStates(prev => ({
      ...prev,
      [activeIndex]: {
        ...prev[activeIndex],
        adjustablePoints: newPoints
      }
    }));
  }, [activeIndex]);

  const toggleAdjusting = () => {
    if (!activeImage) return;
    setAdjustmentStates(prev => {
      const current = prev[activeIndex] || {};
      const nextIsAdjusting = !current.isAdjusting;

      let nextPoints = current.adjustablePoints;
      if (nextIsAdjusting && !nextPoints) {
        nextPoints = {};
        activeImage.landmarks.forEach((lm, idx) => {
          nextPoints[idx] = { x: lm.x, y: lm.y };
        });
      }

      return {
        ...prev,
        [activeIndex]: {
          ...current,
          isAdjusting: nextIsAdjusting,
          adjustablePoints: nextPoints,
          pixelToCmRatio: activeImage.pixelToCmRatio
        }
      };
    });
  };

  const handleResetPoints = () => {
    if (!activeImage) return;
    setAdjustmentStates(prev => {
      const current = prev[activeIndex] || {};
      const nextPoints = {};
      activeImage.landmarks.forEach((lm, idx) => {
        nextPoints[idx] = { x: lm.x, y: lm.y };
      });
      return {
        ...prev,
        [activeIndex]: {
          ...current,
          adjustablePoints: nextPoints
        }
      };
    });
    showNotification('관절의 위치가 AI 초기 측정값으로 초기화되었습니다.');
  };

  const recalculateMeasurements = useCallback((points, ratio, original, imgW, imgH, calib) => {
    const dist = (p1, p2) => {
      if (!p1 || !p2) return 0;
      const dx = (p1.x - p2.x) * imgW;
      const dy = (p1.y - p2.y) * imgH;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const pitchRad = (calib.pitch * Math.PI) / 180;
    const yawRad = (calib.yaw * Math.PI) / 180;
    const verticalCorrection = Math.min(1.15, 1 / Math.cos(pitchRad));
    const horizontalCorrection = Math.min(1.22, 1 / Math.cos(yawRad));

    const sL = points[POSE_LANDMARKS.LEFT_SHOULDER];
    const sR = points[POSE_LANDMARKS.RIGHT_SHOULDER];
    const wL = points[POSE_LANDMARKS.LEFT_WRIST];
    const eL = points[POSE_LANDMARKS.LEFT_ELBOW];
    const hL = points[POSE_LANDMARKS.LEFT_HIP];
    const hR = points[POSE_LANDMARKS.RIGHT_HIP];
    const aL = points[POSE_LANDMARKS.LEFT_ANKLE];

    const shoulderWidth = dist(sL, sR) * ratio * 1.15 * horizontalCorrection;
    const sleeveLength = (dist(sL, eL) + dist(eL, wL)) * ratio * verticalCorrection;
    const shoulderCenter = { x: (sL?.x + sR?.x) / 2, y: (sL?.y + sR?.y) / 2 };
    const hipCenter = { x: (hL?.x + hR?.x) / 2, y: (hL?.y + hR?.y) / 2 };
    const torsoLength = dist(shoulderCenter, hipCenter) * ratio * 1.1 * verticalCorrection;
    const outseam = dist(hipCenter, aL) * ratio * verticalCorrection;

    return { ...original, shoulderWidth, sleeveLength, torsoLength, outseam };
  }, []);

  const currentMeasurements = useMemo(() => {
    if (!activeImage) return measurements;
    if (isAdjusting && adjustablePoints) {
      return recalculateMeasurements(adjustablePoints, pixelToCmRatio, measurements, activeImage.width, activeImage.height, calibration);
    }
    const pitchRad = (calibration.pitch * Math.PI) / 180;
    const yawRad = (calibration.yaw * Math.PI) / 180;
    const verticalCorrection = 1 / Math.cos(pitchRad);
    const horizontalCorrection = 1 / Math.cos(yawRad);

    return {
      ...measurements,
      shoulderWidth: (measurements.shoulderWidth || 0) * horizontalCorrection,
      sleeveLength: (measurements.sleeveLength || 0) * verticalCorrection,
      torsoLength: (measurements.torsoLength || 0) * verticalCorrection,
      outseam: (measurements.outseam || 0) * verticalCorrection
    };
  }, [isAdjusting, adjustablePoints, pixelToCmRatio, measurements, activeImage, calibration, recalculateMeasurements]);

  const measurementItems = useMemo(() => {
    if (!currentMeasurements) return [];
    const { shoulderWidth, sleeveLength, torsoLength, chestCircumference, waistCircumference, hipCircumference, outseam, confidenceShoulder, confidenceArm, confidenceLeg, confidence } = currentMeasurements;
    return [
      { label: t('torso_length'), value: torsoLength?.toFixed(1), confidence, color: measurementStyles.torso_length.color },
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
        value: sleeveLength?.toFixed(1),
        confidence: confidenceArm,
        color: measurementStyles.sleeve_length.color,
        recommendations: [
          { label: t('fit_style_sleeve_wrist'), value: (sleeveLength - 2).toFixed(1) },
          { label: t('fit_style_sleeve_hand'), value: (sleeveLength + 2).toFixed(1) },
          { label: t('fit_style_sleeve_long'), value: (sleeveLength + 5).toFixed(1) },
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
      { label: t('chest_circumference'), value: chestCircumference?.toFixed(1), confidence, color: measurementStyles.chest_circumference.color },
      { label: t('waist_circumference'), value: waistCircumference?.toFixed(1), confidence, color: measurementStyles.waist_circumference.color },
      { label: t('hip_circumference'), value: hipCircumference?.toFixed(1), confidence, color: measurementStyles.hip_circumference.color },
    ].filter(item => item.value);
  }, [currentMeasurements, t]);

  const handleCopy = () => {
    const lines = [t('result_title'), ''];
    measurementItems.forEach(item => {
      lines.push(`[${item.label}]`, `${t('result_measurement')}: ${item.value} cm`);
      if (item.recommendations) {
        lines.push(`${t('fit_guide_title')}:`);
        item.recommendations.forEach(rec => lines.push(`- ${rec.label}: ${rec.value} cm`));
      }
      lines.push('');
    });
    navigator.clipboard.writeText(lines.join('\n').trim());
    showNotification(t('copied_success'));
  };

  const handleSaveOrShare = async (action) => {
    try {
      const el = document.getElementById('result-capture-wrapper');
      if (!el) return;
      const canvas = await html2canvas(el, {
        useCORS: true,
        scale: 2,
        backgroundColor: window.getComputedStyle(document.body).getPropertyValue('background-color'),
      });
      if (action === 'save') {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png', 1.0);
        link.download = 'screenfit_results.png';
        link.click();
        showNotification(t('saved_success'));
      } else if (action === 'share') {
        canvas.toBlob(async (blob) => {
          if (!blob) return showNotification(t('share_error'));
          const file = new File([blob], 'screenfit_results.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: t('result_title'), text: t('fit_guide_intro') });
            showNotification(t('share_success'));
          }
        }, 'image/png');
      }
    } catch {
      showNotification(t('share_error'));
    }
  };

  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="animate-fade-in">
      {notification && <div className="fixed top-5 right-5 bg-green-600 text-white px-5 py-3 rounded-full shadow-lg z-50 animate-fade-in-down">{notification}</div>}

      {/* 3D camera angle alignment overlay modal popup */}
      {!isCalibrated && (
        <CalibrationModal
          activeImage={activeImage}
          calibration={calibration}
          setCalibration={setCalibration}
          onConfirm={() => {
            setIsCalibrated(true);
            showNotification('신체 3D 각도 교정이 완료되었습니다! 최종 치수 및 추천 사이즈를 확인하세요.');
          }}
        />
      )}

      {/* Main Results Dashboard */}
      <div id="result-capture-wrapper" className="bg-slate-50 dark:bg-gray-900 p-4 sm:p-6 md:p-10 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-xl space-y-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-slate-200 dark:border-gray-800 pb-6 gap-4">
          <div className="text-left">
            <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">{t('analysis_complete')}</span>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mt-2">{t('result_title')}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="relative aspect-[3/4] max-h-[380px] sm:max-h-[500px] bg-slate-900 rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-gray-800 flex items-center justify-center">
            <CanvasViewport
              activeImage={activeImage}
              isAdjusting={isAdjusting}
              adjustablePoints={adjustablePoints}
              calibration={calibration}
              isCalibrated={isCalibrated}
              currentMeasurements={currentMeasurements}
              onAdjustmentChange={onAdjustmentChange}
            />

            {/* Manual coordinate adjust toggler */}
            {isCalibrated && (
              <button
                onClick={toggleAdjusting}
                className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-3.5 py-2 rounded-xl border backdrop-blur-md transition-all duration-300 shadow-md ${isAdjusting
                    ? 'bg-emerald-500/25 border-emerald-500/50 text-emerald-300 font-bold ring-1 ring-emerald-500/20'
                    : 'bg-slate-950/75 border-white/15 text-white/95 hover:bg-slate-900/90'
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isAdjusting ? 'bg-emerald-400 animate-ping' : 'bg-white/60'}`} />
                <span className="text-[11px] font-semibold">{isAdjusting ? t('adjust_mode_active') : t('adjust_mode_toggle')}</span>
              </button>
            )}

            {/* Clear edit point modifications */}
            {isCalibrated && isAdjusting && (
              <button
                onClick={handleResetPoints}
                className="absolute top-16 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold rounded-xl backdrop-blur-md hover:bg-rose-500/45 text-[10px] transition-all"
              >
                {t('dot_reset', '도트 초기화')}
              </button>
            )}

            {/* Calibration warning for offset angles */}
            {isCalibrated && isAdjusting && (Math.abs(calibration.yaw) > 10 || Math.abs(calibration.pitch) > 7) && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 w-[80%] bg-amber-500/20 border border-amber-500/35 text-amber-200 text-[10px] font-medium px-3 py-1.5 rounded-xl backdrop-blur-md text-center">
                ⚠️ 3D 각도가 보정되어 있습니다 ({calibration.yaw > 0 ? `+${calibration.yaw}` : calibration.yaw}°, {calibration.pitch > 0 ? `+${calibration.pitch}` : calibration.pitch}°). 사진 속 사선/회전된 경계선에 맞춰 포인트를 편집해 주세요!
              </div>
            )}

            {/* Re-open 3D alignment popup */}
            {isCalibrated && (
              <button
                onClick={() => setIsCalibrated(false)}
                className="absolute bottom-4 right-4 bg-slate-950/80 border border-white/10 hover:border-white/25 text-slate-300 hover:text-white text-[10px] font-bold px-3 py-1.5 rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5 z-10"
              >
                {t('angle_recalibrate', '각도 재보정')}
              </button>
            )}

            {/* Status hud overlay */}
            <div className="absolute top-4 left-4 z-10 flex flex-col space-y-1 text-left bg-slate-950/65 backdrop-blur-md p-2 px-2.5 rounded-xl border border-white/10 select-none pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isCalibrated ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                <span className="text-[9px] font-mono font-bold tracking-wider text-slate-300 uppercase">
                  {isCalibrated ? (isAdjusting ? t('system_manual_edit') : t('system_locked_calibration')) : t('system_3d_calibration')}
                </span>
              </div>
              <span className="text-[8px] font-mono text-slate-400/80">
                V-CORR: x{(1 / Math.cos((calibration.pitch * Math.PI) / 180)).toFixed(2)} | H-CORR: x{(1 / Math.cos((calibration.yaw * Math.PI) / 180)).toFixed(2)}
              </span>
            </div>

            {processedImages.length > 1 && (
              <>
                <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/35 text-white p-2 rounded-full hover:bg-black/50 transition-colors z-10">&lt;</button>
                <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/35 text-white p-2 rounded-full hover:bg-black/50 transition-colors z-10">&gt;</button>
              </>
            )}
          </div>

          <div id="measurements-capture-container" className="space-y-4">
            <MeasurementCards items={measurementItems} />
            {measurements && measurements.confidence < 0.75 && <p className="text-yellow-600 dark:text-yellow-400 text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">{t('accuracy_warning')}</p>}
          </div>
        </div>
      </div>

      {isCalibrated && (
        <ActionButtons
          canShare={canShare}
          handleCopy={handleCopy}
          handleSaveOrShare={handleSaveOrShare}
          onReset={onReset}
        />
      )}
    </div>
  );
};

export default ResultDisplay;
