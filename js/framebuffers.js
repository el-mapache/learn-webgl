export default createFrameBuffers(gl, textures, src) {
  // create 2 textures and attach them to framebuffers.
  const textures = [];
  const framebuffers = [];

  for (let i = 0; i < numBuffers; ++i) {
    const texture = createAndSetupTexture(gl);
    textures.push(texture);

    // make the texture the same size as the image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // Create a framebuffer
    var fbo = gl.createFramebuffer();
    framebuffers.push(fbo);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    // Attach a texture to it.
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  }

  return { textures, buffers };
}
