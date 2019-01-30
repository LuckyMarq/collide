precision mediump float;
attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;

uniform float uAlpha;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec4 vColor;

void main(void) {
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	vColor = vec4(aVertexColor.r,aVertexColor.g,aVertexColor.b,aVertexColor.a*uAlpha);
}