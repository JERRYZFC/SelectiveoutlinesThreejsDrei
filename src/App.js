import React, { useRef, useMemo, useState, useEffect } from 'react'
import SpatShow from './SplatShow/SpatShow'
import { GizmoHelper, GizmoViewport,OrbitControls, PerformanceMonitor } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { button, useControls } from 'leva'
import { Perf } from 'r3f-perf'
// import { Box, OrbitControls, useTexture, Text } from "@react-three/drei";
import * as THREE from 'three'
import Grid2, { GridHelper } from './SegmentComponents/grid'
import { Segments } from './SegmentComponents/segment'

import { PivotControls } from './pivotControls/index'

import Normal_fragment_beginGlsl from 'three/src/renderers/shaders/ShaderChunk/normal_fragment_begin.glsl'


const data = new Array(10000).fill(0).map((d, id) => ({ id }))

function Rig() {

  const controls = useThree((state) => state.controls)

  const { ...controlProps} = useControls({
    azimuth: { value: 0, min: 0, max: Math.PI },
    polar: { value: Math.PI / 2, min: 0, max: Math.PI / 2 },
    zoom: { value: 1, min: 0.1, max: 2 }

  })


  function handleLogCamera() {
    console.log(controlProps.polar);
    console.log(controls);
    return;
    console.log(controls.target)//32.456967599223596,   27.618767018359755,   -7.6289124222176214
    console.log(controls.object.position)//32.75402942979723,   20.362798774925448,   -0.3914296930550787
    console.log(controls.object.zoom)//1
  }

  useControls({ logStateButton: button(() => handleLogCamera()) })

  useFrame(() => {
    // controls?.setAzimuthalAngle(controlProps.azimuth)
    // controls?.setPolarAngle(controlProps.polar)
    // console.log(controls)
  })
  return null
}


export default function App() {

  // user input
  const { ...controlProps } = useControls('controls', {
    // NB: { label: 'Max Object', value: 10, min: 1, max: 10, step: 1 }
    NB: { label: 'Max Object', value: 1, min: 1, max: 100000, step: 100 }
  })



useControls({ saveStateButton: button(() => handleSetCamera()) })
useControls({ resetStateButton: button(() => handleResetCamera()) })

const handleSetCamera = () => {
  controlRef.current?.saveState()

}
const handleResetCamera = () => {
  controlRef.current?.reset()
}

const controlRef = useRef()

useEffect(() => {

}, [])


const [NB, setNB] = useState(controlProps.NB)

// adapt quality
const [dpr, setDpr] = useState(1.5)


const [isDragging, setIsDragging] = useState(false)
const floorPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
// Dragging mmngt
const cameraRef = useRef()
const splatRef = useRef()

const [layout, setLayout] = React.useState('grid')
const [selectedPoint, setSelectedPoint] = React.useState(null)

// debounce
useEffect(() => {
  const tmo = setTimeout(() => {
    setNB(controlProps.NB)
  }, 200)
  if (cameraRef.current) {


  }

  return () => clearTimeout(tmo)
}, [controlProps.NB])


return (
  <div className='App'>
    <div className='vis-container'>

      <Canvas style={{ background: 'lightgrey' }} dpr={dpr}
              onCreated={({ gl }) => gl.setClearColor('#aaaaaa')}

      >
        <camera ref={cameraRef} position={[0, 100, 300]} far={1502000}></camera>

        <PerformanceMonitor
          onChange={({ factor }) => {
            console.log('new DPR', 0.1 + 1.5 * factor)
            setDpr(0.5 + 1.5 * factor)
          }}>

          <ambientLight />
          <pointLight />



          <PivotControls  scale={75} depthTest={false} fixed lineWidth={2}>
            {/*rotation={[0, -Math.PI / 2, 0]}  anchor={[1, -1, -1]} */}
          <SpatShow ref={splatRef} />
          </PivotControls>

          <Segments NB={NB} setIsDragging={setIsDragging} floorPlane={floorPlane} />
          {/* <Triangles NB={NB} /> */}

          <Grid2 size={10} />
          <GridHelper />

          <GizmoHelper alignment="bottom-right" margin={[100, 100]}>
            <GizmoViewport labelColor="white" axisHeadScale={1} />
          </GizmoHelper>
          <OrbitControls makeDefault enableDamping={false}
                         enableRotate={true}
                         ref={controlRef}
                         mouseButtons={{
                           LEFT: THREE.MOUSE.PAN,
                           MIDDLE: THREE.MOUSE.DOLLY,
                           RIGHT: THREE.MOUSE.ROTATE
                         }} />

          <Rig />


        </PerformanceMonitor>

        <Perf position='top-left' showGraph={true} />

      </Canvas>


    </div>
  </div>
)

}

/*
* const [layout, setLayout] = React.useState('grid');
  const [selectedPoint, setSelectedPoint] = React.useState(null);



  return (
    <Canvas gl={{ antialias: false }} camera={{ position: [0, 0, 15], near: 5, far: 20 }}>
      <color attach="background" args={['#f0f0f0']} />
      <Boxes  />
      <EffectComposer disableNormalPass>
        <N8AO aoRadius={0.5} intensity={1} />
        <Bloom luminanceThreshold={1} intensity={0.5} levels={9} mipmapBlur />
      </EffectComposer>
    </Canvas>
  )*/

/*
*
    <div className="App">
      <div className="vis-container">
        <ThreePointVis
          ref={visRef}
          data={data}
          layout={layout}
          selectedPoint={selectedPoint}
          onSelectPoint={setSelectedPoint}
        />
      </div>
      <button className="reset-button" onClick={handleResetCamera}>
        Reset Camera
      </button>
      <div className="controls">
        <strong>Layouts</strong>{' '}
        <button
          onClick={() => setLayout('grid')}
          className={layout === 'grid' ? 'active' : undefined}
        >
          Grid
        </button>
        <button
          onClick={() => setLayout('spiral')}
          className={layout === 'spiral' ? 'active' : undefined}
        >
          Spiral
        </button>
        {selectedPoint && (
          <div className="selected-point">
            You selected <strong>{selectedPoint.id}</strong>
          </div>
        )}
      </div>
    </div>*/