import Texture from 'texture';

export default function createFrameBuffers(gl, numBuffers, src) {
  // create 2 textures and attach them to framebuffers.
  const textures = [];
  const frameBuffers = [];

  Array.apply(null, { length: numBuffers }).map(Number.call, Number).forEach(() => {
    const texture = Texture.createTexture(gl);
    textures.push(texture);

    // make the texture the same size as the image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, src.width, src.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // Create a framebuffer
    var fbo = gl.createFramebuffer();
    frameBuffers.push(fbo);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    // Attach a texture to it.
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  });

  return { textures, frameBuffers };
}
