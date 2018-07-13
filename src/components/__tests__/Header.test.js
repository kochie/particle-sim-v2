import Header from '../Header.jsx';

function init(props) {
	const instance = <Header {...props}/>
	return {instance}
}

describe('header react component', () => {
	it('should render and match snapshot', () => {
		const {instance} = init();
		expect(instance).toMatchSnapshot();
	});
});