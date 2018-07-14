import renderer from 'react-test-renderer';
import React from 'react';

import Start from '../Start';

function init(props) {
  const instance = renderer.create(<Start {...props} />);
  return { instance };
}

describe('start react component', () => {
  it('should render and match snapshot', () => {
    const { instance } = init();
    expect(instance).toMatchSnapshot();
  });
});
