import time
import math
θ = math.radians(30)
t = 1
v_0 = 30
g = 9.81
for t in range(10):
    X = v_0 * t * math.cos(θ)
    y = v_0 * t * math.sin(θ) - (0.5 * g * t ** 2)
    print(f"第{t}秒时，X={X:.2f}, y={y:.2f}")
    time.sleep(1)