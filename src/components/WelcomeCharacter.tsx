import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Float, Text } from '@react-three/drei';
import { Group } from 'three';

export function WelcomeCharacter() {
  const group = useRef<Group>(null);
  const { nodes, materials } = useGLTF('/models/delivery_robot.glb');

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
        <primitive object={nodes.Scene} scale={2} />
      </Float>
      <Text
        position={[0, 3, 0]}
        fontSize={0.5}
        color="#39FF14"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        Welcome to Trippa!
      </Text>
    </group>
  );
}

useGLTF.preload('/models/delivery_robot.glb'); 