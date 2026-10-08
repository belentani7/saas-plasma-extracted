import * as THREE from "three";

export const plasmaUniforms = {
  uTime: { value: 0 },
  uResolution: { value: new THREE.Vector2() },
  uMouse: { value: new THREE.Vector2(0, 0) },
  uMouseVel: { value: new THREE.Vector2(0, 0) },
  uQuality: { value: 1 },
  uOpacity: { value: 0.55 },
  uMilkyIntensity: { value: 0.4 },
  uPlasmaIntensity: { value: 0.6 },
};

export const plasmaVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const plasmaFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform vec2 uMouseVel;
  uniform float uQuality;
  uniform float uOpacity;
  uniform float uMilkyIntensity;
  uniform float uPlasmaIntensity;

  varying vec2 vUv;

  #define PI 3.14159265359

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 6; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= uResolution.x / uResolution.y;

    float t = uTime * 0.8 * uQuality;

    float center = length(uv);
    float rad = 0.4 + 0.15 * sin(t * 0.5);

    float plasma = fbm(uv * 3.0 + vec2(t * 0.15, t * 0.1));

    float mouseForce = smoothstep(0.1, 0.0, length(uMouse - uv));
    plasma += mouseForce * 0.5 * uPlasmaIntensity;

    float color = 0.5 + 0.5 * sin(
      t +
      center * 10.0 +
      plasma * 5.0 +
      dot(uv, vec2(3.0, 2.0))
    );

    vec3 plasmaColor = vec3(
      0.5 + 0.5 * sin(color * PI + t * 0.2),
      0.5 + 0.5 * sin(color * PI + PI / 3.0 + t * 0.2),
      0.5 + 0.5 * sin(color * PI + PI / 1.5 + t * 0.2)
    );

    float milky = fbm(uv * 2.0 + vec2(t * 0.05, 0.0)) * 0.3 * uMilkyIntensity;

    gl_FragColor = vec4(plasmaColor + milky, uOpacity);
  }
`;