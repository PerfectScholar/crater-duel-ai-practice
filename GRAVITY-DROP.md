# 重力下墜

- 發射前按 4 或點擊道具選用，仍遵循每種每回合使用一次、不可取消的規則。
- 原本按住空白鍵蓄力，放開發射。炮彈飛行時再次按下空白鍵，觸發重力下墜；按鍵重複事件不會觸發第二次。
- 觸發當下計算 speed = Math.hypot(vx, vy)，保持位置不變，設 vx = 0、vy = speed。
- 之後鎖定觸發時的 X，不再受風影響，重力仍按原本 430 像素／秒平方累加。原本的碰撞、爆炸、傷害、地形破壞照常執行。
- 每次發射只可成功觸發一次。未選用、尚未發射、沒有存活炮彈、已觸發、結束回合時都不會生效或消耗觸發機會。
- 可和連擊、二連擊、三叉彈疊加。同時在空中的炮彈一起轉向；排隊尚未射出的炮彈維持原本彈道，不能再次觸發。
- 特效包含觸發處紫色光環、下墜箭頭，以及受影響炮彈的垂直光尾。

擴充接口：core/items.js 的 flightEffect 對應 core/projectile-effects.js 的效果處理器。Game.canActivateFlightItem / activateFlightItem 處理狀態與一次性限制，既有齊射與彈種數量邏輯保留。

已移除右下角左右移動按鈕，鍵盤 A／D 移動維持原樣。

## 素材

專案素材儲存：`assets/gravity-drop.png`

使用內建 imagegen 去除使用者圖案已烘焙的棋盤格背景，保留透明 RGBA；原始附件沒有修改。未使用 CLI。

提示詞：Use case: background-extraction. Edit target: supplied purple gravity-drop game item icon. Remove ONLY the baked-in gray checkerboard and replace it with genuine transparent alpha. Keep the purple bomb, rings, large downward arrow, purple shards and highlights unchanged. Same composition and square framing, no added shadow backdrop, no glow outside original art, no checkerboard, no text. Output transparent game icon.

驗證：49 項測試通過，包含速度保持、鎖定 X、風力免疫、正常重力、使用時機、重複觸發、連擊三叉彈疊加，以及命中後傷害與挖洞一致性；瀏覽器確認空白鍵觸發特效，沒有執行期錯誤。
