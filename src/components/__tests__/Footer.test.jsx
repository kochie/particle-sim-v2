import renderer from 'react-test-renderer';
import React from 'react';

import Footer from '../Footer';

function init(props) {
  const instance = renderer.create(<Footer {...props} />);
  return { instance };
}

describe('footer react component', () => {
  it('should render and match snapshot', () => {
    const { instance } = init();
    expect(instance).toMatchSnapshot();
  });
});
