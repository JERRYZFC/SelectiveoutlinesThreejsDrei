

import React, { StrictMode, useMemo, useRef, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Stats, Environment, PointerLockControls, useGLTF } from '@react-three/drei'
import { Leva, useControls } from 'leva'
import { Sphere, Vector3 } from 'three'
import { Capsule } from 'three/addons/math/Capsule.js'
import { Octree } from 'three/addons/math/Octree.js'
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js'
import { PivotControls } from '../pivotControls'
import SpatShow from '../SplatShow/SpatShow'

const GRAVITY = 30
const STEPS_PER_FRAME = 5
const BALL_COUNT = 100
const RADIUS = 0.2
const BALLS = [...Array(BALL_COUNT)].map(() => ({
  position: [Math.random() * 50 - 25, 20, Math.random() * 50 - 25]
}))
const V1 = new Vector3()
const V2 = new Vector3()
const V3 = new Vector3()

function useOctree(scene) {
  const octree = useMemo(() => {
    return new Octree().fromGraphNode(scene)
  }, [scene])

  return octree
}

function useOctreeHelper(octree) {
  const { scene } = useThree()
  useEffect(() => {
    const helper = new OctreeHelper(octree, 'hotpink')
    helper.name = 'octreeHelper'
    scene.add(helper)
    return () => {
      scene.remove(helper)
    }
  }, [octree, scene])

  useControls('Octree Helper', {
    visible: {
      value: false,
      onChange: (v) => {
        scene.getObjectByName('octreeHelper').visible = v
        if (document.getElementById('Octree Helper.visible')) document.getElementById('Octree Helper.visible').blur()
      }
    }
  })
}

function useKeyboard() {
  const keyMap = useRef({})

  useEffect(() => {
    const onDocumentKey = (e) => {
      keyMap.current[e.code] = e.type === 'keydown'
    }
    document.addEventListener('keydown', onDocumentKey)
    document.addEventListener('keyup', onDocumentKey)
    return () => {
      document.removeEventListener('keydown', onDocumentKey)
      document.removeEventListener('keyup', onDocumentKey)
    }
  })

  return keyMap.current
}

function Ball({ radius }) {
  return (
    <mesh castShadow>
      <sphereGeometry args={[radius]} />
      <meshStandardMaterial />
    </mesh>
  )
}

function SphereCollider({ id, radius, octree, position, colliders, checkSphereCollisions, children }) {
  const ref = useRef()

  const sphere = useMemo(() => new Sphere(new Vector3(...position), radius), [position, radius])
  const velocity = useMemo(() => new Vector3(), [])

  useEffect(() => {
    colliders[id] = { sphere: sphere, velocity: velocity }
  }, [colliders, id, sphere, velocity])

  function updateSphere(delta, octree, sphere, velocity) {
    sphere.center.addScaledVector(velocity, delta)

    const result = octree.sphereIntersect(sphere)

    if (result) {
      const factor = -result.normal.dot(velocity)
      velocity.addScaledVector(result.normal, factor * 1.5)

      sphere.center.add(result.normal.multiplyScalar(result.depth))
    } else {
      velocity.y -= GRAVITY * delta
    }

    const damping = Math.exp(-1.5 * delta) - 1
    velocity.addScaledVector(velocity, damping)

    checkSphereCollisions(sphere, velocity)

    ref.current.position.copy(sphere.center)
  }

  useFrame((_, delta) => {
    const deltaSteps = Math.min(0.05, delta) / STEPS_PER_FRAME
    for (let i = 0; i < STEPS_PER_FRAME; i++) {
      updateSphere(deltaSteps, octree, sphere, velocity)
    }
  })

  return <group ref={ref}>{children}</group>
}

function Player({ octree, colliders }) {
  const playerOnFloor = useRef(false)
  const playerVelocity = useMemo(() => new Vector3(), [])
  const playerDirection = useMemo(() => new Vector3(), [])
  const capsule = useMemo(() => new Capsule(new Vector3(0, 10, 0), new Vector3(0, 11, 0), 0.5), [])
  const { camera } = useThree()
  let clicked = 0

  const onPointerDown = () => {
    throwBall(camera, capsule, playerDirection, playerVelocity, clicked++)
  }
  useEffect(() => {
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
    }
  })

  useEffect(() => {
    //console.log('adding reference to this capsule collider')
    colliders[BALL_COUNT] = { capsule: capsule, velocity: playerVelocity }
  }, [colliders, capsule, playerVelocity])

  const keyboard = useKeyboard()

  function getForwardVector(camera, playerDirection) {
    camera.getWorldDirection(playerDirection)
    playerDirection.y = 0
    playerDirection.normalize()
    return playerDirection
  }

  function getSideVector(camera, playerDirection) {
    camera.getWorldDirection(playerDirection)
    playerDirection.y = 0
    playerDirection.normalize()
    playerDirection.cross(camera.up)
    return playerDirection
  }

  function controls(camera, delta, playerVelocity, playerOnFloor, playerDirection) {
    const speedDelta = delta * (playerOnFloor ? 25 : 8)
    keyboard['KeyA'] && playerVelocity.add(getSideVector(camera, playerDirection).multiplyScalar(-speedDelta))
    keyboard['KeyD'] && playerVelocity.add(getSideVector(camera, playerDirection).multiplyScalar(speedDelta))
    keyboard['KeyW'] && playerVelocity.add(getForwardVector(camera, playerDirection).multiplyScalar(speedDelta))
    keyboard['KeyS'] && playerVelocity.add(getForwardVector(camera, playerDirection).multiplyScalar(-speedDelta))
    if (playerOnFloor) {
      if (keyboard['Space']) {
        playerVelocity.y = 15
      }
    }
  }

  function updatePlayer(camera, delta, octree, capsule, playerVelocity, playerOnFloor) {
    let damping = Math.exp(-4 * delta) - 1
    if (!playerOnFloor) {
      playerVelocity.y -= GRAVITY * delta
      damping *= 0.1 // small air resistance
    }
    playerVelocity.addScaledVector(playerVelocity, damping)
    const deltaPosition = playerVelocity.clone().multiplyScalar(delta)
    capsule.translate(deltaPosition)
    playerOnFloor = playerCollisions(capsule, octree, playerVelocity)
    camera.position.copy(capsule.end)
    return playerOnFloor
  }

  function throwBall(camera, capsule, playerDirection, playerVelocity, count) {
    const { sphere, velocity } = colliders[count % BALL_COUNT]

    camera.getWorldDirection(playerDirection)

    sphere.center.copy(capsule.end).addScaledVector(playerDirection, capsule.radius * 1.5)

    velocity.copy(playerDirection).multiplyScalar(50)
    velocity.addScaledVector(playerVelocity, 2)
  }

  function playerCollisions(capsule, octree, playerVelocity) {
    const result = octree.capsuleIntersect(capsule)
    let playerOnFloor = false
    if (result) {
      playerOnFloor = result.normal.y > 0
      if (!playerOnFloor) {
        playerVelocity.addScaledVector(result.normal, -result.normal.dot(playerVelocity))
      }
      capsule.translate(result.normal.multiplyScalar(result.depth))
    }
    return playerOnFloor
  }

  function teleportPlayerIfOob(camera, capsule, playerVelocity) {
    if (camera.position.y <= -100) {
      playerVelocity.set(0, 0, 0)
      capsule.start.set(0, 10, 0)
      capsule.end.set(0, 11, 0)
      camera.position.copy(capsule.end)
      camera.rotation.set(0, 0, 0)
    }
  }

  useFrame(({ camera }, delta) => {
    controls(camera, delta, playerVelocity, playerOnFloor.current, playerDirection)
    const deltaSteps = Math.min(0.05, delta) / STEPS_PER_FRAME
    for (let i = 0; i < STEPS_PER_FRAME; i++) {
      playerOnFloor.current = updatePlayer(camera, deltaSteps, octree, capsule, playerVelocity, playerOnFloor.current)
    }
    teleportPlayerIfOob(camera, capsule, playerVelocity)
  })
}

function Game() {
  const { nodes, scene } = useGLTF('/models/scene-transformed.glb')
  const octree = useOctree(scene)
  useOctreeHelper(octree)

  const colliders = useRef([])

  function checkSphereCollisions(sphere, velocity) {
    for (let i = 0, length = colliders.current.length; i < length; i++) {
      const c = colliders.current[i]

      if (c.sphere) {
        const d2 = sphere.center.distanceToSquared(c.sphere.center)
        const r = sphere.radius + c.sphere.radius
        const r2 = r * r

        if (d2 < r2) {
          const normal = V1.subVectors(sphere.center, c.sphere.center).normalize()
          const impact1 = V2.copy(normal).multiplyScalar(normal.dot(velocity))
          const impact2 = V3.copy(normal).multiplyScalar(normal.dot(c.velocity))
          velocity.add(impact2).sub(impact1)
          c.velocity.add(impact1).sub(impact2)
          const d = (r - Math.sqrt(d2)) / 2
          sphere.center.addScaledVector(normal, d)
          c.sphere.center.addScaledVector(normal, -d)
        }
      } else if (c.capsule) {
        const center = V1.addVectors(c.capsule.start, c.capsule.end).multiplyScalar(0.5)
        const r = sphere.radius + c.capsule.radius
        const r2 = r * r
        for (const point of [c.capsule.start, c.capsule.end, center]) {
          const d2 = point.distanceToSquared(sphere.center)
          if (d2 < r2) {
            const normal = V1.subVectors(point, sphere.center).normalize()
            const impact1 = V2.copy(normal).multiplyScalar(normal.dot(c.velocity))
            const impact2 = V3.copy(normal).multiplyScalar(normal.dot(velocity))
            c.velocity.add(impact2).sub(impact1)
            velocity.add(impact1).sub(impact2)
            const d = (r - Math.sqrt(d2)) / 2
            sphere.center.addScaledVector(normal, -d)
          }
        }
      }
    }
  }

  return (
    <>
      <group dispose={null}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Suzanne007.geometry}
          material={nodes.Suzanne007.material}
          position={[1.74, 1.04, 24.97]}
        />
      </group>
      {BALLS.map(({ position }, i) => (
        <SphereCollider
          key={i}
          id={i}
          radius={RADIUS}
          octree={octree}
          position={position}
          colliders={colliders.current}
          checkSphereCollisions={checkSphereCollisions}>
          <Ball radius={RADIUS} />
        </SphereCollider>
      ))}
      <Player octree={octree} colliders={colliders.current} />
    </>
  )
}

function Overlay() {
  return (
    <div id="instructions">
      <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> to move.
      <br />
      Space to jump.
      <br />
      Mouse click to shoot.
    </div>
  )
}

function App() {
  return (
    <>
      <Canvas shadows>
        <directionalLight
          intensity={1}
          castShadow={true}
          shadow-bias={-0.00015}
          shadow-radius={4}
          shadow-blur={10}
          shadow-mapSize={[2048, 2048]}
          position={[85.0, 80.0, 70.0]}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />
        <Environment files="/img/rustig_koppie_puresky_1k.hdr" background />

        <PivotControls  scale={75} depthTest={false} fixed lineWidth={2}>
          {/*rotation={[0, -Math.PI / 2, 0]}  anchor={[1, -1, -1]} */}
          <SpatShow  />
        </PivotControls>

        <Game />

        <PointerLockControls />
        <Stats />
      </Canvas>
      <Overlay />
    </>
  )
}

 export default App;