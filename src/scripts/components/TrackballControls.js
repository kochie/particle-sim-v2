/**
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin / http://mark-lundin.com
 * @author Simone Manini / http://daron1337.github.io
 * @author Luca Antiga / http://lantiga.github.io
 */

import {
  Quaternion, Vector3, Vector2, EventDispatcher,
} from 'three';

const STATE = {
  NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4,
};

const EPS = 0.000001;
const lastPosition = new Vector3();

const eye = new Vector3();

const movePrev = new Vector2();
const moveCurr = new Vector2();

const lastAxis = new Vector3();
let lastAngle = 0;

const zoomStart = new Vector2();
const zoomEnd = new Vector2();

const panStart = new Vector2();
const panEnd = new Vector2();

const changeEvent = { type: 'change' };
const startEvent = { type: 'start' };
const endEvent = { type: 'end' };

let touchZoomDistanceStart = 0;
let touchZoomDistanceEnd = 0;

let state = STATE.NONE;
let prevState = STATE.NONE;

export default class TrackballControls extends EventDispatcher {
  constructor(object, domElement) {
    super();
    this.object = object;
    this.domElement = (domElement !== undefined) ? domElement : document;
    this.enabled = true;

    this.screen = {
      left: 0, top: 0, width: 0, height: 0,
    };

    this.rotateSpeed = 1.0;
    this.zoomSpeed = 1.2;
    this.panSpeed = 0.3;

    this.noRotate = false;
    this.noZoom = false;
    this.noPan = false;

    this.staticMoving = false;
    this.dynamicDampingFactor = 0.2;

    this.minDistance = 0;
    this.maxDistance = Infinity;

    this.keys = [65 /* A */, 83 /* S */, 68];

    // internals

    this.target = new Vector3();
    // for reset

    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.up0 = this.object.up.clone();

    this.getMouseOnScreen = this.getMouseOnScreen();
    this.getMouseOnCircle = this.getMouseOnCircle();
    this.rotateCamera = this.rotateCamera();
    this.panCamera = this.panCamera();

    this.domElement.addEventListener('contextmenu', this.contextmenu, false);
    this.domElement.addEventListener('mousedown', this.mousedown, false);
    this.domElement.addEventListener('wheel', this.mousewheel, false);

    this.domElement.addEventListener('touchstart', this.touchstart, false);
    this.domElement.addEventListener('touchend', this.touchend, false);
    this.domElement.addEventListener('touchmove', this.touchmove, false);

    window.addEventListener('keydown', this.keydown, false);
    window.addEventListener('keyup', this.keyup, false);

    this.handleResize();

    // force an update at start
    this.update();
  }

  handleResize() {
    if (this.domElement === document) {
      this.screen.left = 0;
      this.screen.top = 0;
      this.screen.width = window.innerWidth;
      this.screen.height = window.innerHeight;
    } else {
      const box = this.domElement.getBoundingClientRect();
      // adjustments come from similar code in the jquery offset() function
      const d = this.domElement.ownerDocument.documentElement;
      this.screen.left = box.left + window.pageXOffset - d.clientLeft;
      this.screen.top = box.top + window.pageYOffset - d.clientTop;
      this.screen.width = box.width;
      this.screen.height = box.height;
    }
  }

  handleEvent(event) {
    if (typeof this[event.type] === 'function') {
      this[event.type](event);
    }
  }

  getMouseOnScreen() {
    const vector = new Vector2();

    return (pageX, pageY) => {
      vector.set(
        (pageX - this.screen.left) / this.screen.width,
        (pageY - this.screen.top) / this.screen.height,
      );

      return vector;
    };
  }

  getMouseOnCircle() {
    const vector = new Vector2();

    return (pageX, pageY) => {
      vector.set(
        ((pageX - this.screen.width * 0.5 - this.screen.left) / (this.screen.width * 0.5)),
        ((this.screen.height + 2
            * (this.screen.top - pageY)) / this.screen.width), // screen.width intentional
      );

      return vector;
    };
  }

  rotateCamera() {
    const axis = new Vector3();
    const quaternion = new Quaternion();
    const eyeDirection = new Vector3();
    const objectUpDirection = new Vector3();
    const objectSidewaysDirection = new Vector3();
    const moveDirection = new Vector3();
    let angle;

    return () => {
      moveDirection.set(moveCurr.x - movePrev.x, moveCurr.y - movePrev.y, 0);
      angle = moveDirection.length();

      if (angle) {
        eye.copy(this.object.position).sub(this.target);

        eyeDirection.copy(eye).normalize();
        objectUpDirection.copy(this.object.up).normalize();
        objectSidewaysDirection.crossVectors(objectUpDirection, eyeDirection).normalize();

        objectUpDirection.setLength(moveCurr.y - movePrev.y);
        objectSidewaysDirection.setLength(moveCurr.x - movePrev.x);

        moveDirection.copy(objectUpDirection.add(objectSidewaysDirection));

        axis.crossVectors(moveDirection, eye).normalize();

        angle *= this.rotateSpeed;
        quaternion.setFromAxisAngle(axis, angle);

        eye.applyQuaternion(quaternion);
        this.object.up.applyQuaternion(quaternion);

        lastAxis.copy(axis);
        lastAngle = angle;
      } else if (!this.staticMoving && lastAngle) {
        lastAngle *= Math.sqrt(1.0 - this.dynamicDampingFactor);
        eye.copy(this.object.position).sub(this.target);
        quaternion.setFromAxisAngle(lastAxis, lastAngle);
        eye.applyQuaternion(quaternion);
        this.object.up.applyQuaternion(quaternion);
      }

      movePrev.copy(moveCurr);
    };
  }

  zoomCamera() {
    let factor;

    if (state === STATE.TOUCH_ZOOM_PAN) {
      factor = touchZoomDistanceStart / touchZoomDistanceEnd;
      touchZoomDistanceStart = touchZoomDistanceEnd;
      eye.multiplyScalar(factor);
    } else {
      factor = 1.0 + (zoomEnd.y - zoomStart.y) * this.zoomSpeed;

      if (factor !== 1.0 && factor > 0.0) {
        eye.multiplyScalar(factor);
      }

      if (this.staticMoving) {
        zoomStart.copy(zoomEnd);
      } else {
        zoomStart.y += (zoomEnd.y - zoomStart.y) * this.dynamicDampingFactor;
      }
    }
  }

  panCamera() {
    const mouseChange = new Vector2();
    const objectUp = new Vector3();
    const pan = new Vector3();

    return () => {
      mouseChange.copy(panEnd).sub(panStart);

      if (mouseChange.lengthSq()) {
        mouseChange.multiplyScalar(eye.length() * this.panSpeed);

        pan.copy(eye).cross(this.object.up).setLength(mouseChange.x);
        pan.add(objectUp.copy(this.object.up).setLength(mouseChange.y));

        this.object.position.add(pan);
        this.target.add(pan);

        if (this.staticMoving) {
          panStart.copy(panEnd);
        } else {
          panStart.add(
            mouseChange.subVectors(panEnd, panStart).multiplyScalar(this.dynamicDampingFactor),
          );
        }
      }
    };
  }

  checkDistances() {
    if (!this.noZoom || !this.noPan) {
      if (eye.lengthSq() > this.maxDistance * this.maxDistance) {
        this.object.position.addVectors(this.target, eye.setLength(this.maxDistance));
        zoomStart.copy(zoomEnd);
      }

      if (eye.lengthSq() < this.minDistance * this.minDistance) {
        this.object.position.addVectors(this.target, eye.setLength(this.minDistance));
        zoomStart.copy(zoomEnd);
      }
    }
  }

  update() {
    eye.subVectors(this.object.position, this.target);

    if (!this.noRotate) {
      this.rotateCamera();
    }

    if (!this.noZoom) {
      this.zoomCamera();
    }

    if (!this.noPan) {
      this.panCamera();
    }

    this.object.position.addVectors(this.target, eye);

    this.checkDistances();

    this.object.lookAt(this.target);

    if (lastPosition.distanceToSquared(this.object.position) > EPS) {
      this.dispatchEvent(changeEvent);

      lastPosition.copy(this.object.position);
    }
  }

  reset() {
    state = STATE.NONE;
    prevState = STATE.NONE;

    this.target.copy(this.target0);
    this.object.position.copy(this.position0);
    this.object.up.copy(this.up0);

    eye.subVectors(this.object.position, this.target);

    this.object.lookAt(this.target);

    this.dispatchEvent(changeEvent);

    lastPosition.copy(this.object.position);
  }

  keydown(event) {
    if (this.enabled === false) return;

    window.removeEventListener('keydown', this.keydown);

    prevState = state;

    if (state === STATE.NONE) {
      if (event.keyCode === this.keys[STATE.ROTATE] && !this.noRotate) {
        state = STATE.ROTATE;
      } else if (event.keyCode === this.keys[STATE.ZOOM] && !this.noZoom) {
        state = STATE.ZOOM;
      } else if (event.keyCode === this.keys[STATE.PAN] && !this.noPan) {
        state = STATE.PAN;
      }
    }
  }

  keyup() {
    if (this.enabled === false) return;

    state = prevState;

    window.addEventListener('keydown', this.keydown, false);
  }

  mousemove(event) {
    if (this.enabled === false) return;

    event.preventDefault();
    event.stopPropagation();

    if (state === STATE.ROTATE && !this.noRotate) {
      movePrev.copy(moveCurr);
      moveCurr.copy(this.getMouseOnCircle(event.pageX, event.pageY));
    } else if (state === STATE.ZOOM && !this.noZoom) {
      zoomEnd.copy(this.getMouseOnScreen(event.pageX, event.pageY));
    } else if (state === STATE.PAN && !this.noPan) {
      panEnd.copy(this.getMouseOnScreen(event.pageX, event.pageY));
    }
  }

  mouseup(event) {
    if (this.enabled === false) return;

    event.preventDefault();
    event.stopPropagation();

    state = STATE.NONE;

    document.removeEventListener('mousemove', this.mousemove);
    document.removeEventListener('mouseup', this.mouseup);
    this.dispatchEvent(endEvent);
  }

  mousedown(event) {
    if (this.enabled === false) return;

    event.preventDefault();
    event.stopPropagation();

    if (state === STATE.NONE) {
      state = event.button;
    }

    if (state === STATE.ROTATE && !this.noRotate) {
      moveCurr.copy(this.getMouseOnCircle(event.pageX, event.pageY));
      movePrev.copy(moveCurr);
    } else if (state === STATE.ZOOM && !this.noZoom) {
      zoomStart.copy(this.getMouseOnScreen(event.pageX, event.pageY));
      zoomEnd.copy(zoomStart);
    } else if (state === STATE.PAN && !this.noPan) {
      panStart.copy(this.getMouseOnScreen(event.pageX, event.pageY));
      panEnd.copy(panStart);
    }

    document.addEventListener('mousemove', this.mousemove, false);
    document.addEventListener('mouseup', this.mouseup, false);

    this.dispatchEvent(startEvent);
  }

  mousewheel(event) {
    if (this.enabled === false) return;

    if (this.noZoom === true) return;

    event.preventDefault();
    event.stopPropagation();

    switch (event.deltaMode) {
      case 2:
        // Zoom in pages
        zoomStart.y -= event.deltaY * 0.025;
        break;

      case 1:
        // Zoom in lines
        zoomStart.y -= event.deltaY * 0.01;
        break;

      default:
        // undefined, 0, assume pixels
        zoomStart.y -= event.deltaY * 0.00025;
        break;
    }

    this.dispatchEvent(startEvent);
    this.dispatchEvent(endEvent);
  }

  touchstart(event) {
    if (this.enabled === false) return;

    switch (event.touches.length) {
      case 1: {
        state = STATE.TOUCH_ROTATE;
        moveCurr.copy(this.getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
        movePrev.copy(moveCurr);
        break;
      }

      default: { // 2 or more
        state = STATE.TOUCH_ZOOM_PAN;
        const dx = event.touches[0].pageX - event.touches[1].pageX;
        const dy = event.touches[0].pageY - event.touches[1].pageY;
        touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);
        touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy);

        const x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
        const y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
        panStart.copy(this.getMouseOnScreen(x, y));
        panEnd.copy(panStart);
        break;
      }
    }

    this.dispatchEvent(startEvent);
  }

  touchmove(event) {
    if (this.enabled === false) return;

    event.preventDefault();
    event.stopPropagation();

    switch (event.touches.length) {
      case 1: {
        movePrev.copy(moveCurr);
        moveCurr.copy(this.getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
        break;
      }

      default: { // 2 or more
        const dx = event.touches[0].pageX - event.touches[1].pageX;
        const dy = event.touches[0].pageY - event.touches[1].pageY;
        touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);

        const x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
        const y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
        panEnd.copy(this.getMouseOnScreen(x, y));
        break;
      }
    }
  }

  touchend(event) {
    if (this.enabled === false) return;

    switch (event.touches.length) {
      case 0: {
        state = STATE.NONE;
        break;
      }
      case 1: {
        state = STATE.TOUCH_ROTATE;
        moveCurr.copy(this.getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
        movePrev.copy(moveCurr);
        break;
      }
      default: {
        break;
      }
    }

    this.dispatchEvent(endEvent);
  }

  contextmenu(event) {
    if (this.enabled === false) return;

    event.preventDefault();
  }

  dispose() {
    this.domElement.removeEventListener('contextmenu', this.contextmenu, false);
    this.domElement.removeEventListener('mousedown', this.mousedown, false);
    this.domElement.removeEventListener('wheel', this.mousewheel, false);

    this.domElement.removeEventListener('touchstart', this.touchstart, false);
    this.domElement.removeEventListener('touchend', this.touchend, false);
    this.domElement.removeEventListener('touchmove', this.touchmove, false);

    document.removeEventListener('mousemove', this.mousemove, false);
    document.removeEventListener('mouseup', this.mouseup, false);

    window.removeEventListener('keydown', this.keydown, false);
    window.removeEventListener('keyup', this.keyup, false);
  }
}

// TrackballControls.prototype = Object.create(EventDispatcher.prototype);
// TrackballControls.prototype.constructor = TrackballControls;
