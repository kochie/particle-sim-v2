/**
 * Created by Robert Koch on 12/15/16.
 * https://threejs.org/docs/scenes/geometry-browser.html#TorusKnotBufferGeometry
 */


class Environment {
    constructor(options){
        this.scene = options.scene;
        this.camera = options.camera;
        this.renderer = options.renderer;
        this.meshObjects = [];
        this.stats = options.stats;
        this.stepTime = 1;
        this.cameraStart = {};
        this.particles = [];

        this.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor( 0x000000, 1 );
        document.body.appendChild(this.renderer.domElement);
    }

    setAnimation(animation){
        const _this = this;
        if (typeof this.intervalId === "undefined"){}
        else{
            clearInterval(this.intervalId);
        }
        if (this.stepTime == 100){

        }
        else{
            this.intervalId = setInterval(function(){
                animation(_this);
            }, this.stepTime)
        }
    }
}



function render(env){
    window.requestAnimationFrame(()=>{
        render(env);
    });
    //console.log(env.camera.getWorldDirection());
    TWEEN.update();

    env.stats.begin();
    env.controls.update();
    env.renderer.render(env.scene, env.camera);
    env.stats.end();
}

function animate(env){
    env.meshObjects[0].rotation.y += 0.05;
    env.meshObjects[0].rotation.x += 0.05;
    env.particles[0].calcForce();
    env.particles[0].calcAcceleration();
    env.particles[0].calcVelocity(0.1);
    env.particles[0].calcPosition(0.1);
    env.particles[0].setPosition();
    //env.camera.rotation.x += 0.01;
    //env.meshObjects[0].rotation.z += 0.2;
    // console.log(env.particles[0].mesh.position)
}








render(init());
