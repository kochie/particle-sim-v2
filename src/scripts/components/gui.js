/**
 * Created by rkoch on 1/1/17.
 */

function placeParticle(env){
    let x = new THREE.Vector3(randInteger(5),randInteger(5),randInteger(5));
    console.log(randInteger(1));
    if (randInteger(1)>0){
        new Proton(env, x);
    }
    else {
        new Electron(env, x);
    }

}