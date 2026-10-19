
import math
import os

# =========================
# 原本的計算函數
# =========================

def test_function():
    print("test!")
    return "test!"

def 加法(a, b):
    return a + b

def H公式(v0, θ, g):
    sinθ = math.sin(θ)
    return v0**2 * sinθ**2 / (2 * g)

def R公式(v0, θ, g):
    return v0**2 * math.sin(2 * θ) / g

def T公式(v0, θ, g):
    sinθ = math.sin(θ)
    return 2 * v0 * sinθ / g


# =========================
# CLI 介面
# =========================

def 清除畫面():
    os.system("cls" if os.name == "nt" else "clear")

def 分隔線():
    print("═" * 48)

def 標題(文字):
    分隔線()
    print(f"  ◆ {文字}")
    分隔線()

def 輸入數字(提示, 預設值=None, 必須大於零=False):
    while True:
        預設提示 = f" [{預設值}]" if 預設值 is not None else ""
        原始值 = input(f"  {提示}{預設提示} > ").strip()

        if not 原始值 and 預設值 is not None:
            數值 = float(預設值)
        else:
            try:
                數值 = float(原始值)
            except ValueError:
                print("  [!] 請輸入有效數字。")
                continue

        if not math.isfinite(數值):
            print("  [!] 請輸入有限數值。")
            continue

        if 必須大於零 and 數值 <= 0:
            print("  [!] 數值必須大於 0。")
            continue

        return 數值

def 暫停():
    input("\n  按 Enter 返回主選單...")

def 拋體運動():
    清除畫面()
    標題("拋體運動計算器")

    print("  輸入參數（直接 Enter 使用預設值）\n")

    v0 = 輸入數字("初速度 v0 (m/s)", 30, True)
    角度 = 輸入數字("發射角度 θ (度)", 45)
    g = 輸入數字("重力加速度 g (m/s²)", 9.81, True)

    # 角度轉換：度 → 弧度
    θ = math.radians(角度)

    H = H公式(v0, θ, g)
    R = R公式(v0, θ, g)
    T = T公式(v0, θ, g)

    print()
    標題("計算結果")

    print(f"  初速度       │ {v0:.2f} m/s")
    print(f"  發射角度     │ {角度:.2f}°")
    print(f"  重力加速度   │ {g:.2f} m/s²")
    print("  ──────────────────────────────────")
    print(f"  ▲ 最大高度 H │ {H:.2f} m")
    print(f"  → 水平射程 R │ {R:.2f} m")
    print(f"  ◷ 飛行時間 T │ {T:.2f} s")
    print()

    print("  ※ 假設無空氣阻力，且落點與起點等高。")
    print("  ※ 發射角度建議使用 0°～90°。")
    分隔線()
    暫停()

def 加法計算():
    清除畫面()
    標題("加法計算器")

    a = 輸入數字("第一個數字")
    b = 輸入數字("第二個數字")

    print()
    print(f"  計算結果：{a:g} + {b:g} = {加法(a, b):g}")
    暫停()

def 測試功能():
    清除畫面()
    標題("測試功能")
    test_function()
    暫停()

def 主程式():
    while True:
        清除畫面()
        標題("PYTHON CLI │ 數學工具箱")

        print()
        print("  [1]  拋體運動計算器")
        print("  [2]  加法計算器")
        print("  [3]  測試功能")
        print("  [0]  離開程式")
        print()
        分隔線()

        選擇 = input("  請選擇功能 > ").strip()

        if 選擇 == "1":
            拋體運動()
        elif 選擇 == "2":
            加法計算()
        elif 選擇 == "3":
            測試功能()
        elif 選擇 == "0":
            print("\n  感謝使用，再見！")
            break
        else:
            print("\n  [!] 無效選項，請重新輸入。")
            暫停()

if __name__ == "__main__":
    try:
        主程式()
    except (KeyboardInterrupt, EOFError):
        print("\n\n  程式已結束。")
