function videoInterface(gl, urlSrc) {
  const video = document.createElement('video');

  let playing = false;
  let updating = false;

  return new Promise((resolve, reject) => {
    function setPlaying() {
      playing = true;
      videoIsReady();
    }

    function setUpdating() {
      updating = true;
      videoIsReady();
    }

    function videoIsReady() {
      if (playing && updating) {
        video.removeEventListener('playing', setPlaying);
        video.removeEventListener('timeupdate', setUpdating);
        return resolve(video);
      }
    }

    video.height = gl.canvas.height;
    video.width = gl.canvas.width;
    video.autoplay = true;

    video.addEventListener('playing', setPlaying);
    video.addEventListener('timeupdate', setUpdating);

    video.src = urlSrc;
    video.play();
  });
};

export default videoInterface;
