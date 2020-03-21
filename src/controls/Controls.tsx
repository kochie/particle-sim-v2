import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls"

interface ControlProps {
  type: 'orbit' | 'trackball'
}

export default ({type}: ControlProps) => {
  // useFrame(() => controls.current.update())
  
  switch(type) {
    case "orbit": {
      return (<orbitControls ref={controls} args={[camera, gl.domElement]} enableDamping dampingFactor={0.1} rotateSpeed={0.5} />)  
    } case "trackball": {
      return (<trackballControls ref={controls} args={[camera, gl.domElement]} rotateSpeed={3} />)  
    } default: {
      return null
    }
  }
}
