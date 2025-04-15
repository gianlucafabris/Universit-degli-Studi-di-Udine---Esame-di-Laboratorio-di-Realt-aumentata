function OctoprintApi(resource){
    let url = config.host + "/api/server?apikey=" + config.apikey;
    let apiConnectionInterval;
    let apiJobInterval;
    let apiTempsInterval;
    let apiPrintingFileInterval;
    let statusConn = "";
    let statusJob = "";
    let statusPrintingFile = "";
    let tempsChart;
    let printingFile = "";

    if(resource == "connection"){
        apiConnectionInterval = setInterval(function(){
            url = config.host + "/api/connection?apikey=" + config.apikey;
            jQuery.get(url, function(data){
                if(data.current.state != statusConn){
                    statusConn = data.current.state;
                    $("a-entity#entityConnection").remove();
                    if(data.current.state == "Closed"){
                        $("a-marker").append('<a-entity id="entityConnection" htmlembed scale="0.5 0.5 0.5" position="-1.5 1 0" rotation="0 0 0">\
                            <div class="octoprintApi_connection">\
                                <p>Not connected to any printer</p>\
                            </div>\
                        </a-entity>');
                    }else{
                        $("a-marker").append('<a-entity id="entityConnection" htmlembed scale="0.5 0.5 0.5" position="-1.5 1 0" rotation="0 0 0">\
                            <div class="octoprintApi_connection">\
                                <p>Connected to ' + data.current.printerProfile + '</p>\
                                <div class="octoprintApi_connection_state">' + data.current.state + '</div>\
                            </div>\
                        </a-entity>');
                    }
                }
            }).fail(function(){
                if(statusConn != "OctoprintApiFail"){
                    statusConn = "OctoprintApiFail";
                    $("a-entity#entityConnection").remove();
                    $("a-marker").append('<a-entity id="entityConnection" htmlembed scale="0.5 0.5 0.5" position="-1.5 1 0" rotation="0 0 0">\
                        <div class="octoprintApi_connection">\
                            <p>There is no octoprint server available at ' + config.host + '</p>\
                        </div>\
                    </a-entity>');
                }
            });
        }, 1000);
    }else if(resource == "job"){
        apiJobInterval = setInterval(function(){
            url = config.host + "/api/job?apikey=" + config.apikey;
            jQuery.get(url, function(data){
                if(data.state != "Offline"){
                    if(data.state != statusJob){
                        statusJob = data.state;
                        $("a-entity#entityJob").remove();
                        if(data.state == "Operational"){
                            $("a-marker").append('<a-entity id="entityJob" htmlembed scale="0.5 0.5 0.5" position="-1.5 0.25 0" rotation="0 0 0">\
                                <div class="octoprintApi_job">\
                                    <p class="octoprintApi_job_state">' + data.state + '</p>\
                                </div>\
                            </a-entity>');
                        }else{
                            $("a-marker").append('<a-entity id="entityJob" htmlembed scale="0.5 0.5 0.5" position="-1.5 0.25 0" rotation="0 0 0">\
                                <div class="octoprintApi_job">\
                                    <p class="octoprintApi_job_state">' + data.state + '</p>\
                                    <div class="octoprintApi_job_progress">\
                                        <span style="text-align: left">' + data.progress.printTime + 's passed</span>\
                                        <span style="text-align: center">total ' + data.job.estimatedPrintTime + 's</span>\
                                        <span style="text-align: right">' + data.progress.printTimeLeft + 's left</span>\
                                        <div class="octoprintApi_job_progress_bar">\
                                            <div class="octoprintApi_job_progress_bar_bar" style="width: ' + data.progress.completion + '%"></div>\
                                        </div>\
                                    </div>\
                                </div>\
                            </a-entity>');
                        }
                    }
                }else{
                    $("a-entity#entityJob").remove();
                }
            }).fail(function(){
                $("a-entity#entityJob").remove();
            });
        }, 1000);
    }else if(resource == "temps"){
        apiTempsInterval = setInterval(function(){
            url = config.host + "/api/connection?apikey=" + config.apikey;
            jQuery.get(url, function(data){
                if(data.current.state != "Closed"){
                    url = config.host + "/api/printer?history=true&limit=3600&apikey=" + config.apikey;
                }else{
                    if(tempsChart != undefined){
                        tempsChart.destroy();
                    }
                    $("a-entity#entityTemps").remove();
                }
            }).fail(function(){
                if(tempsChart != undefined){
                    tempsChart.destroy();
                }
                $("a-entity#entityTemps").remove();
            }).then(function(){
                if(url.search("printer") != -1){
                    jQuery.get(url, function(data){
                        const chartData = {
                            labels: data.temperature.history.map(function(data){return new Date(data.time*1000).getHours() + ":" + new Date(data.time*1000).getMinutes() + ":" + new Date(data.time*1000).getSeconds();}),
                            datasets: [
                                {
                                    label: "E0",
                                    data: data.temperature.history.map(function(data){return data.tool0 ? data.tool0.actual : 0.0;}),
                                    backgroundColor: "#6B9EE1",
                                    borderColor: "#6B9EE1",
                                    borderWidth: 1,
                                    fill: false
                                },
                                {
                                    label: "E0 target",
                                    data: data.temperature.history.map(function(data){return data.tool0 ? data.tool0.target : 0.0;}),
                                    backgroundColor: "#567EB4",
                                    borderColor: "#567EB4",
                                    borderWidth: 1,
                                    fill: false
                                },
                                {
                                    label: "B",
                                    data: data.temperature.history.map(function(data){return data.bed ? data.bed.actual : 0.0;}),
                                    backgroundColor: "#86F5FA",
                                    borderColor: "#86F5FA",
                                    borderWidth: 1,
                                    fill: false
                                },
                                {
                                    label: "B target",
                                    data: data.temperature.history.map(function(data){return data.bed ? data.bed.target : 0.0;}),
                                    backgroundColor: "#6BC4C8",
                                    borderColor: "#6BC4C8",
                                    borderWidth: 1,
                                    fill: false
                                }
                            ]
                        };
                        if(tempsChart == undefined){
                            $("a-marker").append('<a-entity id="entityTemps" htmlembed scale="1 1 1" position="0.5 0.5 1" rotation="0 -90 0">\
                                <div class="octoprintApi_temps">\
                                    <canvas id="tempsChart" width=300 height=200></canvas>\
                                </div>\
                            </a-entity>');
                            tempsChart = new Chart("tempsChart", {
                                type: "line",
                                data: chartData,
                                options: {
                                    plugins: {
                                        title: {
                                            display: true,
                                            text: "Printer temperatures"
                                        },
                                        legend: {
                                            display: true
                                        }
                                    }
                                }
                            });
                        }else{
                            tempsChart.data = chartData;
                            tempsChart.update();
                        }
                    });
                }
            });
        }, 1000);
    }else if(resource == "printingFile"){
        apiPrintingFileInterval = setInterval(function(){
            let printingFileTemp = "";
            url = config.host + "/api/job?apikey=" + config.apikey;;
            jQuery.get(url, function(data){
                if(data.state != statusPrintingFile){
                    statusPrintingFile = data.state;
                    if(data.state == "Printing"){
                        url = config.host + "/downloads/files/local/" + data.job.file.path + "?apikey=" + config.apikey;
                        printingFileTemp = data.job.file.path;
                    }else{
                        $("a-entity#entityPrintingFile").remove();
                        $("a-marker").append('<a-entity id="entityPrintingFile" htmlembed scale="1 1 1" position="-0.5 0 0" rotation="0 0 0">\
                            <a-image src="img/prusa mini bed.png" rotation="-90 0 0"></a-image>\
                        </a-entity>');
                    }
                }
            }).fail(function(){
                if(statusPrintingFile != "OctoprintApiFail"){
                    statusPrintingFile = "OctoprintApiFail";
                    $("a-entity#entityPrintingFile").remove();
                    $("a-marker").append('<a-entity id="entityPrintingFile" htmlembed scale="1 1 1" position="-0.5 0 0" rotation="0 0 0">\
                        <a-image src="img/prusa mini bed.png" rotation="-90 0 0"></a-image>\
                    </a-entity>');
                }
            }).then(function(){
                if(url.search("downloads") != -1 && printingFile != printingFileTemp){
                    printingFile = printingFileTemp;
                    $("a-entity#entityPrintingFile").remove();
                    $("a-marker").append('<a-entity id="entityPrintingFile" htmlembed scale="1 1 1" position="-0.5 0 0" rotation="0 0 0">\
                        <a-image src="img/prusa mini bed.png" rotation="-90 0 0"></a-image>\
                    </a-entity>');
                    const loader = new GCodeLoader();
                    loader.load(url, function(object){
                        object.children[0].material.color = new THREE.Color("#6B9EE1");
                        // object.children[0].material.linewidth = 5;
                        object.children[1].material.color = new THREE.Color("#86F5FA");
                        // object.children[1].material.linewidth = 5;
                        object.children[1].visible = false;
                        delete AFRAME.components['gcode'];
                        AFRAME.registerComponent('gcode', {
                            init: function () {
                                this.el.setObject3D('mesh', object.mesh);
                                this.el.setObject3D('material', object.material);
                                this.el = object;
                            },
                            remove: function () {
                                this.el.removeObject3D('mesh');
                            }
                        });
                        $("a-entity#entityPrintingFile").append('<a-entity gcode></a-entity>');
                    });
                }
            });
        }, 1000);
    }
}
