import Overlay from '../Overlay.jsx';

function init(props) {
	const instance = <Overlay {...props}/>
	return {instance}
}

describe('overlay react component', () => {
	it('should render and match snapshot', () => {
		const {instance} = init();
		expect(instance).toMatchSnapshot();
	});
});