$(function(){
    $("#root").html('<a-scene vr-mode-ui="enabled: false;" loading-screen="enabled: false;" arjs="trackingMethod: best; sourceType: webcam; debugUIEnabled: false;" embedded>\
        <a-marker type="pattern" preset="custom" url="marker/3d printer marker.patt" size="0.18"></a-marker>\
        <a-entity camera></a-entity>\
    </a-scene>');

    OctoprintApi("connection");
    OctoprintApi("job");
    OctoprintApi("temps");
    OctoprintApi("printingFile");
});
