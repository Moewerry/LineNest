import { Crop, Grid2X2, Hand, MousePointer2, PaintBucket, Slash } from 'lucide-react'
import type { Tool } from '../model/types'

export type ToolInstruction = { action: string; keys?: string[]; result: string }

export const toolGuides = {
  split: {
    label: '分割线', shortcut: 'S', icon: Grid2X2,
    description: '把图片分成几块，方便后续切图。',
    instructions: [
      { action: '左键单击', result: '添加一条竖线' },
      { action: '按住', keys: ['W'], result: '再单击，添加横线' },
      { action: '按', keys: ['V'], result: '选中线条，拖动调整位置' },
    ],
  },
  select: {
    label: '选择与微调', shortcut: 'V', icon: MousePointer2,
    description: '选中已有的线条，再调整位置。',
    instructions: [
      { action: '单击线条', result: '选中后，按住左键拖动' },
      { action: '按住', keys: ['Shift'], result: '再单击，选中多条线' },
      { action: '方向键', keys: ['↑', '↓', '←', '→'], result: '每次微调 1 px' },
    ],
  },
  pan: {
    label: '移动画布', shortcut: 'H', icon: Hand,
    description: '换个位置查看图片，方便继续编辑。',
    instructions: [
      { action: '按住左键', result: '拖动整张画布' },
      { action: '按', keys: ['S'], result: '返回分割线工具' },
    ],
  },
  line: {
    label: '自由画线', shortcut: 'L', icon: Slash,
    description: '画一条任意方向的直线。',
    instructions: [
      { action: '按住左键', result: '从起点拖到终点，松开完成' },
      { action: '按', keys: ['V'], result: '选中线条，拖动端点微调' },
    ],
  },
  crop: {
    label: '裁剪选区', shortcut: 'C', icon: Crop,
    description: '框出想要单独保存的矩形范围。',
    instructions: [
      { action: '按住左键', result: '拖出矩形，松开确定范围' },
      { action: '保存选区', result: '右上角「导出」→ 导出选区 PNG' },
      { action: '重新框选', result: '替换原来的裁剪范围' },
    ],
  },
  fill: {
    label: '裁切标记', shortcut: 'B', icon: PaintBucket,
    description: '用颜色标出想要单独导出的区域。',
    instructions: [
      { action: '先画分割线', result: '把图片分成需要的区域' },
      { action: '左键单击区域', result: '为这一块添加标记' },
      { action: '保存标记', result: '右上角「导出」→ 导出已标记区域' },
    ],
  },
} satisfies Record<Tool, {
  label: string; shortcut: string; icon: typeof Hand; description: string; instructions: ToolInstruction[]
}>

export const toolOrder: Tool[] = ['split', 'select', 'pan', 'line', 'crop', 'fill']
