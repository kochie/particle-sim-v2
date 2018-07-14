import renderer from 'react-test-renderer';
import React from 'react';

import Overlay from '../Overlay';

function init(props) {
  const instance = renderer.create(<Overlay {...props} />);
  return { instance };
}

describe('overlay react component', () => {
  it('should render and match snapshot', () => {
    const { instance } = init();
    expect(instance).toMatchSnapshot();
  });
});
