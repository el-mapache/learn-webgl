/*
 * Generic code to handle 3x3 convolution matrix
 */

// TODO: I think instead of this project structure, the shaders should be actual objects that
// expose a funciton which initializes all the variables detailed in the shader.
// that way I can keep all related code closer together, and hopefully cut down on some of the
// overhead reading through all the binding and enabling calls

// Return 1 if kernal weight is less than zero to prevent
// divide-by-zero errors
function computeKernalWeight(kernal) {
  const weight = kernal.reduce((next, current) => {
    return next + current;
  });

  return weight <= 0 ? 1 : weight;
}

export default function applyKernal(gl, program, kernal) {
  const kernalLocation = gl.getUniformLocation(program, 'u_kernal[0]');
  const kernalWeightLocation = gl.getUniformLocation(program, 'u_kernalWeight');

  gl.uniform1fv(kernalLocation, kernal);
  gl.uniform1f(kernalWeightLocation, computeKernalWeight(kernal));
}
