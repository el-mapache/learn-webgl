/*
  * should there be a shared data constant where I can define that names of things like
  * varying and attributes? then I don't ahve to remember all the names and can
  * namespace things in constants.
  * Maybe it's not worth the overhead
 */
export default `
  precision mediump float;

  uniform sampler2D u_image;

  varying vec2 v_textureCoord;

  void main() {
    gl_FragColor = texture2D(u_image, v_textureCoord);
  }
`;
