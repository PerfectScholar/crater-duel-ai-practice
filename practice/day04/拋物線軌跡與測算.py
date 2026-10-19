import math
import tkinter as tk
from tkinter import ttk, messagebox

BG = '#f6f8fc'
INK = '#17243a'
BLUE = '#2563eb'

class ProjectileApp:
    def __init__(self, root):
        self.root = root
        root.title('拋物線軌跡計算器')
        root.geometry('1050x680')
        root.minsize(790, 540)
        root.configure(bg=BG)

        style = ttk.Style()
        style.theme_use('clam')
        style.configure('TFrame', background=BG)
        style.configure('TLabel', background=BG, foreground=INK, font=('Microsoft JhengHei UI', 11))
        style.configure('TEntry', padding=8, font=('Segoe UI', 12))
        style.configure('TButton', padding=(20, 11), font=('Microsoft JhengHei UI', 11, 'bold'))

        wrapper = ttk.Frame(root, padding=25)
        wrapper.pack(fill='both', expand=True)
        ttk.Label(wrapper, text='拋物線軌跡計算與繪圖', font=('Microsoft JhengHei UI', 21, 'bold')).pack(anchor='w', pady=(0, 18))

        main = ttk.Frame(wrapper)
        main.pack(fill='both', expand=True)
        main.columnconfigure(0, weight=1, uniform='cols')
        main.columnconfigure(1, weight=2, uniform='cols')
        main.rowconfigure(0, weight=1)

        inputs = ttk.Frame(main)
        inputs.grid(row=0, column=0, sticky='nsew', padx=(0, 22))
        self.entries = {}
        for label, key, default, unit in [
            ('初速度', 'v0', '30', 'm/s'),
            ('發射角度', 'angle', '45', '度'),
            ('重力加速度', 'g', '9.81', 'm/s²'),
        ]:
            block = tk.Frame(inputs, bg='white', highlightbackground='#cbd5e1', highlightthickness=1)
            block.pack(fill='x', pady=(0, 15), ipady=11, padx=1)
            tk.Label(block, text=label, bg='white', fg=INK, font=('Microsoft JhengHei UI', 12, 'bold')).pack(anchor='w', padx=15, pady=(3, 7))
            line = tk.Frame(block, bg='white')
            line.pack(fill='x', padx=15)
            entry = ttk.Entry(line)
            entry.insert(0, default)
            entry.pack(side='left', fill='x', expand=True)
            ttk.Label(line, text=unit, background='white').pack(side='left', padx=(8, 0))
            self.entries[key] = entry
            entry.bind('<Return>', lambda _event: self.calculate())

        right = tk.Frame(main, bg='white', highlightbackground='#cbd5e1', highlightthickness=1)
        right.grid(row=0, column=1, sticky='nsew')
        tk.Label(right, text='拋物線圖', bg='white', fg=INK, font=('Microsoft JhengHei UI', 14, 'bold')).pack(pady=(12, 0))
        self.canvas = tk.Canvas(right, bg='white', highlightthickness=0)
        self.canvas.pack(fill='both', expand=True, padx=12, pady=(0, 12))
        self.canvas.bind('<Configure>', lambda _event: self.draw())

        bottom = ttk.Frame(wrapper)
        bottom.pack(fill='x', pady=(18, 0))
        ttk.Button(bottom, text='計算並繪圖', command=self.calculate).pack(side='left')
        self.result = ttk.Label(bottom, text='', font=('Microsoft JhengHei UI', 11))
        self.result.pack(side='left', padx=22)
        ttk.Label(wrapper, text='假設：無空氣阻力，起點與落點等高；發射角度介於 0°～90°。', font=('Microsoft JhengHei UI', 9)).pack(anchor='w', pady=(12, 0))
        self.data = None
        self.calculate()

    def calculate(self):
        try:
            v0 = float(self.entries['v0'].get())
            degrees = float(self.entries['angle'].get())
            g = float(self.entries['g'].get())
            if not all(math.isfinite(v) for v in (v0, degrees, g)):
                raise ValueError('請輸入有限數字。')
            if v0 <= 0 or g <= 0 or not 0 < degrees < 90:
                raise ValueError('初速度與重力加速度必須大於 0，角度需介於 0° 與 90° 之間。')
            theta = math.radians(degrees)
            vx = v0 * math.cos(theta)
            vy = v0 * math.sin(theta)
            T = 2 * vy / g
            H = vy**2 / (2 * g)
            R = vx * T
            if not all(math.isfinite(v) for v in (vx, vy, T, H, R)) or R <= 0 or H <= 0:
                raise ValueError('數值超出可計算範圍。')
            self.data = (vx, vy, g, T, H, R)
            self.result.config(text=f'最大高度 H：{H:.2f} m     水平射程 R：{R:.2f} m     飛行時間 T：{T:.2f} s')
            self.draw()
        except ValueError as exc:
            messagebox.showerror('輸入錯誤', str(exc))

    def draw(self):
        c = self.canvas
        c.delete('all')
        w, h = c.winfo_width(), c.winfo_height()
        if w < 100 or h < 100:
            return
        left, right, top, bottom = 58, 25, 35, 48
        plot_w = max(1, w-left-right)
        plot_h = max(1, h-top-bottom)
        x0, y0 = left, h-bottom
        c.create_line(x0, top, x0, y0, fill=INK, width=2, arrow='first')
        c.create_line(x0, y0, w-right+8, y0, fill=INK, width=2, arrow='last')
        c.create_text(x0-15, top+4, text='Y', fill=INK)
        c.create_text(w-right, y0+20, text='X', fill=INK)
        c.create_text(x0-12, y0+14, text='0', fill='#64748b')
        if not self.data:
            return
        vx, vy, g, T, H, R = self.data
        # 各軸按資料範圍自動縮放，留出頂部與右側空間。
        max_x = R * 1.12
        max_y = H * 1.18
        for i in range(1, 5):
            x = x0 + plot_w*i/4
            y = y0 - plot_h*i/4
            c.create_line(x, top, x, y0, fill='#eef2f7')
            c.create_line(x0, y, w-right, y, fill='#eef2f7')
            c.create_text(x, y0+18, text=f'{max_x*i/4:.1f}', fill='#64748b', font=('Segoe UI', 9))
            c.create_text(x0-8, y, text=f'{max_y*i/4:.1f}', anchor='e', fill='#64748b', font=('Segoe UI', 9))
        points = []
        for i in range(241):
            t = T*i/240
            x = vx*t
            y = max(0.0, vy*t-0.5*g*t*t)
            points.extend((x0 + x/max_x*plot_w, y0 - y/max_y*plot_h))
        c.create_line(*points, fill=BLUE, width=3, smooth=False)
        apex_x = x0 + (R/2)/max_x*plot_w
        apex_y = y0 - H/max_y*plot_h
        c.create_oval(apex_x-4, apex_y-4, apex_x+4, apex_y+4, fill='#f59e0b', outline='')
        c.create_text(apex_x, apex_y-16, text=f'H = {H:.2f} m', fill=INK, font=('Segoe UI', 10, 'bold'))
        c.create_text(x0+R/max_x*plot_w, y0-15, text=f'R = {R:.2f} m', fill=BLUE, anchor='e', font=('Segoe UI', 10, 'bold'))

if __name__ == '__main__':
    root = tk.Tk()
    ProjectileApp(root)
    root.mainloop()
