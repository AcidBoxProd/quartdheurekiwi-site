(function (Q) {
    'use strict';
    class Renderer {
        constructor(canvas, assets) {
            this.canvas = canvas; this.assets = assets; this.ctx = canvas.getContext('2d', { alpha: false });
            if (!this.ctx) throw new Error('Canvas 2D indisponible dans ce navigateur.');
            this.tint = document.createElement('canvas'); this.tint.width = 150; this.tint.height = 150;
            this.tintContext = this.tint.getContext('2d'); this.debug = false;
            this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
        resize(width, height) {
            const ratio = Math.min(2, window.devicePixelRatio || 1);
            const scale = Math.min(2, Math.max(1, width * ratio / 800));
            const w = Math.round(800 * scale), h = Math.round(450 * scale);
            if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
        }
        image(name, x, y, w, h, count = 1, index = 0, ctx = this.ctx) {
            const image = this.assets.get(name); if (!image) return;
            const fw = image.width / count;
            ctx.drawImage(image, Math.min(count - 1, index) * fw, 0, fw, image.height, x, y, w, h);
        }
        strip(name, offset, y, height) {
            const image = this.assets.get(name); if (!image) return;
            const width = image.width, start = ((offset % width) + width) % width;
            let remaining = 800, dest = 0, sx = start;
            while (remaining > 0) {
                const length = Math.min(remaining, width - sx);
                this.ctx.drawImage(image, sx, 0, length, image.height, dest, y, length, height);
                remaining -= length; dest += length; sx = 0;
            }
        }
        draw(screen, game, alpha, uiTime, options) {
            const c = this.ctx; c.setTransform(this.canvas.width / 800, 0, 0, this.canvas.height / 450, 0, 0);
            c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.imageSmoothingEnabled = false;
            c.fillStyle = '#160f0a'; c.fillRect(0, 0, 800, 450);
            if (screen === 'splash') this.image('your-splash-image-landscape.png', 0, 0, 800, 450);
            if (screen === 'home') this.image('home-screen-1920x1080.png', 0, 0, 800, 450);
            if (screen === 'settings') {
                const version = options.music ? (options.sfx ? 1 : 2) : (options.sfx ? 3 : 4);
                this.image(`menu-screen-${version}.png`, 0, 0, 800, 450);
            }
            if (screen === 'characters') {
                this.image('char-select-screen-bg.png', 0, 0, 800, 450);
                Q.characters.forEach((name, i) => this.image(`${name}-idle-sprite.png`, 20.833 + i * 175, 116.667, 233.333, 233.333, 6, Q.frame(uiTime, 6, 1.5)));
            }
            if (screen === 'game') this.world(game, alpha);
        }
        world(g, alpha) {
            const c = this.ctx, time = Q.lerp(g.previousTime, g.time, alpha), distance = Q.lerp(g.previousDistance, g.distance, alpha);
            c.save();
            if (!this.reducedMotion && ((g.boost > 0 && g.state === 'playing') || (g.wallBroken && time < g.wallReveal + .08))) c.translate(Math.sin(time * 90) * 1.3, Math.cos(time * 73) * 1.3);
            this.strip('bg-far.png', distance * .2, 0, 450); this.strip('bg-near.png', distance * .5, 0, 450);
            this.strip('ground-tile.png', distance, 400, 50);
            if (g.wallX > -150) this.image(g.wallBroken ? 'wall-texture-hole.png' : 'wall-texture-solid.png', g.wallX, 50, 150, 350);
            this.strip('ceiling-tile.png', distance, 0, 50);
            for (const e of g.entities) {
                const rect = Q.entityRect(e, time, alpha), age = Math.max(0, time - e.born);
                if (e.kind === 'obstacle') {
                    const image = this.assets.get(e.image);
                    if (image) {
                        const scale = Math.min(rect.w / image.width, rect.h / image.height), w = image.width * scale, h = image.height * scale;
                        this.image(e.image, rect.x + (rect.w - w) / 2, rect.y + rect.h - h, w, h);
                    }
                } else this.image(e.image, rect.x, rect.y, rect.w, rect.h, e.kind === 'beer' ? 10 : e.kind === 'bottle' ? 5 : 1,
                    e.kind === 'beer' ? Q.frame(age, 10, 1) : e.kind === 'bottle' ? Q.frame(age, 5, .5) : 0);
                if (this.debug) { c.strokeStyle = '#ff5252'; c.lineWidth = 1; c.strokeRect(rect.x, rect.y, rect.w, rect.h); }
            }
            const p = g.player, rect = Q.playerRect(p, alpha);
            if (g.lives > 0 && g.state !== 'over' && (g.wallReveal && time >= g.wallReveal || g.state !== 'intro')) {
                if (p.bottom < 290 && !g.boost) {
                    c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(rect.x + rect.w / 2, 409, Math.max(12, 35 - (p.bottom - 40) * .07), 6, 0, 0, Math.PI * 2); c.fill();
                }
                const animation = { run: ['run-sprite', 10, .8], rise: ['jump-up', 1, 1], fall: ['jump-down', 1, 1], slide: ['slide', 1, 1], crouch: ['crouch', 1, 1], boost: ['boost-sprite', 3, .4] }[p.mode];
                const [suffix, frames, duration] = animation, name = `${g.character}-${suffix}.png`, index = Q.frame(p.modeTime, frames, duration);
                c.globalAlpha = g.invulnerable && Math.floor(time * 10) % 2 ? .4 : 1;
                if (g.qhk && this.tintContext) {
                    const t = this.tintContext; t.clearRect(0, 0, 150, 150); t.imageSmoothingEnabled = false;
                    t.globalCompositeOperation = 'source-over'; this.image(name, 0, 0, rect.w, rect.h, frames, index, t);
                    t.globalCompositeOperation = 'source-atop'; t.fillStyle = `hsla(${time * 300 % 360},100%,55%,.38)`; t.fillRect(0, 0, 150, 150);
                    t.globalCompositeOperation = 'source-over';
                    // A few low-opacity copies create a pixel halo without a full-scene blur.
                    if (!this.reducedMotion) for (const echo of g.trail || []) {
                        const age = Math.max(0, time - echo.born);
                        c.globalAlpha = .2 * Math.max(0, 1 - age / .3);
                        c.drawImage(this.tint, 0, 0, rect.w, rect.h,
                            echo.x - (distance - echo.distance) - 8, echo.y, echo.w, echo.h);
                    }
                    c.globalCompositeOperation = 'lighter'; c.globalAlpha = .11;
                    for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4], [-3, -3], [3, 3]]) c.drawImage(this.tint, rect.x + dx, rect.y + dy);
                    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
                    c.drawImage(this.tint, rect.x, rect.y);
                } else this.image(name, rect.x, rect.y, rect.w, rect.h, frames, index);
                c.globalAlpha = 1;
                if (this.debug) { const hit = Q.playerRect(p, alpha, true); c.strokeStyle = '#59ff72'; c.lineWidth = 1; c.strokeRect(hit.x, hit.y, hit.w, hit.h); }
            }
            for (let i = 0; i < g.effects.length; i++) {
                const e = g.effects[i], age = Math.max(0, time - e.born), progress = age / e.duration, x = e.x - (distance - e.distance);
                if (time < e.born || progress >= 1) continue;
                c.globalAlpha = 1 - progress;
                if (e.kind === 'explosion') this.image('explosion-sprite.png', x, e.y, 120, 120, 4, Math.min(3, Math.floor(progress * 4)));
                else if (e.kind === 'smoke') {
                    const size = (e.size || 100) + (e.growth || 50) * progress;
                    c.globalAlpha = Math.min(1, (1 - progress) * 1.5);
                    c.save(); c.translate(x + (e.vx || 0) * age, e.y + (e.vy || -45) * age);
                    c.rotate((e.rotation || 0) + (e.spin || 0) * age);
                    this.image('smoke-plume.png', -size / 2, -size / 2, size, size); c.restore();
                } else if (e.kind === 'debris') {
                    c.fillStyle = '#795548'; c.fillRect(x + e.vx * age, e.y + e.vy * age + 150 * age * age, e.size, e.size);
                }
                else { c.fillStyle = e.kind === 'spark' ? '#ffd700' : '#795548'; c.fillRect(x - progress * 80, e.y + Math.sin(i * 2) * progress * 70 + progress * progress * 35, 5, 5); }
            }
            c.globalAlpha = 1; c.restore();
        }
    }
    Q.Renderer = Renderer;
})(window.QHK);
