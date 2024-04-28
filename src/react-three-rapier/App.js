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
import "./styles.scss.css";
import Scene from './react-three-rapier'

export default function App() {
  return (
    <div className="App">
      <R3RapierBranding title="Auto Colliders" version="1.0.0">
        <Suspense fallback={<Spinner />}>
          <Canvas shadows>
            <Environment preset="studio" />
            <fog attach="fog" args={["#000", 2, 100]} />

            <Physics debug>
              <Scene />
            </Physics>
          </Canvas>
        </Suspense>
      </R3RapierBranding>
    </div>
  );
}