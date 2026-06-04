import { POSE_LANDMARKS } from '@mediapipe/pose';

const createFullLandmarks = (overrides) => {
  const landmarks = [];
  for (let i = 0; i < 33; i++) {
    landmarks.push({ x: 0.5, y: 0.5, z: 0, visibility: 0.95 });
  }
  Object.keys(overrides).forEach(idx => {
    landmarks[parseInt(idx)] = {
      ...landmarks[parseInt(idx)],
      ...overrides[idx]
    };
  });
  return landmarks;
};

export const sampleModelData = {
  sample_model: {
    label: 'sample_male_front',
    height: 176,
    isFrontFacing: true,
    measurements: {
      shoulderWidth: 44.5,
      sleeveLength: 60.5,
      torsoLength: 70.5,
      outseam: 92.8,
      chestCircumference: 98.2,
      waistCircumference: 81.5,
      hipCircumference: 96.0,
      confidence: 0.98,
      confidenceShoulder: 0.99,
      confidenceArm: 0.97,
      confidenceLeg: 0.98,
      isFrontFacing: true
    },
    landmarks: createFullLandmarks({
      [POSE_LANDMARKS.NOSE]: { x: 0.495, y: 0.29 },
      [POSE_LANDMARKS.LEFT_SHOULDER]: { x: 0.555, y: 0.335 },
      [POSE_LANDMARKS.RIGHT_SHOULDER]: { x: 0.435, y: 0.335 },
      [POSE_LANDMARKS.LEFT_ELBOW]: { x: 0.575, y: 0.44 },
      [POSE_LANDMARKS.RIGHT_ELBOW]: { x: 0.41, y: 0.44 },
      [POSE_LANDMARKS.LEFT_WRIST]: { x: 0.56, y: 0.55 },
      [POSE_LANDMARKS.RIGHT_WRIST]: { x: 0.43, y: 0.55 },
      [POSE_LANDMARKS.LEFT_HIP]: { x: 0.535, y: 0.53 },
      [POSE_LANDMARKS.RIGHT_HIP]: { x: 0.45, y: 0.53 },
      [POSE_LANDMARKS.LEFT_KNEE]: { x: 0.555, y: 0.70 },
      [POSE_LANDMARKS.RIGHT_KNEE]: { x: 0.435, y: 0.69 },
      [POSE_LANDMARKS.LEFT_ANKLE]: { x: 0.565, y: 0.86 },
      [POSE_LANDMARKS.RIGHT_ANKLE]: { x: 0.425, y: 0.85 },
      [POSE_LANDMARKS.LEFT_HEEL]: { x: 0.565, y: 0.87 },
      [POSE_LANDMARKS.RIGHT_HEEL]: { x: 0.425, y: 0.87 }
    })
  },
  sample_model_female: {
    label: 'sample_female_front',
    height: 165,
    isFrontFacing: true,
    measurements: {
      shoulderWidth: 38.2,
      sleeveLength: 56.4,
      torsoLength: 64.2,
      outseam: 86.8,
      chestCircumference: 88.5,
      waistCircumference: 67.2,
      hipCircumference: 91.5,
      confidence: 0.99,
      confidenceShoulder: 0.99,
      confidenceArm: 0.99,
      confidenceLeg: 0.98,
      isFrontFacing: true
    },
    landmarks: createFullLandmarks({
      [POSE_LANDMARKS.NOSE]: { x: 0.50, y: 0.295 },
      [POSE_LANDMARKS.LEFT_SHOULDER]: { x: 0.54, y: 0.33 },
      [POSE_LANDMARKS.RIGHT_SHOULDER]: { x: 0.445, y: 0.33 },
      [POSE_LANDMARKS.LEFT_ELBOW]: { x: 0.55, y: 0.43 },
      [POSE_LANDMARKS.RIGHT_ELBOW]: { x: 0.43, y: 0.43 },
      [POSE_LANDMARKS.LEFT_WRIST]: { x: 0.55, y: 0.53 },
      [POSE_LANDMARKS.RIGHT_WRIST]: { x: 0.44, y: 0.53 },
      [POSE_LANDMARKS.LEFT_HIP]: { x: 0.52, y: 0.51 },
      [POSE_LANDMARKS.RIGHT_HIP]: { x: 0.46, y: 0.51 },
      [POSE_LANDMARKS.LEFT_KNEE]: { x: 0.535, y: 0.69 },
      [POSE_LANDMARKS.RIGHT_KNEE]: { x: 0.45, y: 0.69 },
      [POSE_LANDMARKS.LEFT_ANKLE]: { x: 0.555, y: 0.85 },
      [POSE_LANDMARKS.RIGHT_ANKLE]: { x: 0.445, y: 0.85 },
      [POSE_LANDMARKS.LEFT_HEEL]: { x: 0.555, y: 0.87 },
      [POSE_LANDMARKS.RIGHT_HEEL]: { x: 0.445, y: 0.87 }
    })
  },
  sample_model_rotated: {
    label: 'sample_male_yaw',
    height: 178,
    isFrontFacing: false,
    measurements: {
      shoulderWidth: 41.5,
      sleeveLength: 61.2,
      torsoLength: 71.8,
      outseam: 94.2,
      chestCircumference: 99.4,
      waistCircumference: 82.8,
      hipCircumference: 97.2,
      confidence: 0.97,
      confidenceShoulder: 0.98,
      confidenceArm: 0.96,
      confidenceLeg: 0.97,
      isFrontFacing: false
    },
    landmarks: createFullLandmarks({
      [POSE_LANDMARKS.NOSE]: { x: 0.48, y: 0.16 },
      [POSE_LANDMARKS.LEFT_SHOULDER]: { x: 0.41, y: 0.25 },
      [POSE_LANDMARKS.RIGHT_SHOULDER]: { x: 0.53, y: 0.24 },
      [POSE_LANDMARKS.LEFT_ELBOW]: { x: 0.39, y: 0.39 },
      [POSE_LANDMARKS.RIGHT_ELBOW]: { x: 0.57, y: 0.39 },
      [POSE_LANDMARKS.LEFT_WRIST]: { x: 0.38, y: 0.54 },
      [POSE_LANDMARKS.RIGHT_WRIST]: { x: 0.59, y: 0.53 },
      [POSE_LANDMARKS.LEFT_HIP]: { x: 0.42, y: 0.51 },
      [POSE_LANDMARKS.RIGHT_HIP]: { x: 0.52, y: 0.51 },
      [POSE_LANDMARKS.LEFT_KNEE]: { x: 0.43, y: 0.70 },
      [POSE_LANDMARKS.RIGHT_KNEE]: { x: 0.52, y: 0.70 },
      [POSE_LANDMARKS.LEFT_ANKLE]: { x: 0.44, y: 0.89 },
      [POSE_LANDMARKS.RIGHT_ANKLE]: { x: 0.52, y: 0.88 },
      [POSE_LANDMARKS.LEFT_HEEL]: { x: 0.44, y: 0.90 },
      [POSE_LANDMARKS.RIGHT_HEEL]: { x: 0.52, y: 0.90 }
    })
  },
  sample_model_high_angle: {
    label: 'sample_female_pitch',
    height: 168,
    isFrontFacing: false,
    measurements: {
      shoulderWidth: 38.8,
      sleeveLength: 54.8,
      torsoLength: 62.5,
      outseam: 85.2,
      chestCircumference: 89.2,
      waistCircumference: 68.0,
      hipCircumference: 92.4,
      confidence: 0.96,
      confidenceShoulder: 0.97,
      confidenceArm: 0.95,
      confidenceLeg: 0.96,
      isFrontFacing: false
    },
    landmarks: createFullLandmarks({
      [POSE_LANDMARKS.NOSE]: { x: 0.50, y: 0.20 },
      [POSE_LANDMARKS.LEFT_SHOULDER]: { x: 0.42, y: 0.30 },
      [POSE_LANDMARKS.RIGHT_SHOULDER]: { x: 0.58, y: 0.30 },
      [POSE_LANDMARKS.LEFT_ELBOW]: { x: 0.39, y: 0.44 },
      [POSE_LANDMARKS.RIGHT_ELBOW]: { x: 0.61, y: 0.44 },
      [POSE_LANDMARKS.LEFT_WRIST]: { x: 0.38, y: 0.57 },
      [POSE_LANDMARKS.RIGHT_WRIST]: { x: 0.62, y: 0.57 },
      [POSE_LANDMARKS.LEFT_HIP]: { x: 0.44, y: 0.59 },
      [POSE_LANDMARKS.RIGHT_HIP]: { x: 0.56, y: 0.59 },
      [POSE_LANDMARKS.LEFT_KNEE]: { x: 0.45, y: 0.75 },
      [POSE_LANDMARKS.RIGHT_KNEE]: { x: 0.55, y: 0.75 },
      [POSE_LANDMARKS.LEFT_ANKLE]: { x: 0.45, y: 0.88 },
      [POSE_LANDMARKS.RIGHT_ANKLE]: { x: 0.55, y: 0.88 },
      [POSE_LANDMARKS.LEFT_HEEL]: { x: 0.45, y: 0.90 },
      [POSE_LANDMARKS.RIGHT_HEEL]: { x: 0.55, y: 0.90 }
    })
  },
  sample_character: {
    label: 'sample_character',
    height: 182,
    isFrontFacing: true,
    measurements: {
      shoulderWidth: 48.0,
      sleeveLength: 63.5,
      torsoLength: 74.0,
      outseam: 105.0,
      chestCircumference: 102.5,
      waistCircumference: 76.0,
      hipCircumference: 94.0,
      confidence: 0.98,
      confidenceShoulder: 0.99,
      confidenceArm: 0.97,
      confidenceLeg: 0.98,
      isFrontFacing: true
    },
    landmarks: createFullLandmarks({
      [POSE_LANDMARKS.NOSE]: { x: 0.495, y: 0.285 },
      [POSE_LANDMARKS.LEFT_SHOULDER]: { x: 0.545, y: 0.32 },
      [POSE_LANDMARKS.RIGHT_SHOULDER]: { x: 0.445, y: 0.32 },
      [POSE_LANDMARKS.LEFT_ELBOW]: { x: 0.58, y: 0.38 },
      [POSE_LANDMARKS.RIGHT_ELBOW]: { x: 0.42, y: 0.38 },
      [POSE_LANDMARKS.LEFT_WRIST]: { x: 0.55, y: 0.44 },
      [POSE_LANDMARKS.RIGHT_WRIST]: { x: 0.41, y: 0.44 },
      [POSE_LANDMARKS.LEFT_HIP]: { x: 0.53, y: 0.47 },
      [POSE_LANDMARKS.RIGHT_HIP]: { x: 0.46, y: 0.47 },
      [POSE_LANDMARKS.LEFT_KNEE]: { x: 0.565, y: 0.63 },
      [POSE_LANDMARKS.RIGHT_KNEE]: { x: 0.42, y: 0.63 },
      [POSE_LANDMARKS.LEFT_ANKLE]: { x: 0.595, y: 0.79 },
      [POSE_LANDMARKS.RIGHT_ANKLE]: { x: 0.38, y: 0.79 },
      [POSE_LANDMARKS.LEFT_HEEL]: { x: 0.595, y: 0.81 },
      [POSE_LANDMARKS.RIGHT_HEEL]: { x: 0.38, y: 0.81 }
    })
  },
  sample_celebrity: {
    label: 'sample_celebrity',
    height: 180,
    isFrontFacing: true,
    measurements: {
      shoulderWidth: 45.2,
      sleeveLength: 61.5,
      torsoLength: 71.2,
      outseam: 98.5,
      chestCircumference: 96.8,
      waistCircumference: 78.2,
      hipCircumference: 94.5,
      confidence: 0.97,
      confidenceShoulder: 0.98,
      confidenceArm: 0.96,
      confidenceLeg: 0.97,
      isFrontFacing: true
    },
    landmarks: createFullLandmarks({
      [POSE_LANDMARKS.NOSE]: { x: 0.495, y: 0.285 },
      [POSE_LANDMARKS.LEFT_SHOULDER]: { x: 0.545, y: 0.335 },
      [POSE_LANDMARKS.RIGHT_SHOULDER]: { x: 0.445, y: 0.335 },
      [POSE_LANDMARKS.LEFT_ELBOW]: { x: 0.56, y: 0.43 },
      [POSE_LANDMARKS.RIGHT_ELBOW]: { x: 0.425, y: 0.43 },
      [POSE_LANDMARKS.LEFT_WRIST]: { x: 0.54, y: 0.54 },
      [POSE_LANDMARKS.RIGHT_WRIST]: { x: 0.43, y: 0.54 },
      [POSE_LANDMARKS.LEFT_HIP]: { x: 0.53, y: 0.50 },
      [POSE_LANDMARKS.RIGHT_HIP]: { x: 0.46, y: 0.50 },
      [POSE_LANDMARKS.LEFT_KNEE]: { x: 0.55, y: 0.69 },
      [POSE_LANDMARKS.RIGHT_KNEE]: { x: 0.445, y: 0.69 },
      [POSE_LANDMARKS.LEFT_ANKLE]: { x: 0.57, y: 0.88 },
      [POSE_LANDMARKS.RIGHT_ANKLE]: { x: 0.43, y: 0.88 },
      [POSE_LANDMARKS.LEFT_HEEL]: { x: 0.57, y: 0.90 },
      [POSE_LANDMARKS.RIGHT_HEEL]: { x: 0.43, y: 0.90 }
    })
  }
};
