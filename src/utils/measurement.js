import { Pose, POSE_LANDMARKS } from '@mediapipe/pose';

const MODEL_COMPLEXITY = 1;

const createImageElement = (imageFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageElement = document.createElement('img');
      imageElement.src = e.target.result;
      imageElement.onload = () => resolve(imageElement);
      imageElement.onerror = reject;
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
        return { view: 'front', score: (leftVisibility + rightVisibility) / 2 };
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
    allProcessedImages.push({ ...result, ...classification, originalFile: fileWrapper.originalFile, id: fileWrapper.id });
  }

  const frontImage = allProcessedImages.find(p => p.view === 'front');
  const sideImage = allProcessedImages.find(p => p.view === 'side');

  if (!frontImage) {
    throw new Error('error_no_front_image');
  }

  // Mark which images were used for calculations
  allProcessedImages = allProcessedImages.map(img => ({
      ...img,
      isUsedFor2D: img.id === frontImage.id,
      isUsedFor3D: img.id === sideImage?.id,
  }));

  const { landmarks: frontLm, width: frontW, height: frontH } = frontImage;

  const topPoint = frontLm[POSE_LANDMARKS.NOSE];
  const leftHeel = frontLm[POSE_LANDMARKS.LEFT_HEEL];
  const rightHeel = frontLm[POSE_LANDMARKS.RIGHT_HEEL];
  const bottomY = Math.max(leftHeel.y, rightHeel.y);
  const bodyHeightInPixels = (bottomY - topPoint.y) * frontH;
  const pixelsToCmRatio = userHeightCm / bodyHeightInPixels;

  const getDistance = (p1, p2, w, h) => Math.sqrt(Math.pow((p1.x - p2.x) * w, 2) + Math.pow((p1.y - p2.y) * h, 2));

  const shoulderL = frontLm[POSE_LANDMARKS.LEFT_SHOULDER];
  const shoulderR = frontLm[POSE_LANDMARKS.RIGHT_SHOULDER];
  const hipL = frontLm[POSE_LANDMARKS.LEFT_HIP];
  const hipR = frontLm[POSE_LANDMARKS.RIGHT_HIP];
  const ankleL = frontLm[POSE_LANDMARKS.LEFT_ANKLE];
  const ankleR = frontLm[POSE_LANDMARKS.RIGHT_ANKLE];

  const shoulderWidthCm = getDistance(shoulderL, shoulderR, frontW, frontH) * pixelsToCmRatio;
  const armLengthCm = (getDistance(frontLm[POSE_LANDMARKS.LEFT_SHOULDER], frontLm[POSE_LANDMARKS.LEFT_WRIST], frontW, frontH) + getDistance(frontLm[POSE_LANDMARKS.RIGHT_SHOULDER], frontLm[POSE_LANDMARKS.RIGHT_WRIST], frontW, frontH)) / 2 * pixelsToCmRatio;
  const outseamCm = (getDistance(hipL, ankleL, frontW, frontH) + getDistance(hipR, ankleR, frontW, frontH)) / 2 * pixelsToCmRatio;
  
  const shoulderCenterY = (shoulderL.y + shoulderR.y) / 2;
  const hipCenterY = (hipL.y + hipR.y) / 2;

  const torsoLengthCm = Math.abs(hipCenterY - shoulderCenterY) * frontH * pixelsToCmRatio;
  const bodyRatio = (hipCenterY - topPoint.y) / (bottomY - hipCenterY);

  let chestCircumferenceCm, waistCircumferenceCm, hipCircumferenceCm, chestSectionCm, waistSectionCm, hipSectionCm;
  if (sideImage) {
    const { landmarks: sideLm, width: sideW } = sideImage;
    const estimateCircumference = (width, depth) => Math.PI * (1.5 * (width + depth) - Math.sqrt(width * depth));

    const chestWidth = shoulderWidthCm;
    const chestDepth = Math.abs(sideLm[POSE_LANDMARKS.LEFT_SHOULDER].x - sideLm[POSE_LANDMARKS.RIGHT_SHOULDER].x) * sideW * pixelsToCmRatio;
    chestCircumferenceCm = estimateCircumference(chestWidth, chestDepth);
    chestSectionCm = chestCircumferenceCm / 2;

    const waistWidth = getDistance(hipL, hipR, frontW, frontH) * pixelsToCmRatio;
    const waistDepth = Math.abs(sideLm[POSE_LANDMARKS.LEFT_HIP].x - sideLm[POSE_LANDMARKS.RIGHT_HIP].x) * sideW * pixelsToCmRatio;
    waistCircumferenceCm = estimateCircumference(waistWidth, waistDepth);
    waistSectionCm = waistCircumferenceCm / 2;

    const hipWidth = waistWidth;
    const hipDepth = waistDepth;
    hipCircumferenceCm = estimateCircumference(hipWidth, hipDepth) * 1.05;
    hipSectionCm = hipCircumferenceCm / 2;
  }

  const confidenceShoulder = (shoulderL.visibility + shoulderR.visibility) / 2;
  const confidenceArm = (frontLm[POSE_LANDMARKS.LEFT_WRIST].visibility + frontLm[POSE_LANDMARKS.RIGHT_WRIST].visibility) / 2;
  const confidenceLeg = (ankleL.visibility + ankleR.visibility) / 2;
  const totalConfidence = (confidenceShoulder + confidenceArm + confidenceLeg) / 3;

  pose.close();

  return {
    measurements: {
        shoulderWidth: shoulderWidthCm,
        armLength: armLengthCm,
        outseam: outseamCm,
        torsoLength: torsoLengthCm,
        bodyRatio: bodyRatio,
        chestCircumference: chestCircumferenceCm,
        waistCircumference: waistCircumferenceCm,
        hipCircumference: hipCircumferenceCm,
        chestSection: chestSectionCm,
        waistSection: waistSectionCm,
        hipSection: hipSectionCm,
        confidence: totalConfidence,
        confidenceShoulder,
        confidenceArm,
        confidenceLeg,
    },
    allProcessedImages: allProcessedImages,
  };
};