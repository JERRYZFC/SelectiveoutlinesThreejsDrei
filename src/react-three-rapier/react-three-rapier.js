import {
  ContactShadows,
  Environment,
  OrbitControls,
  TorusKnot
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { CuboidCollider, Physics, RigidBody } from "@react-three/rapier";
import { R3RapierBranding } from "r3-rapier-branding";
import { Suspense } from "react";
import Spinner from "./Spinner";
import "./styles.scss";

const Scene = () => {
  return (
    <group>
      <RigidBody colliders="hull" position={[-3, 2, 0]}>
        <TorusKnot scale={0.5}>
          <meshPhysicalMaterial />
        </TorusKnot>
      </RigidBody>

      <RigidBody colliders="ball" position={[-1, 2, 0]}>
        <TorusKnot scale={0.5}>
          <meshPhysicalMaterial />
        </TorusKnot>
      </RigidBody>

      <RigidBody colliders="cuboid" position={[1, 2, 0]}>
        <TorusKnot scale={0.5}>
          <meshPhysicalMaterial />
        </TorusKnot>
      </RigidBody>

      <RigidBody colliders="trimesh" position={[3, 2, 0]}>
        <TorusKnot scale={0.5}>
          <meshPhysicalMaterial />
        </TorusKnot>
      </RigidBody>

      {/* Floor */}
      <CuboidCollider position={[0, -2.5, 0]} args={[10, 1, 10]} />

      <ContactShadows
        scale={20}
        blur={0.4}
        opacity={0.2}
        position={[-0, -1.5, 0]}
      />

      <OrbitControls />
    </group>
  );
};


export default Scene;
