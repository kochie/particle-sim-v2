import Environment from '../src/scripts/components/environment';

describe('Environment', () => {
  it('should create class', () => {
    const env = new Environment({
      scene: jest.fn(),
      camera: jest.fn(),
      renderer: {
        setPixelRatio: jest.fn(),
        setSize: jest.fn(),
        setClearColor: jest.fn(),
        domElement: jest.fn(),
      },
      stats: jest.fn(),
    });
    expect(env).toBeDefined();
  });
});
