const createSvgElement = (t, props, children) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', t)
  for (const key of Object.keys(props)) {
    const value = props[key]
    el.setAttributeNS(null, key, value)
  }

  if (!children) return el  

  for (let child of Array.isArray(children) ? children : [children]) {
    if (!child) continue
    el.appendChild(child instanceof Element
      ? child
      : document.createTextNode(String(child)))
  }

  return el
}

export const create = (t, ...args) => args.length
  ? createSvgElement(t, ...args)
  : createSvgElement.bind(null, t)

export const getClickName = e => {
  switch (e.which) {
    case 1: return 'leftclick'
    case 2: return 'middleclick'
    case 3: return 'rightclick'
    default: {
      switch (e.button) {
        case 1: return 'leftclick'
        case 2: return 'rightclick'
        case 4: return 'middleclick'
      }
    }
  }
}
