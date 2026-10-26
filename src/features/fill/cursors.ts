// Icon paths match the sidebar's Lucide icons (ISC license).
const bucketPaths = [
  'm19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z',
  'm5 2 5 5',
  'M2 13h15',
  'M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z',
]
const eraserPaths = [
  'm7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21',
  'M22 21H7',
  'm5 11 9 9',
]

function iconCursor(paths: string[], x: number, y: number) {
  const shapes = paths.map(path => `<path d="${path}"/>`).join('')
  // A white halo keeps the dark icon visible over both light and dark images.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g transform="translate(3 3)" fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="white" stroke-width="4">${shapes}</g><g stroke="#171717" stroke-width="2">${shapes}</g></g></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${x} ${y}, default`
}

export const fillCursors = {
  mark: iconCursor(bucketPaths, 5, 15),
  erase: iconCursor(eraserPaths, 10, 24),
}
