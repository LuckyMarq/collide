precision mediump float;

uniform vec3 uTint;
uniform float uTintWeight;

varying vec4 vColor;

void main(void) {
	float textelWeight = 1.0-uTintWeight;
	gl_FragColor = vec4((vColor.r*textelWeight)+(uTint.r*uTintWeight),(vColor.g*textelWeight)+(uTint.g*uTintWeight),(vColor.b*textelWeight)+(uTint.b*uTintWeight),vColor.a);
}