# 角色動作與貼地設定

目前採用完整角色逐格圖集（沒有假拆成頭部、身體、武器，也沒有骨骼動畫引擎）。兩個角色各有 16 幀：前 8 幀循環爬行，後 8 幀為趴姿、微微起身抬炮、發射、後座、降低炮口、回到趴姿。

## 遊戲行為

- 按住 A／D 時，以每秒 12 幀持續循環爬行，不依賴實際位移、地面接觸或碰撞；放開立即停止，左右同時按下視為停止。
- 按住蓄力會播放起身與抬炮，放開發射時播放發射與後座，接著完整收回趴姿。
- 連擊的後續發射也會觸發後座與回復動作。
- 角色附近地形取樣後直接對齊傾斜，最大 ±25°；貼地位移最多 8 像素，允許約 3 像素交疊，避免過度穿模與突然跳動。
- 只修改渲染姿態，不改碰撞圓心、半徑、炮彈出生點、重力、風力、地形破壞或發射角度。
- 這是整體角色的動作幀，炮口圖案會依起身動作抬起；實際瞄準角仍以既有虛線為準，沒有宣稱已能任意獨立旋轉炮筒。

## 調整位置

專案：本儲存庫根目錄

- `character-animation.js`：`ANIMATION_CONFIG.crawl.framesPerSecond` 控制爬行幀率；`shot.prepareDuration` 為起身時間、`shot.recoverDuration` 為發射後回趴時間；保留原有閃爍與後座設定。
- `character-ground.js`：`GROUND_CONFIG.maxTiltDegrees` 為最大傾角；`maxOffset` 限制貼地位移，`allowedPenetration` 控制可接受交疊。
- `character-sprites.js`：各幀 source rect 與腳底對齊設定；生成圖未改動，只校正取圖座標。
- `character-renderer.js`：逐格、完整靜態圖與真實三圖層的渲染接口。動作素材失敗時回退到原完整角色圖。
- `assets/girl-actions.png`、`assets/boy-actions.png`：內建 imagegen 生成的 RGBA 圖集；同名 JSON 保留取圖與對齊資料。

## 後續分層接口

取得真正分層透明素材後，skin 可改為 `mode:'layered'`，並設定 `layers.body`、`layers.head`、`layers.weapon`。各圖層提供 `src,x,y,width,height`；可選 `source:[sx,sy,sw,sh]`，武器另有 `pivot:[x,y]`。頭部支援獨立浮動，武器支援依瞄準角旋轉與後座。現有動作圖不是分層圖。

## 素材生成紀錄

使用內建 imagegen 編輯／生成，輸出已複製到專案 assets，沒有使用 CLI。女孩以原完整圖集右側角色為身份參考；男孩以原圖左側角色為身份參考，另用女孩序列作動作版面參考。生成時要求 4×4 等格，實際輸出為 1254×1254；已依每排實際內容校正取圖座標，不假設格線完全精準。

女孩提示詞：

> Use case: identity-preserve game animation sprite sheet. Use ONLY the red-haired girl with red bow, red clothes and red/gold cannon from RIGHT of reference. Generate a production 4 columns by 4 rows sprite sheet, exactly 16 complete full-body frames. True transparent background, no grid lines, no text/numbers, no shadows or glow. Uniform equal square cells, each character centered at same scale, feet/belly ground baseline at 84% of its cell, original low-resolution pixel art style. All frames face RIGHT, same character identity and large cannon, no cropping/overlap across cells. Rows 1-2 (8 frames read left-to-right) are a smooth looping prone military forward crawl: alternate elbows reaching and pulling, knees and boots bending/pushing, body close to ground and cannon held forward. Clear distinct poses, not identical duplicates. Rows 3-4 (8 frames read left-to-right) are one complete shot and return sequence: frame1 flat prone ready, frame2 slight chest lift supported on elbows, frame3 chest raised a little and cannon tilting up about 25 degrees, frame4 raised firing pose with SMALL muzzle flash, frame5 subtle recoil backward while raised no flash, frame6 easing torso and cannon downward, frame7 almost prone, frame8 exactly flat prone ready matching frame1. This is a small lift, not standing or kneeling. Keep full hair, bow, boots and complete cannon in every cell. Preserve generous transparent padding inside all cells and stable alignment. Output square image 2048 by 2048 with exactly four uniform columns and four uniform rows.

男孩提示詞：

> Use case: identity-preserve game animation sprite sheet. Reference 1 identity: ONLY blue boy with brown spiky hair, blue clothes, blue boots, gray-blue gold cannon on LEFT. Reference 2: layout and animation sequence ONLY, do not use girl's appearance. Generate boy sprite sheet exactly FOUR columns FOUR rows, 16 complete full-body frames, square image. True transparent background, no grid, text, background, shadows or glow. Stable scale across frames, face RIGHT in every cell, equal square cells, feet ground baseline 84% cell height. Pixel art like reference, entire hair/boots/cannon visible and no overlap across cells. Rows1-2 = 8-frame looping prone crawl forward, elbows alternating reach/pull, knees/boots pushing, cannon forward, body stays low. Rows3-4 = 8-frame complete firing sequence: 1 flat prone ready; 2 slight chest lift on elbows; 3 chest slightly raised cannon elevated 25deg; 4 raised firing pose with SMALL muzzle flash; 5 recoil while raised; 6 lowering chest/cannon; 7 nearly flat; 8 fully prone identical to first firing frame. Distinct gradual intermediate poses, no standing/kneeling. Keep boy identity and cannon design consistent. Character fits inside each cell with transparent margins. Output 2048x2048.

移動不使用加速、減速或水平慣性；放開按鍵後即停止。貼地位移與傾斜也不使用延遲追蹤，避免角色停止後仍然緩動。

## 貼地抗抖更新
移動能量為 0 時，即使仍按著 A／D，也不播放爬行。動畫循環本身仍由按鍵與時間控制。

視覺貼地改用 6 像素腳底接觸容差，避免 grounded 一幀切換就突然站直。角度變化不足 1.5°、貼地位移不足 1 像素時保留上一個顯示姿態；超過門檻即更新，不加入位置插值或水平慣性。參數在 character-ground.js 的 GROUND_CONFIG。待機浮動也降低至 0.35 像素。這些處理只影響渲染，不影響碰撞與重力。

舒適度優先設定：接觸容差提高至 12 像素、角度死區 4°、位移死區 3 像素。
