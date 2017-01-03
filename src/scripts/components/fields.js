/**
 * Created by rkoch on 1/2/17.
 */

class Field{
    constructor(fn_x = function(x,y,z){return 0}, fn_y = function(x,y,z){return 0}, fn_z = function(x,y,z){return 0}){
        this.fn_x = fn_x;
        this.fn_y = fn_y;
        this.fn_z = fn_z;
    }

    getValue(position){
        return new THREE.Vector3(
            this.fn_x(position.x,position.y,position.z),
            this.fn_y(position.x,position.y,position.z),
            this.fn_z(position.x,position.y,position.z)
        );
    }
}
