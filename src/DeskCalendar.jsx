import React, { useState, useEffect, useCallback } from 'react'

// ── 24 节气数据 ──────────────────────────────────────────────
const SOLAR_TERMS = [
  { key: 'xiaohan',   name: '小寒', month: 1,  day: 5  },
  { key: 'dahan',     name: '大寒', month: 1,  day: 20 },
  { key: 'lichun',    name: '立春', month: 2,  day: 4  },
  { key: 'yushui',    name: '雨水', month: 2,  day: 19 },
  { key: 'jingzhe',   name: '惊蛰', month: 3,  day: 6  },
  { key: 'chunfen',   name: '春分', month: 3,  day: 21 },
  { key: 'qingming',  name: '清明', month: 4,  day: 5  },
  { key: 'guyu',      name: '谷雨', month: 4,  day: 20 },
  { key: 'lixia',     name: '立夏', month: 5,  day: 6  },
  { key: 'xiaoman',   name: '小满', month: 5,  day: 21 },
  { key: 'mangzhong', name: '芒种', month: 6,  day: 6  },
  { key: 'xiazhi',    name: '夏至', month: 6,  day: 21 },
  { key: 'xiaoshu',   name: '小暑', month: 7,  day: 7  },
  { key: 'dashu',     name: '大暑', month: 7,  day: 23 },
  { key: 'liqiu',     name: '立秋', month: 8,  day: 7  },
  { key: 'chushu',    name: '处暑', month: 8,  day: 23 },
  { key: 'bailu',     name: '白露', month: 9,  day: 8  },
  { key: 'qiufen',    name: '秋分', month: 9,  day: 23 },
  { key: 'hanlu',     name: '寒露', month: 10, day: 8  },
  { key: 'shuangjiang', name: '霜降', month: 10, day: 23 },
  { key: 'lidong',    name: '立冬', month: 11, day: 7  },
  { key: 'xiaoxue',   name: '小雪', month: 11, day: 22 },
  { key: 'daxue',     name: '大雪', month: 12, day: 7  },
  { key: 'dongzhi',   name: '冬至', month: 12, day: 22 },
  ]

// ── 天干地支 ────────────────────────────────────────────────
const TIANGAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const DIZHI   = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
const SHUXIANG = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪']

function getGanZhi(year) {
    const g = (year - 4) % 10
    const z = (year - 4) % 12
    return TIANGAN[g] + DIZHI[z]
}

function getShuxiang(year) {
    return SHUXIANG[(year - 4) % 12]
}

// ── 获取当前节气 ─────────────────────────────────────────────
function getCurrentSolarTerm(date) {
    const m = date.getMonth() + 1
    const d = date.getDate()
    let current = null
    let next = null
    for (let i = 0; i < SOLAR_TERMS.length; i++) {
          const t = SOLAR_TERMS[i]
          if (t.month < m || (t.month === m && t.day <= d)) {
                  current = t
          } else if (!next) {
                  next = t
          }
    }
    if (!current) current = SOLAR_TERMS[SOLAR_TERMS.length - 1]
    if (!next) next = SOLAR_TERMS[0]
    return { current, next }
}

// ── 宜忌列表 ────────────────────────────────────────────────
const YI_LIST = ['出行','会友','签约','开业','学习','运动','创作','冥想','晒太阳','读书','烹饪','园艺']
const JI_LIST = ['争吵','熬夜','冲动消费','久坐','暴饮暴食','焦虑','拖延','散漫']

function getDailyYiJi(seed) {
    const s = seed % 7
    return {
          yi: [YI_LIST[(s * 3) % YI_LIST.length], YI_LIST[(s * 3 + 1) % YI_LIST.length], YI_LIST[(s * 3 + 2) % YI_LIST.length]],
          ji: [JI_LIST[s % JI_LIST.length], JI_LIST[(s + 2) % JI_LIST.length]]
    }
}

// ── 运势评分 ─────────────────────────────────────────────────
function getFortuneScore(birthYear, birthMonth, birthDay, todaySeed) {
    const base = ((birthYear + birthMonth * 3 + birthDay * 7 + todaySeed) % 40) + 60
    return base
}

// ── 农历简易转换（近似） ─────────────────────────────────────
const LUNAR_MONTHS = ['正','二','三','四','五','六','七','八','九','十','冬','腊']
const LUNAR_DAYS_TENS = ['初','十','廿','三']
const LUNAR_DAYS_ONES = ['日','一','二','三','四','五','六','七','八','九','十']

function getLunarDay(day) {
    if (day === 10) return '初十'
    if (day === 20) return '二十'
    if (day === 30) return '三十'
    const tens = LUNAR_DAYS_TENS[Math.floor(day / 10)]
    const ones = LUNAR_DAYS_ONES[day % 10]
    return tens + ones
}

// ── 节气颜色主题 ──────────────────────────────────────────────
const TERM_COLORS = {
    xiaohan:    { bg: '#e8f0f8', accent: '#5b7fa6', text: '#2c3e50' },
    dahan:      { bg: '#f0e8f8', accent: '#7a5ba6', text: '#2c2040' },
    lichun:     { bg: '#f0f8e8', accent: '#5ba65b', text: '#203c20' },
    yushui:     { bg: '#e8f4f8', accent: '#4a9ab5', text: '#1a3040' },
    jingzhe:    { bg: '#fef8e8', accent: '#c8a832', text: '#3c2c00' },
    chunfen:    { bg: '#f8f0e8', accent: '#d4845a', text: '#3c1a00' },
    qingming:   { bg: '#e8f8f0', accent: '#2da870', text: '#0a3020' },
    guyu:       { bg: '#f8fee8', accent: '#8ab52c', text: '#283c00' },
    lixia:      { bg: '#fff8e8', accent: '#e8a820', text: '#3c2800' },
    xiaoman:    { bg: '#f8ffe8', accent: '#7ec820', text: '#203800' },
    mangzhong:  { bg: '#fffee0', accent: '#c8c020', text: '#383800' },
    xiazhi:     { bg: '#fff8e0', accent: '#e88c20', text: '#3c2000' },
    xiaoshu:    { bg: '#fff0e0', accent: '#e86020', text: '#3c1000' },
    dashu:      { bg: '#ffe8e0', accent: '#e84020', text: '#3c0800' },
    liqiu:      { bg: '#f8f0e0', accent: '#c87830', text: '#3c2000' },
    chushu:     { bg: '#f0ece0', accent: '#a09060', text: '#302810' },
    bailu:      { bg: '#f0f8f4', accent: '#60a880', text: '#103828' },
    qiufen:     { bg: '#f8f0e8', accent: '#c88040', text: '#3c1800' },
    hanlu:      { bg: '#f0f4f8', accent: '#6080a8', text: '#101828' },
    shuangjiang:{ bg: '#f4f0f8', accent: '#9070a8', text: '#201030' },
    lidong:     { bg: '#e8f0f8', accent: '#4870a8', text: '#101828' },
    xiaoxue:    { bg: '#f0f4f8', accent: '#6890b8', text: '#101820' },
    daxue:      { bg: '#f0f4fc', accent: '#4878c0', text: '#081830' },
    dongzhi:    { bg: '#e8eef8', accent: '#3060b8', text: '#081028' },
}

const DEFAULT_COLOR = { bg: '#f5f0e8', accent: '#8b7355', text: '#3c2800' }

// ── 主组件 ───────────────────────────────────────────────────
export default function DeskCalendar() {
    const today = new Date()
    const [birthDate, setBirthDate] = useState({ year: '', month: '', day: '' })
    const [showInput, setShowInput] = useState(true)
    const [fortune, setFortune] = useState(null)

  // Load saved birth date
  useEffect(() => {
        const saved = localStorage.getItem('fortune_birthdate')
        if (saved) {
                const parsed = JSON.parse(saved)
                setBirthDate(parsed)
                setShowInput(false)
                calcFortune(parsed)
        }
  }, [])

  const calcFortune = useCallback((bd) => {
        const { year, month, day } = bd
        if (!year || !month || !day) return
        const todaySeed = today.getFullYear() * 10000 + (today.getMonth()+1) * 100 + today.getDate()
        const score = getFortuneScore(parseInt(year), parseInt(month), parseInt(day), todaySeed)
        const { current, next } = getCurrentSolarTerm(today)
        const yiji = getDailyYiJi(todaySeed % 100 + parseInt(day))
        const ganzhiYear = getGanZhi(today.getFullYear())
        const shuxiang = getShuxiang(today.getFullYear())
        // Approximate lunar date (simplified)
                                      const lunarMonth = ((today.getMonth() + 10) % 12)
        const lunarDay = today.getDate() % 30 || 30

                                      setFortune({
                                              score,
                                              currentTerm: current,
                                              nextTerm: next,
                                              yiji,
                                              ganzhiYear,
                                              shuxiang,
                                              lunarMonth: LUNAR_MONTHS[lunarMonth],
                                              lunarDay: getLunarDay(lunarDay),
                                      })
  }, [today])

  const handleSaveBirth = () => {
        if (!birthDate.year || !birthDate.month || !birthDate.day) return
        localStorage.setItem('fortune_birthdate', JSON.stringify(birthDate))
        setShowInput(false)
        calcFortune(birthDate)
  }

  const colors = fortune ? (TERM_COLORS[fortune.currentTerm.key] || DEFAULT_COLOR) : DEFAULT_COLOR

  const weekdays = ['日','一','二','三','四','五','六']
    const weekday = weekdays[today.getDay()]

  // Star rating display
  const stars = fortune ? Math.round((fortune.score - 60) / 8) : 0

  const imgBase = import.meta.env.BASE_URL + 'illustrations/'

  return (
        <div style={{
                minHeight: '100vh',
                background: colors.bg,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '20px 16px 40px',
                transition: 'background 0.8s ease',
        }}>
          {/* Header */}
                <div style={{ width: '100%', maxWidth: 420, marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ fontSize: 13, color: colors.accent, letterSpacing: 2 }}>运势日历</span>
                                      <button
                                                    onClick={() => setShowInput(true)}
                                                    style={{ background: 'none', border: 'none', fontSize: 12, color: colors.accent, cursor: 'pointer', opacity: 0.7 }}
                                                  >
                                                  ⚙ 修改生日
                                      </button>
                          </div>
                </div>
        
          {/* Main Card */}
              <div style={{
                  width: '100%',
                  maxWidth: 420,
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: 24,
                  padding: '28px 28px 24px',
                  boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
                  border: `1px solid ${colors.accent}30`,
        }}>
                {/* Date Row */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div>
                                            <div style={{ fontSize: 72, fontWeight: 200, color: colors.text, lineHeight: 1, letterSpacing: -2 }}>
                                              {String(today.getDate()).padStart(2,'0')}
                                            </div>
                                            <div style={{ fontSize: 16, color: colors.accent, marginTop: 4, letterSpacing: 1 }}>
                                              {today.getFullYear()}年 {today.getMonth()+1}月 星期{weekday}
                                            </div>
                                </div>
                        {/* Solar term illustration */}
                        {fortune && (
                      <div style={{ textAlign: 'center' }}>
                                    <img
                                                      src={`${imgBase}${fortune.currentTerm.key}.png`}
                                                      alt={fortune.currentTerm.name}
                                                      style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', opacity: 0.9 }}
                                                      onError={(e) => { e.target.style.display = 'none' }}
                                                    />
                                    <div style={{ fontSize: 12, color: colors.accent, marginTop: 4, letterSpacing: 1 }}>
                                      {fortune.currentTerm.name}
                                    </div>
                      </div>
                                )}
                      </div>
              
                {/* Lunar & GanZhi */}
                {fortune && (
                    <div style={{
                                  display: 'flex',
                                  gap: 12,
                                  marginBottom: 20,
                                  padding: '10px 14px',
                                  background: `${colors.accent}15`,
                                  borderRadius: 12,
                    }}>
                                <span style={{ fontSize: 13, color: colors.text }}>
                                              农历 {fortune.lunarMonth}月{fortune.lunarDay}
                                </span>
                                <span style={{ color: colors.accent, opacity: 0.4 }}>·</span>
                                <span style={{ fontSize: 13, color: colors.text }}>
                                  {fortune.ganzhiYear}年 {fortune.shuxiang}年
                                </span>
                    </div>
                      )}
              
                {/* Fortune Score */}
                {fortune ? (
                    <div style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                              <span style={{ fontSize: 14, color: colors.text, letterSpacing: 1 }}>今日运势</span>
                                              <span style={{ fontSize: 22, fontWeight: 600, color: colors.accent }}>{fortune.score}</span>
                                </div>
                      {/* Progress bar */}
                                <div style={{ background: `${colors.accent}20`, borderRadius: 8, height: 8, overflow: 'hidden' }}>
                                              <div style={{
                                      width: `${fortune.score}%`,
                                      height: '100%',
                                      background: `linear-gradient(90deg, ${colors.accent}80, ${colors.accent})`,
                                      borderRadius: 8,
                                      transition: 'width 1s ease',
                    }} />
                                </div>
                      {/* Stars */}
                                <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                                  {[1,2,3,4,5].map(i => (
                                      <span key={i} style={{ fontSize: 18, color: i <= stars ? colors.accent : `${colors.accent}30` }}>
                                        {i <= stars ? '★' : '☆'}
                                      </span>
                                    ))}
                                </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: colors.accent, opacity: 0.6, fontSize: 14 }}>
                                请输入生日以查看个人运势
                    </div>
                      )}
              
                {/* Yi Ji */}
                {fortune && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                                <div style={{ background: `${colors.accent}12`, borderRadius: 12, padding: '12px 14px' }}>
                                              <div style={{ fontSize: 12, color: colors.accent, marginBottom: 8, letterSpacing: 1 }}>宜</div>
                                  {fortune.yiji.yi.map(item => (
                                      <div key={item} style={{ fontSize: 13, color: colors.text, marginBottom: 4 }}>✓ {item}</div>
                                    ))}
                                </div>
                                <div style={{ background: '#ff6b6b12', borderRadius: 12, padding: '12px 14px' }}>
                                              <div style={{ fontSize: 12, color: '#c0392b', marginBottom: 8, letterSpacing: 1 }}>忌</div>
                                  {fortune.yiji.ji.map(item => (
                                      <div key={item} style={{ fontSize: 13, color: colors.text, marginBottom: 4 }}>✗ {item}</div>
                                    ))}
                                </div>
                    </div>
                      )}
              
                {/* Next solar term */}
                {fortune && (
                    <div style={{
                                  fontSize: 12,
                                  color: colors.accent,
                                  opacity: 0.7,
                                  textAlign: 'center',
                                  letterSpacing: 1,
                    }}>
                                下一节气：{fortune.nextTerm.name}（{fortune.nextTerm.month}月{fortune.nextTerm.day}日）
                    </div>
                      )}
              </div>
        
          {/* Birth date input modal */}
          {showInput && (
                  <div style={{
                              position: 'fixed', inset: 0,
                              background: 'rgba(0,0,0,0.4)',
                              backdropFilter: 'blur(8px)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              zIndex: 100, padding: 24,
                  }}>
                            <div style={{
                                background: colors.bg,
                                borderRadius: 24,
                                padding: '32px 28px',
                                width: '100%',
                                maxWidth: 340,
                                boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
                  }}>
                                        <h2 style={{ fontSize: 20, color: colors.text, marginBottom: 8, fontWeight: 400 }}>
                                                      🌿 欢迎使用运势日历
                                        </h2>
                                        <p style={{ fontSize: 13, color: colors.accent, marginBottom: 24, lineHeight: 1.6 }}>
                                                      输入您的出生日期，获取基于八字的每日运势指引
                                        </p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
                                                      <input
                                                                        type="number"
                                                                        placeholder="年 (如1990)"
                                                                        value={birthDate.year}
                                                                        onChange={e => setBirthDate(b => ({ ...b, year: e.target.value }))}
                                                                        style={{
                                                                                            padding: '12px 14px', borderRadius: 12, border: `1px solid ${colors.accent}40`,
                                                                                            fontSize: 14, background: 'rgba(255,255,255,0.8)', color: colors.text,
                                                                                            outline: 'none',
                                                                        }}
                                                                      />
                                                      <input
                                                                        type="number"
                                                                        placeholder="月"
                                                                        min={1} max={12}
                                                                        value={birthDate.month}
                                                                        onChange={e => setBirthDate(b => ({ ...b, month: e.target.value }))}
                                                                        style={{
                                                                                            padding: '12px 14px', borderRadius: 12, border: `1px solid ${colors.accent}40`,
                                                                                            fontSize: 14, background: 'rgba(255,255,255,0.8)', color: colors.text,
                                                                                            outline: 'none',
                                                                        }}
                                                                      />
                                                      <input
                                                                        type="number"
                                                                        placeholder="日"
                                                                        min={1} max={31}
                                                                        value={birthDate.day}
                                                                        onChange={e => setBirthDate(b => ({ ...b, day: e.target.value }))}
                                                                        style={{
                                                                                            padding: '12px 14px', borderRadius: 12, border: `1px solid ${colors.accent}40`,
                                                                                            fontSize: 14, background: 'rgba(255,255,255,0.8)', color: colors.text,
                                                                                            outline: 'none',
                                                                        }}
                                                                      />
                                        </div>
                                        <button
                                                        onClick={handleSaveBirth}
                                                        style={{
                                                                          width: '100%', padding: '14px', borderRadius: 14,
                                                                          background: colors.accent, color: '#fff',
                                                                          border: 'none', fontSize: 16, cursor: 'pointer',
                                                                          letterSpacing: 1, fontWeight: 500,
                                                        }}
                                                      >
                                                      查看今日运势
                                        </button>
                            </div>
                  </div>
              )}
        </div>
      )
}</button>
