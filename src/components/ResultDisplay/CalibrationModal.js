import React from 'react';
import { useTranslation } from 'react-i18next';
import CanvasViewport from './CanvasViewport';

const CalibrationModal = ({ 
  activeImage, 
  calibration, 
  setCalibration, 
  onConfirm 
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 md:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-4 sm:p-6 max-w-4xl w-full flex flex-col md:flex-row gap-5 sm:gap-6 shadow-2xl relative animate-scale-up text-left">
        
        {/* Left Side: Interactive 3D Canvas */}
        <div className="relative aspect-[3/4] max-h-[350px] sm:max-h-[500px] w-full md:w-1/2 bg-slate-950 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center">
          <CanvasViewport
            activeImage={activeImage}
            isAdjusting={false}
            adjustablePoints={null}
            calibration={calibration}
            isCalibrated={false}
            currentMeasurements={null}
            onAdjustmentChange={() => {}}
          />

          {/* Pitch vertical slider overlay */}
          <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 flex flex-col items-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-3 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-white/15 space-y-2 sm:space-y-3 shadow-lg select-none z-10">
            <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-indigo-400 uppercase select-none" style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}>
              {t('pitch_short', 'Pitch')}
            </span>
            <div className="h-24 sm:h-32 flex items-center justify-center">
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={calibration.pitch}
                onChange={(e) => setCalibration(prev => ({ ...prev, pitch: parseInt(e.target.value) }))}
                className="h-20 sm:h-28 w-1 cursor-pointer accent-indigo-500 rounded bg-white/20 appearance-none"
                style={{
                  writingMode: 'bt-lr',
                  WebkitAppearance: 'slider-vertical',
                }}
              />
            </div>
            <span className="text-[8px] sm:text-[9px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-1 sm:px-1.5 py-0.5 rounded">
              {calibration.pitch > 0 ? `+${calibration.pitch}` : calibration.pitch}°
            </span>
          </div>

          {/* Yaw horizontal slider overlay */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[85%] sm:w-[75%] bg-slate-950/80 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-white/15 flex items-center justify-between space-x-2 sm:space-x-3 shadow-lg z-10">
            <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-emerald-400 uppercase select-none">
              {t('yaw_short', 'Yaw')}
            </span>
            <input
              type="range"
              min="-45"
              max="45"
              step="1"
              value={calibration.yaw}
              onChange={(e) => setCalibration(prev => ({ ...prev, yaw: parseInt(e.target.value) }))}
              className="flex-1 h-1.5 bg-white/25 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <span className="text-[8px] sm:text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 rounded min-w-[28px] sm:min-w-[32px] text-center">
              {calibration.yaw > 0 ? `+${calibration.yaw}` : calibration.yaw}°
            </span>
          </div>

          {/* Sci-Fi Status Hud overlay */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 flex flex-col space-y-0.5 sm:space-y-1 text-left bg-slate-950/65 backdrop-blur-md p-1.5 sm:p-2 px-2 sm:px-2.5 rounded-lg sm:rounded-xl border border-white/10 select-none pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full animate-pulse bg-indigo-500" />
              <span className="text-[8px] sm:text-[9px] font-mono font-bold tracking-wider text-slate-300 uppercase">
                {t('system_3d_calibration')}
              </span>
            </div>
            <span className="text-[7px] sm:text-[8px] font-mono text-slate-400/80">
              V-CORR: x{(1 / Math.cos((calibration.pitch * Math.PI) / 180)).toFixed(2)} | H-CORR: x{(1 / Math.cos((calibration.yaw * Math.PI) / 180)).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Right Side: Description and Confirm Button */}
        <div className="flex-1 flex flex-col justify-between space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/25 p-2 sm:p-2.5 rounded-xl border border-indigo-500/35">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-100">{t('calibration_title')}</h3>
                <p className="text-[10px] sm:text-xs text-slate-400">정밀 왜곡 복원을 위한 입체 정렬 단계</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 sm:p-5 rounded-2xl border border-white/5">
              <p>
                정면 촬영 사진이 아닌 경우, 실제 체형 크기를 정확하게 추출하기 위해 **사진 촬영 당시의 왜곡 각도를 먼저 매칭**해야 합니다.
              </p>
              <div className="space-y-2 pt-2 border-t border-white/5 text-[11px] sm:text-xs">
                <div className="flex items-start gap-2">
                  <span className="bg-indigo-500/25 text-indigo-300 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</span>
                  <p className="text-slate-300 pt-0.5">좌측 캔버스 위의 **3D 실린더 골격**이 사진 속 서 있는 방향 및 카메라 촬영 각도와 대략 일치하도록 Pitch(상하) 및 Yaw(좌우) 슬라이더를 조작하세요.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-indigo-500/25 text-indigo-300 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</span>
                  <p className="text-slate-300 pt-0.5">원통의 두께와 3D 그리드 링이 사진 속 체형 정렬과 비슷해지면, 아래 버튼을 눌러 정밀 치수 측정을 진행하세요.</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onConfirm}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 hover:from-blue-700 hover:via-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 sm:py-4 px-6 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20 text-sm sm:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            이 각도로 최종 치수 측정하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalibrationModal;
