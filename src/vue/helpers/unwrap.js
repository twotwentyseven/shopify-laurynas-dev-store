import { isReactive, isReadonly, isRef, toRaw, unref } from 'vue';

// returns the raw value when passed a vue ref or reactive object
export function unwrap(value) {
	if (isRef(value)) {
		return unref(value);
	}
	
	if (isReactive(value) || isReadonly(value)) {
		return toRaw(value);
	}

	return value;
}

// returns a raw version of an object containing vue refs or reactive objects
export function unwrapObject(value) {
	const unwrappedObject = {};

	for (const key in value) {
		unwrappedObject[key] = unwrap(value[key]);
	}

	return unwrappedObject;
}