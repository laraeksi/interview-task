/**
 utils/index.ts is Utility Functions
 
 Contains helper utility functions used throughout the application.
 classNames() Combines multiple CSS class names into a single string.
 Filters out falsy values (null, undefined, empty strings) and joins the rest.
 Makes it easier to conditionally apply CSS classes in React components.
 */
export function classNames(...classes: unknown[]): string {
    return classes.filter(Boolean).join(' ')
}
