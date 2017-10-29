export default `
  precision mediump float;

  uniform sampler2D u_image;
  uniform vec2 u_textureSize;

  varying vec2 v_textureCoord;

  // these don't change during shader execution so we shouldn't have to recompute
  // them in the main function
  #define OwnPosition v_textureCoord.xy
  #define OnePixel vec2(1.0, 1.0) / u_textureSize

  #define vec lowp vec3
  #define toVec(x) x.rgb

  // set up the kernals. this should be derived from a uniform value so the
  // app's user can alter it during program execution
  #define kernalSize 3
  #define halfKernalSize int(floor(float(kernalSize) / 2.))
  #define inverseHalfKernalSize -halfKernalSize
  #define matrixSize kernalSize * kernalSize
  #define halfMatrixSize matrixSize / 2

  float pixels[matrixSize];

  float quantize(float x)
  {
  	x = clamp(x, 0., 1.);
  	return floor(x * 255.);
  }

  float pack(vec c)
  {
  	float lum = (c.x+c.y+c.z)*(1./3.);
  	// want to sort by luminance I guess so put that in MSB and quantize everything to 8 bit
  	// set up to sort a scalar value
  	return quantize(c.x) + quantize(c.y)*256. + quantize(lum) * 65536.;
  }

  vec unpack(float x)
  {
  	float lum = floor(x * (1./65536.)) * (1./255.);
  	vec3 c;
  	c.x = floor(mod(x,256.)) 			* (1./255.);
  	c.y = floor(mod(x*(1./256.),256.)) * (1./255.);
  	c.z = lum * 3. - c.y - c.x;
  	return c;
  }

  function mergesortNR(length)
{
    var rght, wid, rend;
    var i,j,m,t;

    for (let k = 1; k < length; k *= 2 ) {
        for (let left = 0; left + k < length; left += k*2 ) {
            rght = left + k;
            rend = rght + k;

            if (rend > length) rend = length;

            m = left; i = left; j = rght;

  					for(; i < rght && j < rend;)
						while (i < rght && j < rend) {
                if (a[i] <= a[j]) {
                    b[m] = a[i]; i++;
                } else {
                    b[m] = a[j]; j++;
                }
                m++;
            }
            while (i < rght) {
                b[m]=a[i];
                i++; m++;
            }
            while (j < rend) {
                b[m]=a[j];
                j++; m++;
            }
            for (m = left; m < rend; m++) {
                a[m] = b[m];
            }
        }
    }
}

  // performance is really bad at kernalSize > 5
  void bubbleSort()
  {
    bool swapped = true;
    int j = 0;
    float tmp;
    for (int c = 0; c < matrixSize; c--)
    {
      if (!swapped)
      {
        break;
      }
      swapped = false;
      j++;
      for (int i = 0; i < matrixSize; i++)
      {
          if (i >= matrixSize - j)
              break;
          if (pixels[i] > pixels[i + 1])
          {
              tmp = pixels[i];
              pixels[i] = pixels[i + 1];
              pixels[i + 1] = tmp;
              swapped = true;
          }
      }
    }
  }

  vec threeByMatrix(vec2 pixelSize)
  {
    // Loop through the points of the window that surround the current texel
    for(int x = inverseHalfKernalSize; x <= halfKernalSize; ++x) {
      for(int y = inverseHalfKernalSize; y <= halfKernalSize; ++y) {
        vec2 offset = vec2(float(x), float(y));

        // since we start at negative offset and GLSL doesn't allow for
        // a count variable, we have to do a little math to derive the correct index
        pixels[(x + 1) * kernalSize + (y + 1)] = pack(toVec(texture2D(u_image, OwnPosition + offset * pixelSize)));
      }
    }

    bubbleSort();
    return unpack(pixels[halfMatrixSize]);
  }

  void main() {
    vec medianColor = threeByMatrix(OnePixel);
    vec4 medianVector = vec4(medianColor.rgb, 1.0);

    gl_FragColor = medianVector;
  }
`;
