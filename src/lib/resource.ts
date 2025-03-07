import 'reflect-metadata';

/**
 * Metadata key for storing the resource URI
 */
const RESOURCE_URI_KEY = Symbol('resourceUri');

/**
 * Decorator for marking methods as MCP resources.
 * @param uri The URI pattern for the resource
 */
export function Resource(uri: string): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    // Store the URI pattern in the method's metadata
    Reflect.defineMetadata(RESOURCE_URI_KEY, uri, target, propertyKey);
    return descriptor;
  };
}

/**
 * Get the resource URI for a decorated method
 * @param target The class instance or constructor
 * @param propertyKey The method name
 * @returns The resource URI or undefined if not a resource
 */
export function getResourceUri(target: object, propertyKey: string | symbol): string | undefined {
  return Reflect.getMetadata(RESOURCE_URI_KEY, target, propertyKey);
}
