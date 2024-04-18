import * as React from 'react';
import { Canvas, useFrame } from '@react-three/fiber'
import Controls from './Controls';
import InstancedPoints from './InstancedPoints';
import { EffectComposer, Outline, Select, Selection } from '@react-three/postprocessing'
import * as THREE from 'three'
import { OrbitControls } from '@react-three/drei'
import { useRef, useState } from 'react'



const ThreePointVis = ({ data, layout, selectedPoint, onSelectPoint }) => {
  return (
    <Canvas style={{ background: "hotpink" }} camera={{ position: [0, 0, 80], far: 15000 }}>
      <Controls />
      <ambientLight intensity={0.5} />
      <hemisphereLight
        color="#ffffff"
        skyColor="#ffffbb"
        groundColor="#080820"
        intensity={1.0}
      />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <Selection>
        <EffectComposer multisampling={8} autoClear={false}>
          <Outline blur visibleEdgeColor="white" edgeStrength={100} width={1000} />
        </EffectComposer>

        <Box position={[0, 0, 0]} />

        <Zcylinder position={[5, 0, 0]} rotation={[Math.PI * 0.5, 0, 0]}>
          <cylinderBufferGeometry attach="geometry" args={[0.5, 0.5, 0.15, 32]} />
          <meshStandardMaterial attach="material" color="#fff" />
        </Zcylinder>

        <Zcylinder position={[5, 0, 5]} rotation={[Math.PI * 0.5, 0, 0]}>
          <cylinderBufferGeometry attach="geometry" args={[0.5, 0.5, 0.15, 32]} />
          <meshStandardMaterial attach="material" color="#fff" />
        </Zcylinder>

        <Zprimitive object={new THREE.Mesh(new THREE.BoxGeometry(1, 1, 10), new THREE.MeshStandardMaterial({ color: 'orange' }))} position={[-2, 0, 0]} />

        <ZMesh position={[2, 2, 0]}>
          <boxGeometry attach="geometry" args={[2, 1, 5]} />
          <meshStandardMaterial color="#ff0" />
        </ZMesh>

      </Selection>
      <OrbitControls />


      <InstancedPoints
        data={data}
        layout={layout}
        selectedPoint={selectedPoint}
        onSelectPoint={onSelectPoint}
      />
    </Canvas>
  );
};



function Box(props) {
  const ref = useRef()
  const [hovered, hover] = useState(null)
  console.log(hovered)
  useFrame((state, delta) => (ref.current.rotation.x = ref.current.rotation.y += delta))
  return (
    <Select enabled={hovered}>
      <mesh ref={ref} {...props} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <boxGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>
    </Select>
  )
}

function ZMesh(props) {
  const ref = useRef()
  const [hovered, hover] = useState(null)
  console.log(hovered)
  useFrame((state, delta) => (ref.current.rotation.x = ref.current.rotation.y += delta))
  return (
    <Select enabled={hovered}>
      <mesh ref={ref} {...props} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <boxGeometry />
      </mesh>
    </Select>
  )
}
function Zcylinder(props) {
  const ref = useRef()
  const [hovered, hover] = useState(null)
  console.log(hovered)
  useFrame((state, delta) => (ref.current.rotation.x = ref.current.rotation.y += delta))
  return (
    <Select enabled={hovered}>
      <mesh ref={ref} {...props} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <cylinderBufferGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>
    </Select>
  )
}

function Zprimitive(props) {
  const ref = useRef()
  const [hovered, hover] = useState(null)
  console.log(hovered)
  useFrame((state, delta) => (ref.current.rotation.x = ref.current.rotation.y += delta))
  return (
    <Select enabled={hovered}>
      <primitive ref={ref} {...props} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
      </primitive>
    </Select>
  )
}


export default ThreePointVis;
