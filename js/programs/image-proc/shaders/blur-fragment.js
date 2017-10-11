export default `
  precision mediump float;

  uniform sampler2D u_image;
  uniform vec2 u_textureSize;

  varying vec2 v_textureCoord;

  void main() {
    vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;

    gl_FragColor = (
      texture2D(u_image, v_textureCoord) +
      texture2D(u_image, v_textureCoord + vec2(onePixel.x, 0.0)) +
      texture2D(u_image, v_textureCoord + vec2(-onePixel.x, 0.0))) / 3.0;
  }
`;
