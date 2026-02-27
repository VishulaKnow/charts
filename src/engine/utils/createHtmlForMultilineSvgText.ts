export function createHtmlForMultilineSvgText(
	parentElement: SVGTextElement,
	parentX: number,
	stringLines: (string | number)[]
) {
	stringLines.forEach((line, lineIndex) => {
		const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
		// Pass an empty string so this element is counted, ensuring correct `dy` attribute behavior
		// https://stackoverflow.com/questions/34078357/empty-tspan-not-rendered-dy-value-ignored
		tspan.textContent = line.toString() || " ";
		if (lineIndex !== 0) tspan.setAttribute("dy", `1em`);
		tspan.setAttribute("x", parentX.toString());
		parentElement.appendChild(tspan);
	});
}
