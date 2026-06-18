# ScreenFit: On-Device AI Body Measurement Engine

> **100% Client-Side Edge AI 신체 치수 계측 및 의류 사이즈 추천 솔루션**
> 
> *Created by [evenight (저녁)](https://github.com/EveNight-Lab)*

---

## 개요 (Overview)

ScreenFit은 사용자의 전신 사진을 기반으로 어깨너비, 소매 길이, 상의 총장, 다리 길이 등을 실시간 계측하여 체형에 맞는 의류 사이즈를 추천하는 온디바이스(On-Device) Edge AI 웹 애플리케이션입니다.

사용자의 사진 데이터를 외부 서버로 전송하지 않고 브라우저 내에서 100% 로컬 연산을 처리하여 개인정보 보호 및 응답 지연 최소화를 설계에 반영했습니다.

---

## 주요 기능 및 사용자 경험 (Key Features & UX)

```carousel
![ScreenFit Demo Screen](file:///C:/Users/Dolveul/.gemini/antigravity/brain/d12c0ca1-8a50-4281-a24e-b4e1870a8783/demo_results_page_1780247151363.png)
<!-- slide -->
### 핵심 엔지니어링 스택
- **Core Engine**: React (v18), JavaScript (ES6+)
- **Pose Detection**: `@mediapipe/pose` (WASM 기반 AI 엔진)
- **Styling**: Tailwind CSS & Vanilla CSS 마이크로 애니메이션
- **Architecture**: Zero-Server $0 MRC (Monthly Recurring Cost)
```

1. **온디바이스 Edge AI 포즈 랜드마크 추적**:
   - Google MediaPipe의 33개 신체 관절 포즈 탐지 모델을 WebAssembly(WASM)로 연동하여 브라우저에서 직접 좌표를 연산합니다.
2. **실시간 인터랙션 관절 미세 조정 (Manual Adjustment Canvas)**:
   - AI가 탐지한 관절의 위치가 불분명할 경우, 사용자가 마우스나 터치 스크린으로 관절 포인트를 드래그 앤 드롭하여 실시간으로 계측값을 미세 조정할 수 있는 캔버스 인터랙션 레이어를 탑재했습니다.
3. **오프라인 샌드박스 데모 모드 (Demo Mode)**:
   - 카메라 장비 연결이 불가하거나 오프라인 환경에서도 계측 및 추천 기능을 검증할 수 있도록 가상의 신체 실루엣 랜드마크 데이터셋을 포함하고 있습니다.
4. **글로벌 비즈니스 대응 (i18n)**:
   - `i18next` 기반으로 다국어 처리를 구축하여 한국어와 영어를 지원합니다.

---

## 핵심 계측 아키텍처 및 수학 공식 (Engineering Architecture & Algorithms)

ScreenFit은 카메라 렌즈의 왜곡 및 촬영 거리에 따른 오차를 극복하기 위해 사용자가 입력한 키(Height) 값을 기준으로 픽셀 평면 좌표계를 물리적 센티미터 단위로 역산하는 삼각측량 비례식(Triangulation Scaling)을 사용합니다.

### 1. 픽셀 대 센티미터 환산 비율 (Pixel-to-CM Ratio)
사용자의 정수리(실제 연산에서는 Nose 랜드마크 기반 보정치 사용)부터 발뒤꿈치(Heel)까지의 수직 픽셀 거리와 입력한 실제 키(Height)의 관계를 통해 기준 비율을 도출합니다.

$$Ratio_{px \to cm} = \frac{Height_{user\_cm}}{Y_{heel\_px} - Y_{nose\_px}}$$

### 2. 관절 간 거리 및 신체 치수 연산 (Biometric Calculation)
도출된 비율을 활용하여 유클리드 거리 공식(Euclidean Distance)에 기반한 관절 간 선형 거리 측정 및 인체 해부학적 보정 계수(Calibration Coefficients)를 결합하여 최종 의류 치수를 확정합니다.

*   **어깨 단면 (Shoulder Width)**: 양쪽 어깨 관절 랜드마크 간의 거리에 아우터/상의 패턴 왜곡률을 감안한 $1.15$의 피팅 보정 상수를 곱해 산출합니다.
    $$Width_{shoulder} = \sqrt{(X_{L\_shoulder} - X_{R\_shoulder})^2 + (Y_{L\_shoulder} - Y_{R\_shoulder})^2} \times Ratio_{px \to cm} \times 1.15$$
*   **소매 길이 (Sleeve Length)**: 어깨 관절에서 팔꿈치(Elbow), 팔꿈치에서 손목(Wrist)까지의 거리를 체인 형태로 결합 연산하여 정밀도를 대폭 올렸습니다.
    $$Length_{sleeve} = (Dist(Shoulder, Elbow) + Dist(Elbow, Wrist)) \times Ratio_{px \to cm}$$

---

## 로컬 개발 환경 설정 (Getting Started)

### 사전 요구 사항
- **Node.js**: v16.0.0 이상 권장
- **Package Manager**: npm 혹은 yarn

### 설치 및 구동 방법
```bash
# 1. 저장소 클론 및 이동
git clone https://github.com/EveNight-Lab/screenfit.git
cd screenfit

# 2. 의존성 패키지 설치
npm install

# 3. 로컬 개발 서버 실행
npm start
```
실행 완료 후 브라우저에서 `http://localhost:3000`으로 접속하여 계측 엔진을 확인할 수 있습니다.

---

## 기대 효과 및 비즈니스 가치 (Business Value)
*   **반품률 감소**: 온라인 쇼핑몰 연동 시 잘못된 사이즈 선택으로 인한 반품 비용을 완화할 수 있습니다.
*   **서버 인프라 비용 절감**: 클라이언트의 연산 자원을 사용하므로, 대규모 트래픽 발생 시에도 백엔드 서버 호스팅 비용이 거의 발생하지 않습니다.
*   **개인정보 보호 컴플라이언스 대응**: 서버로 이미지를 전송하거나 저장하지 않으므로 개인정보 보호 관련 이슈를 예방할 수 있습니다.
