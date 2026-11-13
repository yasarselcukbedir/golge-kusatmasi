#!/usr/bin/env python3
"""Uygulama simgelerini üretir: altıgen mühür, hisar ve hilal. Ek kütüphane gerekmez."""
import math, struct, zlib, pathlib

GOLD = (232, 198, 127)
CENTER = (27, 52, 62)
EDGE = (16, 31, 38)
HEX = [(256, 80), (408, 160), (408, 348), (256, 430), (104, 348), (104, 160)]


def box(x, y, x0, y0, x1, y1):
    dx = max(x0 - x, 0, x - x1)
    dy = max(y0 - y, 0, y - y1)
    if dx or dy:
        return math.hypot(dx, dy)
    return -min(x - x0, x1 - x, y - y0, y1 - y)


def segment(x, y, a, b):
    ax, ay = a
    bx, by = b
    vx, vy = bx - ax, by - ay
    t = max(0, min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy)))
    return math.hypot(x - ax - vx * t, y - ay - vy * t)


def shape(x, y):
    """Altın rengin işaretli uzaklığı (512 birimlik tuvalde); negatif = içeride."""
    d = min(segment(x, y, HEX[i], HEX[(i + 1) % 6]) for i in range(6)) - 3.5
    if 150 < x < 362 and 120 < y < 356:
        towers = min(box(x, y, 175, 200, 240, 332), box(x, y, 272, 200, 337, 332), box(x, y, 240, 262, 272, 290))
        notches = min(box(x, y, 197, 190, 218, 214), box(x, y, 294, 190, 315, 214))
        castle = max(towers, -notches)
        ground = box(x, y, 160, 340, 352, 346)
        crescent = max(math.hypot(x - 254, y - 152) - 31, -(math.hypot(x - 267, y - 147) - 26))
        d = min(d, castle, ground, crescent)
    return d


def render(size):
    scale = size / 512
    rows = []
    for py in range(size):
        row = bytearray([0])
        for px in range(size):
            x, y = (px + .5) / scale, (py + .5) / scale
            cover = max(0.0, min(1.0, .5 - shape(x, y) * scale))
            fade = min(1.0, math.hypot(x - 256, y - 256) / 360)
            for channel in range(3):
                back = CENTER[channel] + (EDGE[channel] - CENTER[channel]) * fade
                row.append(round(back + (GOLD[channel] - back) * cover))
        rows.append(bytes(row))
    raw = b''.join(rows)

    def chunk(kind, data):
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data) & 0xffffffff)

    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')


if __name__ == '__main__':
    out = pathlib.Path(__file__).resolve().parent.parent / 'icons'
    for name, size in (('icon-512.png', 512), ('maskable-512.png', 512), ('icon-192.png', 192), ('apple-touch-icon.png', 180)):
        (out / name).write_bytes(render(size))
        print(name, size)
