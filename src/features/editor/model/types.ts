export type Point = { x: number; y: number }
export type Box = Point & { width: number; height: number }
export type Matrix = [number, number, number, number, number, number]
export type ImageInfo = { id: string; name: string; width: number; height: number }
type BaseNode = { id: string; name: string; parentId: string | null; matrix: Matrix; locked: boolean }
export type SplitAxis = 'horizontal' | 'vertical'
export type LineNode = BaseNode & { type: 'line'; start: Point; end: Point; splitAxis?: SplitAxis }
export type GroupNode = BaseNode & { type: 'group'; children: string[] }
export type EditorNode = LineNode | GroupNode
export type RegionMark = { id: string; rings: Point[][]; label: Point; color: string; opacity: number }
export type DocumentData = {
  version: 1
  image: ImageInfo | null
  nodes: Record<string, EditorNode>
  roots: string[]
  crop: Box | null
  marks?: RegionMark[]
}
export type Snapshot = { doc: DocumentData; selected: string[]; scope: string | null }
export type Tool = 'split' | 'select' | 'pan' | 'line' | 'crop' | 'fill'
export const emptySnapshot = (): Snapshot => ({
  doc: { version: 1, image: null, nodes: {}, roots: [], crop: null, marks: [] },
  selected: [], scope: null,
})
