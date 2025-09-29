import { Pose, POSE_LANDMARKS } from '@mediapipe/pose';

const {
  LEFT_SHOULDER, RIGHT_SHOULDER,
  LEFT_HIP, RIGHT_HIP,
  LEFT_ANKLE, RIGHT_ANKLE, 
  LEFT_ELBOW, LEFT_WRIST, RIGHT_WRIST,
  NOSE,
  LEFT_HEEL, RIGHT_HEEL
} = POSE_LANDMARKS;

const MODEL_COMPLEXITY = 1;
const MAX_IMAGE_SIZE = 1024; // 이미지 최대 크기를 1024px로 제한

const createImageElement = (imageFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const originalImage = document.createElement('img');
      originalImage.src = e.target.result;
      originalImage.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let { width, height } = originalImage;

        if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) { 
          const ratio = Math.min(MAX_IMAGE_SIZE / width, MAX_IMAGE_SIZE / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(originalImage, 0, 0, width, height);

        const resizedImage = document.createElement('img');
        resizedImage.src = canvas.toDataURL('image/jpeg', 0.9); // JPEG로 변환하여 용량 추가 감소
        resizedImage.onload = () => resolve(resizedImage);
        resizedImage.onerror = reject;
      };
      originalImage.onerror = reject;
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
};

const getLandmarksForImage = (imageElement, pose) => {
  return new Promise((resolve, reject) => {
    pose.onResults((results) => {
      if (!results.poseLandmarks) {
        return reject(new Error('error_mediapipe'));
      }
      resolve({ landmarks: results.poseLandmarks, width: imageElement.width, height: imageElement.height });
    });
    pose.send({ image: imageElement });
  });
};

const classifyPose = (landmarks) => {
    const leftVisibility = (landmarks[POSE_LANDMARKS.LEFT_SHOULDER].visibility + landmarks[POSE_LANDMARKS.LEFT_HIP].visibility + landmarks[POSE_LANDMARKS.LEFT_ANKLE].visibility) / 3;
    const rightVisibility = (landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].visibility + landmarks[POSE_LANDMARKS.RIGHT_HIP].visibility + landmarks[POSE_LANDMARKS.RIGHT_ANKLE].visibility) / 3;

    if (leftVisibility > 0.8 && rightVisibility > 0.8) {
        // 정면 판별 로직 강화: 코가 양쪽 어깨의 중앙에 위치하는지 확인
        const shoulderL = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
        const shoulderR = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
        const nose = landmarks[POSE_LANDMARKS.NOSE];

        const shoulderMidX = (shoulderL.x + shoulderR.x) / 2;
        const noseToMidDist = Math.abs(nose.x - shoulderMidX);
        const shoulderSpan = Math.abs(shoulderL.x - shoulderR.x);

        // 코가 어깨너비의 25% 이상 벗어나면 정면으로 보지 않음
        if (noseToMidDist < shoulderSpan * 0.25) {
            return { view: 'front', score: (leftVisibility + rightVisibility) / 2 };
        }
    }
    if (leftVisibility > 0.7 && rightVisibility < 0.5) {
        return { view: 'side', score: leftVisibility };
    }
    if (rightVisibility > 0.7 && leftVisibility < 0.5) {
        return { view: 'side', score: rightVisibility };
    }
    return { view: 'unknown', score: 0 };
}

export const calculateBodyMeasurements = async (files, userHeightCm) => {
  const pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
  pose.setOptions({ modelComplexity: MODEL_COMPLEXITY, staticImageMode: true, enableSegmentation: false, smoothLandmarks: true });

  let allProcessedImages = [];
  for (const fileWrapper of files) {
    const imageElement = await createImageElement(fileWrapper.originalFile);
    const result = await getLandmarksForImage(imageElement, pose);
    // pixelToCmRatio 계산 기준을 코-발뒤꿈치 수직 픽셀 거리로 명확히 함
    const topPointY = result.landmarks[NOSE].y;
    const bottomPointY = Math.max(result.landmarks[LEFT_HEEL].y, result.landmarks[RIGHT_HEEL].y);
    const bodyHeightInPixels = (bottomPointY - topPointY) * imageElement.height;
    const pixelToCmRatio = userHeightCm / bodyHeightInPixels;
    const classification = classifyPose(result.landmarks);
    allProcessedImages.push({ 
      ...result, 
      ...classification, 
      resizedImageSrc: imageElement.src,      // 리사이징된 이미지 데이터 URL 추가
      pixelToCmRatio: pixelToCmRatio,         // 각 이미지의 고유 비율 저장
      id: fileWrapper.id 
    });
  }

  // 신뢰도(score)가 0.85 이상인 모든 정면 사진을 분석 대상으로 선택
  const goodFrontImages = allProcessedImages
    .filter(p => p.view === 'front' && p.score >= 0.85)
    .sort((a, b) => b.score - a.score);

  if (goodFrontImages.length === 0) {
    throw new Error('error_no_front_image');
  }

  const frontImage = goodFrontImages[0]; // 대표 이미지는 가장 점수 높은 것으로 유지

  // Mark which images were used for calculations
  allProcessedImages = allProcessedImages.map(img => ({
      ...img,
      isUsedFor2D: goodFrontImages.some(goodImg => goodImg.id === img.id),
      isUsedFor3D: false, // 측면 사진을 더 이상 사용하지 않음
  }));

  // 모든 측정값은 여러 장의 'goodFrontImages'에서 계산 후 평균을 내어 안정성 확보
  const measurementsList = [];
  for (const image of goodFrontImages) {
    const { landmarks: lm, width: w, height: h, pixelToCmRatio } = image;
    
    const getDistanceInCm = (p1, p2) => Math.sqrt(Math.pow((p1.x - p2.x) * w, 2) + Math.pow((p1.y - p2.y) * h, 2)) * pixelToCmRatio;

    const shoulderL = lm[LEFT_SHOULDER];
    const shoulderR = lm[RIGHT_SHOULDER];
    const ankleL = lm[LEFT_ANKLE];
    const ankleR = lm[RIGHT_ANKLE];
    const hipL = lm[LEFT_HIP];
    const hipR = lm[RIGHT_HIP];
    const shoulderWidth = getDistanceInCm(shoulderL, shoulderR) * 1.15; // 보정 계수 상향
    // 소매 길이: 어깨부터 손목까지의 거리로, 가장 기본적인 '손목 기장'을 기준으로 함
    const sleeveLength = (getDistanceInCm(lm[LEFT_SHOULDER], lm[LEFT_ELBOW]) + getDistanceInCm(lm[LEFT_ELBOW], lm[LEFT_WRIST]));
    
    const shoulderCenter = { x: (shoulderL.x + shoulderR.x) / 2, y: (shoulderL.y + shoulderR.y) / 2 };
    const hipCenter = { x: (hipL.x + hipR.x) / 2, y: (hipL.y + hipR.y) / 2 };
    const waistPoint = { x: hipCenter.x, y: (shoulderCenter.y * 0.18 + hipCenter.y * 0.82) }; // 하의 총장 측정 시작점을 허리선에 가깝게 조정
    const torsoLength = getDistanceInCm(shoulderCenter, hipCenter) * 1.1;
    const ankleCenter = { x: (ankleL.x + ankleR.x) / 2, y: (ankleL.y + ankleR.y) / 2 };
    const outseam = getDistanceInCm(waistPoint, ankleCenter); // 하의 총장 측정 기준을 'hipCenter'에서 'waistPoint'로 변경
    
    measurementsList.push({ shoulderWidth, sleeveLength, outseam, torsoLength });
  }

  // 어깨너비는 최대값을, 나머지 측정값은 평균을 사용하도록 로직 수정
  const finalMeasurements = measurementsList.reduce((acc, curr, index) => {
    if (index === 0) {
      return { ...curr }; // 첫 번째 측정값으로 초기화
    }
    // 어깨너비는 최대값으로 업데이트
    acc.shoulderWidth = Math.max(acc.shoulderWidth, curr.shoulderWidth);
    // 나머지 값들은 합산
    acc.sleeveLength += curr.sleeveLength;
    acc.outseam += curr.outseam;
    acc.torsoLength += curr.torsoLength;
    return acc;
  }, {});

  // 합산된 값들을 사진 개수로 나누어 평균 계산 (어깨너비 제외)
  if (measurementsList.length > 1) {
    finalMeasurements.sleeveLength /= measurementsList.length;
    finalMeasurements.outseam /= measurementsList.length;
    finalMeasurements.torsoLength /= measurementsList.length;
  }

  const { landmarks: frontLm } = frontImage;
  const shoulderL = frontLm[LEFT_SHOULDER];
  const shoulderR = frontLm[RIGHT_SHOULDER];
  const hipL = frontLm[LEFT_HIP];
  const hipR = frontLm[RIGHT_HIP];
  const topPoint = frontLm[NOSE];
  const bottomY = Math.max(frontLm[LEFT_HEEL].y, frontLm[RIGHT_HEEL].y);
  const hipCenterY = (hipL.y + hipR.y) / 2;
  const bodyRatio = (hipCenterY - topPoint.y) / (bottomY - hipCenterY);

  const confidenceShoulder = (shoulderL.visibility + shoulderR.visibility) / 2;
  const confidenceArm = (frontLm[LEFT_WRIST].visibility + frontLm[RIGHT_WRIST].visibility) / 2;
  const confidenceLeg = (frontLm[LEFT_ANKLE].visibility + frontLm[RIGHT_ANKLE].visibility) / 2;
  const totalConfidence = (confidenceShoulder + confidenceArm + confidenceLeg) / 3;

  pose.close();

  return {
    measurements: {
        ...finalMeasurements,
        bodyRatio: bodyRatio,
        confidence: totalConfidence,
        confidenceShoulder,
        confidenceArm,
        confidenceLeg,
    },
    allProcessedImages: allProcessedImages,
  };
};

export const recalculateMeasurements = (points, allProcessedImages, originalMeasurements) => {
  const goodFrontImages = allProcessedImages.filter(p => p.isUsedFor2D);
  if (goodFrontImages.length === 0) {
    return originalMeasurements; // 계산할 이미지가 없으면 원본 값 반환
  }

  const measurementsList = [];
  for (const image of goodFrontImages) {
    const { pixelToCmRatio } = image;
    const getDistanceInCm = (p1, p2) => Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2)) * pixelToCmRatio;

    const shoulderL = points[LEFT_SHOULDER];
    const shoulderR = points[RIGHT_SHOULDER];
    const wristL = points[LEFT_WRIST];
    const elbowL = points[LEFT_ELBOW];
    const hipL = points[LEFT_HIP];
    const hipR = points[RIGHT_HIP];
    const ankleL = points[LEFT_ANKLE];

    const shoulderWidth = getDistanceInCm(shoulderL, shoulderR) * 1.15;
    const sleeveLength = (getDistanceInCm(shoulderL, elbowL) + getDistanceInCm(elbowL, wristL));
    const shoulderCenter = { x: (shoulderL?.x + shoulderR?.x) / 2, y: (shoulderL?.y + shoulderR?.y) / 2 };
    const hipCenter = { x: (hipL?.x + hipR?.x) / 2, y: (hipL?.y + hipR?.y) / 2 };
    const torsoLength = getDistanceInCm(shoulderCenter, hipCenter) * 1.1;
    const outseam = getDistanceInCm(hipCenter, ankleL);

    measurementsList.push({ shoulderWidth, sleeveLength, outseam, torsoLength });
  }

  // 초기 계산과 동일한 로직으로 최종 측정값 집계
  const finalMeasurements = measurementsList.reduce((acc, curr, index) => {
    if (index === 0) return { ...curr };
    acc.shoulderWidth = Math.max(acc.shoulderWidth, curr.shoulderWidth);
    acc.sleeveLength += curr.sleeveLength;
    acc.outseam += curr.outseam;
    acc.torsoLength += curr.torsoLength;
    return acc;
  }, {});

  if (measurementsList.length > 1) {
    finalMeasurements.sleeveLength /= measurementsList.length;
    finalMeasurements.outseam /= measurementsList.length;
    finalMeasurements.torsoLength /= measurementsList.length;
  }

  return { ...originalMeasurements, ...finalMeasurements };
};