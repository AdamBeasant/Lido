HEAD = '''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <style>
    body { margin: 0; }
    * { box-sizing: border-box; }
    a { color: #98673E; text-decoration: none; }
    a:hover { color: #6F4A2B; }
    .u { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif; }
  </style>
</helmet>
'''
FOOT = '''
</div>
</x-dc>
</body>
</html>
'''
# Contrast-checked on white: SEC 4.6:1, MUTE 4.6:1. TINT is for non-text only.
INK  = "#0B0D0C"
SEC  = "rgba(11,13,12,.56)"
MUTE = "rgba(11,13,12,.56)"
TINT = "rgba(11,13,12,.30)"
LINE = "rgba(11,13,12,.09)"
FILL = "rgba(11,13,12,.05)"
GO, PEND, OUT = "#1E7A38", "#8F5A00", "rgba(11,13,12,.45)"
CARD = f"border-radius: 22px; background: #FFFFFF; box-shadow: 0 0 0 .5px {LINE}, 0 6px 18px rgba(11,13,12,.05);"

def phone(inner, bg="#FFFFFF"):
    return (f'<div class="u" style="position: relative; width: 390px; height: 844px; overflow: hidden; '
            f'background: {bg}; color: {INK}; -webkit-font-smoothing: antialiased;">' + inner)

def glass(extra=""):
    return ("background: rgba(255,255,255,.72); backdrop-filter: blur(26px) saturate(190%); "
            "-webkit-backdrop-filter: blur(26px) saturate(190%); box-shadow: inset 0 .5px 0 rgba(255,255,255,1), "
            "0 0 0 .5px rgba(11,13,12,.06), 0 8px 26px rgba(11,13,12,.13);" + extra)

def darkglass(extra=""):
    return ("background: rgba(255,255,255,.2); backdrop-filter: blur(18px) saturate(180%); "
            "-webkit-backdrop-filter: blur(18px) saturate(180%); border: .5px solid rgba(255,255,255,.4); "
            "box-shadow: inset 0 .5px 0 rgba(255,255,255,.55);" + extra)

SHADES = ["#C9CFCB", "#B6BEB9", "#D2D7D3", "#BFC6C1"]
def av(letters, size=30, border="#FFFFFF"):
    out = []
    for i, l in enumerate(letters):
        ml = "" if i == 0 else f"margin-left: -{round(size/3.4)}px;"
        out.append(f'<div style="width: {size}px; height: {size}px; border-radius: 999px; background: {SHADES[i%4]}; '
                   f'border: 2px solid {border}; {ml} display: flex; align-items: center; justify-content: center; '
                   f'font-size: {round(size*0.4)}px; font-weight: 600; color: #FFFFFF; flex: none;">{l}</div>')
    return '<div style="display: flex; flex: none;">' + "".join(out) + '</div>'

def chip(label, fg=SEC, bg=FILL, weight=600, size=12.5):
    return (f'<span style="height: 26px; padding: 0 11px; border-radius: 999px; background: {bg}; color: {fg}; '
            f'font-size: {size}px; font-weight: {weight}; display: inline-flex; align-items: center; flex: none;">{label}</span>')

def rail(title, trailing=""):
    return (f'<div style="display: flex; align-items: baseline; gap: 8px;">'
            f'<span style="font-size: 13px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: {SEC};">{title}</span>'
            f'<span style="flex: 1;"></span>{trailing}</div>')

def dock(accent, count="4"):
    def item(label, glyph):
        return (f'<div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;">'
                f'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="{INK}" stroke-width="1.9" '
                f'stroke-linecap="round" stroke-linejoin="round">{glyph}</svg>'
                f'<span style="font-size: 10.5px; font-weight: 600;">{label}</span></div>')
    return f'''
  <div style="position: absolute; left: 0; right: 0; bottom: 0; height: 132px; background: linear-gradient(to top, #FFFFFF 44%, rgba(255,255,255,0));"></div>
  <div style="position: absolute; left: 16px; right: 16px; bottom: 26px; height: 68px; border-radius: 999px; {glass()} display: flex; align-items: center; padding: 0 10px; gap: 4px;">
    {item("Invite", '<circle cx="10" cy="8.5" r="3.6"/><path d="M4 19.5c0-3.2 2.7-5.2 6-5.2 1.3 0 2.5.3 3.5.9"/><path d="M18 14v6M15 17h6"/>')}
    {item("Shout", '<path d="M4 11.5L20 4l-7 16-2.2-6.4L4 11.5z"/>')}
    <div style="width: 84px; height: 56px; border-radius: 999px; background: #FFFFFF; box-shadow: 0 0 0 .5px rgba(11,13,12,.07), 0 3px 12px rgba(11,13,12,.14); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; flex: none;">
      <div style="font-size: 19px; font-weight: 700; letter-spacing: -.3px;">{count}</div>
      <div style="font-size: 10px; font-weight: 600; color: {SEC};">going</div>
    </div>
    {item("Pack", '<rect x="3.5" y="7.5" width="17" height="13" rx="3"/><path d="M9 7.5V5.5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 5.5v2"/>')}
    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;">
      <div style="width: 30px; height: 30px; border-radius: 999px; background: {accent}; display: flex; align-items: center; justify-content: center;">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </div>
      <span style="font-size: 10.5px; font-weight: 600;">Add</span>
    </div>
  </div>'''
