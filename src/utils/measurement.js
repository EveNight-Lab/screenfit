import { Pose, POSE_LANDMARKS } from '@mediapipe/pose';
import { createDemoSilhouette } from './demoSilhouette';

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
};

export const calculateBodyMeasurements = async (files, userHeightCm) => {
  if (files[0] && files[0].isDemo) {
    const demoImageSrc = createDemoSilhouette();
    const mockLandmarks = [];
    for (let i = 0; i < 33; i++) {
      mockLandmarks.push({ x: 0.5, y: 0.5, visibility: 0.99 });
    }
    
    mockLandmarks[0] = { x: 0.5, y: 0.15, visibility: 0.99 }; // NOSE
    mockLandmarks[11] = { x: 0.42, y: 0.25, visibility: 0.99 }; // LEFT_SHOULDER
    mockLandmarks[12] = { x: 0.58, y: 0.25, visibility: 0.99 }; // RIGHT_SHOULDER
    mockLandmarks[13] = { x: 0.38, y: 0.4, visibility: 0.99 }; // LEFT_ELBOW
    mockLandmarks[14] = { x: 0.62, y: 0.4, visibility: 0.99 }; // RIGHT_ELBOW
    mockLandmarks[15] = { x: 0.36, y: 0.55, visibility: 0.99 }; // LEFT_WRIST
    mockLandmarks[16] = { x: 0.64, y: 0.55, visibility: 0.99 }; // RIGHT_WRIST
    mockLandmarks[23] = { x: 0.44, y: 0.5, visibility: 0.99 }; // LEFT_HIP
    mockLandmarks[24] = { x: 0.56, y: 0.5, visibility: 0.99 }; // RIGHT_HIP
    mockLandmarks[25] = { x: 0.44, y: 0.7, visibility: 0.99 }; // LEFT_KNEE
    mockLandmarks[26] = { x: 0.56, y: 0.7, visibility: 0.99 }; // RIGHT_KNEE
    mockLandmarks[27] = { x: 0.44, y: 0.9, visibility: 0.99 }; // LEFT_ANKLE
    mockLandmarks[28] = { x: 0.56, y: 0.9, visibility: 0.99 }; // RIGHT_ANKLE
    mockLandmarks[29] = { x: 0.44, y: 0.92, visibility: 0.99 }; // LEFT_HEEL
    mockLandmarks[30] = { x: 0.56, y: 0.92, visibility: 0.99 }; // RIGHT_HEEL

    const demoProcessedImage = {
      landmarks: mockLandmarks,
      width: 512,
      height: 682,
      view: 'front',
      score: 0.99,
      resizedImageSrc: demoImageSrc,
      pixelToCmRatio: 176 / ((0.92 - 0.15) * 682),
      id: files[0].id,
      isUsedFor2D: true,
      isUsedFor3D: false
    };

    const measurements = {
      shoulderWidth: 42.5,
      sleeveLength: 61.2,
      torsoLength: 72.8,
      outseam: 96.5,
      bodyRatio: 1.25,
      confidence: 0.99,
      confidenceShoulder: 0.99,
      confidenceArm: 0.99,
      confidenceLeg: 0.99,
      isFrontFacing: true
    };

    return {
      measurements,
      allProcessedImages: [demoProcessedImage]
    };
  }

  const pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
  pose.setOptions({ modelComplexity: MODEL_COMPLEXITY, staticImageMode: true, enableSegmentation: false, smoothLandmarks: true });

  let allProcessedImages = [];
  for (const fileWrapper of files) {
    const imageElement = await createImageElement(fileWrapper.originalFile);
    const result = await getLandmarksForImage(imageElement, pose);
    const topPointY = result.landmarks[NOSE].y;
    const bottomPointY = Math.max(result.landmarks[LEFT_HEEL].y, result.landmarks[RIGHT_HEEL].y);
    const bodyHeightInPixels = (bottomPointY - topPointY) * imageElement.height;
    const pixelToCmRatio = userHeightCm / bodyHeightInPixels;
    const classification = classifyPose(result.landmarks);
    
    const isSample = fileWrapper.originalFile && fileWrapper.originalFile.name && (
      fileWrapper.originalFile.name.includes('sample_model') ||
      fileWrapper.originalFile.name.includes('sample_character') ||
      fileWrapper.originalFile.name.includes('sample_celebrity')
    );

    allProcessedImages.push({ 
      ...result, 
      view: isSample ? 'front' : classification.view, 
      score: isSample ? 0.99 : classification.score,
      resizedImageSrc: imageElement.src,
      pixelToCmRatio: pixelToCmRatio,
      id: fileWrapper.id 
    });
  }

  // 신뢰도가 0.85 이상인 정면 사진 탐색
  let isFrontFacing = true;
  let goodFrontImages = allProcessedImages
    .filter(p => p.view === 'front' && p.score >= 0.85)
    .sort((a, b) => b.score - a.score);

  if (goodFrontImages.length === 0) {
    // 정면 사진이 감지되지 않으면 전체 사진 중에서 분석을 계속하며 보정 절차 필요 플래그를 false로 설정
    isFrontFacing = false;
    goodFrontImages = [...allProcessedImages];
  }

  const frontImage = goodFrontImages[0];

  // 계산에 사용된 이미지 표시
  allProcessedImages = allProcessedImages.map(img => ({
    ...img,
    isUsedFor2D: goodFrontImages.some(goodImg => goodImg.id === img.id),
    isUsedFor3D: false,
  }));

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
    const shoulderWidth = getDistanceInCm(shoulderL, shoulderR) * 1.15;
    const sleeveLength = (getDistanceInCm(lm[LEFT_SHOULDER], lm[LEFT_ELBOW]) + getDistanceInCm(lm[LEFT_ELBOW], lm[LEFT_WRIST]));
    
    const shoulderCenter = { x: (shoulderL.x + shoulderR.x) / 2, y: (shoulderL.y + shoulderR.y) / 2 };
    const hipCenter = { x: (hipL.x + hipR.x) / 2, y: (hipL.y + hipR.y) / 2 };
    const waistPoint = { x: hipCenter.x, y: (shoulderCenter.y * 0.18 + hipCenter.y * 0.82) };
    const torsoLength = getDistanceInCm(shoulderCenter, hipCenter) * 1.1;
    const ankleCenter = { x: (ankleL.x + ankleR.x) / 2, y: (ankleL.y + ankleR.y) / 2 };
    const outseam = getDistanceInCm(waistPoint, ankleCenter);
    
    measurementsList.push({ shoulderWidth, sleeveLength, outseam, torsoLength });
  }

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
      isFrontFacing,
    },
    allProcessedImages: allProcessedImages,
  };
};

export const recalculateMeasurements = (points, allProcessedImages, originalMeasurements) => {
  const goodFrontImages = allProcessedImages.filter(p => p.isUsedFor2D);
  if (goodFrontImages.length === 0) {
    return originalMeasurements;
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