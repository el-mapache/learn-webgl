import glContext from 'glContext';
import Compiler from 'webgl';
import shaders from './shaders';
import videoInterface from 'video';
import Texture from 'texture';
import framebuffers from 'framebuffers';

const PROGRAM_NAME = 'colorLookup';

const gl = glContext('#canvas');
const compiler = Compiler(gl);

const colorLookupProgram = compiler.createProgram(
  PROGRAM_NAME,
  shaders.vertexShaderSource,
  shaders.convolveFragmentShaderSource
);

const medianProgram = compiler.createProgram(
  'median',
  shaders.vertexShaderSource,
  shaders.medianFragmentShaderSource
);

function tick(callback) {
  window.requestAnimationFrame(callback);
}

const KERNALS = {
  normal: [
    0, 0, 0,
    0, 1, 0,
    0, 0, 0
  ],
  gaussianBlur: [
    0.045, 0.122, 0.045,
    0.122, 0.332, 0.122,
    0.045, 0.122, 0.045
  ],
  unsharpen: [
    -1, -1, -1,
    -1,  9, -1,
    -1, -1, -1
  ],
  emboss: [
     -2, -1,  0,
     -1,  1,  1,
      0,  1,  2
  ]
};

// List of effects to apply.
const effectsToApply = [
  "gaussianBlur",
  "emboss",
  "gaussianBlur",
  "unsharpen"
];

let globalAlphaLocation, demultiplierLocation, kernalLocation,
    kernalWeightLocation, resolutionUniformLocation, positionLocation,
    textureCoordLocation, flipYLocation, textureSizeLocation;

navigator.mediaDevices.getUserMedia({ audio: false, video: true })
  .then(mediaStream => {
    const urlSrc = URL.createObjectURL(mediaStream);

    compiler.resizeCanvas(gl);

    videoInterface(gl, urlSrc)
      .then(video => init(video));
  })
    .catch(err => console.warn(err));

function init(video) {
  const srcTexture = Texture.createTexture(gl);
  // In this case, the position buffer is the size of the entire canvas.
  const positionBuffer = createPositionBuffer(gl, 0, 0, video.height, video.width);
  const textureCoordBuffer = gl.createBuffer();
  const { textures, frameBuffers } = framebuffers(gl, 2, video);

  function bindStuff() {
    // get global alpha + blend settings
    globalAlphaLocation = gl.getUniformLocation(compiler.currentProgram, 'u_globalAlpha');
    demultiplierLocation = gl.getUniformLocation(compiler.currentProgram, 'u_demultiplier');
    // get kernal uniform locations
    kernalLocation = gl.getUniformLocation(compiler.currentProgram, 'u_kernal[0]');
    kernalWeightLocation = gl.getUniformLocation(compiler.currentProgram, 'u_kernalWeight');
    flipYLocation = gl.getUniformLocation(compiler.currentProgram, 'u_flipY');
    textureSizeLocation = gl.getUniformLocation(compiler.currentProgram, 'u_textureSize');

    // set the resolution
    resolutionUniformLocation = gl.getUniformLocation(compiler.currentProgram, 'u_resolution');
    gl.uniform2f(resolutionUniformLocation, gl.canvas.clientWidth, gl.canvas.clientHeight);

    // Initialize a buffer with the description of how
    // to draw the primitive that will make up the texture.
    // In this case two triangles are used.
    {
      gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0
      ]), gl.STATIC_DRAW);
    }

    {  // Bind the position buffer.
      positionLocation = gl.getAttribLocation(compiler.currentProgram, "a_position");
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
      gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
    }

    // Turn on the texturecord attribute
    {
      textureCoordLocation = gl.getAttribLocation(compiler.currentProgram, 'a_textureCoord');
      gl.enableVertexAttribArray(textureCoordLocation);
      // Bind the textureCoord buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
      // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
      var size = 2;          // 2 components per iteration
      var type = gl.FLOAT;   // the data is 32bit floats
      var normalize = false; // don't normalize the data
      var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0;        // start at the beginning of the buffer
      gl.vertexAttribPointer(textureCoordLocation, size, type, normalize, stride, offset);
    }

    gl.uniform2f(textureSizeLocation, video.height, video.width);

    gl.uniform1f(globalAlphaLocation, 0.5);
    gl.uniform1f(demultiplierLocation, 0.7);
  }

  function setFrameBuffer(fbuffer, width, height) {
    // bind nothing to the frame buffer to indicate that we don't want to use it any more
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbuffer, width, height);
    gl.uniform2f(resolutionUniformLocation, width, height);
    gl.viewport(0, 0, width, height);
  }

  function applyKernel(gl, kernal) {
    gl.uniform1fv(kernalLocation, kernal);
    gl.uniform1f(kernalWeightLocation, computeKernalWeight(kernal));
  }

  function drawWithKernal(kname) {
    applyKernel(gl, KERNALS[kname]);
    drawRaw();
  }

  function draw(gl, texture, video) {
    compiler.clearDrawingSurface();
    compiler.useProgram('median');
    bindStuff();
    // compiler.useProgram(PROGRAM_NAME);
    // bindStuff();

    Texture.updateTexture(gl, srcTexture, video);
    // Framebuffers aren't being displayed on the canvas, and don't need the y
    // position flipped.
    gl.uniform1f(flipYLocation, 1);

    // effectsToApply.forEach((kernalName, index) => {
    //   setFrameBuffer(frameBuffers[index % 2], gl.drawingBufferWidth, gl.drawingBufferHeight);
    //   drawWithKernal(kernalName);
    //   gl.bindTexture(gl.TEXTURE_2D, textures[index % 2]);
    // });

    gl.uniform1f(flipYLocation, -1);

    setFrameBuffer(null, video.width, video.height);
    // drawWithKernal('normal');

    // compiler.useProgram('median');
    // bindStuff();

    drawRaw();

    tick(draw.bind(null, gl, srcTexture, video));
  }

  enableBlend();
  draw(gl, srcTexture, video);
}

function drawRaw(offset = 0, count = 6) {
  gl.drawArrays(gl.TRIANGLES, offset, count);
}

// The position buffer defines the area in which the scene will be drawn
function createPositionBuffer(gl, x, y, height, width) {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);

  return buffer;
}

function computeKernalWeight(kernal) {
  const weight = kernal.reduce((next, current) => {
    return next + current;
  });

  return weight <= 0 ? 1 : weight;
}

function enableBlend() {
  gl.enable(gl.BLEND);
  // this one gives the desired results. not 100 percent sure why!
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
}

const execute = () => {
  return null;
};

export default { execute };
