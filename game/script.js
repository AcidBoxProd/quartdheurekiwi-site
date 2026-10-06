/* Browser adapter: loading, audio, menus and input. The simulation lives in engine.js. */
(function (Q) {
    'use strict';
    const $ = id => document.getElementById(id);
    const assets = new Map(), pending = new Map();
    const game = new Q.Engine(), clock = new Q.Clock();
    const stage = $('stage'), canvas = $('scene');
    let renderer, screen = 'splash', frameId = 0, uiTime = 0, lastUiTime = null, ready = false, contextLost = false;
    let retryAction = null, loading = false, touch = null, lastState = '', soundIndex = 0, lastPower = -1;
    const keys = new Set();
    function storageGet(key, fallback) { try { const v = localStorage.getItem(key); return v === null ? fallback : v; } catch (_) { return fallback; } }
    function storageSet(key, value) { try { localStorage.setItem(key, String(value)); } catch (_) { /* private or embedded storage must not prevent play */ } }
    let record = Math.max(0, Number(storageGet('htmlRunnerHighScore', '0')) || 0);
    const settings = { music: storageGet('htmlRunnerMusicOn', 'true') === 'true', sfx: storageGet('htmlRunnerSfxOn', 'true') === 'true' };
    const tracks = { menu: 'menu-theme.mp3', game: 'quart-dheure-kiwi-theme.mp3', qhk: 'invincibility-music.mp3' };
    const sounds = { jump: 'jump-sfx.mp3', beer: 'beer-collect-sfx.mp3', coin: 'coin.mp3', kiwi: 'kiwi-collect-sfx.mp3',
        hit: 'hit-sfx.mp3', boost: 'boost-activate-sfx.mp3', over: 'game-over-sfx.mp3', break: 'wall-break-sfx.mp3',
        slide: 'slide-sfx.mp3', click: 'button-click-sfx.mp3', select: 'char-select-confirm-sfx.mp3' };
    const music = new Audio(); music.loop = true; music.volume = .3; music.preload = 'none';
    let currentTrack = '', audioUnlocked = false, audioContext = null, stopSlideSound = null;
    const soundBuffers = new Map(), soundPools = new Map(), activeSounds = new Set();
    function safePlay(audio) { try { const p = audio.play(); if (p && p.catch) p.catch(() => {}); } catch (_) {} }
    function unlockAudio() {
        audioUnlocked = true;
        if (!audioContext && location.protocol !== 'file:') {
            const Context = window.AudioContext || window.webkitAudioContext;
            if (Context) { try { audioContext = new Context(); } catch (_) {} }
        }
        if (audioContext && audioContext.state === 'suspended') audioContext.resume().catch(() => {});
        playMusic();
    }
    function desiredTrack() { return screen === 'game' ? game.qhk ? 'qhk' : 'game' : 'menu'; }
    function playMusic() {
        if (!audioUnlocked || !settings.music || document.hidden || screen === 'splash' || screen === 'game' && ['paused', 'countdown', 'dying', 'over'].includes(game.state)) { music.pause(); return; }
        const next = desiredTrack();
        if (currentTrack !== next) { currentTrack = next; music.src = 'audio/' + tracks[next]; }
        if (music.paused) safePlay(music);
    }
    function stopEffects() {
        if (stopSlideSound) { stopSlideSound(); stopSlideSound = null; }
        for (const source of activeSounds) { try { source.stop(); } catch (_) {} } activeSounds.clear();
        for (const pool of soundPools.values()) for (const audio of pool) audio.pause();
    }
    async function warmAudio() {
        // Short sounds are optional. Load after images, four at a time, never block start.
        const files = [...Object.values(sounds), ...[1, 2, 3, 4].map(n => `footstep-sfx-${n}.mp3`)];
        let index = 0;
        await Promise.all(Array.from({ length: 4 }, async () => {
            while (index < files.length) {
                const name = files[index++];
                if (soundPools.has(name)) continue;
                const pool = [new Audio('audio/' + name), new Audio('audio/' + name)];
                pool.forEach(a => { a.preload = 'auto'; a.volume = .5; }); soundPools.set(name, pool);
                if (audioContext) {
                    try {
                        const response = await fetch('audio/' + name); if (!response.ok) continue;
                        const buffer = await response.arrayBuffer();
                        const decoded = await new Promise((resolve, reject) => audioContext.decodeAudioData(buffer, resolve, reject));
                        soundBuffers.set(name, decoded);
                    } catch (_) { /* HTML audio fallback also supports opening index.html directly. */ }
                }
            }
        }));
    }
    function sound(event, loop = false) {
        if (!settings.sfx || !audioUnlocked || document.hidden) return;
        const name = event === 'foot' ? `footstep-sfx-${1 + soundIndex++ % 4}.mp3` : sounds[event];
        if (!name) return;
        if (audioContext && audioContext.state === 'running' && soundBuffers.has(name)) {
            if (activeSounds.size >= 12) return;
            const source = audioContext.createBufferSource(), gain = audioContext.createGain();
            source.buffer = soundBuffers.get(name); source.loop = loop; gain.gain.value = event === 'foot' ? .25 : .5;
            source.connect(gain); gain.connect(audioContext.destination); activeSounds.add(source);
            source.onended = () => { activeSounds.delete(source); source.disconnect(); gain.disconnect(); }; source.start();
            return () => { try { source.stop(); } catch (_) {} activeSounds.delete(source); };
        } else {
            const pool = soundPools.get(name); if (!pool) return;
            const audio = pool.find(a => a.paused || a.ended); if (!audio) return;
            audio.loop = loop; try { audio.currentTime = 0; } catch (_) {} safePlay(audio);
            return () => { audio.pause(); audio.loop = false; try { audio.currentTime = 0; } catch (_) {} };
        }
    }
    function syncSlideSound() {
        const sliding = screen === 'game' && game.state === 'playing' && game.player.mode === 'slide' && settings.sfx && !document.hidden;
        if (!sliding && stopSlideSound) { stopSlideSound(); stopSlideSound = null; }
        else if (sliding && !stopSlideSound) stopSlideSound = sound('slide', true) || null;
    }
    function loadImage(name) {
        if (assets.has(name)) return Promise.resolve();
        if (pending.has(name)) return pending.get(name);
        const task = new Promise((resolve, reject) => {
            const image = new Image(); let settled = false;
            const finish = error => {
                if (settled) return; settled = true; clearTimeout(timer); image.onload = image.onerror = null;
                if (error) { reject(error); return; }
                try {
                // Store small decoded canvases for oversized menu art and idle sheets.
                let width = image.naturalWidth, height = image.naturalHeight;
                if (name.includes('-idle-sprite')) { width = 840; height = 140; }
                else if (/^(home-screen|menu-screen|char-select-screen|your-splash-image-landscape)/.test(name)) { width = 800; height = 450; }
                if (width !== image.naturalWidth || height !== image.naturalHeight) {
                    const buffer = document.createElement('canvas'); buffer.width = width; buffer.height = height;
                    const context = buffer.getContext('2d');
                    if (context) { context.imageSmoothingEnabled = false; context.drawImage(image, 0, 0, width, height); assets.set(name, buffer); }
                    else assets.set(name, image);
                } else assets.set(name, image);
                resolve();
                } catch (error) { reject(error); }
            };
            const timer = setTimeout(() => finish(new Error(name)), 15000);
            image.onload = async () => {
                if (typeof image.decode === 'function') { try { await image.decode(); } catch (_) { /* onload remains usable on older decoders */ } }
                finish(image.naturalWidth ? null : new Error(name));
            };
            image.onerror = () => finish(new Error(name)); image.src = 'img/' + name;
        }).finally(() => pending.delete(name));
        pending.set(name, task); return task;
    }
    async function loadImages(names) {
        const list = [...new Set(names)], failures = []; let index = 0, completed = 0;
        await Promise.all(Array.from({ length: 4 }, async () => {
            while (index < list.length && failures.length === 0) {
                const name = list[index++]; let loaded = false;
                for (let attempt = 0; attempt < 2; attempt++) { try { await loadImage(name); loaded = true; break; } catch (_) {} }
                if (!loaded) failures.push(name);
                completed++; $('loading-text').textContent = `Chargement… ${Math.round(completed / list.length * 100)} %`;
            }
        }));
        if (failures.length) throw new Error(`Images non chargées : ${failures.join(', ')}`);
    }
    async function withLoading(action) {
        if (loading) return;
        loading = true; retryAction = () => withLoading(action); $('loading').hidden = false; $('retry').hidden = true;
        try { await action(); $('loading').hidden = true; retryAction = null; }
        catch (error) { console.error(error); $('loading-text').textContent = 'Chargement incomplet. Vérifiez la connexion puis réessayez.'; $('retry').hidden = false; }
        finally { loading = false; wake(); }
    }
    const menuAssets = ['your-splash-image-landscape.png', 'home-screen-1920x1080.png', 'char-select-screen-bg.png', ...[1, 2, 3, 4].map(n => `menu-screen-${n}.png`), ...Q.characters.map(n => `${n}-idle-sprite.png`)];
    const sceneAssets = ['bg-far.png', 'bg-near.png', 'ground-tile.png', 'ceiling-tile.png', 'beer-sprite-10.png', 'thrown-bottle-sprite.png', 'kiwi.png', 'qhk-logo.png', 'coin.png', 'heart-full.png', 'heart-empty.png', 'wall-texture-solid.png', 'wall-texture-hole.png', 'explosion-sprite.png', 'smoke-plume.png',
        ...Object.entries(Q.obstacles).flatMap(([kind, variants]) => variants.map(v => `obstacle-${kind}${v ? '-' + v : ''}.png`))];
    function show(next) {
        screen = next; for (const section of document.querySelectorAll('.screen')) section.hidden = section.id !== next;
        $('confirmation').hidden = true; $('record').textContent = record;
        clock.reset(); lastUiTime = null; lastState = ''; lastPower = -1; keys.clear(); touch = null; game.release(); playMusic(); wake();
    }
    function start(character) {
        unlockAudio(); sound('select');
        withLoading(async () => {
            await loadImages([...sceneAssets, ...['run-sprite', 'jump-up', 'jump-down', 'slide', 'crouch', 'boost-sprite'].map(s => `${character}-${s}.png`)]);
            game.reset(character); show('game'); updateHud(); warmAudio();
            if (document.hidden) pause();
        });
    }
    function pause() {
        if (screen !== 'game') return;
        game.pause(); keys.clear(); touch = null; stopEffects(); clock.reset(); updateHud(); playMusic(); wake();
    }
    function resume() { if (contextLost) return; unlockAudio(); game.resume(); clock.reset(); updateHud(); wake(); }
    function updateHud() {
        if (screen !== 'game') return;
        const score = `SCORE: ${Math.floor(game.score)}`; if ($('score').textContent !== score) $('score').textContent = score;
        const lifeLabel = `${game.lives} vies`;
        if ($('hearts').getAttribute('aria-label') !== lifeLabel || !$('hearts').children.length) {
            $('hearts').setAttribute('aria-label', lifeLabel); $('hearts').replaceChildren(...[0, 1, 2].map(i => {
                const image = document.createElement('img'); image.src = `img/heart-${i < game.lives ? 'full' : 'empty'}.png`; image.alt = ''; return image;
            }));
        }
        if (lastPower !== game.power || lastState !== game.state) {
            lastPower = game.power; $('boost-fill').style.transform = `scaleY(${game.power / 100})`;
            $('boost').disabled = game.power < 100 || game.state !== 'playing'; $('boost').classList.toggle('ready', game.power >= 100);
            $('boost-label').textContent = game.power >= 100 ? 'READY!' : 'BOOST';
        }
        if (lastState !== game.state) {
            lastState = game.state;
            $('pause-panel').hidden = !['paused', 'countdown'].includes(game.state);
            $('pause-actions').hidden = game.state === 'countdown'; $('pause-title').hidden = game.state === 'countdown';
            $('countdown').hidden = game.state !== 'countdown'; $('over').hidden = game.state !== 'over';
            $('pause').disabled = game.state === 'over';
            $('boost').classList.toggle('pulse-paused', game.state !== 'playing');
            if (game.state === 'over') {
                record = Math.max(record, Math.floor(game.score)); storageSet('htmlRunnerHighScore', record);
                $('final-score').textContent = Math.floor(game.score); $('final-record').textContent = record;
            }
            playMusic();
        }
        if (game.state === 'countdown') $('countdown').textContent = Math.max(1, Math.ceil(game.countdown * 2));
    }
    function render(timestamp) {
        frameId = 0; if (document.hidden || contextLost || !renderer) return;
        if (lastUiTime !== null) uiTime += Math.min(.1, (timestamp - lastUiTime) / 1000); lastUiTime = timestamp;
        const alpha = screen === 'game' ? clock.advance(timestamp, dt => game.step(dt)) : 1;
        for (const event of game.drainEvents()) { if (event !== 'slide') sound(event); if (event === 'qhk' || event === 'qhk-end' || event === 'start') playMusic(); }
        syncSlideSound();
        const moving = screen === 'game' && ['playing', 'intro', 'dying'].includes(game.state);
        renderer.draw(screen, game, moving ? alpha : 1, uiTime, settings); updateHud();
        if (screen === 'characters' || screen === 'game' && ['playing', 'intro', 'dying', 'countdown'].includes(game.state)) wake();
    }
    // Queue one frame even during initial visibility transitions. Safari may load an
    // iframe while hidden; its pending frame will run when painting resumes.
    function wake() { if (!frameId && !contextLost) frameId = requestAnimationFrame(render); }

    function resize() {
        if (!renderer) return;
        const rect = stage.getBoundingClientRect(); renderer.resize(rect.width, rect.height);
        stage.style.fontSize = `${16 * rect.width / 800}px`; wake();
    }
    function button(id, fn) { $(id).addEventListener('click', () => { sound('click'); fn(); }); }
    button('play', () => { if (!ready) return; show('home'); unlockAudio(); warmAudio(); });
    button('start', () => { unlockAudio(); show('characters'); });
    button('settings-open', () => show('settings')); button('settings-back', () => show('home')); button('characters-back', () => show('home'));
    for (const type of ['music', 'sfx']) button(`${type}-toggle`, () => {
        settings[type] = !settings[type]; storageSet(type === 'music' ? 'htmlRunnerMusicOn' : 'htmlRunnerSfxOn', settings[type]);
        $(`${type}-toggle`).setAttribute('aria-pressed', String(settings[type])); unlockAudio(); wake();
    });
    for (const item of document.querySelectorAll('[data-character]')) item.addEventListener('click', () => start(item.dataset.character));
    button('pause', () => game.state === 'paused' ? resume() : pause()); button('resume', resume);
    button('boost', () => { unlockAudio(); game.activateBoost(); wake(); });
    button('restart', () => start(game.character)); button('change-character', () => { stopEffects(); show('characters'); });
    button('pause-home', () => { $('confirmation').hidden = false; });
    button('confirm-home', () => { stopEffects(); show('home'); }); button('cancel-home', () => { $('confirmation').hidden = true; });
    button('retry', () => { if (retryAction) retryAction(); }); button('context-retry', () => location.reload());
    function updateKeys() { game.input.up = keys.has('ArrowUp'); game.input.down = keys.has('ArrowDown'); game.input.jump = keys.has('Space') || keys.has('ArrowUp'); }
    document.addEventListener('keydown', e => {
        if (screen !== 'game' || loading) return;
        if (e.code === 'F2') { e.preventDefault(); renderer.debug = !renderer.debug; wake(); return; }
        if (e.code === 'Escape' || e.code === 'KeyP') { e.preventDefault(); if (!e.repeat && $('confirmation').hidden) game.state === 'paused' ? resume() : pause(); return; }
        if (game.state !== 'playing') return;
        if (!['ArrowUp', 'ArrowDown', 'Space', 'ShiftLeft', 'ShiftRight'].includes(e.code)) return;
        e.preventDefault(); unlockAudio(); keys.add(e.code); updateKeys();
        if (!e.repeat) { if (e.code === 'Space' || e.code === 'ArrowUp') game.jump(); if (e.code === 'ArrowDown') game.down(); if (e.code.startsWith('Shift')) game.activateBoost(); }
    });
    document.addEventListener('keyup', e => { keys.delete(e.code); updateKeys(); });
    const logicalPoint = e => { const rect = canvas.getBoundingClientRect(); return { x: (e.clientX - rect.left) * 800 / rect.width, y: (e.clientY - rect.top) * 450 / rect.height }; };
    stage.addEventListener('pointerdown', e => {
        if (e.target.closest('button, .overlay') || screen !== 'game' || game.state !== 'playing' || touch || e.button !== 0) return;
        e.preventDefault(); unlockAudio(); const point = logicalPoint(e);
        touch = { id: e.pointerId, y: point.y, bottom: game.player.bottom, start: performance.now(), slid: false };
        try { stage.setPointerCapture(e.pointerId); } catch (_) {}
        if (game.boost) game.input.target = game.player.bottom; else game.jump();
    });
    stage.addEventListener('pointermove', e => {
        if (!touch || e.pointerId !== touch.id) return;
        e.preventDefault(); const delta = logicalPoint(e).y - touch.y;
        if (game.boost) game.input.target = Q.clamp(touch.bottom - delta, 50, 275);
        else if (!touch.slid && delta > 30 && performance.now() - touch.start < 500) { touch.slid = true; game.down(); }
    });
    function releasePointer(e) {
        if (!touch || e.pointerId !== touch.id) return;
        touch = null; game.input.target = null; game.input.jump = false; game.input.down = false; updateKeys();
    }
    stage.addEventListener('pointerup', releasePointer); stage.addEventListener('pointercancel', releasePointer); stage.addEventListener('lostpointercapture', releasePointer);
    stage.addEventListener('contextmenu', e => e.preventDefault());
    function hide() { pause(); if (frameId) { cancelAnimationFrame(frameId); frameId = 0; } music.pause(); stopEffects(); keys.clear(); touch = null; game.release(); clock.reset(); lastUiTime = null; }
    document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); else { playMusic(); wake(); } });
    window.addEventListener('blur', hide); window.addEventListener('pagehide', hide); window.addEventListener('pageshow', () => { clock.reset(); resize(); });
    window.addEventListener('focus', () => { playMusic(); wake(); });
    window.addEventListener('resize', resize); if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
    canvas.addEventListener('contextlost', e => { e.preventDefault(); pause(); contextLost = true; $('context-error').hidden = false; });
    canvas.addEventListener('contextrestored', () => { contextLost = false; $('context-error').hidden = true; resize(); });
    // Retire only this game's old service worker. Versioned scripts avoid mixed releases.
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
        const ownScope = new URL('./', location.href).href;
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (const registration of registrations) if (registration.scope === ownScope && /\/sw\.js(?:\?|$)/.test((registration.active || registration.waiting || registration.installing || {}).scriptURL || '')) registration.unregister().catch(() => {});
        }).catch(() => {});
    }
    for (const type of ['music', 'sfx']) $(`${type}-toggle`).setAttribute('aria-pressed', String(settings[type]));
    try { renderer = new Q.Renderer(canvas, assets); resize(); }
    catch (error) { $('loading-text').textContent = error.message; return; }
    withLoading(async () => { await loadImages(menuAssets); ready = true; resize(); });
})(window.QHK);
