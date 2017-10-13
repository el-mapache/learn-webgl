import glContext from 'glContext';
import Compiler from 'webgl';
import shaders from './shaders';
import models from 'models';
import videoInterface from 'video';

const PROGRAM_NAME = 'colorLookup';

const gl = glContext('#canvas');
const compiler = Compiler(gl);

const colorLookupProgram = compiler.createProgram(
  PROGRAM_NAME,
  shaders.vertexShaderSource,
  shaders.convolveFragmentShaderSource
);

navigator.mediaDevices.getUserMedia({ audio: false, video: true })
  .then(mediaStream => {
    const urlSrc = URL.createObjectURL(mediaStream);

    compiler.resizeCanvas(gl);

    videoInterface(gl, urlSrc)
      .then(video => init(video));
  })
    .catch(err => console.warn(err));

function init(video) {
  compiler.useProgram(PROGRAM_NAME);

  // Bind the position buffer.
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setRectangle(gl, 0, 0, video.width, video.height);

  const textureCoordLocation = gl.getAttribLocation(colorLookupProgram, 'a_textureCoord');

  // set the resolution
  const resolutionUniformLocation = gl.getUniformLocation(colorLookupProgram, 'u_resolution');

  const defaultTexture = createTexture(gl);

  function tick(callback) {
    window.requestAnimationFrame(callback);
  }

  function draw(gl, texture, video) {
    compiler.clearDrawingSurface();

    const flipYLocation = gl.getUniformLocation(program, 'u_flipY');
    gl.uniform1f('u_flipY', -1);

    // Initialize a buffer to hold the description of how
    // to draw the primitive used to display the texture.
    // In this case two triangles are used.
    const textureCoordBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(colorLookupProgram, "a_position");
    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset)

    // Turn on the texturecord attribute
    gl.enableVertexAttribArray(textureCoordLocation);
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(textureCoordLocation, size, type, normalize, stride, offset)

    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    const textureSizeLocation = gl.getUniformLocation(colorLookupProgram, 'u_textureSize');
    gl.uniform2f(textureSizeLocation, video.height, video.width);

    models.convolution(gl, colorLookupProgram, [ -1, -1, -1, -1, 8, -1, -1, -1, -1 ]);

    updateTexture(gl, texture, video);

    const primitiveType = gl.TRIANGLES;
    var offset = 0;
    const count = 6;

    gl.drawArrays(primitiveType, offset, count);

    tick(draw.bind(null, gl, texture, video));
  }

  draw(gl, defaultTexture, video);
}



// draw a rectangle that is the same size as our canvas. not 100% sure why
function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}

function createTexture(gl) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 0, 255]);

  // Set the texture as a black 1 pixel image so webgl has something to render before the video is
  // ready to be displayed
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return texture;
}

function updateTexture(gl, texture, video) {
  const level = 0;
  const internalFormat = gl.RGBA;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, video);
}

const execute = () => {
  return null;
};

export default { execute };
