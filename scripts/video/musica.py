# Pista de fondo lo-fi sintetizada (sin derechos de terceros). Uso: python3 -I musica.py salida.wav segundos
import sys, wave, numpy as np
sr = 44100
out, dur = sys.argv[1], float(sys.argv[2])
bpm = 84; beat = 60 / bpm; bar = 4 * beat
n = int(sr * dur); t = np.arange(n) / sr
mix = np.zeros(n)
rng = np.random.default_rng(7)

def midi(m): return 440 * 2 ** ((m - 69) / 12)
def env(length, a=0.02, r=0.3):
    k = np.arange(length) / sr
    e = np.minimum(1, k / a) * np.exp(-k / r)
    return e
def add(sig, start):
    i = int(start * sr)
    if i >= n: return
    j = min(n, i + len(sig)); mix[i:j] += sig[: j - i]

# Progresión cálida: Fmaj7 - Em7 - Dm7 - Cmaj7
acordes = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]
nbars = int(dur / bar) + 1
for b in range(nbars):
    ch = acordes[b % 4]; t0 = b * bar
    L = int(bar * sr); k = np.arange(L) / sr
    pad = np.zeros(L)
    for m in ch:
        f = midi(m + 12)
        pad += np.sin(2 * np.pi * f * k) + 0.3 * np.sin(2 * np.pi * f * 2.003 * k) + 0.15 * np.sin(2 * np.pi * f * 0.997 * k)
    pad *= np.minimum(1, k / 0.6) * np.minimum(1, (bar - k) / 0.5) * 0.045
    add(pad, t0)
    # bajo
    for q in (0, 2.5):
        f = midi(ch[0] - 12); L2 = int(beat * 1.4 * sr); k2 = np.arange(L2) / sr
        add(np.sin(2 * np.pi * f * k2) * env(L2, 0.01, 0.5) * 0.22, t0 + q * beat)
    # arpegio pluck
    patron = [0, 2, 1, 3, 2, 1, 3, 2]
    for s, idx in enumerate(patron):
        f = midi(ch[idx] + 24); L3 = int(0.6 * sr); k3 = np.arange(L3) / sr
        tono = (np.sin(2 * np.pi * f * k3) + 0.4 * np.sin(4 * np.pi * f * k3)) * env(L3, 0.004, 0.18) * 0.05
        add(tono, t0 + s * beat / 2 + (0.02 if s % 2 else 0))
    # bombo suave y hi-hat
    for q in range(4):
        if q in (0, 2):
            L4 = int(0.35 * sr); k4 = np.arange(L4) / sr
            f4 = 50 + 70 * np.exp(-k4 * 30)
            add(np.sin(2 * np.pi * np.cumsum(f4) / sr) * env(L4, 0.002, 0.12) * 0.35, t0 + q * beat)
        if q in (1, 3):
            L5 = int(0.25 * sr); k5 = np.arange(L5) / sr
            nz = rng.standard_normal(L5); nz = np.convolve(nz, np.ones(6) / 6, "same")
            add(nz * env(L5, 0.003, 0.06) * 0.05, t0 + q * beat)
        for h in (0.5,):
            L6 = int(0.06 * sr); nz = rng.standard_normal(L6) - np.convolve(rng.standard_normal(L6), np.ones(3)/3, "same")
            add(nz * env(L6, 0.001, 0.015) * 0.035, t0 + (q + h) * beat)

# vinilo
mix += np.convolve(rng.standard_normal(n), np.ones(40) / 40, "same") * 0.006
# fade in / out
fade = np.ones(n); fi = int(2 * sr); fo = int(4 * sr)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
mix *= fade
mix = mix / np.max(np.abs(mix)) * 0.8
st = np.stack([mix, np.roll(mix, 220)], axis=1)
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print("ok", out)
