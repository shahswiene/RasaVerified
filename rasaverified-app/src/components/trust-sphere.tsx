'use client';

import { useRef, useMemo, useState, Component, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

interface TrustSphereProps {
  score: number;
  verdict: string;
}

function getColorFromScore(score: number): string {
  if (score >= 75) return '#10b981';
  if (score >= 45) return '#f59e0b';
  return '#ef4444';
}

function getEmissiveFromScore(score: number): string {
  if (score >= 75) return '#059669';
  if (score >= 45) return '#d97706';
  return '#dc2626';
}

function getTailwindColor(score: number): string {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 45) return 'text-amber-400';
  return 'text-red-400';
}

function getTailwindBorder(score: number): string {
  if (score >= 75) return 'border-emerald-500/40';
  if (score >= 45) return 'border-amber-500/40';
  return 'border-red-500/40';
}

function getTailwindShadow(score: number): string {
  if (score >= 75) return 'shadow-emerald-500/30';
  if (score >= 45) return 'shadow-amber-500/30';
  return 'shadow-red-500/30';
}

// --- CSS-only fallback when WebGL is unavailable ---
function CSSFallbackSphere({ score, verdict }: TrustSphereProps) {
  return (
    <div className="w-full h-[300px] sm:h-[350px] flex flex-col items-center justify-center gap-4">
      <div
        className={`relative w-36 h-36 rounded-full border-4 ${getTailwindBorder(score)} shadow-lg ${getTailwindShadow(score)} flex items-center justify-center animate-pulse`}
      >
        <div
          className={`w-28 h-28 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border ${getTailwindBorder(score)}`}
        >
          <span className={`text-4xl font-bold ${getTailwindColor(score)}`}>{score}</span>
        </div>
      </div>
      <span className={`text-sm font-medium ${getTailwindColor(score)}`}>{verdict}</span>
    </div>
  );
}

// --- Error boundary to catch WebGL crashes ---
interface ErrorBoundaryProps { fallback: ReactNode; children: ReactNode }
interface ErrorBoundaryState { hasError: boolean }

class WebGLErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[trust-sphere] WebGL error, falling back to CSS:', error.message);
    }
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// --- Three.js scene components ---

function SphereCore({ score }: { score: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = getColorFromScore(score);
  const emissive = getEmissiveFromScore(score);
  const distort = useMemo(() => {
    if (score >= 75) return 0.15;
    if (score >= 45) return 0.3;
    return 0.5;
  }, [score]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.8}
          distort={distort}
          speed={2}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

// Deterministic pseudo-random based on index to avoid impure Math.random in render
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function ParticleRing({ score }: { score: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const particleCount = 30;
  const color = getColorFromScore(score);

  const positions = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 2.2 + seededRandom(i) * 0.3;
      const y = (seededRandom(i + 100) - 0.5) * 0.5;
      pts.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
    }
    return pts;
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// --- Detect WebGL support ---
function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function TrustSphere({ score, verdict }: TrustSphereProps) {
  const [webglOk, setWebglOk] = useState(() => supportsWebGL());

  const fallback = <CSSFallbackSphere score={score} verdict={verdict} />;

  if (!webglOk) return fallback;

  return (
    <WebGLErrorBoundary fallback={fallback}>
      <div className="w-full h-[300px] sm:h-[350px]">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          style={{ background: 'transparent' }}
          onCreated={({ gl }) => {
            const canvas = gl.domElement;
            canvas.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              if (process.env.NODE_ENV === 'development') {
                console.warn('[trust-sphere] WebGL context lost');
              }
              setWebglOk(false);
            });
          }}
        >
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
          <pointLight
            position={[-3, -3, 2]}
            intensity={0.5}
            color={getColorFromScore(score)}
          />

          <SphereCore score={score} />
          <ParticleRing score={score} />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 3}
          />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}
