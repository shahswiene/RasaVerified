'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial, Float, Text } from '@react-three/drei';
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
        <sphereGeometry args={[1.5, 64, 64]} />
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
  const particleCount = 60;
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
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function ScoreLabel({ score, verdict }: { score: number; verdict: string }) {
  const color = getColorFromScore(score);

  return (
    <group position={[0, -2.5, 0]}>
      <Text
        fontSize={0.4}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {score}
      </Text>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.18}
        color="#9ca3af"
        anchorX="center"
        anchorY="middle"
      >
        {verdict}
      </Text>
    </group>
  );
}

export function TrustSphere({ score, verdict }: TrustSphereProps) {
  return (
    <div className="w-full h-[300px] sm:h-[350px]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
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
        <ScoreLabel score={score} verdict={verdict} />

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
  );
}
