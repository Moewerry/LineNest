import { Crop, Eraser, Grid2X2, Hand, MousePointer2, PaintBucket, Slash } from 'lucide-react'
import type { Tool } from '../model/types'

export type ToolInstruction = { action: string; keys?: string[]; gesture?: string; result: string }

export const toolGuides = {
  split: {
    label: '分割线', shortcut: 'S', icon: Grid2X2,
    description: '把图片分成几块，方便切图。',
    instructions: [
      { action: '左键单击', result: '添加竖线，图片上下方也可点击' },
      { action: '按住', keys: ['W'], result: '添加横线，图片左右侧也可点击', gesture: '＋左键单击' },
      { action: '按住左键拖动', result: '调整新线位置，松开确认' },
      { action: '拖动时按住', keys: ['W'], result: '切换横线，松开后恢复竖线' },
      { action: '拖动最新线条的虚线框', result: '移动当前线条，新建后旧线不再支持此操作' },
      { action: '按', keys: ['V'], result: '选择并调整其他线条', gesture: '后左键拖动' },
    ],
  },
  select: {
    label: '选择与微调', shortcut: 'V', icon: MousePointer2,
    description: '选中已有的线条，再调整位置。',
    instructions: [
      { action: '左键单击后拖动', result: '选择并移动线条' },
      { action: '按住', keys: ['Shift'], result: '选中多条线', gesture: '＋左键单击' },
      { action: '按', keys: ['↑', '↓', '←', '→'], result: '微调 1 px' },
    ],
  },
  pan: {
    label: '移动画布', shortcut: 'H', icon: Hand,
    description: '换个位置查看图片，方便继续编辑。',
    instructions: [
      { action: '左键拖动', result: '移动画布' },
      { action: '按', keys: ['S'], result: '返回分割线工具' },
    ],
  },
  line: {
    label: '自由画线', shortcut: 'L', icon: Slash,
    description: '画一条任意方向的直线。',
    instructions: [
      { action: '左键拖动', result: '从起点画到终点' },
      { action: '按', keys: ['V'], result: '微调线条端点', gesture: '后左键拖动端点' },
    ],
  },
  crop: {
    label: '裁剪选区', shortcut: 'C', icon: Crop,
    description: '框出想要单独保存的矩形范围。',
    instructions: [
      { action: '左键拖动', result: '框选矩形范围' },
      { action: '导出 → 导出选区 PNG', result: '保存选区' },
      { action: '左键重新拖动', result: '替换裁剪范围' },
    ],
  },
  fill: {
    label: '标记色块', shortcut: 'B', icon: PaintBucket,
    description: '用颜色标出想要导出的区域。',
    instructions: [
      { action: '左键单击区域', result: '为这一块添加标记' },
    ],
  },
  erase: {
    label: '擦除模式', shortcut: 'E', icon: Eraser,
    description: '划过即可整项擦除线条、色块和裁剪框，锁定对象需先解锁。',
    instructions: [
      { action: '左键单击或按住拖动', result: '擦除划过的对象' },
      { action: '划过裁剪框边缘', result: '清除裁剪选区' },
      { action: '松开左键', result: '确认本次擦除，可一次撤销' },
      { action: '右键单击', result: '撤回上次擦除，可连续撤回' },
      { action: '按', keys: ['Esc'], result: '取消本次擦除' },
    ],
  },
} satisfies Record<Tool, {
  label: string; shortcut: string; icon: typeof Hand; description: string; instructions: ToolInstruction[]
}>

export const toolOrder: Tool[] = ['split', 'select', 'pan', 'line', 'crop', 'fill', 'erase']
