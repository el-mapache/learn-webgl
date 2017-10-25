export default `
  precision mediump float;

  uniform sampler2D u_image;
  uniform vec2 u_textureSize;
  uniform float u_kernal[9];
  uniform float u_kernalWeight;

  uniform float u_globalAlpha;
  uniform float u_demultiplier;

  varying vec2 v_textureCoord;

  void main() {
    vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
    vec4 colorSum =
      texture2D(u_image, v_textureCoord + onePixel * vec2(-1, -1)) * u_kernal[0] +
      texture2D(u_image, v_textureCoord + onePixel * vec2(0, -1)) * u_kernal[1] +
      texture2D(u_image, v_textureCoord + onePixel * vec2(1, -1)) * u_kernal[2] +
      texture2D(u_image, v_textureCoord + onePixel * vec2(-1, 0)) * u_kernal[3] +
      texture2D(u_image, v_textureCoord + onePixel * vec2(0, 0)) * u_kernal[4] +
      texture2D(u_image, v_textureCoord + onePixel * vec2(1, 0)) * u_kernal[5] +
      texture2D(u_image, v_textureCoord + onePixel * vec2(-1, 1)) * u_kernal[6] +
      texture2D(u_image, v_textureCoord + onePixel * vec2(0, 1)) * u_kernal[7] +
      texture2D(u_image, v_textureCoord + onePixel * vec2(1, 0)) * u_kernal[8];

    gl_FragColor = vec4((colorSum / u_kernalWeight).rgb / u_demultiplier, 1.0) * u_globalAlpha;
  }
`;
