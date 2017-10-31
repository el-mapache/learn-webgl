import compiler from './compiler';
import { resizeCanvasToDisplaySize } from 'utils';

const programs = {};
let currentProgram = null;

const WebGl = (gl) => {
  return {
    // Create a program from supplied shaders.
    // Program is cached in an object for later lookups
    createProgram(name, vertexShaderSource, fragmentShaderSource) {
      if (programs[name]) {
        console.warning(`Program with name ${name} already exists!`);
        return null;
      }

      const vertexShader = compiler.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = compiler.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

      programs[name] = compiler.createProgram(gl, vertexShader, fragmentShader);

      // TODO: should this return something else?
      return programs[name];
    },

    useProgram(name) {
      currentProgram = programs[name];
      gl.useProgram(currentProgram);
    },

    resizeCanvas(gl) {
      resizeCanvasToDisplaySize(gl.canvas);
    },

    clearDrawingSurface() {
      // tell webgl what size our canvas is
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.clearColor(0, 0, 0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    },

    get programs() {
      return programs;
    },

    get currentProgram() {
      return currentProgram;
    },

    setSize() {

    }
  };
};

export default WebGl;
