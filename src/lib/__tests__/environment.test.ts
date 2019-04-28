import Environment from '../environment';
import { Scene, PerspectiveCamera } from 'three';

function createEnv(): Environment {
 return new Environment({
      scene: new Scene(),
      camera: new PerspectiveCamera(),
      renderer: {
        setPixelRatio: jest.fn(),
        setSize: jest.fn(),
        setClearColor: jest.fn(),
        domElement: document.createElement('div'),
      },
      stats: jest.fn(),
    });
}

describe('Environment', (): void => {
  it('should create class', ():void => {
    const env = createEnv()
    expect(env).toBeDefined();
  });

});
