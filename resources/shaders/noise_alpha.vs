precision mediump float;
attribute vec3 aVertexPosition;
attribute float aAlpha;

uniform float time;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
varying vec2 texCoord2D;
varying float alpha;

void main(void) {
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	texCoord2D = aVertexPosition.xy;
	alpha = aAlpha;
}