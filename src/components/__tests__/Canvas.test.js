import Canvas from '../Canvas.jsx';

function init(props) {
	const instance = <Canvas {...props}/>
	return {instance}
}

describe('canvas react component', () => {
	it('should render and match snapshot', () => {
		const {instance} = init();
		expect(instance).toMatchSnapshot();
	});
});
