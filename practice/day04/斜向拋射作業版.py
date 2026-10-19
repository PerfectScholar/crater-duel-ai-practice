import math
import time
import test

a = test.test_function()
v0 = 30
g = 9.81
θ = math.radians(45)
sinθ = math.sin(θ)
H = test.H公式(v0, θ, g)
print(f"最大高度H={H:.2f}米")
R = test.R公式(v0, θ, g)
print(f"水平射程R={R:.2f}米")
T = test.T公式(v0, θ, g)
print(f"飛行時間{T:.2f}秒")