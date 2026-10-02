// Diff por líneas (LCS) para comparar el prompt/KB guardado contra el borrador.
// Devuelve [{ type: 'same' | 'add' | 'del', text }]. Pensado para textos de
// cientos de líneas; por encima de MAX_CELLS cae a un diff trivial.

const MAX_CELLS = 4_000_000

export function lineDiff(before, after) {
  const a = String(before || '').split('\n')
  const b = String(after || '').split('\n')
  if (a.length * b.length > MAX_CELLS) {
    return [
      ...a.map((text) => ({ type: 'del', text })),
      ...b.map((text) => ({ type: 'add', text })),
    ]
  }
  // Tabla LCS desde el final para reconstruir hacia adelante.
  const n = a.length
  const m = b.length
  const lcs = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1])
    }
  }
  const out = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ type: 'same', text: a[i] })
      i++
      j++
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      out.push({ type: 'del', text: a[i++] })
    } else {
      out.push({ type: 'add', text: b[j++] })
    }
  }
  while (i < n) out.push({ type: 'del', text: a[i++] })
  while (j < m) out.push({ type: 'add', text: b[j++] })
  return out
}

export default lineDiff
