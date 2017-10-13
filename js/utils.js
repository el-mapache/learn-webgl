const resizeCanvasToDisplaySize = (canvas) => {
  // Look up the size of the canvas element in the browser
  const displayWidth  = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
};

export { resizeCanvasToDisplaySize };
