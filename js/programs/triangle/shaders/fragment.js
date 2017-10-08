// gl_FragColor is a magic global the fragment shader must set
export default `
  precision mediump float;

  void main() {
    gl_FragColor = vec4(1, 0, 0.5, 1); // colors in webgl go from 0 to 1
  }
`;
