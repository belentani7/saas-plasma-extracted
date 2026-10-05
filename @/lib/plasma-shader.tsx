import { type PlasmaUniforms } from 'three';

export const plasmaUniforms: PlasmaUniforms = {
  uTime: { value: 0 },
  uResolution: { value: [0, 0] },
  uMouse: { value: [0, 0] },
  uMouseVel: { value: [0, 0] },
  uQuality: { value: 0.5 },
  uOpacity: { value: 0.5 },
  uMilkyIntensity: { value: 0.4 },
  uPlasmaIntensity: { value: 0.6 },
};

export const plasmaVertexShader: string = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const plasmaFragmentShader: string = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform vec2 uMouseVel;
  uniform float uQuality;
  uniform float uOpacity;
  uniform float uMilkyIntensity;
  uniform float uPlasmaIntensity;

  varying vec2 vUv;
  varying vec3 vNormal;

  #define PI 3.14159265359

  void main() {
    float t = uTime;
    vec2 m = uMouse;
    vec2 mv = uMouseVel;
    float q = uQuality;
    float op = uOpacity;
    float mi = uMilkyIntensity;
    float pi = uPlasmaIntensity;

    vec2 uv = vUv * uResolution;

    // Plasma pattern based on distance fields
    float plasma = sin(t + uv.x) * sin(t + uv.y) * sin(t * 0.5 + (uv.x + uv.y) * 0.3);

    // Mouse interaction
    float mouseDist = length(uv - m);
    plasma += sin(mouseDist * 10.0 - t) * 0.1 * (1.0 - q);

    // Quality-based detail
    float detail = step(0.5, q) * 0.5 + step(q, 0.5) * 0.5;
    plasma = mix(plasma, sin(t * 2.0 + uv.x * uv.y) * 0.3, detail);

    // Milky way effect
    float milky = sin(t * 0.3 + uv.x * 0.5) * sin(t * 0.5 + uv.y * 0.3) * mi;

    // Final composition
    vec3 color = vec3(0.0) + plasma * vec3(0.7 * pi) + vec3(0.3) * op;

    gl_FragColor = vec4(color, 1.0);
  }
`;