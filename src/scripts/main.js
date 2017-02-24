/**
 * Created by Robert Koch on 12/15/16.
 * https://threejs.org/docs/scenes/geometry-browser.html#TorusKnotBufferGeometry
 */


class Environment {
    constructor(options){
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.scene = options.scene;
        this.camera = options.camera;
        this.renderer = options.renderer;
        this.stats = options.stats;
        this.stepTime = 100;
        this.cameraStart = {};
        this.particleGroup = new ParticleGroup(this);
        this.ringGroup = new RingGroup(this);

        this.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor( 0x000000, 1 );
        document.body.appendChild(this.renderer.domElement);

        this.magneticField = new Field(
            function(x,y,z){
                return Math.sin(x)*y+z;
            },
            function(x,y,z){
                return Math.sin(x)*y;
            },
            function(x,y,z){
                return 0;
            }
        );

        this.electricField = new Field();
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
    // TWEEN.update();

    env.stats.begin();
    env.controls.update();
    env.renderer.render(env.scene, env.camera);
    env.stats.end();
}

function animate(env){
    env.particleGroup.calculateForceAll(env);
    env.particleGroup.updatePositionAll();
}

render(init());
