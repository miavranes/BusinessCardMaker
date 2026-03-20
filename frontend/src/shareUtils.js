function stripNonSerializable(elements) {
  return elements.map(({ imgElement, ...rest }) => rest);
}

export function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function encodeShareData(state, userData, bgFront, bgBack, accessCode) {
  const payload = {
    sectionsFront: state.sectionsFront,
    sectionsBack:  state.sectionsBack,
    elementsFront: stripNonSerializable(state.elementsFront),
    elementsBack:  stripNonSerializable(state.elementsBack),
    userData,
    bgFront,
    bgBack,
    accessCode,
  };
  try {
    const json    = JSON.stringify(payload);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    return encoded;
  } catch {
    return null;
  }
}

export function decodeShareData(encoded) {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}