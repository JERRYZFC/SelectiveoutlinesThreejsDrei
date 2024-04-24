import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls,  Splat, useFBO } from '@react-three/drei'
import { forwardRef } from 'react'

// import { Box, OrbitControls, useTexture, Text } from "@react-three/drei";
import * as THREE from 'three'
import PyramidOutline from '../PyramidOutline'
import { PivotControls } from '../pivotControls'

function SpatShow() {

  const splatRef = useRef(  )
  const refMesh = useRef();
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)

  // Performance factor
  const [factor, setFactor] = useState(1);

  const [active, setActive] = useState(false);

  useFrame((_state, delta) => {

    // console.log(splatRef.current);
    // console.log(refMesh.current);
    // console.log(scene);
  });

  const { camera, gl, scene } = useThree();
  const groupRef = useRef (new THREE.Group());

  useEffect(() => {

    console.log('load');
    console.log('camera',camera);
    console.log('gl',gl);
    console.log('scene',scene);
    console.log(splatRef)

    // const mesh = scene.getObjectByName("zny");
    // mesh.rotation.x = Math.PI   ;
    // mesh.rotation.z = 3*Math.PI /4  ;


  }, [])

  useEffect(() => {
    const fetchCameras = async () => {
      const response = await fetch('/lab31/planes_data.json');
      const data = await response.json();

      data.forEach((item ) => {
        const materialB = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          wireframe: true,
        });
        const camera = PyramidOutline(new THREE.Vector3(0.06, 0.06, 0.045));

        camera.position.set(...(item.position  ));
        camera.rotation.set(
          ...(item.rotation )
        );
        camera.rotateX(THREE.MathUtils.degToRad(90));

        groupRef.current.add(camera);

      });
    };

    fetchCameras();
  }, [ ]);


  return (

    <>

        {/*<Splat ref={splatRef} src={'/data/zny.compressed.splat'}*/}
        {/*       name={'zny'}*/}
        {/*       userData={'zny zfc created'}*/}
        {/*       position={[0, 0, 10]}*/}
        {/*       chunkSize={1000} scale={10}*/}
        {/*       onClick={(e) =>  {*/}
        {/*         console.log(*/}
        {/*         "clicking here",*/}
        {/*         e,*/}
        {/*         e.point*/}
        {/*       );*/}
        {/*         const newMesh = new THREE.Mesh(*/}
        {/*         new THREE.SphereGeometry(0.05),*/}
        {/*         new THREE.MeshBasicMaterial({*/}
        {/*         color: new THREE.Color("red"),*/}
        {/*       })                 );*/}
        {/*         newMesh.position.set(*/}
        {/*         e.point.x,*/}
        {/*         e.point.y,*/}
        {/*         e.point.z*/}
        {/*         );*/}
        {/*         scene.add(newMesh);*/}
        {/*       }}  ></Splat>*/}

        {/*<Splat name={'nike shoe'} userData={'load from web resource'} src={'/data/nike.splat'} position={[0, 3, 0]} scale={10} ></Splat>*/}


        {/*<mesh ref={refMesh} />*/}

      <Splat src={'/lab31/model.splat'} name={'lab31 model.splat'}  position={[0, 0, 0]} />


      <PivotControls  scale={75} depthTest={false} fixed lineWidth={2}>
      <primitive object={groupRef.current} />
      </PivotControls>

    </>


  )


}


export default forwardRef(SpatShow)