import { AxesHelper } from 'three'
import * as THREE from 'three'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Select } from '@react-three/postprocessing'
import * as React from 'react'


const Axes = () => {
  const axesHelper = new AxesHelper(0.4)
  axesHelper.setColors(
    new THREE.Color(0xff0000),
    new THREE.Color(0x00ff00),
    new THREE.Color(0x0000ff)
  )

  return <primitive object={axesHelper} />
}


function Box(props) {
  const ref = useRef()
  const [hovered, hover] = useState(null)
  console.log(hovered)
  useFrame((state, delta) => (ref.current.rotation.x = ref.current.rotation.y += delta))
  return (
    <Select enabled={hovered}>
      <mesh ref={ref} {...props} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <boxGeometry />
        <meshStandardMaterial color='orange' />
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
        <cylinderGeometry />
        <meshStandardMaterial color='orange' />
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