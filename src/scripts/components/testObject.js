/**
 * Created by rkoch on 12/23/16.
 */


function createTestObject(){
    const mesh = new THREE.Object3D();

    const geometry = new THREE.TorusBufferGeometry(10, 3, 50, 50);

    mesh.add( new THREE.LineSegments(
        new THREE.WireframeGeometry(geometry),
        new THREE.LineBasicMaterial( {
            color: 0xffffff,
            transparent: true,
            opacity: 0.5
        } )

    ) );

    mesh.add( new THREE.Mesh(
        geometry,
        new THREE.MeshPhongMaterial( {
            color: 0x156289,
            emissive: 0x072534,
            side: THREE.DoubleSide,
            shading: THREE.FlatShading
        } )

    ) );

    return mesh;
}