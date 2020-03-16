// import Canvas from "../components/Canvas"
// import dynamic from 'next/dynamic'
// import { Canvas } from 'react-three-fiber'

import Canvas from "../components/Canvas"

// import "../styles/main.scss"

// const Canvas = dynamic(() => import('../components/Canvas'), {ssr: false})

export default () => {
    return (
        <>
            <Canvas />
        </>
    )
}