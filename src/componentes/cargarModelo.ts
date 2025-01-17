import { FilesetResolver, ObjectDetector } from '@mediapipe/tasks-vision';

export default async function cargarModelo(nivelConfianza: number) {
  const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm');

  return await ObjectDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite`,
      delegate: 'GPU',
    },
    scoreThreshold: nivelConfianza,
    runningMode: 'VIDEO',
  });
}
