import tkinter as 介面

root = 介面.Tk()
root.title("我的GUI程式")
寬度 = 400
高度 = 300
left = 0
top = 0
root.geometry(f"{寬度}x{高度}+{left}+{top}")
label = 介面.Label(root, text="歡迎使用我的GUI程式！")
root.mainloop()