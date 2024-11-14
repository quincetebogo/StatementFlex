/**
 * @jest-environment jsdom
 */

import Helpers from '../src/internals/Helpers.js';
import util from 'util';

test(`getProxy() must return a proxy`, () => {
	const o = {
		x: `y`
	};

	const p = Helpers.getProxy(o);

	expect(p.x).toEqual(`y`);
	expect(util.types.isProxy(p));
});

test(`Object.getPrototypeOf() must throw exception`, () => {

	const p = Helpers.getProxy({});

	expect(() => Object.getPrototypeOf(p)).toThrow();
});

test(`Object.setPrototypeOf() must throw exception`, () => {

	const p = Helpers.getProxy({});
	const q = {};

	expect(() => Object.setPrototypeOf(p, q)).toThrow();
});

test(`Object.defineProperty() must throw exception`, () => {

	const p = Helpers.getProxy({});

	expect(() => Object.defineProperty(p, `prop`, {
		value: 42
	})).toThrow();
});

test(`Object.isExtensible() returns false`, () => {

	const p = Helpers.getProxy({});

	expect(Object.isExtensible(p)).toBeFalsy();
});

test(`set property must throw exception`, () => {

	const o = {
		x: `y`
	};

	const p = Helpers.getProxy(o);

	expect(() => p.prop = `prop`).toThrow();
});

test(`delete property must throw exception`, () => {

	const o = {
		x: `y`
	};

	const p = Helpers.getProxy(o);

	expect(() => delete p.x).toThrow();
});