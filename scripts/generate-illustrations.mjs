/**
 * 离线生成 24 节气插画（SVG，无需任何 API / 网络）
 *
 * 使用方法：
 *   node scripts/generate-illustrations.mjs
 *
 * 每个节气根据其主题（花 / 叶 / 雪 / 雨 / 谷物 / 松竹 / 太阳）与配色，
 * 用矢量图元组合绘制，输出到 public/illustrations/<key>.svg
 *
 * （如需写实风格插画，可改用 scripts/generate-illustrations-dalle.mjs，
 *   该脚本调用 OpenAI DALL·E，需要 OPENAI_API_KEY 与外网访问。）
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, '../public/illustrations')
mkdirSync(OUTPUT_DIR, { recursive: true })

// ── 配色：{ bg 背景, mid 中间色, accent 主色, deep 深色 } ──
const P = {
  xiaohan:    { bg: '#eef3f9', mid: '#aac2dd', accent: '#5b7fa6', deep: '#2c3e50' },
  dahan:      { bg: '#f2ecf9', mid: '#bda6db', accent: '#7a5ba6', deep: '#2c2040' },
  lichun:     { bg: '#f0f8e8', mid: '#9fce8a', accent: '#5ba65b', deep: '#203c20' },
  yushui:     { bg: '#e8f4f8', mid: '#8fc8d8', accent: '#4a9ab5', deep: '#1a3040' },
  jingzhe:    { bg: '#fdf3f3', mid: '#f0a6b6', accent: '#e06a86', deep: '#7a2c3c' },
  chunfen:    { bg: '#fdeef2', mid: '#f3aec4', accent: '#e87fa6', deep: '#7a2c4c' },
  qingming:   { bg: '#e8f8f0', mid: '#86cca8', accent: '#2da870', deep: '#0a3020' },
  guyu:       { bg: '#fbf0f5', mid: '#e69ac0', accent: '#cc4f97', deep: '#5c1640' },
  lixia:      { bg: '#eef8e6', mid: '#a6cf72', accent: '#6fae2c', deep: '#2c4400' },
  xiaoman:    { bg: '#f8ffe8', mid: '#c5d96a', accent: '#9aae2c', deep: '#3c4400' },
  mangzhong:  { bg: '#fffce0', mid: '#d8c95a', accent: '#b89a20', deep: '#5c4c00' },
  xiazhi:     { bg: '#fff6e0', mid: '#f2c34a', accent: '#e8a020', deep: '#6c4400' },
  xiaoshu:    { bg: '#fff0e6', mid: '#f0a87a', accent: '#e8742c', deep: '#6c2c00' },
  dashu:      { bg: '#ffe8e2', mid: '#f08a70', accent: '#e0492c', deep: '#641400' },
  liqiu:      { bg: '#f8f0e2', mid: '#d6a86a', accent: '#c07830', deep: '#5c2c00' },
  chushu:     { bg: '#f6f1e2', mid: '#cdbb78', accent: '#a8902c', deep: '#4c3c00' },
  bailu:      { bg: '#eef8f2', mid: '#9ecdb4', accent: '#52a07c', deep: '#10402c' },
  qiufen:     { bg: '#fbf2e6', mid: '#e2b06a', accent: '#cc8a2c', deep: '#5c3800' },
  hanlu:      { bg: '#fbeee6', mid: '#e8946a', accent: '#d4582c', deep: '#641c00' },
  shuangjiang:{ bg: '#fbece6', mid: '#e88a5a', accent: '#d4502c', deep: '#5c1800' },
  lidong:     { bg: '#e9f0f4', mid: '#8aafa0', accent: '#3f7a64', deep: '#10342a' },
  xiaoxue:    { bg: '#eef3f8', mid: '#a6c2d8', accent: '#6890b8', deep: '#142840' },
  daxue:      { bg: '#eef2fb', mid: '#9ab2dd', accent: '#4878c0', deep: '#08203c' },
  dongzhi:    { bg: '#e9eef8', mid: '#9aaedd', accent: '#3060b8', deep: '#08142c' },
}

// ── 图元 ────────────────────────────────────────────────────
// 5 瓣花
function blossom(cx, cy, r, petal, center) {
  let s = `<g transform="translate(${cx} ${cy})">`
  for (let i = 0; i < 5; i++) {
    s += `<ellipse cx="0" cy="${-r * 0.62}" rx="${r * 0.46}" ry="${r * 0.66}" fill="${petal}" transform="rotate(${i * 72})"/>`
  }
  s += `<circle r="${r * 0.34}" fill="${center}"/></g>`
  return s
}

// 叶片（angle 度，len 长，w 宽）
function leaf(cx, cy, angle, len, w, color, vein) {
  return `<g transform="translate(${cx} ${cy}) rotate(${angle})">` +
    `<path d="M0 0 Q ${w} ${-len * 0.5} 0 ${-len} Q ${-w} ${-len * 0.5} 0 0 Z" fill="${color}"/>` +
    `<path d="M0 0 L0 ${-len * 0.92}" stroke="${vein}" stroke-width="1" fill="none" opacity="0.5"/></g>`
}

// 枝条
function branch(d, color, w) {
  return `<path d="${d}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`
}

// 雪花（6 角）
function snowflake(cx, cy, s, color) {
  let out = `<g transform="translate(${cx} ${cy})" stroke="${color}" stroke-width="1.4" stroke-linecap="round">`
  for (let i = 0; i < 6; i++) {
    out += `<g transform="rotate(${i * 60})"><line x1="0" y1="0" x2="0" y2="${-s}"/>` +
      `<line x1="0" y1="${-s * 0.6}" x2="${s * 0.28}" y2="${-s * 0.82}"/>` +
      `<line x1="0" y1="${-s * 0.6}" x2="${-s * 0.28}" y2="${-s * 0.82}"/></g>`
  }
  return out + `</g>`
}

// 雨滴 / 露珠
function drop(x, y, s, color) {
  return `<path d="M${x} ${y} q ${s * 0.55} ${s * 0.9} 0 ${s * 1.4} q ${-s * 0.55} ${-s * 0.5} 0 ${-s * 1.4} Z" fill="${color}"/>`
}

// 太阳（带光芒）
function sun(cx, cy, r, color, ray) {
  let out = `<g transform="translate(${cx} ${cy})">`
  for (let i = 0; i < 12; i++) {
    out += `<line x1="0" y1="${-r - 3}" x2="0" y2="${-r - (ray || 9)}" stroke="${color}" stroke-width="2" stroke-linecap="round" transform="rotate(${i * 30})"/>`
  }
  return out + `<circle r="${r}" fill="${color}"/></g>`
}

// 谷穗（type: 'wheat' 直立 | 'rice' 下垂）
function grain(x, baseY, h, color, type) {
  let s = branch(`M${x} ${baseY} L${x} ${baseY - h}`, color, 1.8)
  const top = baseY - h
  for (let i = 0; i < 6; i++) {
    const gy = top + i * (h / 7)
    const off = type === 'rice' ? 3 + i * 0.6 : 3
    const drp = type === 'rice' ? 4 : 0
    s += `<ellipse cx="${x - off}" cy="${gy + drp}" rx="1.7" ry="3" fill="${color}" transform="rotate(-25 ${x - off} ${gy + drp})"/>`
    s += `<ellipse cx="${x + off}" cy="${gy + drp}" rx="1.7" ry="3" fill="${color}" transform="rotate(25 ${x + off} ${gy + drp})"/>`
  }
  return s
}

// 松针小枝
function pine(cx, cy, color) {
  let s = branch(`M${cx} ${cy} L${cx} ${cy - 34}`, color, 2)
  for (let i = 0; i < 6; i++) {
    const y = cy - 4 - i * 5
    s += branch(`M${cx} ${y} L${cx - 11} ${y + 5}`, color, 1.3)
    s += branch(`M${cx} ${y} L${cx + 11} ${y + 5}`, color, 1.3)
  }
  return s
}

// 枫叶
function mapleLeaf(cx, cy, r, color, stem) {
  const pts = []
  for (let i = 0; i < 5; i++) {
    const a = (-90 + i * 60) * Math.PI / 180
    const a2 = (-90 + i * 60 + 30) * Math.PI / 180
    pts.push(`${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r}`)
    if (i < 4) pts.push(`${cx + Math.cos(a2) * r * 0.42} ${cy + Math.sin(a2) * r * 0.42}`)
  }
  return `<polygon points="${pts.join(' ')}" fill="${color}"/>` +
    branch(`M${cx} ${cy} L${cx} ${cy + r * 0.9}`, stem, 1.5)
}

// 蜻蜓
function dragonfly(cx, cy, color) {
  return `<g transform="translate(${cx} ${cy})" fill="${color}">` +
    `<ellipse cx="0" cy="0" rx="1.5" ry="9"/>` +
    `<ellipse cx="-7" cy="-3" rx="7" ry="2.2" opacity="0.7"/>` +
    `<ellipse cx="7" cy="-3" rx="7" ry="2.2" opacity="0.7"/>` +
    `<ellipse cx="-6" cy="1" rx="6" ry="2" opacity="0.5"/>` +
    `<ellipse cx="6" cy="1" rx="6" ry="2" opacity="0.5"/></g>`
}

// 柿子
function persimmon(cx, cy, r, color, calyx) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>` +
    `<path d="M${cx - r * 0.6} ${cy - r} q${r * 0.6} ${r * 0.4} ${r * 1.2} 0 q${-r * 0.3} ${r * 0.4} ${-r * 0.6} ${r * 0.4} q${-r * 0.3} 0 ${-r * 0.6} ${-r * 0.4} Z" fill="${calyx}"/>`
}

// 散落小点（花瓣 / 雪 / 露）
function dots(list, r, color, op) {
  return list.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${op || 1}"/>`).join('')
}

// ── 每个节气的构图 ─────────────────────────────────────────
const MOTIFS = {
  // 冬：梅花踏雪
  xiaohan: p => branch('M20 88 Q42 60 78 30', p.deep, 2.5) + branch('M40 66 Q52 52 64 50', p.deep, 1.6) +
    blossom(64, 48, 9, p.mid, p.accent) + blossom(46, 60, 7, p.mid, p.accent) + blossom(30, 78, 6, p.mid, p.accent) +
    snowflake(74, 70, 7, p.accent) + snowflake(24, 30, 6, p.mid),
  // 大寒：枯枝寒梅
  dahan: p => branch('M24 90 Q38 50 50 18', p.deep, 2.5) + branch('M40 56 L64 44', p.deep, 1.6) + branch('M44 40 L26 34', p.deep, 1.4) +
    blossom(64, 42, 8, p.mid, p.accent) + blossom(24, 32, 6, p.mid, p.accent) +
    snowflake(72, 74, 8, p.accent) + snowflake(20, 64, 6, p.mid) + snowflake(78, 30, 5, p.mid),
  // 立春：新芽破土
  lichun: p => branch('M50 92 L50 44', p.accent, 2.5) +
    leaf(50, 56, -42, 30, 16, p.mid, p.accent) + leaf(50, 50, 42, 34, 18, p.accent, p.deep) +
    `<ellipse cx="50" cy="40" rx="6" ry="9" fill="${p.deep}"/>` + dots([[30, 80], [72, 76]], 2, p.mid, 0.7),
  // 雨水：柳枝细雨
  yushui: p => branch('M30 14 Q40 50 36 86', p.accent, 2) + branch('M30 14 Q56 46 60 84', p.mid, 2) +
    Array.from({ length: 6 }, (_, i) => leaf(34 + i * 0.5, 28 + i * 9, 110, 12, 4, p.mid, p.accent)).join('') +
    drop(70, 30, 4, p.accent) + drop(78, 52, 4, p.mid) + drop(66, 64, 4, p.accent),
  // 惊蛰：桃花春雷
  jingzhe: p => branch('M16 86 Q40 56 80 36', p.deep, 2.5) +
    blossom(72, 34, 11, p.mid, p.accent) + blossom(50, 50, 9, p.mid, p.accent) + blossom(30, 70, 8, p.mid, p.accent) +
    dots([[84, 56], [22, 50], [60, 24]], 2.4, p.mid, 0.8),
  // 春分：樱花满枝
  chunfen: p => branch('M14 80 Q46 60 86 64', p.deep, 2.2) +
    blossom(30, 60, 9, p.mid, p.accent) + blossom(52, 50, 10, p.mid, p.accent) + blossom(74, 56, 9, p.mid, p.accent) +
    dots([[40, 78], [64, 74], [86, 40], [20, 38]], 2.6, p.mid, 0.8),
  // 清明：嫩草微雨
  qingming: p => Array.from({ length: 7 }, (_, i) => branch(`M${22 + i * 9} 90 Q${20 + i * 9} 64 ${24 + i * 9} 46`, i % 2 ? p.mid : p.accent, 2)).join('') +
    drop(34, 22, 4, p.mid) + drop(58, 30, 4, p.accent) + drop(74, 20, 4, p.mid),
  // 谷雨：牡丹盛放
  guyu: p => leaf(50, 86, -30, 26, 14, p.mid, p.deep) + leaf(50, 86, 30, 26, 14, p.mid, p.deep) +
    blossom(50, 48, 20, p.mid, p.accent) + blossom(50, 48, 11, p.accent, p.deep),
  // 立夏：荷叶蝉鸣
  lixia: p => `<path d="M50 50 m-32 0 a32 22 0 1 0 64 0 a32 22 0 1 0 -64 0" fill="${p.mid}"/>` +
    `<path d="M50 50 L50 30" stroke="${p.bg}" stroke-width="1.5"/>` +
    Array.from({ length: 8 }, (_, i) => branch(`M50 50 L${50 + Math.cos(i * 0.785) * 30} ${50 + Math.sin(i * 0.785) * 20}`, p.accent, 0.8)).join('') +
    branch('M50 50 Q56 70 52 90', p.accent, 2),
  // 小满：麦穗渐满
  xiaoman: p => grain(38, 90, 50, p.accent, 'wheat') + grain(58, 90, 56, p.mid, 'wheat') + grain(48, 90, 46, p.deep, 'wheat'),
  // 芒种：稻穗低垂
  mangzhong: p => grain(40, 88, 52, p.accent, 'rice') + grain(60, 88, 58, p.mid, 'rice') + grain(50, 88, 48, p.deep, 'rice'),
  // 夏至：向日葵
  xiazhi: p => Array.from({ length: 16 }, (_, i) => `<ellipse cx="50" cy="${50 - 22}" rx="4.5" ry="11" fill="${p.mid}" transform="rotate(${i * 22.5} 50 50)"/>`).join('') +
    `<circle cx="50" cy="50" r="14" fill="${p.deep}"/>` + `<circle cx="50" cy="50" r="14" fill="${p.accent}" opacity="0.3"/>` +
    branch('M50 64 L50 92', p.accent, 2.5),
  // 小暑：睡莲蜻蜓
  xiaoshu: p => `<path d="M14 70 a36 12 0 0 0 72 0" fill="${p.mid}" opacity="0.4"/>` +
    blossom(42, 58, 13, p.mid, p.accent) + dragonfly(68, 36, p.accent),
  // 大暑：荷花映日
  dashu: p => sun(74, 26, 9, p.mid, 7) +
    leaf(50, 84, 0, 18, 22, p.mid, p.deep) + blossom(46, 54, 17, p.mid, p.accent) + blossom(46, 54, 8, p.accent, p.deep),
  // 立秋：梧桐叶落
  liqiu: p => leaf(56, 40, 18, 40, 24, p.accent, p.deep) +
    leaf(30, 74, -50, 22, 13, p.mid, p.deep) + dots([[74, 70], [22, 30]], 2.4, p.mid, 0.7),
  // 处暑：秋谷初黄
  chushu: p => grain(42, 88, 50, p.accent, 'wheat') + grain(58, 88, 54, p.mid, 'wheat') +
    sun(72, 26, 7, p.mid, 6),
  // 白露：芦苇凝露
  bailu: p => branch('M34 90 Q32 50 36 18', p.accent, 2) + branch('M58 90 Q60 54 56 22', p.mid, 2) +
    `<ellipse cx="36" cy="16" rx="4" ry="9" fill="${p.mid}"/>` + `<ellipse cx="56" cy="20" rx="3.5" ry="8" fill="${p.accent}"/>` +
    drop(46, 46, 4, p.accent) + drop(64, 60, 3.5, p.mid) + drop(28, 64, 3.5, p.mid),
  // 秋分：丹桂飘香
  qiufen: p => branch('M50 92 L50 30', p.deep, 2) +
    [[40, 44], [60, 50], [44, 60], [58, 66], [50, 36]].map(([x, y]) => blossom(x, y, 6, p.mid, p.accent)).join('') +
    leaf(50, 70, -40, 16, 9, p.mid, p.deep) + leaf(50, 56, 40, 16, 9, p.mid, p.deep),
  // 寒露：红枫凝露
  hanlu: p => mapleLeaf(50, 46, 26, p.accent, p.deep) + drop(74, 30, 4, p.mid) + drop(26, 64, 3.5, p.mid),
  // 霜降：枫红柿黄
  shuangjiang: p => mapleLeaf(36, 42, 20, p.accent, p.deep) + persimmon(68, 62, 13, p.mid, p.deep),
  // 立冬：苍松
  lidong: p => pine(50, 90, p.accent) + pine(34, 88, p.mid) + pine(66, 88, p.mid),
  // 小雪：翠竹覆雪
  xiaoxue: p => branch('M42 92 L42 14', p.accent, 3) + branch('M58 92 L58 22', p.mid, 2.5) +
    leaf(42, 40, 60, 18, 6, p.accent, p.deep) + leaf(42, 30, 60, 16, 5, p.accent, p.deep) +
    leaf(58, 46, -55, 16, 5, p.mid, p.deep) +
    snowflake(72, 36, 6, p.accent) + snowflake(24, 60, 5, p.mid),
  // 大雪：松枝负雪
  daxue: p => pine(50, 92, p.accent) +
    snowflake(72, 34, 8, p.accent) + snowflake(26, 30, 6, p.mid) + snowflake(76, 68, 6, p.mid) + snowflake(22, 64, 5, p.accent),
  // 冬至：水仙清雅
  dongzhi: p => branch('M44 92 L44 50', p.accent, 2) + branch('M56 92 L56 54', p.mid, 2) +
    leaf(40, 90, 8, 50, 7, p.mid, p.deep) + leaf(60, 90, -8, 46, 7, p.accent, p.deep) +
    blossom(44, 46, 10, '#fffef5', p.accent) + blossom(60, 50, 9, '#fffef5', p.mid),
}

const NAMES = {
  xiaohan: '小寒', dahan: '大寒', lichun: '立春', yushui: '雨水', jingzhe: '惊蛰', chunfen: '春分',
  qingming: '清明', guyu: '谷雨', lixia: '立夏', xiaoman: '小满', mangzhong: '芒种', xiazhi: '夏至',
  xiaoshu: '小暑', dashu: '大暑', liqiu: '立秋', chushu: '处暑', bailu: '白露', qiufen: '秋分',
  hanlu: '寒露', shuangjiang: '霜降', lidong: '立冬', xiaoxue: '小雪', daxue: '大雪', dongzhi: '冬至',
}

function build(key) {
  const p = P[key]
  const motif = MOTIFS[key](p)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.bg}"/>
      <stop offset="1" stop-color="${p.mid}" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="14" fill="url(#bg)"/>
  ${motif}
</svg>`
}

let n = 0
for (const key of Object.keys(MOTIFS)) {
  const svg = build(key)
  writeFileSync(join(OUTPUT_DIR, `${key}.svg`), svg)
  console.log(`  ✓ ${NAMES[key]} (${key}.svg)`)
  n++
}
console.log(`\n生成完成：${n} 张节气插画 → ${OUTPUT_DIR}`)
