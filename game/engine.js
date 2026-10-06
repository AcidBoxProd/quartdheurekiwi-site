/* QHK simulation: no DOM, audio, wall-clock timers or browser detection. */
(function (root) {
    'use strict';
    const C = Object.freeze({ width: 800, height: 450, ground: 40, step: 1 / 60,
        initialSpeed: 300, maxSpeed: 900, acceleration: 6, gravity: 2880,
        jump: 720, holdAcceleration: 1800, maxJump: 250, boostSeconds: 3,
        qhkSeconds: 7, streamSeconds: 6, invulnerableSeconds: 1 });
    const characters = ['raphael', 'mick', 'thibault', 'simon'];
    const obstacles = {
        short: ['barrels', 'box', 'crates', 'crates2', 'crates3', 'mop'],
        tall: ['crates', 'crates2', 'crates3', 'crates4', 'crates5', 'barrels', 'ladder', 'rack', 'speakers'],
        high: ['', 'lamp', 'cables', 'rack']
    };
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const lerp = (a, b, t) => a + (b - a) * t;
    const frame = (time, count, seconds) => Math.floor((Math.max(0, time) % seconds) / seconds * count) % count;
    const intersects = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    // Swept relative motion prevents a fast bottle crossing a narrow hitbox between steps.
    function swept(a0, a1, b0, b1) {
        if (intersects(a0, b0) || intersects(a1, b1)) return true;
        const vx = (a1.x - a0.x) - (b1.x - b0.x), vy = (a1.y - a0.y) - (b1.y - b0.y);
        let enter = 0, exit = 1;
        for (const [p, size, q, extent, velocity] of [[a0.x, a0.w, b0.x, b0.w, vx], [a0.y, a0.h, b0.y, b0.h, vy]]) {
            if (!velocity) { if (p + size <= q || p >= q + extent) return false; continue; }
            const t1 = (q - p - size) / velocity, t2 = (q + extent - p) / velocity;
            enter = Math.max(enter, Math.min(t1, t2)); exit = Math.min(exit, Math.max(t1, t2));
            if (enter > exit) return false;
        }
        return enter < 1 && exit > 0;
    }
    function playerSize(p) {
        return p.mode === 'boost' ? { w: 150, h: 150 } : { w: 120, h: p.mode === 'slide' ? 60 : p.mode === 'crouch' ? 90 : 120 };
    }
    function playerRect(p, alpha = 1, hitbox = false) {
        const { w, h } = playerSize(p), x = lerp(p.px, p.x, alpha), bottom = lerp(p.pb, p.bottom, alpha);
        return { x: x + (hitbox ? 40 : 0), y: C.height - bottom - h + (hitbox ? 20 : 0),
            w: w - (hitbox ? 80 : 0), h: h - (hitbox ? 40 : 0) };
    }
    function entityRect(e, time, alpha = 1) {
        // Shared by drawing and collision: the bob is never just a CSS offset.
        const bob = ['beer', 'kiwi', 'logo', 'coin'].includes(e.kind) ? 4 * Math.sin((time - e.born) * Math.PI * 2 / 1.5) : 0;
        return { x: lerp(e.px, e.x, alpha), y: e.y + bob, w: e.w, h: e.h };
    }
    class Engine {
        constructor(random = Math.random, visualRandom = Math.random) { this.random = random; this.visualRandom = visualRandom; this.reset('raphael'); }
        reset(character) {
            this.character = characters.includes(character) ? character : characters[0];
            this.state = 'intro'; this.resumeState = 'playing'; this.time = 0; this.previousTime = 0;
            this.score = 0; this.lives = 3; this.power = 0; this.speed = C.initialSpeed;
            this.distance = 0; this.previousDistance = 0; this.boost = 0; this.qhk = 0; this.stream = 0; this.invulnerable = 0;
            this.entities = []; this.effects = []; this.trail = []; this.trailTimer = 0; this.deathRemaining = 0; this.events = []; this.nextId = 1;
            this.wallX = 0; this.wallBroken = false; this.wallReveal = 0;
            this.spawnTimers = { obstacle: 0, beer: 0, kiwi: 0, logo: 0, bottle: 0, coin: 0, stream: 0, foot: 0, particle: 0 };
            this.nextCoin = this.range(.5, 1.2); this.lastObstacle = ''; this.repeats = 0; this.lastImages = {};
            this.player = { x: -120, px: -120, bottom: 190, pb: 190, velocity: 0, mode: 'fall', modeTime: 0, transition: 0, slam: false };
            this.release();
        }
        range(a, b) { return a + this.random() * (b - a); }
        choose(list) { return list[Math.min(list.length - 1, Math.floor(this.random() * list.length))]; }
        emit(name) { this.events.push(name); }
        drainEvents() { return this.events.splice(0); }
        mode(value) { if (this.player.mode !== value) { this.player.mode = value; this.player.modeTime = 0; } }
        release() { this.input = { jump: false, down: false, up: false, target: null }; }
        pause() {
            if (!['playing', 'intro', 'dying', 'countdown'].includes(this.state)) return;
            if (this.state !== 'countdown') this.resumeState = this.state;
            this.state = 'paused'; this.release(); this.sync();
        }
        resume() { if (this.state === 'paused') { this.state = 'countdown'; this.countdown = 1.5; } }
        sync() {
            this.player.px = this.player.x; this.player.pb = this.player.bottom;
            this.previousDistance = this.distance; this.previousTime = this.time;
            for (const e of this.entities) e.px = e.x;
        }
        jump() {
            if (this.state !== 'playing' || this.boost) return;
            this.input.jump = true;
            if (this.player.mode === 'run') { this.player.velocity = C.jump; this.mode('rise'); this.emit('jump'); }
        }
        down() {
            if (this.state !== 'playing') return;
            this.input.down = true; this.input.jump = false;
            if (this.boost) return;
            if (['rise', 'fall'].includes(this.player.mode)) { this.player.velocity = -C.jump * 1.5; this.player.slam = true; this.mode('fall'); }
            else if (this.player.mode === 'run') { this.mode('crouch'); this.player.transition = .05; }
        }
        activateBoost() {
            if (this.state !== 'playing' || this.boost || this.power < 100) return false;
            this.boost = C.boostSeconds; this.power = 0; this.player.velocity = 0; this.player.slam = false;
            this.player.bottom = clamp(this.player.bottom, 50, 275); this.player.pb = this.player.bottom;
            this.input.target = null; this.mode('boost'); this.emit('boost'); return true;
        }
        add(kind, x, y, w, h, image) {
            const e = { id: this.nextId++, kind, x, px: x, y, w, h, image, born: this.time, alive: true };
            this.entities.push(e); return e;
        }
        effect(x, y, kind = 'explosion', options = {}) {
            this.effects.push({ x, y, kind, distance: this.distance, born: this.time,
                duration: kind === 'smoke' ? 1 : kind === 'debris' ? .8 : .5, ...options });
        }
        breakWall() {
            this.wallBroken = true; this.wallReveal = this.time + .12; this.emit('break');
            // Cosmetic randomness is independent of obstacle/bonus generation.
            const random = (a, b) => a + this.visualRandom() * (b - a);
            for (let i = 0; i < 20; i++) this.effect(random(45, 105), random(195, 320), 'debris', {
                vx: random(-100, 160), vy: random(-170, 55), size: random(3, 9), duration: random(.45, .9)
            });
            // Dense core covers the breach; outer plumes expand in different directions.
            for (let i = 0; i < 11; i++) this.effect(random(45, 100), i === 0 ? 335 : random(290, 365), 'smoke', {
                size: i === 0 ? 180 : random(95, 165), growth: random(35, 100),
                vx: random(-90, 130), vy: random(-115, 25), rotation: random(-Math.PI, Math.PI),
                spin: random(-.7, .7), duration: random(.6, 1.15), born: this.time + (i < 4 ? 0 : random(0, .08))
            });
        }
        updateTrail(dt) {
            if (!this.qhk) { this.trail.length = 0; this.trailTimer = 0; return; }
            this.trailTimer += dt;
            if (this.trailTimer >= .06) {
                this.trailTimer -= .06;
                this.trail.push({ ...playerRect(this.player), mode: this.player.mode,
                    modeTime: this.player.modeTime, born: this.time, distance: this.distance });
            }
            this.trail = this.trail.filter(e => this.time - e.born < .3).slice(-5);
        }
        spawnObstacle() {
            let types = Object.keys(obstacles);
            if (this.repeats >= 3) types = types.filter(t => t !== this.lastObstacle);
            const type = this.choose(types), names = obstacles[type].filter(n => n !== this.lastImages[type]);
            const variant = this.choose(names), image = `obstacle-${type}${variant ? '-' + variant : ''}.png`;
            this.lastImages[type] = variant; this.repeats = type === this.lastObstacle ? this.repeats + 1 : 1; this.lastObstacle = type;
            const [w, h] = type === 'short' ? [100, 80] : type === 'tall' ? [60, 160] : [120, 280];
            this.add('obstacle', 800, type === 'high' ? 50 : 410 - h, w, h, image);
        }
        spawnBeer() {
            let bottom = this.range(70, 110);
            for (let attempt = 0; attempt < 3; attempt++, bottom += 60) {
                const rect = { x: 400, y: 450 - bottom - 50, w: 500, h: 50 };
                if (rect.y < 60) return;
                if (!this.entities.some(e => ['obstacle', 'bottle'].includes(e.kind) && intersects(rect, entityRect(e, this.time)))) {
                    this.add('beer', 800, rect.y, 50, 50, 'beer-sprite-10.png'); return;
                }
            }
        }
        collect(e) {
            e.alive = false;
            const multiplier = this.boost > 0 ? 15 : 1;
            if (e.kind === 'beer') { this.score += 50 * multiplier; if (!this.boost) this.power = Math.min(100, this.power + 10); this.emit('beer'); }
            if (e.kind === 'coin') { this.score += 100 * multiplier; this.emit('coin'); }
            if (e.kind === 'kiwi') { this.lives = Math.min(3, this.lives + 1); if (!this.boost) this.power = 100; this.emit('kiwi'); }
            if (e.kind === 'logo') { this.qhk = C.qhkSeconds; this.stream = C.streamSeconds; this.invulnerable = 0; this.spawnTimers.stream = 0; this.emit('qhk'); }
        }
        hit(e) {
            if (this.boost) { e.alive = false; this.effect(e.x, e.y); this.emit('break'); return; }
            if (this.qhk || this.invulnerable) return;
            e.alive = false; this.lives--; this.invulnerable = C.invulnerableSeconds;
            this.input.down = false; this.player.slam = false;
            if (['slide', 'crouch'].includes(this.player.mode)) this.mode('run');
            this.effect(this.player.x, 450 - this.player.bottom - 120); this.emit('hit');
            if (!this.lives) { this.state = 'dying'; this.deathRemaining = .5; this.trail.length = 0; this.release(); this.emit('death'); }
        }
        step(dt = C.step) {
            if (this.state === 'countdown') { this.countdown -= dt; if (this.countdown <= 0) { this.state = this.resumeState; this.sync(); } return; }
            if (this.state === 'dying') {
                this.sync(); this.time += dt; this.deathRemaining = Math.max(0, this.deathRemaining - dt);
                if (this.deathRemaining < 1e-9) { this.deathRemaining = 0; this.state = 'over'; this.emit('over'); }
                return;
            }
            if (!['playing', 'intro'].includes(this.state)) return;
            this.sync(); this.time += dt; const p = this.player; p.modeTime += dt;
            if (this.state === 'intro') {
                p.x = Math.min(100, p.x + 300 * dt); p.velocity -= 5400 * dt; p.bottom = Math.max(40, p.bottom + p.velocity * dt);
                if (!this.wallBroken && p.x + 120 >= 80) this.breakWall();
                if (p.bottom === 40) this.mode('run');
                if (p.x === 100 && p.bottom === 40) { this.state = 'playing'; this.mode('run'); this.emit('start'); }
                return;
            }
            this.effects = this.effects.filter(e => this.time - e.born < e.duration);
            const wasBoost = this.boost > 0, wasQhk = this.qhk > 0;
            this.boost = Math.max(0, this.boost - dt); this.qhk = Math.max(0, this.qhk - dt);
            this.invulnerable = Math.max(0, this.invulnerable - dt); this.stream = Math.max(0, this.stream - dt);
            if (wasBoost && !this.boost) { this.mode(p.bottom > 40 ? 'fall' : 'run'); p.velocity = 0; this.invulnerable = 1; this.input.target = null; }
            if (wasQhk && !this.qhk) { this.invulnerable = 1; this.emit('qhk-end'); }
            if (!this.boost) this.speed = Math.min(C.maxSpeed, this.speed + C.acceleration * dt);
            const speed = this.speed * (this.boost ? 2 : 1), movement = speed * dt;
            this.distance += movement; this.wallX -= movement;
            this.score += 10 * dt * (this.boost ? 15 : 1);
            if (this.boost) {
                if (this.input.target !== null) p.bottom += (this.input.target - p.bottom) * (1 - Math.pow(.9, dt * 60));
                else p.bottom += ((this.input.up ? 1 : 0) - (this.input.down ? 1 : 0)) * 300 * dt;
                p.bottom = clamp(p.bottom, 50, 275);
            } else if (['rise', 'fall'].includes(p.mode)) {
                p.velocity -= C.gravity * dt;
                if (this.input.jump && p.velocity > 0) p.velocity += C.holdAcceleration * dt;
                p.bottom += p.velocity * dt;
                if (p.bottom >= 290 && p.velocity > 0) { p.bottom = 290; p.velocity = 0; }
                if (p.bottom <= 40) {
                    p.bottom = 40; p.velocity = 0;
                    if (this.input.down) { this.mode('crouch'); p.transition = .05; } else this.mode('run');
                    p.slam = false;
                } else this.mode(p.velocity > 0 ? 'rise' : 'fall');
            } else if (p.mode === 'crouch') {
                p.transition -= dt;
                if (p.transition <= 0) { this.mode(this.input.down ? 'slide' : 'run'); if (this.input.down) this.emit('slide'); }
            } else if (p.mode === 'slide' && !this.input.down) { this.mode('crouch'); p.transition = .05; }
            this.updateTrail(dt);
            const current = playerRect(p, 1, true), previous = playerRect(p, 0, true);
            for (const e of this.entities) {
                e.x -= movement * (e.kind === 'bottle' ? 1.2 : 1);
                const hit = swept(previous, current, entityRect(e, this.previousTime, 0), entityRect(e, this.time));
                if (hit && this.state === 'playing') {
                    if (e.kind === 'obstacle' || e.kind === 'bottle') this.hit(e); else this.collect(e);
                }
                if (e.x + e.w < -20) e.alive = false;
            }
            this.entities = this.entities.filter(e => e.alive);
            if (this.state !== 'playing') return;
            this.spawn(dt, speed);
        }
        spawn(dt, speed) {
            const t = this.spawnTimers;
            for (const name of Object.keys(t)) t[name] += dt;
            const due = (key, duration) => { if (t[key] + 1e-9 < duration) return false; t[key] -= duration; return true; };
            if (due('obstacle', Math.max(.9, 2 * Math.pow(300 / speed, .75)))) { if (!this.qhk) this.spawnObstacle(); t.obstacle = -this.range(0, .1); }
            if (due('beer', 1)) { if (!this.qhk) this.spawnBeer(); t.beer = -this.range(0, .1); }
            if (due('kiwi', 5) && !this.boost && !this.qhk && this.random() < .1) this.add('kiwi', 800, 450 - this.range(95, 125) - 35, 35, 35, 'kiwi.png');
            if (due('logo', 6) && !this.boost && !this.qhk && this.random() < .05) this.add('logo', 800, 450 - this.range(100, 140) - 45, 45, 45, 'qhk-logo.png');
            if (due('bottle', Math.max(2.5, 4 * Math.pow(300 / speed, .7))) && !this.boost && !this.qhk && this.random() < .35) this.add('bottle', 860, this.range(60, 340), 60, 60, 'thrown-bottle-sprite.png');
            if (this.boost && !this.qhk && due('coin', this.nextCoin)) { this.add('coin', 800, 450 - this.range(70, 340) - 30, 30, 30, 'coin.png'); this.nextCoin = this.range(.5, 1.2); }
            if (!this.boost) t.coin = 0;
            if (this.stream && due('stream', .12)) this.add('coin', 820, 320, 30, 30, 'coin.png');
            if (!this.stream) t.stream = 0;
            if (due('foot', .38) && this.player.mode === 'run') this.emit('foot');
            if (due('particle', .1) && this.boost) this.effect(this.player.x, 450 - this.player.bottom - 70, 'spark');
        }
    }
    // Fixed simulation with interpolation at arbitrary display refresh rates. Never catch up a hidden tab.
    class Clock {
        constructor() { this.reset(); }
        reset() { this.previous = null; this.accumulator = 0; }
        advance(timestamp, update) {
            if (this.previous === null) { this.previous = timestamp; return 0; }
            this.accumulator += clamp((timestamp - this.previous) / 1000, 0, .1); this.previous = timestamp;
            let steps = 0;
            while (this.accumulator + 1e-10 >= C.step && steps < 6) { update(C.step); this.accumulator -= C.step; steps++; }
            this.accumulator = Math.max(0, this.accumulator);
            return clamp(this.accumulator / C.step, 0, 1);
        }
    }
    const api = { C, characters, obstacles, Engine, Clock, clamp, lerp, frame, intersects, swept, playerRect, entityRect };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.QHK = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
