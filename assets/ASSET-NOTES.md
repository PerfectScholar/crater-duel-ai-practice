# 炸彈素材

來源：使用者提供的「透明背景的卡通炸彈圖示.png」。原檔 RGB，方格背景已烘焙進圖。使用內建 imagegen 去背，輸出 bomb.png 為 RGBA，透明度範圍 0–255；原始檔未修改。

最終提示詞：

Use case: background-extraction. Edit target: supplied cartoon bomb icon. Remove ONLY the baked-in gray and white checkerboard background and replace it with genuine transparent alpha. Preserve the black round bomb, shiny highlights, rope fuse, bright orange yellow spark and small spark particles as closely as possible. Same composition and square framing, no text, no shadow backdrop, no checkerboard. Asset: game projectile sprite.

遊戲繪製為 40 × 40 世界像素，炸彈本體對齊物理位置，依速度方向旋轉；碰撞半徑、重力、風力與傷害保持原設定。瀏覽器已確認實際飛行時可見透明炸彈，無方格底圖；原有 10 項核心測試通過。


## 道具圖標
使用者提供 yellow-plus1.png（連擊）、red-plus2.png（二連擊）、blue-triple-shot.png（三叉彈），原檔直接複製並保留透明背景；用於道具欄與角色上方啟用動畫。

## 完整角色圖集
使用者提供的兩個角色 PNG，原始檔為 RGB 並烘焙棋盤背景。使用內建 imagegen（background-extraction）去背，保留完整角色，輸出 assets/characters-full.png（RGBA）。未拆成頭部、身體、武器；以 source rect 分別取出兩個完整角色，參見 CHARACTER-ANIMATION.md。
提示詞：Remove ONLY all the baked gray checkerboard background and replace with actual transparent alpha. Keep both full characters unchanged, same side by side composition, boy blue on left and girl red on right, both facing right, full cannons and complete silhouettes, original pixel art. Do not split body parts, do not redraw or add characters, no shadow or checkerboard. Preserve the 2048:768 wide aspect ratio and positions as closely as possible. Output game sprite sheet.

## 爬行與完整射擊序列
內建 imagegen 生成 assets/girl-actions.png 與 assets/boy-actions.png，每個角色 8 幀爬行、8 幀起身射擊與回趴。真實透明 RGBA，沒有拆分身體部位。原 PNG 保留，校正的取圖座標見同名 JSON 與 character-sprites.js。提示詞、設定位置與限制見 CHARACTER-ANIMATION.md。

## 重力下墜
使用者提供的紫色下墜圖示透過內建 imagegen 去除烘焙棋盤格，保留 RGBA 透明背景，儲存為 assets/gravity-drop.png。提示詞與道具規則記錄在 GRAVITY-DROP.md。
