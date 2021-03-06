let canvas;
let gl;

export default function(canvasId, options = { alpha: false }) {
  if (gl) return gl;

  canvas = document.querySelector(canvasId);
  gl = canvas.getContext('webgl', options);

  return gl;
};
