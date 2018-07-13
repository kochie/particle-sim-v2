import Footer from '../Footer';

function init(props) {
	const instance = <Footer {...props}/>
	return {instance}
}

describe('footer react component', () => {
	it('should render and match snapshot', () => {
		const {instance} = init();
		expect(instance).toMatchSnapshot();
	});
});