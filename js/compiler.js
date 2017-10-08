const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (success) return shader;

  console.log('Error creating shader: ', gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
};

const createProgram = (gl, vertexShaders = [], fragmentShaders = []) => {
  const program = gl.createProgram();

  vertexShaders.forEach(vShader => gl.attachShader(program, vShader));
  fragmentShaders.forEach(fShader => gl.attachShader(program, fShader));

  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (success) return program;

  console.log('Error linking program: ', gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
};

export { createShader, createProgram };
