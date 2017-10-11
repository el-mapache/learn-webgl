export default function debugAttribs(gl) {
  const numAttribs = gl.getProgramParameter(colorLookupProgram, gl.ACTIVE_ATTRIBUTES);

  for (let i = 0; i < numAttribs; ++i) {
    const attribInfo = gl.getActiveAttrib(colorLookupProgram, ii);

    if (!attribInfo) {
      break;
    }

    console.log('Attribute: ', gl.getAttribLocation(colorLookupProgram, attribInfo.name), attribInfo.name);
  }
};
