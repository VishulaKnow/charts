export function getCssPropertyValue(node: Element, propertyName: string): string {
	return window.getComputedStyle(node).getPropertyValue(propertyName);
}
