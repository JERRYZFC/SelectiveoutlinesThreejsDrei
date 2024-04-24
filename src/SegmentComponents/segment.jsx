import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useDrag } from '@use-gesture/react'

// const NB = 100;

// Temp object for color setting and position settings
const tempColor = new THREE.Color()
const tempObject = new THREE.Object3D()
const tempMatrix = new THREE.Matrix4()
const tempQuaternion = new THREE.Quaternion()
const tempScale = new THREE.Vector3()
const tempPos = new THREE.Vector3()

// Define segment and arrow props
const lineWidth = 0.2
const arrowHeight = 0.3
const arrowWidth = 0.4

// Define line geometry
const lineBaseSeg = new THREE.Shape()
lineBaseSeg.moveTo(0, 0.5)
lineBaseSeg.lineTo(1, 0.5)
lineBaseSeg.lineTo(1, -0.5)
lineBaseSeg.lineTo(0, -0.5)
lineBaseSeg.lineTo(0, 0.5)

export function Segments({ NB, setIsDragging, floorPlane }) {
  // Define ref to update the triangles and the lines
  const triangleEndMeshRef = useRef()
  const triangleStartMeshRef = useRef()
  const lineMeshRef = useRef()
  // const vertices = useMemo(() => {
  //   const triangleVertices = [new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.1, 0, 0)]

  //   return Float32Array.from(new Array(triangleVertices.length).fill('').flatMap((item, index) => triangleVertices[index].toArray()))
  // }, [])

  // Compute the triangle vertices
  const vertices = useMemo(() => {
    const triangleVertices = [
      new THREE.Vector3(arrowHeight, 0, 0),
      new THREE.Vector3(0, arrowWidth, 0),
      new THREE.Vector3(0, -arrowWidth, 0)
    ]
    return Float32Array.from(new Array(triangleVertices.length).fill().flatMap((item, index) => triangleVertices[index].toArray()))
  }, [])

  const r = 100

  // Generate random positions
  const segmentsProps = useMemo(
    () =>
      new Array(NB).fill(0).map(() => ({
        coords: [
          [r * Math.random() - r / 2, r * Math.random() - r / 2],
          [r * Math.random() - r / 2, r * Math.random() - r / 2]
          // [0, 0],
          // [5, 5]
          // [Math.floor()]
        ],
        color: tempColor.setHex(Math.random() * 0xffffff).clone(),

        computedData: {
          length: undefined,
          dx: undefined,
          dy: undefined,
          angle: undefined
        }
      })),
    [NB]
  )

  const [hoverId, setHoverId] = useState(-1)

  // Set all segment position
  useLayoutEffect(() => {
    // Return if the ref is not ready
    if (triangleEndMeshRef === null) return
    if (triangleEndMeshRef.current === null) return
    if (triangleStartMeshRef === null) return
    if (triangleStartMeshRef.current === null) return
    if (lineMeshRef === null) return
    if (lineMeshRef.current === null) return

    // Simplify syntax for the ref
    const triangleEndMesh = triangleEndMeshRef.current
    const triangleStartMesh = triangleStartMeshRef.current
    const lineMesh = lineMeshRef.current

    // Loop over all object and set the positions
    for (let i = 0; i < NB; i++) {
      const segment = segmentsProps[i]
      const color = segment.color
      const coords = segment.coords
      const computedData = segment.computedData

      if (computedData.dx === undefined || computedData.y === undefined || computedData.angle === undefined) {
        const startVector = new THREE.Vector3(coords[0][0], coords[0][1], 0)
        const endVector = new THREE.Vector3(coords[1][0], coords[1][1], 0)
        const length = endVector.distanceTo(startVector)
        const dx = coords[1][0] - coords[0][0]
        const dy = coords[1][1] - coords[0][1]

        computedData.dx = dx
        computedData.dy = dy
        computedData.length = length

        const angle = Math.atan2(dy, dx)

        computedData.angle = angle
      }

      // get random number for the color later
      // const color = Math.random()

      // set line position
      tempObject.position.set(coords[0][0], coords[0][1], i / 100)
      tempObject.rotation.set(0, 0, computedData.angle ?? 0)
      tempObject.scale.set(computedData.length ? computedData.length - arrowHeight : 1 - arrowHeight, lineWidth, 1)

      tempObject.updateMatrix()
      lineMesh.setMatrixAt(i, tempObject.matrix)
      lineMesh.setColorAt(i, color)

      // set Triangle position
      const dx = -arrowHeight * Math.cos(computedData.angle ?? 0)
      const dy = -arrowHeight * Math.sin(computedData.angle ?? 0)

      // start Triangle
      tempObject.position.set(coords[0][0], coords[0][1], i / 100)
      tempObject.rotation.set(0, 0, computedData.angle ?? 0)
      tempObject.scale.set(1, 1, 1)

      tempObject.updateMatrix()
      triangleStartMesh.setMatrixAt(i, tempObject.matrix)
      triangleStartMesh.setColorAt(i, color)
      tempObject.needsUpdate = true
      tempObject.position.set(coords[1][0] + dx, coords[1][1] + dy, i / 100)
      tempObject.rotation.set(0, 0, computedData.angle ?? 0)

      // End Triangle
      tempObject.position.set(coords[1][0] + dx, coords[1][1] + dy, i / 100)
      tempObject.rotation.set(0, 0, computedData.angle ?? 0)

      tempObject.updateMatrix()
      triangleEndMesh.setMatrixAt(i, tempObject.matrix)
      triangleEndMesh.setColorAt(i, color)
      tempObject.needsUpdate = true
      tempObject.position.set(coords[1][0] + dx, coords[1][1] + dy, i / 100)
      tempObject.rotation.set(0, 0, computedData.angle ?? 0)
    }

    // Launch updates
    triangleEndMesh.instanceMatrix.needsUpdate = true
    triangleEndMesh.instanceColor.needsUpdate = true
    triangleEndMesh.material.needsUpdate = true

    triangleStartMesh.instanceMatrix.needsUpdate = true
    triangleStartMesh.instanceColor.needsUpdate = true
    triangleStartMesh.material.needsUpdate = true

    lineMesh.instanceMatrix.needsUpdate = true
    lineMesh.instanceColor.needsUpdate = true
    lineMesh.material.needsUpdate = true
  }, [NB])

  const { size, viewport } = useThree()
  const aspect = size.width / viewport.width

  const prevHoverId = useRef(hoverId)
  useEffect(() => {
    // Simplify syntax for the ref
    const triangleEndMesh = triangleEndMeshRef.current
    const triangleStartMesh = triangleStartMeshRef.current
    const lineMesh = lineMeshRef.current

    lineMesh.setColorAt(hoverId, tempColor.setHex(1 * 0xffffff))
    triangleStartMesh.setColorAt(hoverId, tempColor.setHex(1 * 0xffffff))
    triangleEndMesh.setColorAt(hoverId, tempColor.setHex(1 * 0xffffff))

    if (prevHoverId && prevHoverId.current >= 0 && prevHoverId.current !== hoverId && prevHoverId.current < NB) {
      lineMesh.setColorAt(prevHoverId.current, segmentsProps[prevHoverId.current].color)
      triangleStartMesh.setColorAt(prevHoverId.current, segmentsProps[prevHoverId.current].color)
      triangleEndMesh.setColorAt(prevHoverId.current, segmentsProps[prevHoverId.current].color)
    }

    prevHoverId.current = hoverId
    lineMesh.instanceColor.needsUpdate = true
    triangleStartMesh.instanceColor.needsUpdate = true
    triangleEndMesh.instanceColor.needsUpdate = true
  }, [hoverId])

  let planeIntersectPoint = new THREE.Vector3()
  const dragBinding = useDrag(
    ({ active, delta: [dx, dy], down, event }) => {
      // Simplify syntax for the ref
      const triangleEndMesh = triangleEndMeshRef.current
      const triangleStartMesh = triangleStartMeshRef.current
      const lineMesh = lineMeshRef.current
      if (active) {
        event.ray.intersectPlane(floorPlane, planeIntersectPoint)

        /** --------------------Update Line-------------------- */
        // Retrieve current positions information
        lineMesh.getMatrixAt(event.instanceId, tempMatrix)
        tempMatrix.decompose(tempPos, tempQuaternion, tempScale)

        tempPos.x += dx / aspect
        tempPos.y -= dy / aspect
        tempObject.rotation.setFromQuaternion(tempQuaternion)
        tempObject.position.set(tempPos.x, tempPos.y, tempPos.z)
        tempObject.scale.setFromMatrixScale(tempMatrix)

        tempObject.updateMatrix()
        tempObject.needsUpdate = true

        // apply everything in the instance mesh
        lineMesh.setMatrixAt(event.instanceId, tempObject.matrix)
        lineMesh.instanceMatrix.needsUpdate = true

        /** --------------------Update Triangle start-------------------- */
        // Retrieve current positions information
        triangleStartMesh.getMatrixAt(event.instanceId, tempMatrix)
        tempMatrix.decompose(tempPos, tempQuaternion, tempScale)

        tempPos.x += dx / aspect
        tempPos.y -= dy / aspect
        tempObject.rotation.setFromQuaternion(tempQuaternion)
        tempObject.position.set(tempPos.x, tempPos.y, tempPos.z)
        tempObject.scale.setFromMatrixScale(tempMatrix)

        tempObject.updateMatrix()
        tempObject.needsUpdate = true

        // apply everything in the instance mesh
        triangleStartMesh.setMatrixAt(event.instanceId, tempObject.matrix)
        triangleStartMesh.instanceMatrix.needsUpdate = true

        /** --------------------Update triangle eng-------------------- */
        // Retrieve current positions information
        triangleEndMesh.getMatrixAt(event.instanceId, tempMatrix)
        tempMatrix.decompose(tempPos, tempQuaternion, tempScale)

        tempPos.x += dx / aspect
        tempPos.y -= dy / aspect
        tempObject.rotation.setFromQuaternion(tempQuaternion)
        tempObject.position.set(tempPos.x, tempPos.y, tempPos.z)
        tempObject.scale.setFromMatrixScale(tempMatrix)

        tempObject.updateMatrix()
        tempObject.needsUpdate = true

        // apply everything in the instance mesh
        triangleEndMesh.setMatrixAt(event.instanceId, tempObject.matrix)
        triangleEndMesh.instanceMatrix.needsUpdate = true
      }

      setIsDragging((prev) => (prev === active ? prev : active))
      if (!active) console.log('line Mesh', tempPos, tempScale, tempQuaternion)
    },
    { delay: true }
  )

  return (
    <>
      <instancedMesh
        ref={lineMeshRef}
        args={[null, null, NB]}
        onPointerOver={(e) => setHoverId(e.instanceId)}
        onPointerLeave={(e) => setHoverId(-1)}
        {...dragBinding()}>
        <shapeGeometry args={[lineBaseSeg]} />
        <meshBasicMaterial side={THREE.DoubleSide} />
        <meshBasicMaterial attach="material" side={THREE.DoubleSide} />
      </instancedMesh>

      <instancedMesh ref={triangleStartMeshRef} args={[null, null, NB]}>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attachObject={['attibutes', 'position']}
            attach="attributes-position"
            array={vertices}
            itemSize={3}
            count={3}></bufferAttribute>
        </bufferGeometry>
        <meshBasicMaterial attach="material" side={THREE.DoubleSide} />
      </instancedMesh>

      <instancedMesh ref={triangleEndMeshRef} args={[null, null, NB]}>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attachObject={['attibutes', 'position']}
            attach="attributes-position"
            array={vertices}
            itemSize={3}
            count={3}></bufferAttribute>
        </bufferGeometry>
        <meshBasicMaterial attach="material" side={THREE.DoubleSide} />
      </instancedMesh>
    </>
  )
}
