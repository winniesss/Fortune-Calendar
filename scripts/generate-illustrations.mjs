/**
 * 批量生成 24 节气插画脚本
  * 使用方法：
   *   OPENAI_API_KEY=sk-xxx node scripts/generate-illustrations.mjs
    *
     * 需要 openai 包：npm install openai
      * 生成的图片保存到 public/illustrations/
       */

       import OpenAI from 'openai'
       import { writeFileSync, mkdirSync } from 'fs'
       import { join, dirname } from 'path'
       import { fileURLToPath } from 'url'
       import https from 'https'

       const __dirname = dirname(fileURLToPath(import.meta.url))
       const OUTPUT_DIR = join(__dirname, '../public/illustrations')

       mkdirSync(OUTPUT_DIR, { recursive: true })

       const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

       const SOLAR_TERMS = [
         { key: 'xiaohan',    name: '小寒', desc: '隆冬时节，梅花初绽，冰雪中透出生机' },
           { key: 'dahan',      name: '大寒', desc: '严寒极致，腊梅傲雪，冰晶与枯枝交织' },
             { key: 'lichun',     name: '立春', desc: '春回大地，嫩芽萌发，迎春花点点金黄' },
               { key: 'yushui',     name: '雨水', desc: '春雨润物，柳芽初绿，雨珠挂枝头' },
                 { key: 'jingzhe',    name: '惊蛰', desc: '春雷惊蛰，桃花盛放，万物复苏' },
                   { key: 'chunfen',    name: '春分', desc: '昼夜均等，樱花烂漫，春意正浓' },
                     { key: 'qingming',   name: '清明', desc: '清明时节，杏花微雨，嫩草如茵' },
                       { key: 'guyu',       name: '谷雨', desc: '谷雨滋润，牡丹盛开，绿意盎然' },
                         { key: 'lixia',      name: '立夏', desc: '立夏初至，荷叶田田，蝉鸣渐起' },
                           { key: 'xiaoman',    name: '小满', desc: '麦穗渐满，蔷薇花开，初夏清新' },
                             { key: 'mangzhong',  name: '芒种', desc: '芒种时节，稻穗飘香，石榴花红' },
                               { key: 'xiazhi',     name: '夏至', desc: '夏至极昼，向日葵盛放，热烈明媚' },
                                 { key: 'xiaoshu',    name: '小暑', desc: '小暑热浪，睡莲安然，蜻蜓点水' },
                                   { key: 'dashu',      name: '大暑', desc: '大暑酷热，荷花映日，蝉声响彻' },
                                     { key: 'liqiu',      name: '立秋', desc: '立秋凉意，桂花飘香，梧桐叶落' },
                                       { key: 'chushu',     name: '处暑', desc: '暑气渐消，秋菊初绽，稻穗金黄' },
                                         { key: 'bailu',      name: '白露', desc: '白露为霜，芦苇摇曳，秋意渐浓' },
                                           { key: 'qiufen',     name: '秋分', desc: '秋分时节，丹桂飘香，层林尽染' },
                                             { key: 'hanlu',      name: '寒露', desc: '寒露凝珠，红枫如火，菊花傲霜' },
                                               { key: 'shuangjiang', name: '霜降', desc: '霜降枫红，柿子挂枝，秋深意浓' },
                                                 { key: 'lidong',     name: '立冬', desc: '立冬收藏，松柏苍翠，北风萧瑟' },
                                                   { key: 'xiaoxue',    name: '小雪', desc: '小雪初降，竹叶覆白，寂静清寒' },
                                                     { key: 'daxue',      name: '大雪', desc: '大雪纷飞，松枝负雪，银装素裹' },
                                                       { key: 'dongzhi',    name: '冬至', desc: '冬至最长夜，水仙清雅，阴极阳生' },
                                                       ]

                                                       async function downloadImage(url, filepath) {
                                                         return new Promise((resolve, reject) => {
                                                             const file = require('fs').createWriteStream(filepath)
                                                                 https.get(url, (response) => {
                                                                       response.pipe(file)
                                                                             file.on('finish', () => { file.close(); resolve() })
                                                                                 }).on('error', reject)
                                                                                   })
                                                                                   }

                                                                                   async function generateIllustration(term) {
                                                                                     const prompt = `Traditional Chinese botanical illustration of "${term.name}" solar term. ${term.desc}. 
                                                                                     Style: delicate ink wash painting with soft watercolor, muted earthy tones, white background, 
                                                                                     minimalist composition, hand-illustrated botanicals, no text, square format, 
                                                                                     suitable for a desk calendar app. High quality, artistically refined.`

                                                                                       console.log(`Generating ${term.name} (${term.key})...`)

                                                                                           const response = await client.images.generate({
                                                                                               model: 'dall-e-3',
                                                                                                   prompt,
                                                                                                       n: 1,
                                                                                                           size: '1024x1024',
                                                                                                               quality: 'standard',
                                                                                                                   style: 'natural',
                                                                                                                     })
                                                                                                                     
                                                                                                                       const imageUrl = response.data[0].url
                                                                                                                         const outputPath = join(OUTPUT_DIR, `${term.key}.png`)
                                                                                                                           
                                                                                                                             // Download the image
                                                                                                                               await downloadImage(imageUrl, outputPath)
                                                                                                                                 console.log(`  Saved: ${outputPath}`)
                                                                                                                                   
                                                                                                                                     // Rate limit: wait 12 seconds between requests (DALL-E 3 limit: 5 images/min)
                                                                                                                                       await new Promise(r => setTimeout(r, 12000))
                                                                                                                                       }
                                                                                                                                       
                                                                                                                                       async function main() {
                                                                                                                                         if (!process.env.OPENAI_API_KEY) {
                                                                                                                                             console.error('Error: OPENAI_API_KEY environment variable not set')
                                                                                                                                                 process.exit(1)
                                                                                                                                                   }
                                                                                                                                                     
                                                                                                                                                       console.log(`Generating ${SOLAR_TERMS.length} solar term illustrations...`)
                                                                                                                                                         console.log(`Output directory: ${OUTPUT_DIR}`)
                                                                                                                                                           console.log('Note: This will take ~5 minutes due to rate limits.\n')
                                                                                                                                                             
                                                                                                                                                               for (const term of SOLAR_TERMS) {
                                                                                                                                                                   await generateIllustration(term)
                                                                                                                                                                     }
                                                                                                                                                                       
                                                                                                                                                                         console.log('\nAll illustrations generated successfully!')
                                                                                                                                                                         }
                                                                                                                                                                         
                                                                                                                                                                         main().catch(console.error)
