export default `
  attribute vec2 a_position;
  attribute vec2 a_textureCoord;

  varying vec2 v_textureCoord;

  uniform vec2 u_resolution;
  uniform float u_flipY;

  void main() {
    // covert pixel position data to clipspace for webgl
    vec2 zeroToOne = a_position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, u_flipY), 0, 1);

    v_textureCoord = a_textureCoord;
  }
`;
