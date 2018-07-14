import renderer from 'react-test-renderer';
import React from 'react';

import Canvas from '../Canvas';


jest.mock('../../lib/init', () => jest.fn(() => ({
  stats: {
    begin: jest.fn(),
    end: jest.fn(),
  },
  controls: {
    update: jest.fn(),
  },
  renderer: {
    render: jest.fn(),
  },
})));

function init(props) {
  const instance = renderer.create(<Canvas {...props} />);
  return { instance };
}

describe('canvas react component', () => {
  it('should render and match snapshot', () => {
    const { instance } = init();
    expect(instance).toMatchSnapshot();
  });
});
