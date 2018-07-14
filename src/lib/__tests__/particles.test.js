import { Particle } from '../particle';

describe('particles', () => {
  it('should create a particle', () => {
    const p = new Particle();
    expect(p).toBeDefined();
  });
});
