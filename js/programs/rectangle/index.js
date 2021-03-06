import { createShader, createProgram } from 'compiler';
import { resizeCanvasToDisplaySize } from 'utils';

import vertexRectangleShader from 'programs/rectangle/shaders/vertex.js';
import fragmentRectangleShader from 'programs/rectangle/shaders/fragment.js';

const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexRectangleShader);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentRectangleShader);
const program = createProgram(gl, [ vertexShader] , [ fragmentShader ]);


// first we look up the location of the position attribute. lookups should not
// be done in a render loop!
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
const colorUniformLocation = gl.getUniformLocation(program, 'u_color')
const positionBuffer = gl.createBuffer();

// WebGL exposes many resources on global bind points. These are global variables
// within webGL. We can bind resources to bind points, and other function can refer
// to that resource via the bind point.
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const positions = [ 20, 20, 20, 80, 200, 20 ];
// webgl only accepts types arrays so we have to convert out position data into a
// float32 array. STATIC_DRAW is a hint to webgl that the position data is
// unlikely to change
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// make sure the canvas size and drawing size match pixels
resizeCanvasToDisplaySize(gl.canvas);
// tell webgl what size our canvas is
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program);


gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
// turn on the attribute we bound earlier
gl.enableVertexAttribArray(positionAttributeLocation);

// instructions for how the attribute will get data out of the positionBuffer
const size = 2; // 2 elements per iteration
const type = gl.FLOAT; // data being read is a 32bit float
const normalize = false; // don't normalize data (whatever that means)
const stride = 0; // 0 means the next position is derived from size * sizeof(type)
const offset = 0; // position at which to start reading data
// this also binds the current ARRAY_BUFFER (positionBuffer in this case) to the attribute
// supplied to this function (positionAttributeLocation). That means that ARRAY_BUFFER
// can now be rebound
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

const randomInt = range => {
  return Math.floor(Math.random() * range);
}

const setRectangle = (gl, x, y, height, width) => {
  const x2 = x + width;
  const y2 = y + height;

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x, y,
    x2, y,
    x, y2,
    x, y2,
    x2, y2,
    x2, y
  ]), gl.STATIC_DRAW);
};

const execute = () => {
  for (let i = 0; i < 50; i++) {
    setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));
    gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }
}


// webgl renders in clipspace by default. In clipspace, 0 x and y represents the center of the canvas
// -1 is the bottom or left, and 1 is the top or right.

export default { execute };
