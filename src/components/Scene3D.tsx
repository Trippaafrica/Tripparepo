import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { WelcomeCharacter } from './WelcomeCharacter';

export function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{
        width: '100%',
        height: '400px',
        background: 'transparent',
      }}
    >
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <WelcomeCharacter />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
} 