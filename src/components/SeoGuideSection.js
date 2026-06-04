import React, { useState } from 'react';

const SeoGuideSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-gray-800/85 text-left">
      {/* Expand/Collapse Toggle Button */}
      <div className="text-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-2.5 px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800/40 dark:hover:bg-gray-800/70 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 rounded-full transition-all duration-300 border border-slate-200/60 dark:border-gray-700/60 hover:scale-[1.02] shadow-sm"
        >
          <span>{isExpanded ? '📖 AI 분석 기술 설명 및 사이즈 가이드 접기' : '📘 AI 분석 기술 설명 및 사이즈 가이드 펼쳐보기'}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transform transition-transform duration-300 text-slate-500 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Crawlable SEO Content: Permanently rendered in the DOM for crawlability, hidden via CSS */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isExpanded 
            ? 'opacity-100 max-h-[5000px] mt-8 space-y-8 pointer-events-auto' 
            : 'opacity-0 max-h-0 overflow-hidden pointer-events-none'
        }`}
      >
        {/* Section 1: Introduction */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">
            옷 사이즈 실패 없는 쇼핑을 위한 AI 신체 치수 분석 시스템
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            온라인으로 옷을 주문할 때 가장 고민되는 부분이 바로 사이즈 선택입니다. 스크린핏(ScreenFit)은 고도화된 컴퓨터 비전 및 AI 골격 추출 기술(MediaPipe Pose)을 기반으로, 전신 사진 단 한 장만으로도 어깨 단면, 소매 길이, 상의 총장, 다리 길이(아웃심) 등 옷 선택의 기준이 되는 주요 신체 치수를 밀리미터 단위로 정확하게 산출합니다.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            특히 카메라 촬영 각도로 인해 발생하는 왜곡 현상을 해결하기 위해 3D 원근 교정 알고리즘을 탑재하고 있습니다. 촬영 시 카메라가 위로 기울어지거나(Pitch) 피사체가 비스듬히 선 경우(Yaw), 3D 실린더 가상 모델 매칭 기법을 통해 실제 수직/수평 투영 배율(V-CORR, H-CORR)을 실시간으로 도출하고 치수를 보정합니다.
          </p>
        </div>

        {/* Section 2: Detailed Body Measurement Guides */}
        <div className="space-y-4 border-t border-slate-100 dark:border-gray-800 pt-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            📐 신체 부위별 상세 측정 가이드 및 쇼핑 꿀팁
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            AI가 신체의 관절 좌표 및 실루엣 경계를 추적하여 산출하는 4대 주요 치수의 상세 정의와 의류 실측표 매칭 가이드입니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <div className="bg-slate-50 dark:bg-gray-800/20 p-4 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">1. 어깨 단면 (Shoulder Width)</h4>
              <p className="leading-relaxed text-slate-500 dark:text-slate-400 text-xs">
                왼쪽 어깨의 가쪽 끝점(견봉점)부터 오른쪽 어깨 끝점까지의 최단 직선거리입니다. 드롭 숄더 실루엣의 맨투맨이나 루즈핏 티셔츠를 고를 때는 측정된 어깨 단면에 4~8cm를 더한 치수의 의류 실측표를 선택하시는 것이 가장 이상적입니다.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-gray-800/20 p-4 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">2. 소매 길이 (Sleeve Length)</h4>
              <p className="leading-relaxed text-slate-500 dark:text-slate-400 text-xs">
                어깨 견봉점에서 시작하여 팔꿈치를 지나 손목뼈 돌출부(척골 경상돌기)까지의 길이입니다. 소매 기장은 옷의 핏감을 결정짓는 매우 중요한 요소로, 셔츠나 포멀 자켓은 손목 관절 핏에 맞추어 측정값 정사이즈로, 캐주얼 후디나 집업은 손등을 덮도록 +2~4cm 여유를 주는 것이 좋습니다.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-gray-800/20 p-4 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">3. 상의 총장 (Torso Length)</h4>
              <p className="leading-relaxed text-slate-500 dark:text-slate-400 text-xs">
                목 옆점 혹은 뒷덜미의 돌출된 목뼈(경추점) 부근에서 엉덩이 수평선 영역까지의 수직 길이입니다. 크롭 기장의 트렌디한 상의를 찾으신다면 골반 시작점 부근(측정된 총장 -10~15cm)을 기준으로 삼고, 기본 아우터나 셔츠는 엉덩이 절반을 덮는 길이(측정값 정사이즈)를 선택하면 단정한 핏을 연출할 수 있습니다.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-gray-800/20 p-4 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">4. 다리 길이 / 아웃심 (Outseam)</h4>
              <p className="leading-relaxed text-slate-500 dark:text-slate-400 text-xs">
                골반뼈 가쪽 시작점부터 복사뼈 하단까지 떨어지는 다리 외측 총기장입니다. 슬랙스나 스트레이트 데님을 구매할 때는 발목에 가볍게 떨어지는 크롭 핏(-6~10cm), 자연스러운 주름이 잡히는 오버 와이드 핏(정사이즈 기장 및 +2cm)을 매칭하여 다양한 연출이 가능합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Mathematical & Technical Details of 3D Distortion */}
        <div className="space-y-4 border-t border-slate-100 dark:border-gray-800 pt-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            ⚙️ 3D 원근 및 카메라 앵글 교정 알고리즘 원리
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            인물이 정면이 아닌 사선 방향을 바라보고 서 있거나, 카메라가 눈높이보다 높거나 낮게 위치하여 하이/로우 앵글 왜곡이 발생한 경우, 2D 이미지 좌표는 투영 왜곡에 의해 실측값보다 대폭 좁거나 짧게 표시됩니다. 스크린핏은 이를 바로잡기 위한 정밀 3D 보정 수학 공식을 사용합니다.
          </p>
          <div className="bg-slate-50 dark:bg-gray-800/20 p-5 rounded-2xl border border-slate-200/50 dark:border-gray-700/50 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <div>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">■ 수직 원근 보정 계수 (V-CORR: Vertical Correction Coefficient)</span>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed">
                카메라가 인물을 위에서 내려다보는 구도로 기울어졌을 때(Pitch 각도 발생), 원근 왜곡으로 인해 하체가 급격히 수축하여 비쳐 보입니다. 스크린핏은 삼각비 코사인 값을 역산하여 수직 좌표 스케일링을 수행합니다. 
                <br />
                <code className="block my-2 p-2 bg-slate-100 dark:bg-gray-900 rounded font-mono text-center text-slate-700 dark:text-slate-300">
                  실제 기장 = 화면 상 기장 / Cos(Pitch 각도)
                </code>
                예를 들어 상하 각도가 15도 기울어지면 약 1.035배(V-CORR: x1.04)의 보정 계수가 적용되어, 찌그러져 렌더링되던 다리 기장과 상의 총장 수치가 원래 비율대로 정확히 복원됩니다.
              </p>
            </div>
            <div className="border-t border-slate-200/50 dark:border-gray-800 pt-4">
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">■ 수평 원근 보정 계수 (H-CORR: Horizontal Correction Coefficient)</span>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed">
                피사체가 정면 카메라 축에서 벗어나 비스듬히 좌우로 회전된 상태(Yaw 각도 발생)에서는 어깨나 가슴폭이 평면상에서 극도로 협소하게 투영됩니다. 스크린핏은 3차원 원통 실린더 체형 평면 투영 공식에 맞추어 수평 너비를 되살립니다.
                <br />
                <code className="block my-2 p-2 bg-slate-100 dark:bg-gray-900 rounded font-mono text-center text-slate-700 dark:text-slate-300">
                  실제 가로폭 = 화면 상 가로폭 / Cos(Yaw 각도)
                </code>
                20도의 몸 회전 각도가 발생하면 H-CORR(x1.06) 배율이 계산되어, 약 41.5cm로 축소 감지되던 어깨 너비가 본래의 체형 값인 44.2cm로 올바르게 재계산됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Confidence Metrics & Optimization */}
        <div className="space-y-4 border-t border-slate-100 dark:border-gray-800 pt-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            💡 AI 체형 분석 신뢰도(Confidence Score) 지표 해석
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            측정 결과 화면 우측 상단에 노출되는 신뢰도 퍼센티지(%) 지표는 관절 검출 신뢰도 및 배경 환경의 우수성을 나타내며 아래의 세 가지 등급으로 나뉩니다.
          </p>
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <div className="flex gap-3">
              <span className="font-mono font-bold text-emerald-500 text-sm">95% ~ 100%</span>
              <div className="space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">최상 (Very High Accuracy)</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">배경과 신체가 명확히 분리되며, 몸에 가볍게 피팅되는 의류를 입은 상태에서 정밀 측정된 최적의 셋업입니다. 실측 사이즈 오차가 ±0.8cm 미만으로 가장 정확합니다.</p>
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 dark:border-gray-800/40 pt-2">
              <span className="font-mono font-bold text-indigo-500 text-sm">80% ~ 95%</span>
              <div className="space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">우수 (Good Accuracy)</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">일반적인 캐주얼 의상(적당한 두께의 라운드 티셔츠, 청바지 등)을 착용하고 측정된 보통의 상태입니다. 실측 사이즈 오차가 ±1.5cm 내외로, 범용적인 쇼핑 가이드용으로 충분한 우수한 신뢰도입니다.</p>
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 dark:border-gray-800/40 pt-2">
              <span className="font-mono font-bold text-rose-500 text-sm">80% 미만</span>
              <div className="space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">주의 (Low Confidence)</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">지나치게 두꺼운 패딩이나 오버 코트, 어두운 배경에서 어두운 옷을 입어 신체 외곽 윤곽 추적이 방해받은 상태입니다. 정확도가 다소 떨어질 수 있으므로, 밝은 방에서 핏되는 옷을 입고 전신이 다 보이게 재촬영하는 것을 추천합니다.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Real-time Analysis Models Dataset */}
        <div className="space-y-4 border-t border-slate-100 dark:border-gray-800 pt-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            📊 AI 바디 스캔 분석 모델 데이터 및 추천 사이즈 가이드
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            구글봇 크롤러 및 사용자를 위한 실시간 분석 모델의 측정 상세 수치 및 핏 가이드 리스트입니다.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Model 1 */}
            <div className="bg-slate-50 dark:bg-gray-800/30 p-5 rounded-2xl border border-slate-200/50 dark:border-gray-700/50 space-y-4">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 flex justify-between items-center text-sm">
                <span>1. 한국 남성 표준 캐주얼 핏 모델 (176cm / 정면)</span>
                <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-mono font-bold">MALE_01</span>
              </h4>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <p><strong>측정된 핵심 치수:</strong></p>
                <ul className="list-disc list-inside pl-1 space-y-1 text-slate-500 dark:text-slate-400">
                  <li>어깨 너비: 44.5 cm (표준형 어깨 라인)</li>
                  <li>소매 기장: 60.5 cm</li>
                  <li>상의 총장: 70.5 cm</li>
                  <li>다리 길이 (아웃심): 92.8 cm</li>
                </ul>
                <p className="pt-2"><strong>어깨 너비 기준 추천 의류 가이드:</strong></p>
                <div className="bg-white dark:bg-gray-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-gray-700/40 text-[11px] space-y-1 text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between"><span>정핏 (레귤러 티셔츠):</span><span className="font-semibold text-slate-700 dark:text-slate-300">어깨 단면 45.5 cm 이상</span></div>
                  <div className="flex justify-between"><span>세미오버핏 맨투맨:</span><span className="font-semibold text-slate-700 dark:text-slate-300">어깨 단면 49.5 cm 이상</span></div>
                  <div className="flex justify-between"><span>스트릿 오버핏 후드:</span><span className="font-semibold text-slate-700 dark:text-slate-300">어깨 단면 54.5 cm 이상</span></div>
                </div>
              </div>
            </div>

            {/* Model 2 */}
            <div className="bg-slate-50 dark:bg-gray-800/30 p-5 rounded-2xl border border-slate-200/50 dark:border-gray-700/50 space-y-4">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 flex justify-between items-center text-sm">
                <span>2. 한국 여성 표준 데일리 핏 모델 (165cm / 정면)</span>
                <span className="text-[10px] bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 px-2 py-0.5 rounded font-mono font-bold">FEMALE_01</span>
              </h4>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <p><strong>측정된 핵심 치수:</strong></p>
                <ul className="list-disc list-inside pl-1 space-y-1 text-slate-500 dark:text-slate-400">
                  <li>어깨 너비: 38.2 cm (슬림형 어깨 라인)</li>
                  <li>소매 기장: 56.4 cm</li>
                  <li>상의 총장: 64.2 cm</li>
                  <li>다리 길이 (아웃심): 86.8 cm</li>
                </ul>
                <p className="pt-2"><strong>소매 기장 기준 아우터 가이드:</strong></p>
                <div className="bg-white dark:bg-gray-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-gray-700/40 text-[11px] space-y-1 text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between"><span>크롭 자켓 (손목 핏):</span><span className="font-semibold text-slate-700 dark:text-slate-300">소매 총장 54.4 cm</span></div>
                  <div className="flex justify-between"><span>오버핏 코트 (손등 덮음):</span><span className="font-semibold text-slate-700 dark:text-slate-300">소매 총장 58.4 cm</span></div>
                  <div className="flex justify-between"><span>롱슬리브 가디건:</span><span className="font-semibold text-slate-700 dark:text-slate-300">소매 총장 61.4 cm</span></div>
                </div>
              </div>
            </div>

            {/* Model 3 */}
            <div className="bg-slate-50 dark:bg-gray-800/30 p-5 rounded-2xl border border-slate-200/50 dark:border-gray-700/50 space-y-4">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 flex justify-between items-center text-sm">
                <span>3. 측면 회전 각도 왜곡 교정 모델 (178cm / +20° Yaw)</span>
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">YAW_CORR_03</span>
              </h4>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <p><strong>측정된 핵심 치수:</strong></p>
                <ul className="list-disc list-inside pl-1 space-y-1 text-slate-500 dark:text-slate-400">
                  <li>어깨 너비: 41.5 cm &rarr; 3D 보정 후 <strong>44.2 cm</strong></li>
                  <li>소매 기장: 61.2 cm</li>
                  <li>상의 총장: 71.8 cm</li>
                  <li>다리 길이 (아웃심): 94.2 cm</li>
                </ul>
                <p className="pt-2"><strong>3D 각도 왜곡(Yaw) 보정 알고리즘 설명:</strong></p>
                <p className="text-slate-500 dark:text-slate-400 leading-normal text-[11px]">
                  몸이 20도 측면으로 틀어졌을 때 정면 투영 방식은 어깨폭을 실제보다 좁은 41.5cm로 오인식합니다. 스크린핏은 수평 배율 보정 계수(H-CORR: x1.06)를 적용하여 원래의 체형 어깨 폭(44.2cm)을 오차 없이 계산합니다.
                </p>
              </div>
            </div>

            {/* Model 4 */}
            <div className="bg-slate-50 dark:bg-gray-800/30 p-5 rounded-2xl border border-slate-200/50 dark:border-gray-700/50 space-y-4">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 flex justify-between items-center text-sm">
                <span>4. 하이앵글 수직 왜곡 교정 모델 (168cm / +15° Pitch)</span>
                <span className="text-[10px] bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded font-mono font-bold">PITCH_CORR_04</span>
              </h4>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <p><strong>측정된 핵심 치수:</strong></p>
                <ul className="list-disc list-inside pl-1 space-y-1 text-slate-500 dark:text-slate-400">
                  <li>어깨 너비: 38.8 cm</li>
                  <li>소매 기장: 54.8 cm &rarr; 3D 보정 후 <strong>56.7 cm</strong></li>
                  <li>상의 총장: 62.5 cm &rarr; 3D 보정 후 <strong>64.7 cm</strong></li>
                  <li>다리 길이: 85.2 cm &rarr; 3D 보정 후 <strong>88.2 cm</strong></li>
                </ul>
                <p className="pt-2"><strong>3D 각도 왜곡(Pitch) 보정 알고리즘 설명:</strong></p>
                <p className="text-slate-500 dark:text-slate-400 leading-normal text-[11px]">
                  카메라가 상단에서 하단으로 기울어지면(하이앵글), 원근법에 의해 하체가 짧아 보이고 총장 및 다리 길이가 크게 왜곡됩니다. 스크린핏은 수직 배율 보정 계수(V-CORR: x1.04)를 연산하여 다리 길이(88.2cm)와 자켓 총장(64.7cm)의 정확한 길이를 산출합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeoGuideSection;
