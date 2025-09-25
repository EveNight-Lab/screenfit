import { Pose, POSE_LANDMARKS } from '@mediapipe/pose';

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
          if (width > height) {
            height = Math.round(height * (MAX_IMAGE_SIZE / width));
            width = MAX_IMAGE_SIZE;
          } else {
            width = Math.round(width * (MAX_IMAGE_SIZE / height));
            height = MAX_IMAGE_SIZE;
          }
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
    const classification = classifyPose(result.landmarks);
    allProcessedImages.push({ 
      ...result, 
      ...classification, 
      originalFile: fileWrapper.originalFile, // 원본 파일 객체 유지
      resizedImageSrc: imageElement.src,      // 리사이징된 이미지 데이터 URL 추가
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

  // 어깨너비는 가장 정확한 사진 한 장으로만 측정하여 각도로 인한 오차를 최소화
  const { landmarks: frontLmForShoulder, width: frontW, height: frontH } = frontImage;
  const topPointForShoulder = frontLmForShoulder[POSE_LANDMARKS.NOSE];
  const bottomYForShoulder = Math.max(frontLmForShoulder[POSE_LANDMARKS.LEFT_HEEL].y, frontLmForShoulder[POSE_LANDMARKS.RIGHT_HEEL].y);
  const bodyHeightInPixelsForShoulder = (bottomYForShoulder - topPointForShoulder.y) * frontH;
  const pixelsToCmRatioForShoulder = userHeightCm / bodyHeightInPixelsForShoulder;
  const getDistanceInCmForShoulder = (p1, p2) => Math.sqrt(Math.pow((p1.x - p2.x) * frontW, 2) + Math.pow((p1.y - p2.y) * frontH, 2)) * pixelsToCmRatioForShoulder;
  
  const shoulderLForShoulder = frontLmForShoulder[POSE_LANDMARKS.LEFT_SHOULDER];
  const shoulderRForShoulder = frontLmForShoulder[POSE_LANDMARKS.RIGHT_SHOULDER];
  const shoulderWidth = getDistanceInCmForShoulder(shoulderLForShoulder, shoulderRForShoulder) * 1.08;


  // 어깨너비를 제외한 나머지 값들은 여러 사진을 평균내어 안정성 확보
  const measurementsList = [];
  for (const image of goodFrontImages) {
    const { landmarks: lm, width: w, height: h } = image;

    const topPoint = lm[POSE_LANDMARKS.NOSE];
    const bottomY = Math.max(lm[POSE_LANDMARKS.LEFT_HEEL].y, lm[POSE_LANDMARKS.RIGHT_HEEL].y);
    const bodyHeightInPixels = (bottomY - topPoint.y) * h;
    const pixelsToCmRatio = userHeightCm / bodyHeightInPixels;

    const getDistanceInCm = (p1, p2) => Math.sqrt(Math.pow((p1.x - p2.x) * w, 2) + Math.pow((p1.y - p2.y) * h, 2)) * pixelsToCmRatio;

    const shoulderL = lm[POSE_LANDMARKS.LEFT_SHOULDER];
    const shoulderR = lm[POSE_LANDMARKS.RIGHT_SHOULDER];
    const ankleL = lm[POSE_LANDMARKS.LEFT_ANKLE];
    const ankleR = lm[POSE_LANDMARKS.RIGHT_ANKLE];
    const armLengthL = getDistanceInCm(lm[POSE_LANDMARKS.LEFT_SHOULDER], lm[POSE_LANDMARKS.LEFT_ELBOW]) + getDistanceInCm(lm[POSE_LANDMARKS.LEFT_ELBOW], lm[POSE_LANDMARKS.LEFT_WRIST]);
    const armLengthR = getDistanceInCm(lm[POSE_LANDMARKS.RIGHT_SHOULDER], lm[POSE_LANDMARKS.RIGHT_ELBOW]) + getDistanceInCm(lm[POSE_LANDMARKS.RIGHT_ELBOW], lm[POSE_LANDMARKS.RIGHT_WRIST]);
    const sleeveLength = (armLengthL + armLengthR) / 2;

    const shoulderCenterY = (shoulderL.y + shoulderR.y) / 2;
    const kneeL = lm[POSE_LANDMARKS.LEFT_KNEE];
    const kneeR = lm[POSE_LANDMARKS.RIGHT_KNEE];
    const kneeCenterY = (kneeL.y + kneeR.y) / 2;
    const correctedHipCenterY = (shoulderCenterY + kneeCenterY) / 2;

    const torsoTopY = (topPoint.y + shoulderCenterY) / 2;
    const torsoLength = Math.abs(correctedHipCenterY - torsoTopY) * h * pixelsToCmRatio;
    const outseam = Math.abs((ankleL.y + ankleR.y) / 2 - correctedHipCenterY) * h * pixelsToCmRatio;

    measurementsList.push({ sleeveLength, outseam, torsoLength });
  }

  const avgMeasurements = measurementsList.reduce((acc, curr) => {
    Object.keys(curr).forEach(key => acc[key] = (acc[key] || 0) + curr[key]);
    return acc;
  }, {});

  Object.keys(avgMeasurements).forEach(key => avgMeasurements[key] /= measurementsList.length);

  const { landmarks: frontLm } = frontImage;
  const shoulderL = frontLm[POSE_LANDMARKS.LEFT_SHOULDER];
  const shoulderR = frontLm[POSE_LANDMARKS.RIGHT_SHOULDER];
  const hipL = frontLm[POSE_LANDMARKS.LEFT_HIP];
  const hipR = frontLm[POSE_LANDMARKS.RIGHT_HIP];
  const topPoint = frontLm[POSE_LANDMARKS.NOSE];
  const bottomY = Math.max(frontLm[POSE_LANDMARKS.LEFT_HEEL].y, frontLm[POSE_LANDMARKS.RIGHT_HEEL].y);
  const hipCenterY = (hipL.y + hipR.y) / 2;
  const bodyRatio = (hipCenterY - topPoint.y) / (bottomY - hipCenterY);

  const confidenceShoulder = (shoulderL.visibility + shoulderR.visibility) / 2;
  const confidenceArm = (frontLm[POSE_LANDMARKS.LEFT_WRIST].visibility + frontLm[POSE_LANDMARKS.RIGHT_WRIST].visibility) / 2;
  const confidenceLeg = (frontLm[POSE_LANDMARKS.LEFT_ANKLE].visibility + frontLm[POSE_LANDMARKS.RIGHT_ANKLE].visibility) / 2;
  const totalConfidence = (confidenceShoulder + confidenceArm + confidenceLeg) / 3;

  pose.close();

  return {
    measurements: {
        ...avgMeasurements,
        shoulderWidth,
        bodyRatio: bodyRatio,
        confidence: totalConfidence,
        confidenceShoulder,
        confidenceArm,
        confidenceLeg,
    },
    allProcessedImages: allProcessedImages,
  };
};