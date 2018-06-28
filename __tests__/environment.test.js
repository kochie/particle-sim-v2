import Environment from '../src/scripts/components/environment';

describe('Environment', () => {
  it('should create class', () => {
    const env = new Environment({
      scene: { add: jest.fn() },
      camera: jest.fn(),
      renderer: {
        setPixelRatio: jest.fn(),
        setSize: jest.fn(),
        setClearColor: jest.fn(),
        domElement: document.createElement('div'),
      },
      stats: jest.fn(),
    });
    expect(env).toBeDefined();
  });
});
