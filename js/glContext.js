let gl;

export default function(canvasId, options = { alpha: false }) {
  if (!gl) {
    gl = document.querySelector(canvasId).getContext('webgl', options);
  }

  return gl;
};
