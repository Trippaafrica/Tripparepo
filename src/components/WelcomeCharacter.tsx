import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Line } from '@react-three/drei';
import { Group, Vector3 } from 'three';

export function WelcomeCharacter() {
  const group = useRef<Group>(null);
  
  // Create route points
  const routePoints = useMemo(() => {
    const points = [];
    for (let i = 0; i < 50; i++) {
      const t = i / 50;
      points.push(
        new Vector3(
          Math.sin(t * Math.PI * 4) * 2,
          Math.cos(t * Math.PI * 2) * 0.5,
          Math.cos(t * Math.PI * 4) * 2
        )
      );
    }
    return points;
  }, []);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <group ref={group} dispose={null}>
      <Float
        speed={1}
        rotationIntensity={0.2}
        floatIntensity={0.5}
      >
        {/* Dark map background */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        {/* Animated route line */}
        <Line
          points={routePoints}
          color="#39FF14"
          lineWidth={2}
          transparent
          opacity={0.8}
        />

        {/* Route points */}
        {routePoints.map((point, index) => (
          <mesh key={index} position={point}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#9d4edd" />
          </mesh>
        ))}

        {/* Floating text */}
        <Text
          position={[0, 2, 0]}
          fontSize={0.5}
          color="#39FF14"
          anchorX="center"
          anchorY="middle"
        >
          Fast & Reliable Delivery
        </Text>
      </Float>
    </group>
  );
} 