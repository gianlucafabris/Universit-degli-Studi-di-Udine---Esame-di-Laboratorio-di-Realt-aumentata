import * as THREE from 'three';
import { GCodeLoader } from 'three/addons/loaders/GCodeLoader.js';
import { useEffect, useState } from 'react';
import { Html } from '@react-three/drei';
import { useLoader } from '@react-three/fiber'
import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";
import config from '../config/config.js';

export default function OctoprintApi({resource}){
    const [render, setRender] = useState();
    let url = config.host + "/api/server?apikey=" + config.apikey;
    let [graphUpdate, setGraphUpdate] = useState(false);
    let graphUpdateInterval;
    let printingFile = "";
    const printerBedTexture = useLoader(THREE.TextureLoader, './img/prusa mini bed.png');
    useEffect(function(){
        if(resource == "connection"){
            url = config.host + "/api/connection?apikey=" + config.apikey;
            jQuery.get(url, function(data){
                setRender(<>
                    <Html transform position={[-50, config.printer.z/2+25, -config.printer.y/2]} rotation={[0, 0, 0]} distanceFactor={10*5} occlude="blending">
                        <div className="octoprintApi_connection">
                            {data.current.state == "Closed" ? <p>Not connected to any printer</p> : <>
                                <p>Connected to {data.current.printerProfile}</p>
                                <div className="octoprintApi_connection_state">{data.current.state}</div>
                            </>}
                        </div>
                    </Html>
                    <Html transform position={[-50, config.printer.z/2+25, -config.printer.y/2-0.001]} rotation={[0, Math.PI, 0]} distanceFactor={10*5} occlude="blending">
                        <div className="octoprintApi_connection">
                            {data.current.state == "Closed" ? <p>Not connected to any printer</p> : <>
                                <p>Connected to {data.current.printerProfile}</p>
                                <div className="octoprintApi_connection_state">{data.current.state}</div>
                            </>}
                        </div>
                    </Html>
                </>);
            }).fail(function(){
                setRender(<>
                    <Html transform position={[-50, config.printer.z/2+25, -config.printer.y/2]} rotation={[0, 0, 0]} distanceFactor={10*5} occlude="blending">
                        <div className="octoprintApi_connection">
                            <p>There is no octoprint server available at {config.host}</p>
                        </div>
                    </Html>
                    <Html transform position={[-50, config.printer.z/2+25, -config.printer.y/2-0.001]} rotation={[0, Math.PI, 0]} distanceFactor={10*5} occlude="blending">
                        <div className="octoprintApi_connection">
                            <p>There is no octoprint server available at {config.host}</p>
                        </div>
                    </Html>
                </>);
            });
        }else if(resource == "job"){
            url = config.host + "/api/job?apikey=" + config.apikey;
            jQuery.get(url, function(data){
                setRender(data.state != "Offline" ? <>
                    <Html transform position={[-50, config.printer.z/2-25, -config.printer.y/2]} rotation={[0, 0, 0]} distanceFactor={10*5} occlude="blending">
                        <div className="octoprintApi_job">
                            {data.state == "Operational" ? <p className="octoprintApi_job_state">{data.state}</p> : <>
                                <p className="octoprintApi_job_state">{data.state}</p>
                                <div className="octoprintApi_job_progress">
                                    <span style={{textAlign: "left"}}>{data.progress.printTime}s passed</span>
                                    <span style={{textAlign: "center"}}>total {data.job.estimatedPrintTime}s</span>
                                    <span style={{textAlign: "right"}}>{data.progress.printTimeLeft}s left</span>
                                    <div className="octoprintApi_job_progress_bar">
                                        <div className="octoprintApi_job_progress_bar_bar" style={{width: data.progress.completion + "%"}}></div>
                                    </div>
                                </div>
                            </>}
                        </div>
                    </Html>
                    <Html transform position={[-50, config.printer.z/2-25, -config.printer.y/2-0.001]} rotation={[0, Math.PI, 0]} distanceFactor={10*5} occlude="blending">
                        <div className="octoprintApi_job">
                            {data.state == "Operational" ? <p className="octoprintApi_job_state">{data.state}</p> : <>
                                <p className="octoprintApi_job_state">{data.state}</p>
                                <div className="octoprintApi_job_progress">
                                    <span style={{textAlign: "left"}}>{data.progress.printTime}s passed</span>
                                    <span style={{textAlign: "center"}}>total {data.job.estimatedPrintTime}s</span>
                                    <span style={{textAlign: "right"}}>{data.progress.printTimeLeft}s left</span>
                                    <div className="octoprintApi_job_progress_bar">
                                        <div className="octoprintApi_job_progress_bar_bar" style={{width: data.progress.completion + "%"}}></div>
                                    </div>
                                </div>
                            </>}
                        </div>
                    </Html>
                </> : <></>);
            }).fail(function(){
                setRender(<></>);
            });
        }else if(resource == "temps"){
            url = config.host + "/api/connection?apikey=" + config.apikey;
            jQuery.get(url, function(data){
                if(data.current.state != "Closed"){
                    url = config.host + "/api/printer?history=true&limit=3600&apikey=" + config.apikey;
                }else{
                    clearInterval(graphUpdateInterval);
                    setGraphUpdate(false);
                    setRender(<></>);
                }
            }).fail(function(){
                clearInterval(graphUpdateInterval);
                setGraphUpdate(false);
                setRender(<></>);
            }).then(function(){
                if(url.search("printer") != -1 && !graphUpdate){
                    setGraphUpdate(true);
                    graphUpdateInterval = setInterval(function(){
                        let tempUrl =  config.host + "/api/connection?apikey=" + config.apikey;
                        jQuery.get(tempUrl, function(data){
                            if(data.current.state == "Closed"){
                                clearInterval(graphUpdateInterval);
                                setGraphUpdate(false);
                                setRender(<></>);
                            }
                        }).fail(function(){
                            clearInterval(graphUpdateInterval);
                            setGraphUpdate(false);
                            setRender(<></>);
                        })
                        jQuery.get(url, function(data){
                            const chartData = {
                                labels: data.temperature.history.map(function(data){return new Date(data.time*1000).getHours() + ":" + new Date(data.time*1000).getMinutes() + ":" + new Date(data.time*1000).getSeconds();}),
                                datasets: [
                                    {
                                        label: "E0",
                                        data: data.temperature.history.map(function(data){return data.tool0 ? data.tool0.actual : 0.0;}),
                                        backgroundColor: ["#6B9EE1"],
                                        borderColor: ["#6B9EE1"],
                                        borderWidth: 1
                                    },
                                    {
                                        label: "E0 target",
                                        data: data.temperature.history.map(function(data){return data.tool0 ? data.tool0.target : 0.0;}),
                                        backgroundColor: ["#567EB4"],
                                        borderColor: ["#567EB4"],
                                        borderWidth: 1
                                    },
                                    {
                                        label: "B",
                                        data: data.temperature.history.map(function(data){return data.bed ? data.bed.actual : 0.0;}),
                                        backgroundColor: ["#86F5FA"],
                                        borderColor: ["#86F5FA"],
                                        borderWidth: 1
                                    },
                                    {
                                        label: "B target",
                                        data: data.temperature.history.map(function(data){return data.bed ? data.bed.target : 0.0;}),
                                        backgroundColor: ["#6BC4C8"],
                                        borderColor: ["#6BC4C8"],
                                        borderWidth: 1
                                    }
                                ]
                            };
                            setRender(<>
                                <Html transform position={[config.printer.x+50, config.printer.z/2, -config.printer.y+100]} rotation={[0, -Math.PI/2, 0]} distanceFactor={10*5} occlude="blending">
                                    <div className="octoprintApi_temps">
                                        <Line data={chartData} options={{
                                            plugins: {
                                                title: {
                                                    display: true,
                                                    text: "Printer temperatures"
                                                },
                                                legend: {
                                                    display: true
                                                }
                                            }
                                        }} />
                                    </div>
                                </Html>
                                <Html transform position={[config.printer.x+50.001, config.printer.z/2, -config.printer.y+100]} rotation={[0, Math.PI/2, 0]} distanceFactor={10*5} occlude="blending">
                                    <div className="octoprintApi_temps">
                                        <Line data={chartData} options={{
                                            plugins: {
                                                title: {
                                                    display: true,
                                                    text: "Printer temperatures"
                                                },
                                                legend: {
                                                    display: true
                                                }
                                            }
                                        }} />
                                    </div>
                                </Html>
                            </>);
                        });
                    }, 1000);
                }
            });
        }else if(resource == "printingFile"){
            let printingFileTemp = "";
            url = config.host + "/api/job?apikey=" + config.apikey;;
            jQuery.get(url, function(data){
                if(data.state == "Printing"){
                    url = config.host + "/downloads/files/local/" + data.job.file.path + "?apikey=" + config.apikey;
                    printingFileTemp = data.job.file.path;
                }else{
                    setRender(<>
                        <mesh position={[config.printer.x/2, 0, -config.printer.y/2]} rotation={[-Math.PI/2, 0, 0]} scale={[config.printer.x, config.printer.z, config.printer.y]}>
                            <planeGeometry />
                            <meshBasicMaterial map={printerBedTexture} />
                        </mesh>
                    </>);
                }
            }).fail(function(){
                setRender(<>
                    <mesh position={[config.printer.x/2, 0, -config.printer.y/2]} rotation={[-Math.PI/2, 0, 0]} scale={[config.printer.x, config.printer.z, config.printer.y]}>
                        <planeGeometry />
                        <meshBasicMaterial map={printerBedTexture} />
                    </mesh>
                </>);
            }).then(function(){
                if(url.search("downloads") != -1 && printingFile != printingFileTemp){
                    printingFile = printingFileTemp;
                    const loader = new GCodeLoader();
                    loader.load(url, function(object){
                        object.children[0].material.color = new THREE.Color("#6B9EE1");
                        // object.children[0].material.linewidth = 5;
                        object.children[1].material.color = new THREE.Color("#86F5FA");
                        // object.children[1].material.linewidth = 5;
                        object.children[1].visible = false;
                        setRender(<>
                            <mesh position={[config.printer.x/2, 0, -config.printer.y/2]} rotation={[-Math.PI/2, 0, 0]} scale={[config.printer.x, config.printer.z, config.printer.y]}>
                                <planeGeometry />
                                <meshBasicMaterial map={printerBedTexture} />
                            </mesh>
                            <primitive object={object} />
                        </>);
                    });
                }
            });
        }
    }, [render]);
    return <>{render}</>;
};
