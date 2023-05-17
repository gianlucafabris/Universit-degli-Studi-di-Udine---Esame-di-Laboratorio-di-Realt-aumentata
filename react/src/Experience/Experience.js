import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import OctoprintApi from "./octoprint/OctoprintApi.js";

import config from './config/config.js';

// import { AFrameRenderer, Marker } from 'react-web-ar';
// import OctoprintApi from "./octoprint/OctoprintApi.js";

export default function Experience(){
    return <>
        <Canvas camera={{fov: 45, near: 0.1, far: 2000, position: [-config.printer.x*2, config.printer.z*2, config.printer.y*2]}}>
            <OrbitControls makeDefault />
            <OctoprintApi resource="connection"></OctoprintApi>
            <OctoprintApi resource="job"></OctoprintApi>
            <OctoprintApi resource="temps"></OctoprintApi>
            <OctoprintApi resource="printingFile"></OctoprintApi>
        </Canvas>
        {/* <AFrameRenderer arToolKit={{ sourceType: 'webcam' }}>
            <Marker parameters={{ preset: "pattern", type: "pattern", url: "./marker/3d printer marker.patt" }}>
                <OctoprintApi resource="connection"></OctoprintApi>
                <OctoprintApi resource="job"></OctoprintApi>
                <OctoprintApi resource="temps"></OctoprintApi>
                <OctoprintApi resource="printingFile"></OctoprintApi>
            </Marker>
        </AFrameRenderer> */}
    </>;
};