/**
 * Created by Robert Koch on 12/15/16.
 */
class Environment {
    constructor(options){
        this.scene = options.scene;
        this.camera = options.camera;
        this.renderer = options.renderer;
        this.meshObjects = [];
        this.stats = options.stats;
        this.stepTime = 1;
        this.cameraOriginalPosition = {};

        this.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    setAnimation(animation){
        const self = this;
        if (typeof this.intervalId === "undefined"){}
        else{
            clearInterval(this.intervalId);
        }
        if (this.stepTime == 50){

        }
        else{
            this.intervalId = setInterval(function(){
                animation(self);
            }, this.stepTime)
        }
    }
}

function init(){
    const env = new Environment({
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000),
        renderer: new THREE.WebGLRenderer(),
        stats: new Stats()
    });

    env.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(env.stats.dom);
    env.controls = new THREE.TrackballControls(env.camera, env.renderer.domElement);
    env.controls.enableDamping = true;
    env.controls.dampingFactor = 0.25;
    env.controls.enableZoom = false;
    env.controls.rotateSpeed = 8;





    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        wireframe: true
    });
    const cube = new THREE.Mesh(geometry, material);

    env.scene.add(cube);
    env.meshObjects.push(cube);

    env.camera.position.z = 5;
    env.cameraOriginalPosition.position = env.camera.position.clone();
    env.cameraOriginalPosition.rotation = env.camera.rotation.clone();
    //env.cameraOriginalPosition.controlCenter = env.camera.center.clone();

    env.setAnimation(animate);

    const FizzyText = function() {
        this.speed = 6;
        this.resetCamera = function(){
            resetCamera(env);
        }
    };

    window.onload = function() {
        env.text = new FizzyText();
        env.gui = new dat.GUI();
        env.speedController = env.gui.add(env.text, 'speed', 0, 50, 2).listen();
        env.gui.add(env.text, 'resetCamera');

        env.speedController.onChange(function(value) {
            env.stepTime = 50 - value;
            env.setAnimation(animate);
        });

        setTimeout(function(){
            env.stepTime = 100;
            env.text.speed = env.stepTime;
            env.setAnimation(animate)
        },5000);
    };

    window.addEventListener('resize', function(){
        onWindowResize(env);
    }, false );

    return env;
}

function render(env){
    window.requestAnimationFrame(()=>{
        render(env);
    });
    env.stats.begin();
    env.controls.update();
    env.renderer.render(env.scene, env.camera);
    env.stats.end();
}

function animate(env){
    env.meshObjects[0].rotation.y += 0.05;
    //env.meshObjects[0].rotation.z += 0.2;
}

function onWindowResize(env) {
    env.camera.aspect = window.innerWidth / window.innerHeight;
    env.camera.updateProjectionMatrix();
    env.renderer.setSize( window.innerWidth, window.innerHeight );
}

function resetCamera(env){
    env.camera.position.set(
        env.cameraOriginalPosition.position.x,
        env.cameraOriginalPosition.position.y,
        env.cameraOriginalPosition.position.z
    );
    env.camera.rotation.set(
        env.cameraOriginalPosition.rotation.x,
        env.cameraOriginalPosition.rotation.y,
        env.cameraOriginalPosition.rotation.z
    );
    // env.controls.center.set(
    //     env.cameraOriginalPosition.controlCenter.x,
    //     env.cameraOriginalPosition.controlCenter.y,
    //     env.cameraOriginalPosition.controlCenter.z
    // );
    controls.update();


}


render(init());
