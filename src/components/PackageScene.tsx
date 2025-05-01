import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { Group } from 'three';

function Package({ position, color, size = 1 }: { position: [number, number, number]; color: string; size?: number }) {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <group ref={group} position={position}>
        {/* Main box */}
        <mesh scale={size}>
          <boxGeometry />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Tape lines */}
        <mesh position={[0, 0, size * 0.501]} scale={[size * 0.8, size * 0.1, 0.01]}>
          <boxGeometry />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, -size * 0.501]} scale={[size * 0.8, size * 0.1, 0.01]}>
          <boxGeometry />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    </Float>
  );
}

export function PackageScene() {
  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 45 }}
      style={{
        width: '100%',
        height: '100%',
        background: 'transparent',
      }}
    >
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />

      {/* Packages with different colors and sizes */}
      <Package position={[-2, 0, 0]} color="#39FF14" size={1.2} />
      <Package position={[0, 0, 0]} color="#9d4edd" size={0.8} />
      <Package position={[2, 0, 0]} color="#00bfff" size={1} />
      <Package position={[-1, 1.5, 0]} color="#ff4444" size={0.9} />
      <Package position={[1, 1.5, 0]} color="#ffaa00" size={1.1} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
} 