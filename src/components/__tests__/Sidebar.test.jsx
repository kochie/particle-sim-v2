import renderer from 'react-test-renderer';
import React from 'react';

import Sidebar from '../Sidebar';

function init(props) {
  const instance = renderer.create(<Sidebar {...props} />);
  return { instance };
}

describe('sidebar react component', () => {
  it('should render and match snapshot', () => {
    const { instance } = init();
    expect(instance).toMatchSnapshot();
  });
});
