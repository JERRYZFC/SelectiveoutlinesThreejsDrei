import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

// const NB = 100;

// Temp object for color setting
const tempColor = new THREE.Color()

// Define segment and arrow props
const lineWidth = 0.2
const arrowHeight = 0.3
const arrowWidth = 0.4

const tempObject = new THREE.Object3D()

// Define line geometry
const lineBaseSeg = new THREE.Shape()
lineBaseSeg.moveTo(0, 0.5)
lineBaseSeg.lineTo(1, 0.5)
lineBaseSeg.lineTo(1, -0.5)
lineBaseSeg.lineTo(0, -0.5)
lineBaseSeg.lineTo(0, 0.5)

export function Triangles({ NB }) {
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
          // [1, 1]
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

  // Generate random colors
  const segmentsColor = useMemo(() => segmentsProps.map((s) => s.color), [NB])

  // const vertices = [0,5,0,0,0,0,5,0,0];

  const M = 10000

  useLayoutEffect(() => {
    if (triangleEndMeshRef === null) return
    if (triangleEndMeshRef.current === null) return
    if (lineMeshRef === null) return
    if (lineMeshRef.current === null) return

    const triangleEndMesh = triangleEndMeshRef.current
    const triangleStartMesh = triangleStartMeshRef.current
    const lineMesh = lineMeshRef.current

    // mesh.

    for (let i = 0; i < NB; i++) {
      const segment = segmentsProps[i]
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

      // tempObject.position.set(20 * Math.random(), 20 * Math.random(), 3 * Math.random())
      // tempObject.rotation.set(0, 0, (180 / Math.PI) * Math.random() * 360)
      // tempObject.rotation.set(0, 0, (180 / Math.PI) * Math.random() * 360)
      // tempObject.scale.set(Math.random(), 1, 1)

      // get random number for the color later
      const color = Math.random()

      // set line position
      tempObject.position.set(coords[0][0], coords[0][1], i / 100)
      tempObject.rotation.set(0, 0, computedData.angle ?? 0)
      tempObject.scale.set(computedData.length ? computedData.length - arrowHeight : 1 - arrowHeight, lineWidth, 1)

      tempObject.updateMatrix()
      lineMesh.setMatrixAt(i, tempObject.matrix)
      lineMesh.setColorAt(i, tempColor.setHex(color * 0xffffff))

      // set Triangle position
      const dx = -arrowHeight * Math.cos(computedData.angle ?? 0)
      const dy = -arrowHeight * Math.sin(computedData.angle ?? 0)

      // start Triangle
      tempObject.position.set(coords[0][0], coords[0][1], i / 100)
      tempObject.rotation.set(0, 0, computedData.angle ?? 0)
      tempObject.scale.set(1, 1, 1)

      tempObject.updateMatrix()
      triangleStartMesh.setMatrixAt(i, tempObject.matrix)
      triangleStartMesh.setColorAt(i, tempColor.setHex(color * 0xffffff))
      tempObject.needsUpdate = true
      tempObject.position.set(coords[1][0] + dx, coords[1][1] + dy, i / 100)
      tempObject.rotation.set(0, 0, computedData.angle ?? 0)

      // End Triangle
      tempObject.position.set(coords[1][0] + dx, coords[1][1] + dy, i / 100)
      tempObject.rotation.set(0, 0, computedData.angle ?? 0)

      tempObject.updateMatrix()
      triangleEndMesh.setMatrixAt(i, tempObject.matrix)
      triangleEndMesh.setColorAt(i, tempColor.setHex(color * 0xffffff))
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

  return (
    <>
      <instancedMesh ref={lineMeshRef} args={[null, null, NB]}>
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
