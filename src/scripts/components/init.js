/**
 * Created by rkoch on 12/23/16.
 */

function init(){
    const env = new Environment({
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000),
        renderer: new THREE.WebGLRenderer({ antialias: true }),
        stats: new Stats()
    });

    env.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(env.stats.dom);

    // const mesh = createTestObject();

    // const geometry = new THREE.WireframeGeometry(new THREE.TorusGeometry(10, 3, 16, 100));
    // const material = new THREE.MeshBasicMaterial({
    //     color: 0xffff00,
    //     wireframe: true
    // });
    // const cube = new THREE.Mesh(geometry, material);

    // env.scene.add(mesh);
    // env.meshObjects.push(mesh);

    env.controls = new THREE.TrackballControls(env.camera, env.renderer.domElement);
    env.controls.enableDamping = true;
    env.controls.dampingFactor = 0.1;
    env.controls.enableZoom = false;
    env.controls.rotateSpeed = 8;

    positionCamera(env, new THREE.Vector3(20,20,20));

    env.cameraStart.position = env.camera.position.clone();
    env.cameraStart.target = env.controls.target.clone();
    env.cameraStart.up = env.camera.up.clone();

    env.setAnimation(animate);

    const FizzyText = function() {
        this.speed = 0;
        this.resetCamera = function(){
            resetCamera(env);
        };
        this.moveCamera = function(){
            moveCamera(env);
        }
    };
    // const lights = [];
    // lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
    // lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
    // lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );
    //
    // lights[ 0 ].position.set( 0, 200, 0 );
    // lights[ 1 ].position.set( 100, 200, 100 );
    // lights[ 2 ].position.set( - 100, - 200, - 100 );
    //
    // env.scene.add( lights[ 0 ] );
    // env.scene.add( lights[ 1 ] );
    // env.scene.add( lights[ 2 ] );

    const light = new THREE.AmbientLight( 0xffffff ); // soft white light
    env.scene.add( light );

    const directionalLight1 = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight1.position.set( 0, 1, 0 );
    env.scene.add( directionalLight1 );

    const directionalLight2 = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight2.position.set( 0, -1, 0 );
    env.scene.add( directionalLight2 );

    window.addEventListener('mousemove', function(event){
        onMouseMove(event, env);
    }, false);
    document.addEventListener('dblclick', function(){
        objectClick(env)
    }, false);


    // new Neutron(env, new THREE.Vector3(-4,0,4));
    new Proton(env, new THREE.Vector3(5,5,5));
    new Electron(env, new THREE.Vector3(10,10,10));


    window.onload = function() {
        env.text = new FizzyText();
        env.gui = new dat.GUI();
        env.speedController = env.gui.add(env.text, 'speed', 0, 100, 2).listen();
        env.gui.add(env.text, 'resetCamera');
        env.gui.add(env.text, 'moveCamera');

        env.speedController.onChange(function(value) {
            env.stepTime = 100 - value;
            env.setAnimation(animate);
        });

        setTimeout(function(){
            env.stepTime = 100;
            env.text.speed = 100 - env.stepTime;
            env.setAnimation(animate)
        },5000);
    };

    window.addEventListener('resize', function(){
        onWindowResize(env);
    }, false );

    const axes = buildAxes();
    env.scene.add(axes);

    return env;
}