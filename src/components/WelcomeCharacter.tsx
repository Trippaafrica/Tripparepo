import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import { Group } from 'three';

function Building({ position, height }: { position: [number, number, number], height: number }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1, height, 1]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
}

function Bicycle({ position }: { position: [number, number, number] }) {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (group.current) {
      // Add subtle movement
      group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={group} position={position}>
      {/* Frame */}
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
        <meshStandardMaterial color="#39FF14" />
      </mesh>
      {/* Wheels */}
      <group position={[-0.5, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.4, 0.05, 8, 24]} />
          <meshStandardMaterial color="#39FF14" />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#39FF14" />
        </mesh>
      </group>
      <group position={[0.5, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.4, 0.05, 8, 24]} />
          <meshStandardMaterial color="#39FF14" />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#39FF14" />
        </mesh>
      </group>
      {/* Rider */}
      <group position={[0, 0.8, 0]}>
        {/* Body */}
        <mesh>
          <capsuleGeometry args={[0.2, 0.4, 8, 8]} />
          <meshStandardMaterial color="#87CEEB" />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        {/* Cap */}
        <mesh position={[0, 0.5, 0]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
          <meshStandardMaterial color="#39FF14" />
        </mesh>
      </group>
    </group>
  );
}

function LocationMarker({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
      <mesh position={position}>
        <cylinderGeometry args={[0.2, 0, 0.5, 8]} />
        <meshStandardMaterial color="#FF4444" />
      </mesh>
    </Float>
  );
}

function Cloud({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.2, 0, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.2, 0, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

export function WelcomeCharacter() {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={group}>
      {/* Background sphere */}
      <mesh position={[0, 0, -5]}>
        <sphereGeometry args={[10, 32, 32]} />
        <meshStandardMaterial color="#8A2BE2" side={2} />
      </mesh>

      {/* Buildings */}
      <Building position={[-3, 2, -2]} height={4} />
      <Building position={[-2, 1.5, -3]} height={3} />
      <Building position={[2, 2, -2]} height={4} />
      <Building position={[3, 1, -3]} height={2} />
      <Building position={[0, 3, -4]} height={6} />

      {/* Clouds */}
      <Cloud position={[-2, 4, -2]} />
      <Cloud position={[2, 3, -1]} />
      <Cloud position={[0, 5, -3]} />

      {/* Location Marker */}
      <LocationMarker position={[0, 4, 0]} />

      {/* Bicycle and Rider */}
      <Bicycle position={[0, 0, 0]} />

      {/* Text */}
      <Text
        position={[0, 2, 2]}
        fontSize={0.5}
        color="#39FF14"
        anchorX="center"
        anchorY="middle"
      >
        Fast City Delivery
      </Text>
    </group>
  );
} 