/**
 * Created by rkoch on 12/28/16.
 */

function randomParticles(env, t){
    for (let i = 0; i < t; i++){
        if (randInteger(t) > 0){
            new Electron(env, new THREE.Vector3(randInteger(t), randInteger(t), randInteger(t)));
        }
        else{
            new Proton(env, new THREE.Vector3(randInteger(t), randInteger(t), randInteger(t)));
        }
    }
}

function randInteger(x){
    return Math.round(Math.random()*(2*x)-x)
}