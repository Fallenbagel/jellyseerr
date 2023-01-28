export type Undefinable<T> = T | undefined;
export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;

/**
 * Helps type objects with an arbitrary number of properties that are
 * usually being defined at export.
 *
 * @param component Main object you want to apply properties to
 * @param properties Object of properties you want to type on the main component
 */
export function withProperties<A extends object, B extends object>(
  component: A,
  properties: B
): A & B {
  (Object.keys(properties) as (keyof B)[]).forEach((key) => {
    Object.assign(component, { [key]: properties[key] });
  });
  return component as A & B;
}
