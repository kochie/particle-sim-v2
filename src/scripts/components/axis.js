/**
 * Created by rkoch on 12/23/16.
 */

function buildAxes() {
    const axes = new THREE.Object3D();
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1000, 0, 0), 0xFF0000, false)); // +X
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-1000, 0, 0), 0x800000, true)); // -X
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1000, 0), 0x00FF00, false)); // +Y
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1000, 0), 0x008000, true)); // -Y
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1000), 0x0000FF, false)); // +Z
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1000), 0x000080, true)); // -Z
    return axes;
}

function buildAxis( src, dst, colorHex, dashed ) {
    const geom = new THREE.Geometry();
    let mat;

    if(dashed) {
        mat = new THREE.LineDashedMaterial({ linewidth: 1, color: colorHex, dashSize: 5, gapSize: 5 });
    } else {
        mat = new THREE.LineBasicMaterial({ linewidth: 1, color: colorHex });
    }

    geom.vertices.push( src.clone() );
    geom.vertices.push( dst.clone() );

    return new THREE.Line( geom, mat );
}