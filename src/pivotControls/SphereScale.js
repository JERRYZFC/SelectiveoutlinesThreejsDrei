import * as React from "react"
import * as THREE from "three"
import { useThree } from "@react-three/fiber"
import { context, resolveObject } from "./context"

const vec1 = new THREE.Vector3()
const vec2 = new THREE.Vector3()
const upV = new THREE.Vector3(0, 1, 0)
const scaleMatrix = new THREE.Matrix4()

export const calculateOffset = (clickPoint, normal, rayStart, rayDir) => {
  const e1 = normal.dot(normal)
  const e2 = normal.dot(clickPoint) - normal.dot(rayStart)
  const e3 = normal.dot(rayDir)
  if (e3 === 0) return -e2 / e1
  vec1
    .copy(rayDir)
    .multiplyScalar(e1 / e3)
    .sub(normal)
  vec2
    .copy(rayDir)
    .multiplyScalar(e2 / e3)
    .add(rayStart)
    .sub(clickPoint)
  return -vec1.dot(vec2) / vec1.dot(vec1)
}

export const SphereScale = ({ direction, axis }) => {
  const {
    translation,
    translationLimits,
    depthTest,
    scale,
    lineWidth,
    fixed,
    axisColors,
    hoveredColor,
    opacity,
    onDragStart,
    onDrag,
    onDragEnd,
    userData,
    object
  } = React.useContext(context)

  // @ts-expect-error new in @react-three/fiber@7.0.5
  const camControls = useThree(state => state.controls)
  const objRef = React.useRef(null)
  const clickInfo = React.useRef(null)
  const scale0 = React.useRef(1)
  const [isHovered, setIsHovered] = React.useState(false)

  const [targetOrigin] = React.useState(() => new THREE.Vector3())
  const onPointerDown = React.useCallback(
    e => {
      e.stopPropagation()

      const target = resolveObject(object)
      if (target) targetOrigin.setFromMatrixPosition(target.matrix)
      else targetOrigin.set(0, 0, 0)

      const clickPoint = e.point.clone()
      const rotation = new THREE.Matrix4().extractRotation(
        objRef.current.matrixWorld
      )
      const origin = new THREE.Vector3().setFromMatrixPosition(
        objRef.current.matrixWorld
      )
      const dir = direction
        .clone()
        .applyMatrix4(rotation)
        .normalize()
      clickInfo.current = { clickPoint, dir }
      //scale0.current = translation.current[axis]
      onDragStart({ component: "Scale", axis, origin, directions: [dir] })
      if (camControls) camControls.enabled = false
      // @ts-ignore - setPointerCapture is not in the type definition
      e.target.setPointerCapture(e.pointerId)
    },
    [direction, camControls, onDragStart, translation, axis, object]
  )

  const vScale = new THREE.Vector3()
  const onPointerMove = React.useCallback(
    e => {
      e.stopPropagation()
      if (!isHovered) setIsHovered(true)
      if (clickInfo.current) {
        const { clickPoint, dir } = clickInfo.current
        const [min, max] = translationLimits?.[axis] || [undefined, undefined]
        let offset = calculateOffset(
          clickPoint,
          dir,
          e.ray.origin,
          e.ray.direction
        )
        if (min !== undefined) offset = Math.max(offset, min - scale0.current)
        if (max !== undefined) offset = Math.min(offset, max - scale0.current)

        vScale.setFromMatrixScale(objRef.current.matrix).add({
          x: dir.x * offset,
          y: dir.y * offset,
          z: dir.z * offset
        })

        console.log(targetOrigin)
        scale0.current = scale0.current + offset
        scaleMatrix.makeScale(vScale.x, vScale.y, vScale.z)
        scaleMatrix.setPosition(
          targetOrigin.x - dir.x * offset,
          targetOrigin.y - dir.y * offset,
          targetOrigin.z - dir.z * offset
        )
        onDrag(scaleMatrix)
      }
    },
    [onDrag, isHovered, translation, translationLimits, axis]
  )

  const onPointerUp = React.useCallback(
    e => {
      e.stopPropagation()
      clickInfo.current = null
      onDragEnd()
      if (camControls) camControls.enabled = true
      // @ts-ignore - releasePointerCapture & PointerEvent#pointerId is not in the type definition
      e.target.releasePointerCapture(e.pointerId)
    },
    [camControls, onDragEnd]
  )

  const onPointerOut = React.useCallback(e => {
    e.stopPropagation()
    setIsHovered(false)
  }, [])

  const {
    cylinderLength,
    coneWidth,
    coneLength,
    matrixL
  } = React.useMemo(() => {
    const coneWidth = fixed ? (lineWidth / scale) * 1.6 : scale / 20
    const coneLength = fixed ? 0.2 : scale / 5
    const cylinderLength = fixed ? 1 - coneLength : scale - coneLength
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      upV,
      direction.clone().normalize()
    )
    const matrixL = new THREE.Matrix4().makeRotationFromQuaternion(quaternion)
    return { cylinderLength, coneWidth, coneLength, matrixL }
  }, [direction, scale, lineWidth, fixed])

  const color_ = isHovered ? hoveredColor : axisColors[axis]

  return (
    <group ref={objRef}>
      <group
        matrix={matrixL}
        matrixAutoUpdate={false}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerOut={onPointerOut}
      >
        {/* The invisible mesh being raycast */}
        <mesh
          position={[0, (cylinderLength + coneLength) * 1.15, 0]}
          userData={userData}
        >
          <sphereGeometry args={[coneWidth * 1.4]} />
          <meshBasicMaterial
            transparent
            depthTest={depthTest}
            color={color_}
            opacity={opacity}
            polygonOffset
            polygonOffsetFactor={-10}
          />
        </mesh>
      </group>
    </group>
  )
}
