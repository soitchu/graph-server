attribute vec3 position;
varying vec2 coord;

void main(void) {
  coord = position.xy;
  gl_Position =  vec4(position, 1.0);
}