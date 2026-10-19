import math
import math as m
θ = math.radians(30)
t = 1
v_0 = 30
g = 9.81
print(math.sin(θ))
X = v_0 * t * math.cos(θ)
y = v_0 * t * math.sin(θ) - 0.5 * g * t ** 2
print(X)
print(y)