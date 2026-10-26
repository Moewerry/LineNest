import Coordinate from 'jsts/org/locationtech/jts/geom/Coordinate.js'
import GeometryFactory from 'jsts/org/locationtech/jts/geom/GeometryFactory.js'
import type Polygon from 'jsts/org/locationtech/jts/geom/Polygon.js'
import UnaryUnionOp from 'jsts/org/locationtech/jts/operation/union/UnaryUnionOp.js'
import Polygonizer from 'jsts/org/locationtech/jts/operation/polygonize/Polygonizer.js'
import InteriorPointArea from 'jsts/org/locationtech/jts/algorithm/InteriorPointArea.js'
import type { Box, Point } from '@/features/editor/model/types'
import type { SliceRegion, SliceRequest, SliceResult } from './types'

// Clip finite segments to the export area. Never extend a user's endpoints.
function clip(a: Point, b: Point, area: Box): [Point, Point] | null {
  let low = 0, high = 1
  const dx = b.x - a.x, dy = b.y - a.y
  const p = [-dx, dx, -dy, dy], q = [a.x - area.x, area.x + area.width - a.x, a.y - area.y, area.y + area.height - a.y]
  for (let i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-12) { if (q[i] < 0) return null; continue }
    const r = q[i] / p[i]
    if (p[i] < 0) low = Math.max(low, r)
    else high = Math.min(high, r)
    if (low > high) return null
  }
  const snap = (value: number, min: number, max: number) => Math.abs(value - min) < 1e-7 ? min : Math.abs(value - max) < 1e-7 ? max : value
  const at = (t: number): Point => ({ x: snap(a.x + t * dx, area.x, area.x + area.width), y: snap(a.y + t * dy, area.y, area.y + area.height) })
  const start = at(low), end = at(high)
  return Math.hypot(end.x - start.x, end.y - start.y) > 1e-7 ? [start, end] : null
}

export function polygonize({ lines, area }: SliceRequest): SliceResult {
  if (lines.length > 500) throw new Error('一次最多处理 500 条线，请减少线条或分批导出')
  const factory = new GeometryFactory()
  const line = (points: Point[]) => factory.createLineString(points.map(p => new Coordinate(p.x, p.y)))
  const { x, y, width, height } = area
  const boundary = line([{ x, y }, { x: x + width, y }, { x: x + width, y: y + height }, { x, y: y + height }, { x, y }])
  const edges = lines.flatMap(segment => {
    const clipped = clip(segment.start, segment.end, area)
    return clipped ? [line(clipped)] : []
  })
  // Unary union nodes intersections and merges coincident segments before polygonization.
  const noded = UnaryUnionOp.union(factory.createMultiLineString([boundary, ...edges]))
  const polygonizer = new Polygonizer(false)
  polygonizer.add(noded)
  const polygons = polygonizer.getPolygons().toArray() as Polygon[]
  if (polygonizer.getInvalidRingLines().size()) throw new Error('部分线条无法形成有效区域，请调整交点后重试')
  const regions: SliceRegion[] = polygons.map(polygon => {
    const ring = (value: { getCoordinates: () => Coordinate[] }): Point[] => value.getCoordinates().map(p => ({ x: p.x, y: p.y }))
    const rings = [ring(polygon.getExteriorRing())]
    for (let i = 0; i < polygon.getNumInteriorRing(); i++) rings.push(ring(polygon.getInteriorRingN(i)))
    const points = rings[0], minX = Math.min(...points.map(p => p.x)), minY = Math.min(...points.map(p => p.y))
    const left = Math.max(0, Math.floor(minX)), top = Math.max(0, Math.floor(minY))
    const right = Math.ceil(Math.max(...points.map(p => p.x))), bottom = Math.ceil(Math.max(...points.map(p => p.y)))
    const label = InteriorPointArea.getInteriorPoint(polygon)
    return { id: 0, rings, area: polygon.getArea() as number, box: { x: left, y: top, width: right - left, height: bottom - top }, label: { x: label.x, y: label.y } }
  }).filter(region => region.area > 1e-8)
  regions.sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x || b.area - a.area)
  regions.forEach((region, i) => { region.id = i + 1 })
  const totalArea = regions.reduce((sum, region) => sum + region.area, 0)
  if (!regions.length || Math.abs(totalArea - width * height) > Math.max(0.01, width * height * 1e-7)) throw new Error('切片未完整覆盖图片，请调整线条后重试')
  if (regions.length > 200) throw new Error('切片超过 200 个，请减少线条或分批导出')
  return { regions, unusedEdges: polygonizer.getDangles().size() + polygonizer.getCutEdges().size(), area }
}
