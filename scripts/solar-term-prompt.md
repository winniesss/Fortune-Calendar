# 节气插画生成 Prompt 指南

## 给 ChatGPT / DALL-E 的统一风格 Prompt

### 基础模板

```
Traditional Chinese botanical illustration for the "[节气名]" solar term.
Scene: [具体描述]
Style requirements:
- Delicate ink wash painting (水墨画) with soft watercolor washes
- Muted, earthy color palette: sage green, dusty rose, warm ochre, slate blue
- Clean white or very light cream background
- Minimalist composition with negative space
- Hand-illustrated botanical elements (flowers, leaves, branches)
- No text, no characters, no people
- Square format (1:1), suitable for a small app icon (80x80px display)
- Soft, dreamy, contemplative mood
```

### 24 节气具体描述

| 节气 | 文件名 | 场景描述 |
|------|--------|----------|
| 小寒 | xiaohan.png | 梅花枝头，冰雪覆盖，一两朵红梅初绽 |
| 大寒 | dahan.png | 腊梅傲雪，冰晶挂枝，枯枝与雪的极简构图 |
| 立春 | lichun.png | 迎春花金黄，嫩绿芽苞，春意初现 |
| 雨水 | yushui.png | 柳枝滴水，雨珠晶莹，嫩芽初绿 |
| 惊蛰 | jingzhe.png | 桃花盛放，几片花瓣飘落，春雷意象 |
| 春分 | chunfen.png | 樱花满枝，花瓣纷飞，粉白色调 |
| 清明 | qingming.png | 杏花雨中，嫩草如茵，清新绿意 |
| 谷雨 | guyu.png | 牡丹盛开，雨后露珠，大朵华贵 |
| 立夏 | lixia.png | 荷叶初展，小荷才露，清新水意 |
| 小满 | xiaoman.png | 蔷薇花开，麦穗渐丰，初夏清新 |
| 芒种 | mangzhong.png | 石榴花红，稻穗飘香，夏意正浓 |
| 夏至 | xiazhi.png | 向日葵明媚，阳光充足，热烈金黄 |
| 小暑 | xiaoshu.png | 睡莲静卧，蜻蜓点水，清凉水面 |
| 大暑 | dashu.png | 荷花映日，荷叶蔽天，盛夏热烈 |
| 立秋 | liqiu.png | 桂花飘香，梧桐叶初黄，秋意初现 |
| 处暑 | chushu.png | 秋菊初绽，稻穗金黄，暑去凉来 |
| 白露 | bailu.png | 芦苇摇曳，露珠晶莹，秋水长天 |
| 秋分 | qiufen.png | 丹桂满枝，层林染色，金秋正好 |
| 寒露 | hanlu.png | 红枫如火，菊花傲霜，秋深色浓 |
| 霜降 | shuangjiang.png | 柿子挂枝，霜叶红遍，深秋意境 |
| 立冬 | lidong.png | 松柏苍翠，北风萧瑟，收藏意象 |
| 小雪 | xiaoxue.png | 竹叶覆雪，细雪初降，静谧清寒 |
| 大雪 | daxue.png | 松枝负雪，银装素裹，大雪纷飞 |
| 冬至 | dongzhi.png | 水仙清雅，阴极阳生，一缕暖意 |

### 使用方法

1. **ChatGPT 手动生成**：将上面的基础模板 + 具体场景描述复制到 ChatGPT，
   点击图片生成，下载后命名为对应文件名放入 `public/illustrations/`

   2. **脚本批量生成**：使用 `generate-illustrations.mjs`（需要 OpenAI API Key）

   ### 图片规格要求

   - 尺寸：至少 400x400px（推荐 1024x1024px 后压缩）
   - 格式：PNG（支持透明背景更佳）
   - 文件大小：每张建议 < 200KB
   - 命名：严格按照上表文件名（全小写，英文）
