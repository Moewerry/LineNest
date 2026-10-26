import Coordinate from 'jsts/org/locationtech/jts/geom/Coordinate.js'
import GeometryFactory from 'jsts/org/locationtech/jts/geom/GeometryFactory.js'
import GeometryCollection from 'jsts/org/locationtech/jts/geom/GeometryCollection.js'
import type Geometry from 'jsts/org/locationtech/jts/geom/Geometry.js'
import Polygon from 'jsts/org/locationtech/jts/geom/Polygon.js'
import OverlayOp from 'jsts/org/locationtech/jts/operation/overlay/OverlayOp.js'
import InteriorPointArea from 'jsts/org/locationtech/jts/algorithm/InteriorPointArea.js'
import type { Box, Point, RegionMark } from '@/features/editor/model/types'
import type { SliceRegion, SliceResult } from '@/features/slicing/types'
import { MAX_MARK_POINTS, MAX_REGION_MARKS } from './constants'

const minimumArea = 1e-8

function collectPolygons(geometry: Geometry): Polygon[] {
  if (geometry instanceof Polygon) return geometry.getArea() > minimumArea ? [geometry] : []
  if (!(geometry instanceof GeometryCollection)) return []
  const polygons: Polygon[] = []
  for (let index = 0; index < geometry.getNumGeometries(); index++) polygons.push(...collectPolygons(geometry.getGeometryN(index)))
  return polygons
}

export function sliceMarkedRegions(marks: RegionMark[], area: Box): SliceResult {
  if (marks.length > MAX_REGION_MARKS) throw new Error(`最多支持 ${MAX_REGION_MARKS} 个裁切标记`)
  const pointCount = marks.reduce((total, mark) => total + mark.rings.reduce((count, ring) => count + ring.length, 0), 0)
  if (pointCount > MAX_MARK_POINTS) throw new Error('裁切标记过于复杂，请减少标记后重试')
  if (![area.x, area.y, area.width, area.height].every(Number.isFinite) || area.width <= 0 || area.height <= 0) throw new Error('裁切范围无效')

  const factory = new GeometryFactory()
  const ring = (points: Point[]) => {
    const coordinates = points.map(point => new Coordinate(point.x, point.y))
    const first = points[0], last = points[points.length - 1]
    if (first && last && (first.x !== last.x || first.y !== last.y)) coordinates.push(new Coordinate(first.x, first.y))
    return factory.createLinearRing(coordinates)
  }
  const boundary = factory.createPolygon(ring([
    { x: area.x, y: area.y }, { x: area.x + area.width, y: area.y },
    { x: area.x + area.width, y: area.y + area.height }, { x: area.x, y: area.y + area.height },
    { x: area.x, y: area.y },
  ]))
  const regions: SliceRegion[] = []

  marks.forEach((mark, index) => {
    if (!mark.rings.length) return
    const polygon = factory.createPolygon(ring(mark.rings[0]), mark.rings.slice(1).map(ring))
    const clipped = OverlayOp.intersection(polygon, boundary) as Geometry
    const polygons = collectPolygons(clipped)
    if (!polygons.length) return

    // A clipped mark may contain multiple disconnected polygons, but remains one slice.
    const rings: Point[][] = []
    let visibleArea = 0
    const pointsOf = (value: { getCoordinates: () => Coordinate[] }): Point[] => value.getCoordinates().map(point => ({ x: point.x, y: point.y }))
    for (const part of polygons) {
      rings.push(pointsOf(part.getExteriorRing()))
      for (let hole = 0; hole < part.getNumInteriorRing(); hole++) rings.push(pointsOf(part.getInteriorRingN(hole)))
      visibleArea += part.getArea()
    }
    const points = rings.flat()
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const point of points) {
      minX = Math.min(minX, point.x); minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x); maxY = Math.max(maxY, point.y)
    }
    const left = Math.max(Math.floor(area.x), Math.floor(minX)), top = Math.max(Math.floor(area.y), Math.floor(minY))
    const right = Math.min(Math.ceil(area.x + area.width), Math.ceil(maxX)), bottom = Math.min(Math.ceil(area.y + area.height), Math.ceil(maxY))
    if (right <= left || bottom <= top || visibleArea <= minimumArea) return
    const label = InteriorPointArea.getInteriorPoint(clipped) as Coordinate | null
    if (!label || !Number.isFinite(label.x) || !Number.isFinite(label.y)) throw new Error('标记区域无法计算有效位置，请重新标记')
    regions.push({ id: index + 1, rings, box: { x: left, y: top, width: right - left, height: bottom - top }, area: visibleArea, label: { x: label.x, y: label.y } })
  })
  return { regions, unusedEdges: 0, area }
}
