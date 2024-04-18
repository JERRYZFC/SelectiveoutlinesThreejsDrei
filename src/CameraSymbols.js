import { useEffect, useRef } from "react";
import * as THREE from "three";
import PyramidOutline from "./PyramidOutline";


const Cameras= ({ url }) => {
  const groupRef = useRef (new THREE.Group());

  useEffect(() => {
    const fetchCameras = async () => {
      const response = await fetch(url);
      const data = await response.json();

      data.forEach((item ) => {
        const materialB = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          wireframe: true,
        });
        const camera = PyramidOutline(new THREE.Vector3(0.06, 0.06, 0.045));

        camera.position.set(...(item.position  ));
        camera.quaternion.set(
          ...(item.quaternion )
      );
        camera.rotateX(THREE.MathUtils.degToRad(90));

        groupRef.current.add(camera);
      });
    };

    fetchCameras();
  }, [url]);

  return <primitive object={groupRef.current} />;
};

export default Cameras;
