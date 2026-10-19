import math
import tkinter as tk
from tkinter import ttk, messagebox, filedialog, colorchooser

BG = '#0f172a'
PANEL = '#172338'
FG = '#e2e8f0'
MUTED = '#94a3b8'
ACCENT = '#38bdf8'

class Showcase(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title('Tkinter 元件實驗室 | Python GUI 示範大全')
        self.geometry('1050x720')
        self.minsize(830, 590)
        self.configure(bg=BG)
        self.style = ttk.Style(self)
        self.style.theme_use('clam')
        self.style.configure('TFrame', background=PANEL)
        self.style.configure('TLabel', background=PANEL, foreground=FG, font=('Microsoft JhengHei UI', 11))
        self.style.configure('TButton', font=('Microsoft JhengHei UI', 10), padding=8)
        self.style.configure('TCheckbutton', background=PANEL, foreground=FG)
        self.style.configure('TRadiobutton', background=PANEL, foreground=FG)
        self.style.configure('TNotebook', background=BG)
        self.style.configure('TNotebook.Tab', padding=(14, 8))
        self.style.configure('Treeview', rowheight=29)
        self.pages = {
            '基礎元件': self.basic,
            '選擇元件': self.choices,
            '數值控制': self.numeric,
            '資料展示': self.data,
            'Canvas 繪圖': self.drawing,
            '視窗與檔案': self.dialogs,
            '鍵盤與滑鼠': self.events,
            '拋體運動': self.projectile,
        }
        sidebar = tk.Frame(self, bg=BG, width=210)
        sidebar.pack(side='left', fill='y', padx=12, pady=14)
        sidebar.pack_propagate(False)
        tk.Label(sidebar, text='PYTHON GUI', bg=BG, fg=ACCENT,
                 font=('Arial', 17, 'bold')).pack(anchor='w', pady=(8, 3))
        tk.Label(sidebar, text='Tkinter 元件實驗室', bg=BG, fg=MUTED,
                 font=('Microsoft JhengHei UI', 10)).pack(anchor='w', pady=(0, 22))
        for name in self.pages:
            tk.Button(sidebar, text=name, anchor='w', bg='#1e293b', fg=FG,
                      activebackground='#0369a1', activeforeground='white',
                      relief='flat', padx=12, pady=11, cursor='hand2',
                      command=lambda n=name: self.show(n)).pack(fill='x', pady=3)
        self.body = tk.Frame(self, bg=PANEL)
        self.body.pack(side='right', fill='both', expand=True, padx=(0, 14), pady=14)
        self.show('基礎元件')

    def show(self, name):
        for child in self.body.winfo_children():
            child.destroy()
        tk.Label(self.body, text=name, bg=PANEL, fg=ACCENT,
                 font=('Microsoft JhengHei UI', 22, 'bold')).pack(anchor='w', padx=25, pady=(23, 8))
        tk.Frame(self.body, bg='#334155', height=1).pack(fill='x', padx=25, pady=(0, 18))
        content = ttk.Frame(self.body)
        content.pack(fill='both', expand=True, padx=25, pady=(0, 25))
        self.pages[name](content)

    def note(self, parent, text):
        ttk.Label(parent, text=text, wraplength=630).pack(anchor='w', pady=(0, 16))

    def basic(self, p):
        self.note(p, 'Label 顯示文字、Entry 單行輸入、Text 多行輸入、Button 觸發動作。')
        name = tk.StringVar(value='你的名子')
        ttk.Label(p, text='你的名字').pack(anchor='w')
        ttk.Entry(p, textvariable=name, width=36).pack(anchor='w', pady=7)
        result = ttk.Label(p, text='按下按鈕試試看')
        result.pack(anchor='w', pady=8)
        ttk.Button(p, text='打招呼', command=lambda: result.config(text=f'你好，{name.get()}！')).pack(anchor='w', pady=8)
        ttk.Label(p, text='多行文字 Text').pack(anchor='w', pady=(16, 5))
        editor = tk.Text(p, width=62, height=8, bg='#0b1220', fg=FG, insertbackground='white', wrap='word')
        editor.pack(anchor='w')
        editor.insert('1.0', '這裡可以自由輸入多行文字。\nTkinter 使用事件驅動的 GUI 模型。')
        ttk.Button(p, text='統計字數', command=lambda: messagebox.showinfo('字數', f"字元數：{len(editor.get('1.0', 'end-1c'))}")).pack(anchor='w', pady=12)

    def choices(self, p):
        self.note(p, 'Checkbutton 多選、Radiobutton 單選、Combobox 下拉式選單。')
        a, b = tk.BooleanVar(value=True), tk.BooleanVar()
        ttk.Checkbutton(p, text='顯示提示', variable=a).pack(anchor='w', pady=5)
        ttk.Checkbutton(p, text='啟用音效（示範狀態）', variable=b).pack(anchor='w', pady=5)
        mode = tk.StringVar(value='一般')
        for option in ('簡單', '一般', '困難'):
            ttk.Radiobutton(p, text=option, value=option, variable=mode).pack(anchor='w', pady=3)
        ttk.Label(p, text='選擇語言').pack(anchor='w', pady=(16, 5))
        language = ttk.Combobox(p, values=['Python', 'Java', 'JavaScript', 'SQL'], state='readonly')
        language.set('Python')
        language.pack(anchor='w')
        result = ttk.Label(p, text='')
        result.pack(anchor='w', pady=15)
        ttk.Button(p, text='讀取所有選項', command=lambda: result.config(
            text=f'提示={a.get()}、音效={b.get()}、難度={mode.get()}、語言={language.get()}')).pack(anchor='w')

    def numeric(self, p):
        self.note(p, 'Scale 拖曳數值、Spinbox 精確選數字、Progressbar 進度條。')
        value = tk.IntVar(value=35)
        ttk.Label(p, text='拖動滑桿').pack(anchor='w')
        ttk.Scale(p, from_=0, to=100, variable=value, orient='horizontal', length=360).pack(anchor='w', pady=10)
        label = ttk.Label(p, text='目前：35')
        label.pack(anchor='w')
        value.trace_add('write', lambda *_: label.config(text=f'目前：{value.get()}'))
        ttk.Label(p, text='Spinbox（數值輸入）').pack(anchor='w', pady=(20, 5))
        spin = ttk.Spinbox(p, from_=0, to=100, increment=5, width=12)
        spin.set(25)
        spin.pack(anchor='w')
        bar = ttk.Progressbar(p, maximum=100, length=360)
        bar.pack(anchor='w', pady=(22, 8))
        def update():
            try:
                bar['value'] = max(0, min(100, float(spin.get())))
            except ValueError:
                messagebox.showerror('輸入錯誤', '請輸入數字')
        ttk.Button(p, text='把 Spinbox 數值套用到進度條', command=update).pack(anchor='w')

    def data(self, p):
        self.note(p, 'Listbox 是清單；Treeview 可以顯示表格與多欄資料。')
        lst = tk.Listbox(p, height=5, bg='#0b1220', fg=FG, selectbackground='#0369a1')
        lst.pack(fill='x', pady=(0, 12))
        for name in ['Java', 'Python', 'SQL', 'Spring Boot']:
            lst.insert('end', name)
        ttk.Button(p, text='新增項目', command=lambda: lst.insert('end', f'新項目 {lst.size()+1}')).pack(anchor='w', pady=(0, 18))
        table = ttk.Treeview(p, columns=('name', 'kind', 'score'), show='headings', height=6)
        for key, title, width in [('name', '名稱', 160), ('kind', '類別', 160), ('score', '分數', 100)]:
            table.heading(key, text=title)
            table.column(key, width=width)
        for row in [('Python', '語言', 90), ('Tkinter', 'GUI 框架', 85), ('SQLite', '資料庫', 88)]:
            table.insert('', 'end', values=row)
        table.pack(fill='x')
        ttk.Button(p, text='刪除選取的表格資料', command=lambda: [table.delete(item) for item in table.selection()]).pack(anchor='w', pady=12)

    def drawing(self, p):
        self.note(p, 'Canvas 可畫線條、矩形、橢圓與文字。按住滑鼠左鍵在畫布上畫圖。')
        canvas = tk.Canvas(p, width=590, height=350, bg='#f8fafc', highlightthickness=0)
        canvas.pack(anchor='w')
        color = tk.StringVar(value='#0284c7')
        prev = [None]
        def down(e): prev[0] = (e.x, e.y)
        def drag(e):
            if prev[0]:
                x, y = prev[0]
                canvas.create_line(x, y, e.x, e.y, fill=color.get(), width=4, capstyle='round', smooth=True)
            prev[0] = (e.x, e.y)
        canvas.bind('<Button-1>', down)
        canvas.bind('<B1-Motion>', drag)
        canvas.bind('<ButtonRelease-1>', lambda e: prev.__setitem__(0, None))
        tools = ttk.Frame(p)
        tools.pack(anchor='w', pady=12)
        ttk.Button(tools, text='清空', command=lambda: canvas.delete('all')).pack(side='left', padx=(0, 8))
        ttk.Button(tools, text='畫圓形', command=lambda: canvas.create_oval(150, 90, 290, 230, fill='#7dd3fc', outline='#0284c7', width=3)).pack(side='left', padx=8)
        ttk.Button(tools, text='畫矩形', command=lambda: canvas.create_rectangle(310, 90, 470, 210, fill='#86efac', outline='#16a34a', width=3)).pack(side='left', padx=8)
        def pick():
            selected = colorchooser.askcolor(color=color.get())[1]
            if selected: color.set(selected)
        ttk.Button(tools, text='畫筆顏色', command=pick).pack(side='left', padx=8)

    def dialogs(self, p):
        self.note(p, 'messagebox、filedialog、colorchooser 都是內建的視窗工具。')
        result = ttk.Label(p, text='選取結果會顯示在這裡', wraplength=590)
        result.pack(anchor='w', pady=12)
        ttk.Button(p, text='顯示資訊', command=lambda: messagebox.showinfo('資訊', '這是資訊對話框')).pack(anchor='w', pady=6)
        ttk.Button(p, text='確認視窗', command=lambda: result.config(text=f'使用者選擇：{messagebox.askyesno("確認", "要繼續嗎？")}')).pack(anchor='w', pady=6)
        ttk.Button(p, text='選擇檔案', command=lambda: result.config(text=f'選取檔案：{filedialog.askopenfilename() or "未選取"}')).pack(anchor='w', pady=6)
        ttk.Button(p, text='選擇顏色', command=lambda: result.config(text=f'選取顏色：{colorchooser.askcolor()[1] or "未選取"}')).pack(anchor='w', pady=6)

    def events(self, p):
        self.note(p, '事件綁定：按鍵、點擊、滑鼠移動。請在下面的區域操作。')
        status = ttk.Label(p, text='等待事件...')
        status.pack(anchor='w', pady=12)
        area = tk.Canvas(p, width=560, height=260, bg='#0b1220', highlightthickness=0)
        area.pack(anchor='w')
        area.create_text(280, 130, text='在這裡移動或點擊滑鼠', fill='white', font=('Arial', 15))
        area.bind('<Motion>', lambda e: status.config(text=f'滑鼠移動：x={e.x}，y={e.y}'))
        area.bind('<Button-1>', lambda e: status.config(text=f'左鍵點擊：x={e.x}，y={e.y}'))
        entry = ttk.Entry(p, width=40)
        entry.pack(anchor='w', pady=(18, 5))
        entry.bind('<KeyRelease>', lambda e: status.config(text=f'放開按鍵：{e.keysym}，輸入內容：{entry.get()}'))
        ttk.Label(p, text='點選輸入框後按鍵盤，觀察事件資訊。').pack(anchor='w')

    def projectile(self, p):
        self.note(p, '輸入初速度、發射角度（度）、重力加速度，計算最高點、水平射程與飛行時間。')
        entries = {}
        for title, default in [('初速度 v0 (m/s)', '30'), ('發射角 θ (度)', '45'), ('重力加速度 g (m/s²)', '9.81')]:
            ttk.Label(p, text=title).pack(anchor='w', pady=(8, 3))
            ent = ttk.Entry(p, width=26)
            ent.insert(0, default)
            ent.pack(anchor='w')
            entries[title] = ent
        result = ttk.Label(p, text='等待計算...', font=('Microsoft JhengHei UI', 13))
        result.pack(anchor='w', pady=22)
        def calculate():
            try:
                v0, angle, g = [float(e.get()) for e in entries.values()]
                if not all(math.isfinite(x) for x in (v0, angle, g)) or v0 < 0 or g <= 0 or not 0 <= angle <= 90:
                    raise ValueError
                theta = math.radians(angle)
                h = v0**2 * math.sin(theta)**2 / (2*g)
                r = v0**2 * math.sin(2*theta) / g
                t = 2*v0*math.sin(theta) / g
                result.config(text=f'▲ 最大高度 H = {h:.2f} m\n\n→ 水平射程 R = {r:.2f} m\n\n◷ 飛行時間 T = {t:.2f} s')
            except ValueError:
                messagebox.showerror('輸入錯誤', '請輸入有效數字，v0 ≥ 0、g > 0、角度介於 0° 到 90°。')
        ttk.Button(p, text='開始計算', command=calculate).pack(anchor='w')
        ttk.Label(p, text='假設：無空氣阻力，且起點與落點高度相同。').pack(anchor='w', pady=18)

if __name__ == '__main__':
    Showcase().mainloop()
