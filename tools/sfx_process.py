#!/usr/bin/env python3
"""把 ElevenLabs 下載的音效（work/sfx/raw/*.mp3）裁切、統一音量、轉單聲道，壓成 audio/sfx/*.m4a。
做法同「下班先鬥牛」的 tools/sfx_process.py：裁掉前面空白和後面尾音、正規化、收尾淡出。
用法：python3 -I tools/sfx_process.py   （需要 ffmpeg、numpy）"""
import os, subprocess, tempfile, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW, OUT = os.path.join(ROOT, 'work/sfx/raw'), os.path.join(ROOT, 'audio/sfx')
SR = 44100
# 名稱：最長秒數（遊戲裡音效要短，免得疊在一起變吵）
ONE = dict(orb_pick=.3, orb_swap=.22, orb_drop=.6, orb_pop=.55, timer=.35,
           ui_click=.22, ui_page=.5, ui_get=1.3, ui_win=2.2, ui_lose=2.0, ui_evo=1.8,
           hit_water=.55, hit_fire=.55, hit_wood=.55, hit_light=.55, hit_dark=.55,
           heal=1.0, shield=1.0, hurt=.5, enemy_die=.9, boss=2.4, charge=.9, slam=1.1,
           chain_lock=1.4, chain_break=1.2, immune=1.0, punch=.35)


def read(name):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{RAW}/{name}.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype='<f4').astype(np.float64)


def one(name, maxlen):
    x = read(name); peak = np.abs(x).max()
    on = np.argmax(np.abs(x) > peak * .03)                 # 開頭：第一個超過峰值 3% 的點，往前留 3 毫秒
    x = x[max(0, on - int(.003 * SR)):]
    win = int(.02 * SR)                                    # 結尾：最後一段超過峰值 0.3% 的位置
    e = np.convolve(np.abs(x), np.ones(win) / win, 'same')
    end = len(x) - np.argmax(e[::-1] > peak * .003)
    x = x[:min(end, int(maxlen * SR))] / peak * .89
    fade = min(int(.08 * SR), len(x) // 3)
    x[-fade:] *= np.linspace(1, 0, fade) ** 2
    return x


def encode(name, x):
    with tempfile.TemporaryDirectory() as d:
        p = f'{d}/a.wav'
        w = wave.open(p, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes()); w.close()
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p, '-c:a', 'aac', '-b:a', '56k', f'{OUT}/{name}.m4a'], check=True)
    return os.path.getsize(f'{OUT}/{name}.m4a')


os.makedirs(OUT, exist_ok=True)
total = 0
for k, m in ONE.items():
    x = one(k, m); s = encode(k, x); total += s
    print(f'{k:11} {len(x) / SR:4.2f}s {s / 1024:5.1f}KB')
print(f'合計 {total / 1024:.0f}KB')
