import renderer from 'react-test-renderer';
import React from 'react';

import Header from '../Header';

function init(props) {
  const instance = renderer.create(<Header {...props} />);
  return { instance };
}

describe('header react component', () => {
  it('should render and match snapshot', () => {
    const { instance } = init();
    expect(instance).toMatchSnapshot();
  });
});
