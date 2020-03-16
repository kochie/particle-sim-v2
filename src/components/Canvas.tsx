import React, { useEffect, useRef, Suspense, useState } from 'react';
import Stats from 'stats.js'
import { Canvas, useFrame, extend, ReactThreeFiber, useThree } from 'react-three-fiber'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass'
import { Controls } from '../controls/Controls';


extend({ EffectComposer, RenderPass, GlitchPass })

// import init from '../rendering/init';
// import Environment from '../rendering/environment';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      effectComposer: ReactThreeFiber.Object3DNode<EffectComposer, typeof EffectComposer>
      renderPass: ReactThreeFiber.Object3DNode<RenderPass, typeof RenderPass>
      glitchPass: ReactThreeFiber.Object3DNode<GlitchPass, typeof GlitchPass>
    }
  }
}



const Box = props => {
  const mesh = useRef(null)

  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)

  useFrame(() => {
    if (!!mesh.current) {
    mesh.current.rotation.x = mesh.current.rotation.y += 0.01
    }
  })

  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? [6, 6, 6] : [5, 5, 5]}
      onClick={e => setActive(!active)}
      onPointerOver={e => setHover(true)}
      onPointerOut={e => setHover(false)}
      // position={[1,1,1]}
    >
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial
        attach="material"
        color={hovered ? '#2b6c76' : '#720b23'}
      />
    </mesh>
  )
}

function Effects() {
  const { gl, scene, camera, size } = useThree()
  const composer = useRef(null)
  const stats = new Stats()

  useEffect(() => {
    document.body.appendChild(stats.dom)
  }, [])

  useEffect(() => {
    composer.current.setSize(size.width, size.height)
  }, [size])

  useFrame(() => {
    stats.begin()
    composer.current.render()
    stats.end()
  }, 1)

  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" args={[scene, camera]} />
      {/* <glitchPass attachArray="passes" renderToScreen /> */}
    </effectComposer>
  )
}

export default () => {
  return (
    <>
    <h1>Click on me - Hover me :)</h1>,
    <Canvas camera={{ position: [0, 0, 35] }}>
      <ambientLight intensity={2} />
      <pointLight position={[40, 40, 40]} />
      <Controls type={"trackball"}/>
      <Effects />
      <Suspense fallback={null}>
        <Box position={[0, 0, 0]} />
        <Box position={[10, 0, 0]} />
        <Box position={[-10, 0, 0]} />
        <Box position={[0, 10, 0]} />
        <Box position={[0, -10, 0]} />
      </Suspense>
    </Canvas>
    </>
  )
}
