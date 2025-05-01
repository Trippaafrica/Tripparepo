import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Box } from '@react-three/drei';
import { Group } from 'three';

export function WelcomeCharacter() {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={group} dispose={null}>
      <Float
        speed={1.5}
        rotationIntensity={0.2}
        floatIntensity={0.5}
      >
        <Box args={[1, 1, 1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#39FF14" />
        </Box>
      </Float>
      <Text
        position={[0, 2, 0]}
        fontSize={0.5}
        color="#39FF14"
        anchorX="center"
        anchorY="middle"
      >
        Welcome to Trippa!
      </Text>
    </group>
  );
} 