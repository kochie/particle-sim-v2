import Field from '../fields'
import { Vector3 } from 'three'

describe('fields test', (): void => {
	it('should create a field', (): void => {
		const field = new Field()
		expect(field).toBeDefined()
	})

	it('should make safe defaults for fields', (): void => {
		const field = new Field()
		expect(field.getValue(new Vector3(1, 1, 1))).toEqual(new Vector3(0, 0, 0))
	})

	it('should get field value', (): void => {
		const field = new Field(
			(x, y, z): number => x + y + z,
			(x, y, z): number => x + y + z,
			(x, y, z): number => x + y + z,
		)

		const x = new Vector3(1, 1, 1)
		expect(field.getValue(x)).toEqual(new Vector3(3, 3, 3))
	})

	it('should get field value at time t', (): void => {
		const field = new Field(
			(x, y, z, t): number => t,
			(x, y, z, t): number => t,
			(x, y, z, t): number => t,
		)

		const x = new Vector3(1, 1, 1)
		expect(field.getValue(x, 2)).toEqual(new Vector3(2, 2, 2))
	})
})
