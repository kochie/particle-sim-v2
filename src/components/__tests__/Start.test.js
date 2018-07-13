import Sidebar from '../Sidebar';

function init(props) {
	const instance = <Sidebar {...props}/>
	return {instance}
}

describe('sidebar react component', () => {
	it('should render and match snapshot', () => {
		const {instance} = init();
		expect(instance).toMatchSnapshot();
	});
});