export default {
  createTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
  },

  updateTexture(gl, texture, src, options = null) {
    const defaultTextureOptions = {
      level: 0,
      internalFormat: gl.RGBA,
      srcFormat: gl.RGBA,
      srcType: gl.UNSIGNED_BYTE
    };
    const opts = options || defaultTextureOptions;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, opts.level, opts.internalFormat, opts.srcFormat, opts.srcType, src);
  }
}
