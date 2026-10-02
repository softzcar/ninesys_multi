// Renderiza texto con el formato propio de WhatsApp (*negrita*, _cursiva_,
// ~tachado~, ```monoespaciado```) para mostrarlo tal como lo vería el cliente.
// No usa Markdown: WhatsApp no lo interpreta. Se escapa TODO el HTML antes de
// aplicar los formatos, así que el resultado es seguro para v-html.

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function waFormat(text) {
  if (!text) return ''
  const blocks = []
  let html = escapeHtml(text)
    // Bloques ``` ``` se reservan para no aplicar otros formatos dentro.
    .replace(/```([\s\S]+?)```/g, (_, code) => {
      blocks.push(code)
      return `\u0000${blocks.length - 1}\u0000`
    })
    .replace(/(^|[\s(])\*(\S(?:[^*\n]*\S)?)\*(?=$|[\s).,!?:;])/g, '$1<strong>$2</strong>')
    .replace(/(^|[\s(])_(\S(?:[^_\n]*\S)?)_(?=$|[\s).,!?:;])/g, '$1<em>$2</em>')
    .replace(/(^|[\s(])~(\S(?:[^~\n]*\S)?)~(?=$|[\s).,!?:;])/g, '$1<del>$2</del>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n/g, '<br>')
  html = html.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code class="wa-mono">${blocks[Number(i)]}</code>`)
  return html
}

export default waFormat
