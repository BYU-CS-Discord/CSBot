/* eslint-disable @typescript-eslint/no-explicit-any */

// This is a type-shim because superstruct's types do not work with NodeNext module resolution
// https://github.com/ianstormtaylor/superstruct/issues/1200
// Types copied from https://github.com/ianstormtaylor/superstruct/
declare module 'superstruct' {
	export interface Failure {
		value: any;
		key: any;
		type: string;
		refinement: string | undefined;
		message: string;
		explanation?: string;
		branch: Array<any>;
		path: Array<any>;
	}

	/**
	 * `StructError` objects are thrown (or returned) when validation fails.
	 *
	 * Validation logic is design to exit early for maximum performance. The error
	 * represents the first error encountered during validation. For more detail,
	 * the `error.failures` property is a generator function that can be run to
	 * continue validation and receive all the failures in the data.
	 */
	export class StructError extends TypeError {
		value: any;
		key!: any;
		type!: string;
		refinement!: string | undefined;
		path!: Array<any>;
		branch!: Array<any>;
		failures: () => Array<Failure>;
		[x: string]: any;

		constructor(failure: Failure, failures: () => Generator<Failure>);
	}

	/**
	 * `Struct` objects encapsulate the validation logic for a specific type of
	 * values. Once constructed, you use the `assert`, `is` or `validate` helpers to
	 * validate unknown input data against the struct.
	 */
	export class Struct<T = unknown, S = unknown> {
		readonly TYPE!: T;
		type: string;
		schema: S;
		coercer: (value: unknown, context: Context) => unknown;
		validator: (value: unknown, context: Context) => Iterable<Failure>;
		refiner: (value: T, context: Context) => Iterable<Failure>;
		entries: (
			value: unknown,
			context: Context
		) => Iterable<[string | number, unknown, Struct<any> | Struct<never>]>;

		constructor(props: {
			type: string;
			schema: S;
			coercer?: Coercer;
			validator?: Validator;
			refiner?: Refiner<T>;
			entries?: Struct<T, S>['entries'];
		});

		/**
		 * Assert that a value passes the struct's validation, throwing if it doesn't.
		 */
		assert(value: unknown, message?: string): asserts value is T;

		/**
		 * Create a value with the struct's coercion logic, then validate it.
		 */
		create(value: unknown, message?: string): T;

		/**
		 * Check if a value passes the struct's validation.
		 */
		is(value: unknown): value is T;

		/**
		 * Mask a value, coercing and validating it, but returning only the subset of
		 * properties defined by the struct's schema.
		 */
		mask(value: unknown, message?: string): T;

		/**
		 * Validate a value with the struct's validation logic, returning a tuple
		 * representing the result.
		 *
		 * You may optionally pass `true` for the `withCoercion` argument to coerce
		 * the value before attempting to validate it. If you do, the result will
		 * contain the coerced result when successful.
		 */
		validate(
			value: unknown,
			options: {
				coerce?: boolean;
				message?: string;
			} = {}
		): [StructError, undefined] | [undefined, T];
	}

	/**
	 * Assert that a value passes a struct, throwing if it doesn't.
	 */
	export function assert<T, S>(
		value: unknown,
		struct: Struct<T, S>,
		message?: string
	): asserts value is T;

	/**
	 * Ensure that a value is an array and that its elements are of a specific type.
	 *
	 * Note: If you omit the element struct, the arrays elements will not be
	 * iterated at all. This can be helpful for cases where performance is critical,
	 * and it is preferred to using `array(any())`.
	 */
	export function array<T extends Struct<any>>(Element: T): Struct<Array<Infer<T>>, T>;
	export function array(): Struct<Array<unknown>, undefined>;
	export function array<T extends Struct<any>>(Element?: T): any;

	/**
	 * Ensure that a value is a boolean.
	 */
	export function boolean(): Struct<boolean, null>;

	/**
	 * Ensure that a value is an exact value, using `===` for comparison.
	 */
	export function literal<T extends boolean>(constant: T): Struct<T, T>;
	export function literal<T extends number>(constant: T): Struct<T, T>;
	export function literal<T extends string>(constant: T): Struct<T, T>;
	export function literal<T>(constant: T): Struct<T, null>;
	export function literal<T>(constant: T): any;

	/**
	 * Ensure that a value is a number.
	 */
	export function number(): Struct<number, null>;

	/**
	 * Ensure that a value is a string.
	 */
	export function string(): Struct<string, null>;

	/**
	 * Ensure that a value is a tuple of a specific length, and that each of its
	 * elements is of a specific type.
	 */
	export function tuple<A extends Struct<any, any>, B extends Array<Struct<any, any>>>(
		Structs: [A, ...B]
	): Struct<[Infer<A>, ...InferStructTuple<B>], null>;

	/**
	 * Ensure that a value has a set of known properties of specific types.
	 *
	 * Note: Unrecognized properties are allowed and untouched. This is similar to
	 * how TypeScript's structural typing works.
	 */

	export function type<S extends ObjectSchema>(schema: S): Struct<ObjectType<S>, S>;

	/**
	 * Infer a type from an object struct schema.
	 */
	export type ObjectType<S extends ObjectSchema> = Simplify<
		Optionalize<{ [K in keyof S]: Infer<S[K]> }>
	>;

	/**
	 * Simplifies a type definition to its most basic representation.
	 */
	export type Simplify<T> = T extends Array<any> | Date ? T : { [K in keyof T]: T[K] } & object;

	/**
	 * Normalize properties of a type that allow `undefined` to make them optional.
	 */
	export type Optionalize<S extends object> = OmitBy<S, undefined> & Partial<PickBy<S, undefined>>;

	/**
	 * A type utility to extract the type from a `Struct` class.
	 */
	export type Infer<T extends Struct<any, any>> = T['TYPE'];

	/*
	 * A `Validator` takes an unknown value and validates it.
	 */
	export type Validator = (value: unknown, context: Context) => Result;

	/**
	 * A `Refiner` takes a value of a known type and validates it against a further
	 * constraint.
	 */
	export type Refiner<T> = (value: T, context: Context) => Result;

	/**
	 * A `Context` contains information about the current location of the
	 * validation inside the initial input value.
	 */
	export interface Context {
		branch: Array<any>;
		path: Array<any>;
	}

	/*
	 * A `Result` is returned from validation functions.
	 */
	export type Result = boolean | string | Partial<Failure>;

	/**
	 * Infer a tuple of types from a tuple of `Struct`s.
	 *
	 * This is used to recursively retrieve the type from `union` `intersection` and
	 * `tuple` structs.
	 */

	export type InferStructTuple<
		Tuple extends Array<Struct<any, any>>,
		Length extends number = Tuple['length'],
	> = Length extends Length
		? number extends Length
			? Tuple
			: _InferTuple<Tuple, Length, []>
		: never;

	type _InferTuple<
		Tuple extends Array<Struct<any, any>>,
		Length extends number,
		Accumulated extends Array<unknown>,
		Index extends number = Accumulated['length'],
	> = Index extends Length
		? Accumulated
		: _InferTuple<Tuple, Length, [...Accumulated, Infer<Tuple[Index]>]>;

	/*
	 * A schema for object structs.
	 */
	export type ObjectSchema = Record<string, Struct<any, any>>;

	/*
	 * Omit properties from a type that extend from a specific type.
	 */
	export type OmitBy<T, V> = Omit<
		T,
		{ [K in keyof T]: V extends Extract<T[K], V> ? K : never }[keyof T]
	>;

	/*
	 * Pick properties from a type that extend from a specific type.
	 */
	export type PickBy<T, V> = Pick<
		T,
		{ [K in keyof T]: V extends Extract<T[K], V> ? K : never }[keyof T]
	>;
}
