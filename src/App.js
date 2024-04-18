
import * as THREE from 'three'
import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, N8AO, Bloom } from '@react-three/postprocessing'
import Boxes from './Boxes/Boxes'

// const data = new Array(10000).fill(0).map((d, id) => ({ id }));

import ThreePointVis from './ThreePointVis/ThreePointVis';


const data = new Array(10000).fill(0).map((d, id) => ({ id }));

export default function App() {

  const [layout, setLayout] = React.useState('grid');
  const [selectedPoint, setSelectedPoint] = React.useState(null);

  const visRef = React.useRef();
  const handleResetCamera = () => {
    visRef.current.resetCamera();
  };

return (
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