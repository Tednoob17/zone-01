import { create, getClickName } from './lib.js'

const Rect = create('rect')
const Circle = create('circle')
const Path = create('path')

const invertParams = fn => (x1, y1, x2, y2) => x1 > x2
  ? fn(x1, y1, x2, y2)
  : fn(x2, y2, x1, y1)

const getLink = invertParams((x1, y1, x2, y2) => {
  const w = Math.abs(x1 - x2)
  const h = Math.abs(y1 - y2)
  if (x1 === x2 || y1 === y2 || w === h) return `M${x1},${y1}L${x2},${y2}`

  const e = -Math.min(w, h)
  const t = (Math.max(w, h) + e) / -2
  if (y1 > y2) {
    return h > w
      ? `M${x1},${y1}v${t}l${e},${e}v${t}`
      : `M${x1},${y1}h${t}l${e},${e}h${t}`
  }
  return h > w
    ? `M${x1},${y1}v${-t}l${e},${-e}v${-t}`
    : `M${x1},${y1}h${t}l${e},${-e}h${t}`
})

const nextPowerOf2 = x => Math.pow(2, Math.ceil(Math.log(x) / Math.log(2)))
const prevPowerOf2 = x => Math.pow(2, Math.floor(Math.log(x) / Math.log(2)))

const isNear = n => {
  const decimals = n - ~~(n)
  return decimals < 0.3 || decimals > 0.7
}

export const defaultKeys = {
  grab: ' ',
  zoomIn: '=',
  zoomInPrecise: '+',
  zoomOut: '-',
  zoomOutPrecise: '_',
  unselect: 'Escape',
}

export const actions = {
  addPoint: 'ADD_POINT',
  addLink: 'ADD_LINK',
  removeLink: 'REMOVE_LINK',
}


export const init = (params = {}) => {
  const KEYS = { ...defaultKeys, ...params.keys }
  const S = params.size || 21
  const SS = S * S

  const linkPreview = Path({
    fill: 'none',
    stroke: 'rgba(255,255,255,0.15)',
    'stroke-linecap': 'round',
    'stroke-width': 0.1,
  })
  const svg = create('svg')({ tabindex: -1, viewBox: `-0.5, -0.5, ${S}, ${S}` })
  const group = create('g')({})
  const hoverMarker = Circle({
    cx: Math.floor(S/2),
    cy: Math.floor(S/2),
    r: 0.2,
    fill: 'transparent',
    'stroke-width': 0.05,
    stroke: `hsla(0,0%,100%,0.2)`,
    display: 'none',
  })

  const grid = [ ...Array(SS).keys() ]
    .map(n => Circle({
      cx: n % S,
      cy: Math.floor(n / S),
      r: 0.02,
      fill: `#999`
    }))

  // STATE
  const graph = {}
  const inputsUp = new Set()
  const inputsDown = new Map()
  const centerX = S/2 - 0.5
  const centerY = S/2 - 0.5
  let links = []
  let scale = 1
  let prevScale = 1
  let mouseX = -1
  let mouseY = -1
  let mouseRelX = centerY
  let mouseRelY = centerX
  let posX = 0
  let posY = 0
  let hoverX = -1
  let hoverY = -1
  let nearX = -1
  let nearY = -1
  let hoverPoint
  let selectedPoint
  let drag
  let bounding
  let now = Date.now()

  const dispatch = params.listenner || (() => {})
  const events = new Set(['init'])
  const handle = eventName => events.has(eventName)
    ? events.delete(eventName) && true
    : false

  const isUp = name => inputsUp.has(name)
  const isDown = name => inputsDown.get(name) > now
  const isHold = name => inputsDown.get(name)
  const getHoldedDuration = name => Math.max(0, (now - inputsDown.get(name))) || 0

  const applyPanAndScale = () => {
    const scaleD = scale / prevScale
    const modX = drag ? (mouseX - drag.x) / bounding.width * S : 0
    const modY = drag ? (mouseY - drag.y) / bounding.height * S : 0
    const x = scaleD * ((modX + posX) - mouseRelX) + mouseRelX
    const y = scaleD * ((modY + posY) - mouseRelY) + mouseRelY
    const transform = `matrix(${scale},0,0,${scale},${x},${y})`

    group.setAttributeNS(null, 'transform', transform)

    prevScale = scale
    posX = scaleD * (posX - mouseRelX) + mouseRelX
    posY = scaleD * (posY - mouseRelY) + mouseRelY
  }

  const drawSelection = () => {
    if (selectedPoint) {
      linkPreview.removeAttributeNS(null, 'display')
      linkPreview.setAttributeNS(null, 'd', hoverPoint
        ? getLink(selectedPoint.x, selectedPoint.y, nearX, nearY)
        : getLink(selectedPoint.x, selectedPoint.y, hoverX, hoverY))
    } else {
      linkPreview.setAttributeNS(null, 'display', 'none')
    }

    if (hoverPoint) {
      hoverMarker.removeAttributeNS(null, 'display')
      hoverMarker.setAttributeNS(null, 'cx', nearX)
      hoverMarker.setAttributeNS(null, 'cy', nearY)
    } else {
      hoverMarker.setAttributeNS(null, 'display', 'none')
    }
  }

  const addLink = (start, end) => {
    if (start === end) return
    const link = {
      start,
      end,
      elem: Path({
        fill: 'none',
        stroke: 'rgba(255,255,255,0.3)',
        'stroke-linecap': 'round',
        'stroke-width': 0.1,
        d: getLink(start.x, start.y, end.x, end.y)
      })
    }
    links.push(link)
    group.appendChild(link.elem)

    dispatch(actions.addLink, { start, end })
  }

  const deleteLink = link => {
    links = links.filter(l => l !== link)
    link.elem.remove()
    dispatch(actions.removeLink, link)
  }

  const addPoint = (x, y) => {
    const elem = Circle({ cx: x, cy: y, r: 0.15, fill: `#ddd` })
    const key = x * S + y
    const point = graph[key] = { elem, x, y, key, links: [] }
    group.prepend(elem)
    dispatch(actions.addPoint, point)
  }

  const executeUpdate = () => {
    if (handle('blur')) {
      // On window blur we want to remove all keys because we can't catch
      // key up event.
      for (const [name] of inputsDown) {
        inputsUp.add(name)
      }
    }

    if (handle('resize') || handle('init')) {
      bounding = svg.getBoundingClientRect()
      applyPanAndScale()
      drawSelection()
    }

    if (isDown(KEYS.zoomIn)) {
      scale = prevPowerOf2(scale * 2)
      applyPanAndScale()
    }

    if (isDown(KEYS.zoomInPrecise)) {
      scale = scale * 1.2
      applyPanAndScale()
    }

    if (isDown(KEYS.zoomOut)) {
      scale = nextPowerOf2(scale / 2)
      applyPanAndScale()
    }

    if (isDown(KEYS.zoomOutPrecise)) {
      scale = scale * 0.8
      applyPanAndScale()
    }

    if (isDown(KEYS.grab)) {
      svg.classList.add('grab')
    }

    if (isUp(KEYS.grab)) {
      svg.classList.remove('grab')
    }

    if (isDown(KEYS.unselect)) {
      selectedPoint = undefined
      drawSelection()
    }

    if (isDown('leftclick')) {
      if (isHold(KEYS.grab)) {
        drag = { x: mouseX, y: mouseY }
        svg.classList.add('grabbing')
      } else if (hoverPoint) {
        if (selectedPoint) {
          addLink(selectedPoint, hoverPoint)
          selectedPoint = undefined
        } else {
          selectedPoint = hoverPoint
        }
      } else {
        drag = { x: mouseX, y: mouseY }
        svg.classList.add('grabbing')
      }
    }

    if (isUp('leftclick')) {
      if (drag) {
        posX = (mouseX - drag.x) / bounding.width * S + posX
        posY = (mouseY - drag.y) / bounding.height * S + posY
        drag = undefined
        svg.classList.remove('grabbing')
      } else if (selectedPoint) {
        if (getHoldedDuration('leftclick') > 300) {
          hoverPoint && addLink(selectedPoint, hoverPoint)
          selectedPoint = undefined
        }
      }
    }

    if (isDown('rightclick')) {
      if (selectedPoint) {
        selectedPoint = undefined
      } else {
        if (hoverPoint === undefined) {
          addPoint(nearX, nearY)
        }
      }
    }

    if (handle('mousemove')) {
      if (drag) {
        applyPanAndScale()
      } else {
        mouseRelX = (mouseX - bounding.x) / bounding.width * S - 0.5
        mouseRelY = (mouseY - bounding.y) / bounding.height * S - 0.5

        hoverX = (mouseRelX - posX) / scale
        hoverY = (mouseRelY - posY) / scale

        nearX = Math.round(hoverX)
        nearY = Math.round(hoverY)

        hoverPoint = isNear(hoverX) && isNear(hoverY) && graph[nearX * S + nearY]
        drawSelection()
      }
    }

    for (const key of inputsUp) {
      inputsUp.delete(key)
      inputsDown.delete(key)
    }

    now = Date.now()
    updateRequested = inputsDown.size && requestAnimationFrame(executeUpdate)
  }

  let updateRequested = requestAnimationFrame(executeUpdate)
  const update = eventName => {
    updateRequested || (updateRequested = requestAnimationFrame(executeUpdate))
    events.add(eventName)
  }
  const svgWheel = e => {
    e.preventDefault()
    scale = scale + Math.sign(e.deltaY) * (scale / 20)
    update('resize')
  }
  const preventDefault = e => e.preventDefault()
  const windowMousemove = e => {
    mouseX = e.x ? e.x : e.clientX
    mouseY = e.y ? e.y : e.clientY
    update('mousemove')
  }
  const windowBlur = e => update('blur')
  const windowResize = () => update('resize')
  const windowKeyup = e => inputsUp.add(e.key)
  const windowKeydown = ({ key }) => {
    if (inputsDown.has(key)) return
    inputsDown.set(key, Date.now())
    update('keyboard')
  }

  const svgMouseup = e => {
    e.preventDefault()
    mouseX = e.x ? e.x : e.clientX
    mouseY = e.y ? e.y : e.clientY
    const name = getClickName(e)
    name && inputsUp.add(name)
    update('mousemove')
  }

  const svgMousedown = e => {
    e.preventDefault()
    mouseX = e.x ? e.x : e.clientX
    mouseY = e.y ? e.y : e.clientY
    const name = getClickName(e)
    name && inputsDown.set(name, Date.now())
    update('mousemove')
  }

  grid.forEach(dot => group.appendChild(dot))
  group.appendChild(hoverMarker)
  group.appendChild(linkPreview)
  svg.appendChild(group)

  let observer
  if (window.ResizeObserver) {
    observer = new ResizeObserver(windowResize).observe(svg)
  } else {
    window.addEventListener('resize', windowResize, { passive: true })
  }
  svg.addEventListener('wheel', svgWheel, { passive: false })
  svg.addEventListener('mouseup', svgMouseup)
  svg.addEventListener('mousedown', svgMousedown)
  svg.addEventListener('contextmenu', preventDefault)
  window.addEventListener('scroll', windowResize)
  window.addEventListener('blur', windowBlur)
  window.addEventListener('keyup', windowKeyup)
  window.addEventListener('keydown', windowKeydown)
  window.addEventListener('mousemove', windowMousemove)

  params.mountingPoint.appendChild(svg)
  bounding = svg.getBoundingClientRect()
  return () => {
    cancelAnimationFrame(updateRequested)
    updateRequested = true
    if (observer) {
      observer.unobserve(svg)
    } else {
      window.removeEventListener('resize', windowResize)
    }
    svg.removeEventListener('wheel', svgWheel)
    svg.removeEventListener('mouseup', svgMouseup)
    svg.removeEventListener('mousedown', svgMousedown)
    svg.removeEventListener('contextmenu', preventDefault)
    window.removeEventListener('blur', windowBlur)
    window.removeEventListener('keyup', windowKeyup)
    window.removeEventListener('keydown', windowKeydown)
    window.removeEventListener('mousemove', windowMousemove)
    window.removeEventListener('scroll', windowResize)
  }
}
