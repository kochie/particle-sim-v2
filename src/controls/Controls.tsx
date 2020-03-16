import { useRef } from "react"
import { useThree, useFrame, ReactThreeFiber, extend } from "react-three-fiber"
import { OrbitControls } from "./OrbitControls"
import { TrackballControls } from "./TrackballControls"

extend({ OrbitControls, TrackballControls })

type ControlType = "orbit" | "trackball"

export function Controls({type} : {type: ControlType}) {
  const controls = useRef(null)
  const { camera, gl } = useThree()
  useFrame(() => controls.current.update())
  if (type === 'orbit') {
    return (
      <orbitControls ref={controls} args={[camera, gl.domElement]} enableDamping dampingFactor={0.1} rotateSpeed={0.5} />
    )  
  } else if (type === 'trackball') {
    return (
      <trackballControls ref={controls} args={[camera, gl.domElement]} rotateSpeed={3} />
    )  
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>;
      trackballControls: ReactThreeFiber.Object3DNode<TrackballControls, typeof TrackballControls>;
    }
  }
}