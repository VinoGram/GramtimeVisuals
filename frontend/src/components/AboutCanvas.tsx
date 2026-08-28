import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function FlowRibbon({ yOffset = 0, speed = 1, opacity = 0.18, color = "#22c55e" }: {
  yOffset?: number;
  speed?: number;
  opacity?: number;
  color?: string;
}) {
  const mesh = useRef<THREE.Mesh>(null!);
  const W = 60, H = 1;
  const segW = 180, segH = 1;

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(W, H, segW, segH);
    return g;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    const pos = geo.attributes.position.array as Float32Array;
    const count = (segW + 1) * (segH + 1);
    for (let i = 0; i < count; i++) {
      const x = pos[i * 3];
      pos[i * 3 + 1] =
        Math.sin(x * 0.18 + t * 0.9) * 0.9 +
        Math.sin(x * 0.07 + t * 0.5) * 1.4 +
        Math.sin(x * 0.32 + t * 1.3) * 0.4;
      pos[i * 3 + 2] =
        Math.cos(x * 0.12 + t * 0.7) * 0.6;
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <mesh ref={mesh} geometry={geo} position={[0, yOffset, 0]}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function GlowCore() {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    mesh.current.position.x = Math.sin(t * 0.18) * 3;
    mesh.current.position.y = Math.cos(t * 0.12) * 1.2;
    const mat = mesh.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.04 + Math.sin(t * 0.6) * 0.02;
  });

  return (
    <mesh ref={mesh} position={[0, 0, -2]}>
      <planeGeometry args={[14, 8]} />
      <meshBasicMaterial color="#22c55e" transparent opacity={0.05} depthWrite={false} />
    </mesh>
  );
}

export function AboutCanvas() {
  return (
    <Canvas
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      camera={{ position: [0, 0, 12], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
    >
      {/* deep background glow */}
      <GlowCore />

      {/* ribbon stack — each at a different depth, speed, opacity */}
      <FlowRibbon yOffset={2.8}  speed={0.38} opacity={0.07} color="#22c55e" />
      <FlowRibbon yOffset={1.4}  speed={0.52} opacity={0.13} color="#22c55e" />
      <FlowRibbon yOffset={0}    speed={0.65} opacity={0.20} color="#4ade80" />
      <FlowRibbon yOffset={-1.4} speed={0.48} opacity={0.13} color="#22c55e" />
      <FlowRibbon yOffset={-2.8} speed={0.35} opacity={0.07} color="#15803d" />
    </Canvas>
  );
}
