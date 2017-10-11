const triangleShaderSource = `
  // this attribute will receive position data from a buffer
  attribute vec2 a_position; // pixels, instead of clipspace
  uniform vec2 u_resolution;

  void main() {
    // convert position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;

    vec2 zeroToTwo = zeroToOne * 2.0;

    vec2 clipSpace = zeroToTwo - 1.0;
    // gl_Position is a magic global that the vertext shader
    // must set
    // flip the canvas so that 0,0 is in the top left corner. webgl defaults to the bottom left,
    // which is weird
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  }
`;

export default triangleShaderSource;
