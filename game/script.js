document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const splashScreen = document.getElementById('splash-screen');
    const homeScreen = document.getElementById('home-screen');
    const homeStartImageButton = document.getElementById('home-start-image-button');
    const homeMenuImageButton = document.getElementById('home-menu-image-button');
    const settingsMenuScreen = document.getElementById('settings-menu-screen');
    const musicToggle = document.getElementById('music-toggle');
    const sfxToggle = document.getElementById('sfx-toggle');
    const settingsBackImageButton = document.getElementById('settings-back-image-button');
    const settingsMusicToggleArea = document.getElementById('settings-music-toggle-area');
    const settingsSfxToggleArea = document.getElementById('settings-sfx-toggle-area');

    const characterSelectionScreen = document.getElementById('character-selection-screen');
    const characterSlotContainers = document.querySelectorAll('.character-slot-container');
    const charSelectBackHomeButton = document.getElementById('char-select-back-home-button');
    const charSelectHighScoreDisplay = document.getElementById('char-select-high-score');
    const loadingMessage = document.getElementById('loading-message');
    const charSelectScreenOverlay = document.getElementById('char-select-screen-overlay');

    const gameContainer = document.getElementById('game-container');
    const player = document.getElementById('player');
    const playerShadow = document.getElementById('player-shadow');
    const playerDebugElement = document.getElementById('player-hitbox-debug');
    const ground = document.getElementById('ground');
    const scoreDisplay = document.getElementById('score');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');
    const changeCharButton = document.getElementById('change-char-button');
    const bgLayer1 = document.getElementById('bg-layer-1');
    const bgLayer2 = document.getElementById('bg-layer-2');
    const ceiling = document.getElementById('ceiling');
    const powerGaugeContainer = document.getElementById('power-gauge-container');
    const powerGaugeFill = document.getElementById('power-gauge-fill');
    const powerGaugeText = document.getElementById('power-gauge-text');
    const gameOverHighScoreDisplay = document.getElementById('game-over-high-score');
    const heartContainer = document.getElementById('heart-container');
    const scalerWrapper = document.getElementById('scaler-wrapper');
    const pageRotator = document.getElementById('page-rotator');
    const rotatePrompt = document.getElementById('rotate-prompt');
    const pauseButton = document.getElementById('pause-button');
    const pauseOverlay = document.getElementById('pause-overlay');
    const pauseMessageElement = document.getElementById('pause-message');
    const countdownDisplay = document.getElementById('countdown-display');
    const resumeButton = document.getElementById('resume-button');
    const pauseMenuButtonsContainer = document.getElementById('pause-menu-buttons');
    const pauseHomeButton = document.getElementById('pause-home-button');
	const backgroundMusic = document.getElementById('background-music');
    const invincibilityMusic = document.getElementById('invincibility-music');
    const menuMusic = document.getElementById('menu-music');
    const sfxJump = document.getElementById('sfx-jump');
    const sfxBeer = document.getElementById('sfx-beer');
    const sfxKiwi = document.getElementById('sfx-kiwi');
    const sfxHit = document.getElementById('sfx-hit');
    const sfxBoost = document.getElementById('sfx-boost');
    const sfxGameOver = document.getElementById('sfx-game-over');
    const sfxWallBreak = document.getElementById('sfx-wall-break');
    const sfxSlide = document.getElementById('sfx-slide');
    const sfxCoin = document.getElementById('sfx-coin');
    const sfxButtonClick = document.getElementById('sfx-button-click');
    const sfxCharSelectConfirm = document.getElementById('sfx-char-select-confirm');
    const sfxFootsteps = [
        document.getElementById('sfx-footstep-1'),
        document.getElementById('sfx-footstep-2'),
        document.getElementById('sfx-footstep-3'),
        document.getElementById('sfx-footstep-4')
    ].filter(sfx => sfx);

    const startWall = document.getElementById('start-wall');
    const confirmationDialog = document.getElementById('confirmation-dialog');
    const confirmationMessage = document.getElementById('confirmation-message');
    const confirmYesButton = document.getElementById('confirm-yes-button');
    const confirmNoButton = document.getElementById('confirm-no-button');

    const allScreens = [homeScreen, characterSelectionScreen, gameContainer, settingsMenuScreen];

    let score = 0, gameSpeed = 5, originalGameSpeed = 5, scoreMultiplier = 1, playerLives = 3;
    let gameOver = true, selectedCharacterClass = 'char1', currentPlayerState = 'idle', playerDY = 0;
    let isJumping = false, isHoldingJump = false, boostVelocityY = 0, isSliding = false;
    let animationFrameId = null, lastTimestamp = 0, beerInterval = 1000;
    let timeSinceLastObstacle = 0, timeSinceLastBeer = 0, timeSinceLastKiwiCheck = 0;
    let currentObstacleIntervalSeconds = 1.5, currentBeerIntervalSeconds = beerInterval / 1000, currentKiwiIntervalSeconds = 5;
    let powerGaugeValue = 0, isBoosting = false, boostTimer = null, isPostHitInvincible = false, postHitInvincibilityTimer = null;
    let bg1PosX = 0, bg2PosX = 0, groundPosX = 0, ceilingPosX = 0;
    let slideEnterTimeout = null, slideExitTimeout = null, isSlammingDown = false, currentScale = 1;
    let timeSinceLastParticle = 0, isPaused = false, isCountingDown = false, pauseStartTime = 0;
    let boostStartTime = 0, boostTimeRemaining = 0, postHitInvincibilityStartTime = 0, postHitInvincibilityTimeRemaining = 0;
    let countdownTimer = null, countdownValue = 3, lastSpawnedObstacleImage = { short: null, tall: null, high: null };
    let timeSinceLastBottle = 0, currentBottleIntervalSeconds = 3.0, musicVolume = 0.3, sfxVolume = 0.5;
    let isMusicOn = true, isSfxOn = true, confirmAction = null, isInStartingAnimation = false;
    let wallBroken = false, wallTextureSwapped = false, playerInitiallyHidden = true, playerStartFalling = false;
    let slideSfxWasPlayingBeforePause = false;
    let isQhkInvincible = false, qhkInvincibilityTimer = null, qhkInvincibilityStartTime = 0, qhkInvincibilityTimeRemaining = 0;
    let timeSinceLastQhkLogoCheck = 0, activeMusicTrack = null;
    let hueAngle = 0, hueAnimationId = null;
    let timeSinceLastBoostCoinSpawn = 0;
    let lastObstacleTypeSpawned = null;
    let consecutiveObstacleTypeSpawns = 0;
    let touchStartY = 0, touchStartTime = 0, touchActionIdentifier = null, isPotentialTap = false;
    let tapTimeout = null, isTouchSliding = false, playerBoostStartY = 0, boostTargetY = 0;
    let isSpawningQhkCoinStream = false;
    let timeSinceLastQhkStreamCoin = 0;
    let qhkCoinSpawnStopTimer = null;

    const SHADOW_BASE_WIDTH_CONST = 70;
    const SHADOW_BASE_HEIGHT_CONST = 15;
    const SHADOW_MIN_SCALE_CONST = 0.4;
    const SHADOW_GROUND_OFFSET_Y_CONST = 0;
    const FOOTSTEP_INTERVAL_CONST = 0.38;

    let timeSinceLastFootstep = 0;
    let footstepSfxPlaying = false;

    const DEBUG_HITBOXES_CONST = false;
    const GAME_DESIGN_WIDTH_CONST = 800, GAME_DESIGN_HEIGHT_CONST = 450;
    const HOME_SCREEN_DESIGN_WIDTH_CONST = 1920, HOME_SCREEN_DESIGN_HEIGHT_CONST = 1080;
    const groundHeight_CONST = 40;
    const CEILING_HEIGHT_CONST = 50;
    const playerWidth_CONST = 120, playerHeight_CONST = 120, playerBoostWidth_CONST = 150, playerBoostHeight_CONST = 150;
    const playerSlideHeight_CONST = 60, playerCrouchHeight_CONST = 90, playerBaseBottom_CONST = 40, playerLeftPosition_CONST = 100;
    const tallObstacleHeight_CONST = 160, tallObstacleWidth_CONST = 60, shortObstacleHeight_CONST = 80, shortObstacleWidth_CONST = 100;
    const highObstacleHeight_CONST = 280, highObstacleWidth_CONST = 120, beerWidth_CONST = 50, beerHeight_CONST = 50;
    const beerBaseBottom_CONST = 90, kiwiBaseBottom_CONST = 110, bg1ScrollFactor_CONST = 0.2, bg2ScrollFactor_CONST = 0.5;
    const bgImageWidth_CONST = 3840, tileImageWidth_CONST = 960, SWIPE_THRESHOLD_Y_CONST = 50, SWIPE_MAX_TIME_CONST = 500;
    const TAP_DURATION_THRESHOLD_CONST = 200, INITIAL_GAME_SPEED_CONST = 5, SPEED_INCREASE_PER_SECOND_CONST = 0.1, MAX_GAME_SPEED_CONST = 15;
    const POWER_GAUGE_MAX_CONST = 100, POWER_PER_BEER_CONST = 10, BOOST_DURATION_CONST = 3000;
    const BOOST_SPEED_MULTIPLIER_CONST = 2.0, BOOST_SCORE_MULTIPLIER_CONST = 15;
    const KIWI_SPAWN_CHANCE_CONST = 0.1, KIWI_SPAWN_INTERVAL_CONST = 5000;
    const HIGH_SCORE_KEY_CONST = 'htmlRunnerHighScore', MAX_LIVES_CONST = 3, POST_HIT_INVINCIBILITY_DURATION_CONST = 1000;
    const CROUCH_TRANSITION_DURATION_CONST = 50;
    const gravity_CONST = 0.8, jumpForce_CONST = 12, MAX_JUMP_HEIGHT_CONST = 250;
    const JUMP_DOWN_THRESHOLD_CONST = 0, JUMP_HOLD_BOOST_CONST = 0.5, BOOST_VERTICAL_SPEED_CONST = 5, BOOST_SMOOTH_FACTOR_CONST = 0.1;
    const BOOST_MIN_BOTTOM_CONST = 50, BOOST_MAX_BOTTOM_CONST = 275, HITBOX_HORIZONTAL_PADDING_CONST = 40, HITBOX_VERTICAL_PADDING_CONST = 20;
    const BASE_OBSTACLE_INTERVAL_MS_CONST = 2000, MIN_OBSTACLE_INTERVAL_SECONDS_CONST = 0.9, OBSTACLE_SPAWN_SPEED_SENSITIVITY_CONST = 0.75;
    const PARTICLE_SPAWN_INTERVAL_CONST = 0.05, BOOST_PARTICLE_SPAWN_SPREAD_X_CONST = 50, BOOST_PARTICLE_SPAWN_SPREAD_Y_CONST = 80;
    const BOOST_PARTICLE_TRAVEL_DISTANCE_X_CONST = 50, BOOST_PARTICLE_TRAVEL_DISTANCE_Y_CONST = 30;
    const BOOST_PARTICLE_MIN_DURATION_CONST = 500, BOOST_PARTICLE_MAX_DURATION_CONST = 1000, SCORE_INCREMENT_PER_SECOND_CONST = 10;
    const POINTS_PER_BEER_CONST = 50, VERTICAL_SPAWN_OFFSET_CONST = -10, THROWN_BOTTLE_WIDTH_CONST = 60, THROWN_BOTTLE_HEIGHT_CONST = 60;
    const THROWN_BOTTLE_SPEED_X_FACTOR_CONST = 1.2, BASE_BOTTLE_INTERVAL_MS_CONST = 4000, MIN_BOTTLE_INTERVAL_SECONDS_CONST = 2.5;
    const BOTTLE_SPAWN_CHANCE_CONST = 0.35, BOTTLE_VERTICAL_MARGIN_CONST = 10, BOTTLE_SPAWN_SENSITIVITY_CONST = 0.7;
    const MUSIC_ON_KEY_CONST = 'htmlRunnerMusicOn', SFX_ON_KEY_CONST = 'htmlRunnerSfxOn';
    const PLAYER_ANIM_START_X_CONST = -120, PLAYER_ANIM_TARGET_X_CONST = playerLeftPosition_CONST, PLAYER_ANIM_START_Y_OFFSET_CONST = 150;
    const PLAYER_LANDING_GRAVITY_CONST = 1.5, PLAYER_ENTRY_FORWARD_SPEED_CONST = 300, WALL_HIT_POINT_X_CONST = 80;
    const DEBRIS_PARTICLE_COUNT_CONST = 55, DEBRIS_SPREAD_CONST = 90, DEBRIS_Y_MULTIPLIER_ON_WALL_CONST = 0.70;
    const SCREEN_SHAKE_DURATION_WALL_CONST = 200, SMOKE_PLUME_COUNT_CONST = 10, SMOKE_PLUME_HORIZONTAL_SPREAD_CONST = 60;
    const SMOKE_PLUME_VERTICAL_SPREAD_CONST = 100, SMOKE_PLUME_Y_BASE_OFFSET_ON_WALL_CONST = 80, SMOKE_PLUME_ASSET_SIZE_CONST = 40;
    const PLAYER_REVEAL_DELAY_CONST = 120;
    const QHK_INVINCIBILITY_DURATION_CONST = 7000;
    const QHK_COIN_SPAWN_DURATION_CONST = 6000;
    const QHK_LOGO_WIDTH_CONST = 45, QHK_LOGO_HEIGHT_CONST = 45;
    const QHK_LOGO_BASE_BOTTOM_CONST = 120, QHK_LOGO_SPAWN_CHANCE_CONST = 0.05, QHK_LOGO_SPAWN_INTERVAL_CONST = 6000;
    const POINTS_PER_BOOST_COIN_CONST = 100, BOOST_COIN_SPAWN_INTERVAL_MIN_CONST = 0.5, BOOST_COIN_SPAWN_INTERVAL_MAX_CONST = 1.2;
    const BOOST_COIN_WIDTH_CONST = 30, BOOST_COIN_HEIGHT_CONST = 30;
    const BOOST_COIN_VERTICAL_RANGE_MIN_CONST = 70;
    const BOOST_COIN_VERTICAL_RANGE_MAX_CONST = GAME_DESIGN_HEIGHT_CONST - CEILING_HEIGHT_CONST - BOOST_COIN_HEIGHT_CONST - 30;
    const MAX_CONSECUTIVE_OBSTACLE_TYPE_CONST = 3;
    const QHK_COIN_Y_POSITION_BOTTOM_CONST = 100;
    const QHK_COIN_START_OFFSET_X_CONST = 20;
    const QHK_STREAM_COIN_SPAWN_INTERVAL_SECONDS_CONST = 0.12;

    const IDLE_SPRITE_INFO = {
        char1: { path: 'img/raphael-idle-sprite.png', frameWidth: 140, frameHeight: 140, frameCount: 6 },
        char2: { path: 'img/mick-idle-sprite.png', frameWidth: 140, frameHeight: 140, frameCount: 6 },
        char3: { path: 'img/thibault-idle-sprite.png', frameWidth: 140, frameHeight: 140, frameCount: 6 },
        char4: { path: 'img/simon-idle-sprite.png', frameWidth: 140, frameHeight: 140, frameCount: 6 }
    };
    const CHAR_SELECT_BG_IMG_PATH_CONST = 'img/char-select-screen-bg.png';
    const CHAR_SELECT_DESIGN_WIDTH_CONST = 1920;
    const CHAR_SELECT_DESIGN_HEIGHT_CONST = 1080;

    const spritePaths_CONST = {
        char1: { run: 'img/raphael-run-sprite.png', jumpUp: 'img/raphael-jump-up.png', jumpDown: 'img/raphael-jump-down.png', slide: 'img/raphael-slide.png', crouch: 'img/raphael-crouch.png', boostAnim: 'img/raphael-boost-sprite.png' },
        char2: { run: 'img/mick-run-sprite.png', jumpUp: 'img/mick-jump-up.png', jumpDown: 'img/mick-jump-down.png', slide: 'img/mick-slide.png', crouch: 'img/mick-crouch.png', boostAnim: 'img/mick-boost-sprite.png' },
        char3: { run: 'img/thibault-run-sprite.png', jumpUp: 'img/thibault-jump-up.png', jumpDown: 'img/thibault-jump-down.png', slide: 'img/thibault-slide.png', crouch: 'img/thibault-crouch.png', boostAnim: 'img/thibault-boost-sprite.png' },
        char4: { run: 'img/simon-run-sprite.png', jumpUp: 'img/simon-jump-up.png', jumpDown: 'img/simon-jump-down.png', slide: 'img/simon-slide.png', crouch: 'img/simon-crouch.png', boostAnim: 'img/simon-boost-sprite.png' }
    };
    const obstacleImages_CONST = { short: ['img/obstacle-short-barrels.png', 'img/obstacle-short-box.png', 'img/obstacle-short-crates.png', 'img/obstacle-short-crates2.png', 'img/obstacle-short-crates3.png', 'img/obstacle-short-mop.png'], tall: ['img/obstacle-tall-crates.png', 'img/obstacle-tall-crates2.png', 'img/obstacle-tall-crates3.png', 'img/obstacle-tall-crates4.png', 'img/obstacle-tall-crates5.png', 'img/obstacle-tall-barrels.png', 'img/obstacle-tall-ladder.png', 'img/obstacle-tall-rack.png', 'img/obstacle-tall-speakers.png'], high: ['img/obstacle-high.png', 'img/obstacle-high-lamp.png', 'img/obstacle-high-cables.png', 'img/obstacle-high-rack.png'] };
    const essentialImagesForGame_CONST = [ 'img/beer-sprite-10.png', 'img/kiwi.png', 'img/qhk-logo.png', 'img/coin.png', 'img/heart-full.png', 'img/heart-empty.png', 'img/explosion-sprite.png', 'img/bg-far.png', 'img/bg-near.png', 'img/ground-tile.png', 'img/ceiling-tile.png', 'img/thrown-bottle-sprite.png', 'img/wall-texture-solid.png', 'img/wall-texture-hole.png', 'img/smoke-plume.png' ].filter(url => url);
    const coreUiImagesToPreload_FN = [ 'img/home-screen-1920x1080.png', 'img/menu-screen-1.png', 'img/menu-screen-2.png', 'img/menu-screen-3.png', 'img/menu-screen-4.png', 'img/wall-texture-solid.png', 'img/wall-texture-hole.png' ].filter(url => url);

    const getRandomElement_FN = (arr) => { if (!Array.isArray(arr) || arr.length === 0) { return null; } return arr[Math.floor(Math.random() * arr.length)]; };
    function getHighScore_FN() { const storedScore = localStorage.getItem(HIGH_SCORE_KEY_CONST); return storedScore ? parseInt(storedScore, 10) : 0; }
    function preloadImages_FN(urls, callback) {
        // console.log("Preloading images:", urls); // Can be too verbose, uncomment if needed
        let loadedCount = 0; let totalImages = urls.length;
        if (totalImages === 0) { /* console.log("No images to preload."); */ if (callback) callback(); return; }
        urls.forEach((url) => {
            if (!url) { loadedCount++; if (loadedCount === totalImages && callback) { /* console.log("Preloading complete (skipped a null URL)."); */ callback(); } return; }
            const img = new Image();
            img.onload = () => { loadedCount++; /* console.log(`Loaded: ${url} (${loadedCount}/${totalImages})`); */ if (loadedCount === totalImages && callback) { console.log("All images preloaded successfully."); callback(); } };
            img.onerror = (e) => { console.error(`Preloading: FAILED to load image: ${url}`, e); loadedCount++; if (loadedCount === totalImages && callback) { console.log("Preloading complete (with errors)."); callback(); } };
            img.src = url;
        });
    }
    function updateSettingsBackgroundImage_FN() { if (!settingsMenuScreen || !musicToggle || !sfxToggle) return; const musicOn = musicToggle.checked; const sfxOn = sfxToggle.checked; let imageUrl = 'img/menu-screen-1.png'; if (musicOn && !sfxOn) { imageUrl = 'img/menu-screen-2.png'; } else if (!musicOn && sfxOn) { imageUrl = 'img/menu-screen-3.png'; } else if (!musicOn && !sfxOn) { imageUrl = 'img/menu-screen-4.png'; } settingsMenuScreen.style.backgroundImage = `url('${imageUrl}')`; }
    function loadAudioSettings_FN() { const storedMusicOn = localStorage.getItem(MUSIC_ON_KEY_CONST); const storedSfxOn = localStorage.getItem(SFX_ON_KEY_CONST); isMusicOn = storedMusicOn !== null ? JSON.parse(storedMusicOn) : true; isSfxOn = storedSfxOn !== null ? JSON.parse(storedSfxOn) : true; if (musicToggle) musicToggle.checked = isMusicOn; if (sfxToggle) sfxToggle.checked = isSfxOn; }
    function saveAudioSettings_FN() { localStorage.setItem(MUSIC_ON_KEY_CONST, JSON.stringify(isMusicOn)); localStorage.setItem(SFX_ON_KEY_CONST, JSON.stringify(isSfxOn)); }

    function playActiveMusic_FN() {
        if (!isMusicOn || !activeMusicTrack) {
            // console.log("playActiveMusic_FN: Music off or no active track.");
            return;
        }
        const allMusicTracks = [backgroundMusic, invincibilityMusic, menuMusic].filter(Boolean);
        allMusicTracks.forEach(track => {
            if (track !== activeMusicTrack && track && !track.paused) {
                track.pause();
                // console.log(`playActiveMusic_FN: Paused other track ${track.id}`);
            }
        });

        if (activeMusicTrack.paused) {
            if (activeMusicTrack.currentTime > 0 && !activeMusicTrack.ended) {
                // console.log(`playActiveMusic_FN: Resuming ${activeMusicTrack.id} from ${activeMusicTrack.currentTime}.`);
            } else {
                activeMusicTrack.currentTime = 0;
                // console.log(`playActiveMusic_FN: Starting ${activeMusicTrack.id} from beginning.`);
            }
            activeMusicTrack.volume = musicVolume;
            activeMusicTrack.play().catch(error => console.warn(`Music play/resume failed for ${activeMusicTrack.id}:`, error));
        } else {
            // console.log(`playActiveMusic_FN: Track ${activeMusicTrack.id} is already playing or not ready.`);
        }
    }
    function pauseActiveMusic_FN() { if (activeMusicTrack && !activeMusicTrack.paused) activeMusicTrack.pause(); }
    function resumeActiveMusic_FN() { if (isMusicOn && activeMusicTrack && activeMusicTrack.paused) playActiveMusic_FN(); }
    function stopAllMusic_FN() {
        if (backgroundMusic) { backgroundMusic.pause(); backgroundMusic.currentTime = 0; }
        if (invincibilityMusic) { invincibilityMusic.pause(); invincibilityMusic.currentTime = 0; }
        if (menuMusic) { menuMusic.pause(); menuMusic.currentTime = 0; }
    }

    function playSoundEffect_FN(sfxElement, loop = false, volumeMultiplier = 1.0) { if (sfxElement && isSfxOn) { let finalVolume = sfxVolume * volumeMultiplier; finalVolume = Math.max(0, Math.min(1.0, finalVolume)); sfxElement.volume = finalVolume; if (sfxElement.paused || !loop) sfxElement.currentTime = 0; sfxElement.loop = loop; sfxElement.play().catch(error => console.warn("SFX play failed:", sfxElement.id, error, sfxElement.src)); } }
    function stopSoundEffect_FN(sfxElement) { if (sfxElement && !sfxElement.paused) { sfxElement.pause(); sfxElement.currentTime = 0; sfxElement.loop = false; } }
    function showConfirmationDialog_FN(message, onConfirm) { if (confirmationDialog && confirmationMessage) { confirmationMessage.textContent = message; confirmAction = onConfirm; confirmationDialog.classList.remove('hidden'); } }
    function hideConfirmationDialog_FN() { if (confirmationDialog) { confirmationDialog.classList.add('hidden'); confirmAction = null; } }
    function applyScreenShake_FN(duration = 150) { if (!scalerWrapper) return; scalerWrapper.classList.add('screen-shaking'); setTimeout(() => { if (scalerWrapper) scalerWrapper.classList.remove('screen-shaking'); }, duration); }
    function loadAndDisplayHighScore_FN() { const highScore = getHighScore_FN(); if (charSelectHighScoreDisplay && characterSelectionScreen && !characterSelectionScreen.classList.contains('hidden')) { charSelectHighScoreDisplay.textContent = highScore; } if (gameOverHighScoreDisplay && gameOverScreen && !gameOverScreen.classList.contains('hidden')) { gameOverHighScoreDisplay.textContent = highScore; } }

    function showScreen_FN(screenToShow) {
        if (!screenToShow || !screenToShow.id) { console.warn("showScreen called with invalid screen:", screenToShow); return; }
        // console.log(`showScreen_FN attempting to show: ${screenToShow.id}. Current activeMusicTrack: ${activeMusicTrack ? activeMusicTrack.id : 'null'}`);
        const isGameScreen = screenToShow.id === 'game-container';

        allScreens.forEach(screen => {
            if (screen && screen.id !== screenToShow.id && !screen.classList.contains('hidden')) {
                screen.classList.add('hidden');
            }
        });
        if (!isGameScreen && gameOverScreen && !gameOverScreen.classList.contains('hidden')) {
            gameOverScreen.classList.add('hidden');
        }
        if (screenToShow.classList.contains('hidden')) {
            screenToShow.classList.remove('hidden');
        }
        // console.log(`${screenToShow.id} classList after hidden toggle: ${screenToShow.classList}`);


        if (!isGameScreen) {
            if (menuMusic) {
                if (activeMusicTrack !== menuMusic) {
                    // console.log(`showScreen_FN: Menu screen. Active track was ${activeMusicTrack ? activeMusicTrack.id : 'null'}. Switching to menuMusic.`);
                    stopAllMusic_FN();
                    activeMusicTrack = menuMusic;
                    playActiveMusic_FN();
                } else if (menuMusic.paused && isMusicOn) {
                    // console.log(`showScreen_FN: Menu screen. menuMusic is active track and paused. Resuming.`);
                    playActiveMusic_FN();
                }
            }
        } else if (isGameScreen) {
             // console.log(`showScreen_FN: Game screen. Music will be handled by game start/resume logic.`);
            if (activeMusicTrack === menuMusic && menuMusic && !menuMusic.paused) {
                //  console.log(`showScreen_FN: Game screen. Explicitly pausing menuMusic.`);
                 menuMusic.pause();
            }
        }

        if (screenToShow.id === 'settings-menu-screen') { updateSettingsBackgroundImage_FN(); }
        else if (screenToShow.id === 'character-selection-screen') { setupCharacterSelectionScreen_FN(); if (charSelectScreenOverlay) charSelectScreenOverlay.classList.add('hidden'); characterSlotContainers.forEach(slot => { slot.classList.remove('selected-char-punchout'); }); }
        resizeGame_FN();
    }

    function setupCharacterSelectionScreen_FN() { if (characterSelectionScreen && !characterSelectionScreen.classList.contains('hidden')) { loadAndDisplayHighScore_FN(); characterSlotContainers.forEach(slot => { const charId = slot.dataset.char; const spriteInfo = IDLE_SPRITE_INFO[charId]; const spriteDiv = slot.querySelector('.char-sprite-animation'); if (spriteInfo && spriteDiv) { spriteDiv.style.backgroundImage = `url('${spriteInfo.path}')`; spriteDiv.style.setProperty('--sprite-frame-width', `${spriteInfo.frameWidth}px`); spriteDiv.style.width = `${spriteInfo.frameWidth}px`; spriteDiv.style.height = `${spriteInfo.frameHeight}px`; const sheetWidth = spriteInfo.frameWidth * spriteInfo.frameCount; spriteDiv.style.backgroundSize = `${sheetWidth}px ${spriteInfo.frameHeight}px`; spriteDiv.classList.add('animating'); } slot.classList.remove('selected-char-punchout'); slot.style.pointerEvents = 'auto'; }); } }

    function goHomeAndReset_FN() {
        stopAllMusic_FN();
        if (menuMusic) { activeMusicTrack = menuMusic; } else { activeMusicTrack = null; }
        stopHueAnimationLoop_FN(); if(player) { player.classList.remove('qhk-invincible-effect'); player.style.filter = ''; }
        clearAllIntervalsAndFrames_FN(); gameOver = true; isPaused = false; isCountingDown = false; isInStartingAnimation = false;
        wallBroken = false; wallTextureSwapped = false; playerInitiallyHidden = true; playerStartFalling = false;
        isQhkInvincible = false; clearTimeout(qhkInvincibilityTimer); qhkInvincibilityTimer = null;
        isSpawningQhkCoinStream = false; clearTimeout(qhkCoinSpawnStopTimer); qhkCoinSpawnStopTimer = null;
        lastObstacleTypeSpawned = null; consecutiveObstacleTypeSpawns = 0;
        if (startWall) { startWall.style.display = 'none'; startWall.style.left = '0px'; startWall.classList.remove('breaking'); startWall.style.backgroundImage = "url('img/wall-texture-solid.png')"; }
        if (countdownTimer) clearInterval(countdownTimer);
        clearGameElements_FN('.obstacle'); clearGameElements_FN('.beer'); clearGameElements_FN('.kiwi');
        clearGameElements_FN('.qhk-logo'); clearGameElements_FN('.boost-coin');
        clearGameElements_FN('.thrown-bottle'); clearGameElements_FN('.explosion');
        clearGameElements_FN('.obstacle-debug'); clearGameElements_FN('.boost-particle');
        clearGameElements_FN('.debris-particle'); clearGameElements_FN('.smoke-plume');
        if (playerDebugElement) playerDebugElement.style.display = 'none';
        if(player) resetPlayerVisuals_FN();
        resetPowerGauge_FN();
        if (bgLayer1) bgLayer1.style.backgroundPositionX = '0px'; if (bgLayer2) bgLayer2.style.backgroundPositionX = '0px';
        if (ground) ground.style.backgroundPositionX = '0px'; if (ceiling) ceiling.style.backgroundPositionX = '0px';
        if(scalerWrapper) scalerWrapper.classList.remove('screen-shaking'); if (gameContainer) gameContainer.classList.remove('game-paused');
        if (charSelectScreenOverlay) charSelectScreenOverlay.classList.add('hidden');
        characterSlotContainers.forEach(slot => slot.classList.remove('selected-char-punchout'));
        showScreen_FN(homeScreen);
        hideConfirmationDialog_FN();
    }

    const initialImagesToPreload = [
        ...coreUiImagesToPreload_FN,
        CHAR_SELECT_BG_IMG_PATH_CONST,
        ...Object.values(IDLE_SPRITE_INFO).map(info => info.path),
		'img/your-splash-image-landscape.png', // <<< CORRECTED: Preload actual landscape splash
		'img/your-splash-image-portrait.png'  // <<< ADDED: Preload actual portrait splash
    ].filter(url => url);

function initializeApp() {
    console.log("initializeApp CALLED");
    const splashStartButton = document.getElementById('splash-start-button'); // Get button early

    if (!splashScreen || !pageRotator || !scalerWrapper || !rotatePrompt || !splashStartButton) {
        console.error("CRITICAL ERROR: Essential layout elements missing. Splash:", !!splashScreen, "PageRotator:", !!pageRotator, "Scaler:", !!scalerWrapper, "RotatePrompt:", !!rotatePrompt, "SplashButton:", !!splashStartButton);
        document.body.innerHTML = "<p style='color:white; text-align:center; padding-top: 50px; font-size: 20px;'>Error: Game files are corrupted or missing. Please reinstall.</p>";
        return;
    }

    splashScreen.classList.remove('hidden');
    document.body.classList.add('splash-active');
    console.log("Splash screen shown with button.");

    function handleSplashInteraction() {
        // Remove listeners from the button itself
        splashStartButton.removeEventListener('click', handleSplashInteraction);
        // if using touchend: splashStartButton.removeEventListener('touchend', handleSplashInteraction);

        console.log("Splash button interaction detected.");

        if (splashScreen) splashScreen.classList.add('hidden');
        document.body.classList.remove('splash-active');
        console.log("Splash screen hidden after interaction.");

        if (pageRotator) pageRotator.style.display = 'block';
        resizeGame_FN();

        loadAudioSettings_FN();
        updateSettingsBackgroundImage_FN();

        if (menuMusic) {
            activeMusicTrack = menuMusic;
            if (activeMusicTrack.volume !== musicVolume) {
                activeMusicTrack.volume = musicVolume;
            }
            if (isMusicOn) {
                console.log("Attempting to play menuMusic directly after splash button tap (if music is on).");
                playActiveMusic_FN();
            } else {
                console.log("Music is set to OFF, not playing after splash.");
            }
        }

        preloadImages_FN(initialImagesToPreload, () => {
            console.log("Preloading finished in initializeApp.");

            if (scalerWrapper.style.display === 'flex') { // landscape
                console.log("Layout is landscape-ready, showing home screen.");
                showScreen_FN(homeScreen);
            } else if (rotatePrompt.style.display === 'flex') { // portrait
                console.log("Layout is portrait, rotate prompt should be visible.");
            } else {
                 console.warn("Unexpected layout state after splash...");
                 if (pageRotator.style.display === 'block') showScreen_FN(homeScreen);
            }

            hideConfirmationDialog_FN();
            if(powerGaugeContainer) resetPowerGauge_FN();
            if (startWall) { startWall.style.display = 'none'; startWall.style.left = '0px'; }
        });
    }

    // Add event listener to the button
    splashStartButton.addEventListener('click', handleSplashInteraction);
    // Consider 'touchend' for better responsiveness on touch devices if 'click' feels slow,
    // but 'click' on buttons is usually fine and handles both mouse and touch.
    // splashStartButton.addEventListener('touchend', handleSplashInteraction, { passive: true });

}
    initializeApp();


    function addButtonClickListener_FN(buttonElement, actionCallback, sfx = sfxButtonClick) { if (buttonElement) { buttonElement.addEventListener('click', () => { playSoundEffect_FN(sfx); if (actionCallback) actionCallback(); }); } }
    addButtonClickListener_FN(homeStartImageButton, () => showScreen_FN(characterSelectionScreen));
    addButtonClickListener_FN(homeMenuImageButton, () => showScreen_FN(settingsMenuScreen));
    addButtonClickListener_FN(settingsBackImageButton, () => showScreen_FN(homeScreen));
    addButtonClickListener_FN(settingsMusicToggleArea, () => { if (musicToggle) musicToggle.click(); });
    addButtonClickListener_FN(settingsSfxToggleArea, () => { if (sfxToggle) sfxToggle.click(); });
    addButtonClickListener_FN(charSelectBackHomeButton, () => {
        console.log("Character Select Back to Home button clicked.");
        showScreen_FN(homeScreen); // Ensures menu music continues if already playing
    });
    addButtonClickListener_FN(restartButton, () => { if(isPaused) { isPaused=false; isCountingDown=false; } stopAllMusic_FN(); stopHueAnimationLoop_FN(); if(player) { player.classList.remove('qhk-invincible-effect'); player.style.filter = ''; } clearAllIntervalsAndFrames_FN(); clearGameElements_FN('.obstacle'); clearGameElements_FN('.beer'); clearGameElements_FN('.kiwi'); clearGameElements_FN('.qhk-logo'); clearGameElements_FN('.boost-coin'); clearGameElements_FN('.thrown-bottle'); clearGameElements_FN('.explosion'); clearGameElements_FN('.obstacle-debug'); clearGameElements_FN('.boost-particle'); clearGameElements_FN('.debris-particle'); clearGameElements_FN('.smoke-plume'); if (playerDebugElement) playerDebugElement.style.display = 'none'; resetPowerGauge_FN(); startGame_FN(); });
    addButtonClickListener_FN(changeCharButton, () => { if(isPaused) { isPaused=false; isCountingDown=false; } goHomeAndReset_FN(); showScreen_FN(characterSelectionScreen); });
    addButtonClickListener_FN(resumeButton, togglePause_FN);
    addButtonClickListener_FN(confirmYesButton, () => { if (typeof confirmAction === 'function') confirmAction(); hideConfirmationDialog_FN(); });
    addButtonClickListener_FN(confirmNoButton, () => { hideConfirmationDialog_FN(); if (isPaused || isCountingDown) { if (gameContainer && !gameContainer.classList.contains('game-paused')) gameContainer.classList.add('game-paused'); }});
    if (musicToggle) musicToggle.addEventListener('change', () => { playSoundEffect_FN(sfxButtonClick); isMusicOn = musicToggle.checked; saveAudioSettings_FN(); if (isMusicOn) { if (activeMusicTrack && activeMusicTrack.paused) playActiveMusic_FN(); } else pauseActiveMusic_FN(); updateSettingsBackgroundImage_FN(); });
    if (sfxToggle) sfxToggle.addEventListener('change', () => { playSoundEffect_FN(sfxButtonClick); isSfxOn = sfxToggle.checked; saveAudioSettings_FN(); if (!isSfxOn && sfxSlide) stopSoundEffect_FN(sfxSlide); else if (currentPlayerState === 'sliding' && sfxSlide) playSoundEffect_FN(sfxSlide, true); updateSettingsBackgroundImage_FN(); });
    if (pauseHomeButton) { pauseHomeButton.addEventListener('click', () => { playSoundEffect_FN(sfxButtonClick); if (!isPaused && !isCountingDown && gameContainer) { gameContainer.classList.add('game-paused'); pauseActiveMusic_FN(); if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }} showConfirmationDialog_FN("Return to Home Screen? Your current run progress will be lost.", goHomeAndReset_FN); });}
    if (pauseButton) { pauseButton.addEventListener('click', () => { playSoundEffect_FN(sfxButtonClick); togglePause_FN(); }); pauseButton.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); playSoundEffect_FN(sfxButtonClick); togglePause_FN(); }, { passive: false });}

    characterSlotContainers.forEach(slot => {
        slot.addEventListener('click', () => {
            // console.log("Slot clicked:", slot.dataset.char);
            if (loadingMessage && loadingMessage.classList.contains('hidden')) {
                playSoundEffect_FN(sfxCharSelectConfirm);
                selectedCharacterClass = slot.dataset.char;
                if(player) { player.className = ''; player.classList.add(selectedCharacterClass); player.classList.remove('qhk-invincible-effect'); player.style.filter = '';}
                if (charSelectScreenOverlay) charSelectScreenOverlay.classList.remove('hidden');
                characterSlotContainers.forEach(s => { if (s === slot) s.classList.add('selected-char-punchout'); else s.classList.remove('selected-char-punchout'); s.style.pointerEvents = 'none';});
                if(loadingMessage) loadingMessage.classList.remove('hidden');
                setTimeout(() => {
                    const charGameSprites = spritePaths_CONST[selectedCharacterClass];
                    if (!charGameSprites) { if (charSelectScreenOverlay) charSelectScreenOverlay.classList.add('hidden'); characterSlotContainers.forEach(s => { s.style.pointerEvents = 'auto'; s.classList.remove('selected-char-punchout'); }); if(loadingMessage) loadingMessage.classList.add('hidden'); console.error("Character game sprites not found for:", selectedCharacterClass); return;}
                    const imagesToLoadForGame = [...essentialImagesForGame_CONST];
                    Object.values(charGameSprites).forEach(spriteUrl => { if (spriteUrl) imagesToLoadForGame.push(spriteUrl); });
                    Object.values(obstacleImages_CONST).forEach(imgArray => { imgArray.forEach(imgUrl => { if(imgUrl && !imagesToLoadForGame.includes(imgUrl)) imagesToLoadForGame.push(imgUrl); }); });
                    preloadImages_FN(imagesToLoadForGame, () => {
                        if(loadingMessage) loadingMessage.classList.add('hidden');
                        if (charSelectScreenOverlay) charSelectScreenOverlay.classList.add('hidden');
                        characterSlotContainers.forEach(s => { s.style.pointerEvents = 'auto'; s.classList.remove('selected-char-punchout'); });
                        stopAllMusic_FN(); // Stop menu music before starting game
                        showScreen_FN(gameContainer);
                        startGame_FN();
                    });
                }, 300);
            } else { console.log("Loading message is visible or loadingMessage element not found. Click ignored.", loadingMessage); }
        });
    });

    document.addEventListener('deviceready', onDeviceReady, false);
    function onDeviceReady() {
        console.log('Device is ready. Applying fullscreen and status bar settings.');
        if (window.StatusBar) { console.log('StatusBar plugin found.'); StatusBar.overlaysWebView(true); StatusBar.hide(); } else { console.warn('StatusBar plugin not found.'); }
        if (window.AndroidFullScreen) { console.log('AndroidFullScreen plugin found.'); AndroidFullScreen.isImmersiveModeSupported( () => { AndroidFullScreen.immersiveMode( () => { console.log('Successfully entered immersive mode.'); resizeGame_FN(); }, (error) => { console.error('Error entering immersive mode: ', error); } ); }, () => { console.log('Immersive mode is NOT supported.'); resizeGame_FN(); } );
        } else { console.warn('AndroidFullScreen plugin not found.'); resizeGame_FN(); }
        if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.ScreenOrientation) { Capacitor.Plugins.ScreenOrientation.lock({ orientation: 'landscape-primary' }).then(() => console.log("Capacitor: Orientation locked")).catch(e => console.error("Capacitor: Orientation lock failed", e));
        } else if (screen && screen.orientation && screen.orientation.lock) { screen.orientation.lock('landscape-primary').then(() => console.log("Web API: Orientation locked")).catch(e => console.warn("Web API: Orientation lock failed", e)); }
        setTimeout(resizeGame_FN, 200); // Give plugins time to apply before final resize
    }
    window.addEventListener('resize', resizeGame_FN);
    document.addEventListener('keydown', handleKeyDown_FN);
    document.addEventListener('keyup', handleKeyUp_FN);
    if (gameContainer) { gameContainer.addEventListener('touchstart', handleTouchStart_FN, { passive: false }); gameContainer.addEventListener('touchmove', handleTouchMove_FN, { passive: false }); gameContainer.addEventListener('touchend', handleTouchEnd_FN, { passive: false }); gameContainer.addEventListener('touchcancel', handleTouchEnd_FN, { passive: false }); }

function resizeGame_FN() {
    console.log("resizeGame_FN called by event:", event ? event.type : 'initial call'); // Keep this for debugging
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const isLandscape = vpW > vpH;

    if (splashScreen && !splashScreen.classList.contains('hidden')) {
        return;
    }
    if (!pageRotator || !scalerWrapper || !rotatePrompt || !homeScreen) { // Added !homeScreen check
        console.error("resizeGame_FN: Critical layout element missing.");
        return;
    }

    // --- SET CONTAINER HEIGHTS DYNAMICALLY ---
    if (pageRotator) {
        pageRotator.style.height = vpH + 'px';
    }
    if (scalerWrapper) {
        scalerWrapper.style.height = vpH + 'px';
        // Ensure width is also set if not 100vw or if issues arise
        scalerWrapper.style.width = vpW + 'px';
    }
    // --- END SET CONTAINER HEIGHTS ---

    let wasInPortrait = rotatePrompt.style.display === 'flex' || !rotatePrompt.classList.contains('hidden');

    if (isLandscape) {
        if (pageRotator) pageRotator.style.display = 'block';
        if (scalerWrapper) scalerWrapper.style.display = 'flex';
        if (rotatePrompt) {
            rotatePrompt.style.display = 'none';
            rotatePrompt.classList.add('hidden');
        }

        // --- ADD THIS LOGIC ---
        // If we just switched from portrait to landscape,
        // and no game-specific screen is currently visible, show the home screen.
        const isGameScreenVisible = gameContainer && !gameContainer.classList.contains('hidden');
        const isCharacterSelectVisible = characterSelectionScreen && !characterSelectionScreen.classList.contains('hidden');
        const isSettingsVisible = settingsMenuScreen && !settingsMenuScreen.classList.contains('hidden');
        const isHomeVisible = homeScreen && !homeScreen.classList.contains('hidden');

        if (wasInPortrait && !isGameScreenVisible && !isCharacterSelectVisible && !isSettingsVisible && !isHomeVisible) {
            console.log("resizeGame_FN: Switched to landscape from portrait, showing home screen.");
            showScreen_FN(homeScreen);
        } else if (!isHomeVisible && !isGameScreenVisible && !isCharacterSelectVisible && !isSettingsVisible) {
            // Fallback: If somehow no screen is visible in landscape, show home.
            // This might happen if the page loaded in landscape but initializeApp didn't catch it.
            console.log("resizeGame_FN: Landscape, but no screen visible. Forcing home screen.");
            showScreen_FN(homeScreen);
        }
        // --- END OF ADDED LOGIC ---

    } else { // Portrait
        if (pageRotator) pageRotator.style.display = 'none';
        if (scalerWrapper) scalerWrapper.style.display = 'none';
        if (rotatePrompt) {
            rotatePrompt.style.display = 'flex';
            rotatePrompt.classList.remove('hidden');
        }
    }

     // Scaling logic (This part is crucial and should now work better)
    if (scalerWrapper.style.display === 'flex') { // Only scale if scalerWrapper is visible
        // The vpW and vpH used here are now the dimensions of scalerWrapper
        if (homeScreen && !homeScreen.classList.contains('hidden')) {
            const s = Math.min(vpW / HOME_SCREEN_DESIGN_WIDTH_CONST, vpH / HOME_SCREEN_DESIGN_HEIGHT_CONST);
            homeScreen.style.transform = `scale(${s})`;
        } else if (homeScreen) {
            homeScreen.style.transform = 'scale(1)'; // Reset if hidden
        }

        if (settingsMenuScreen && !settingsMenuScreen.classList.contains('hidden')) {
            const s = Math.min(vpW / HOME_SCREEN_DESIGN_WIDTH_CONST, vpH / HOME_SCREEN_DESIGN_HEIGHT_CONST);
            settingsMenuScreen.style.transform = `scale(${s})`;
        } else if (settingsMenuScreen) {
            settingsMenuScreen.style.transform = 'scale(1)';
        }

        if (characterSelectionScreen && !characterSelectionScreen.classList.contains('hidden')) {
            const s = Math.min(vpW / CHAR_SELECT_DESIGN_WIDTH_CONST, vpH / CHAR_SELECT_DESIGN_HEIGHT_CONST);
            characterSelectionScreen.style.transform = `scale(${s})`;
        } else if (characterSelectionScreen) {
            characterSelectionScreen.style.transform = 'scale(1)';
        }

        if (gameContainer && !gameContainer.classList.contains('hidden')) {
            currentScale = Math.min(vpW / GAME_DESIGN_WIDTH_CONST, vpH / GAME_DESIGN_HEIGHT_CONST);
            gameContainer.style.transform = `scale(${currentScale})`;
        } else if (gameContainer) {
            gameContainer.style.transform = 'scale(1)';
        }
    } else { // If scalerWrapper is not visible (e.g., in portrait showing rotate prompt)
        // Reset scales to prevent potential layout issues if they were previously scaled
        if (homeScreen) homeScreen.style.transform = 'scale(1)';
        if (settingsMenuScreen) settingsMenuScreen.style.transform = 'scale(1)';
        if (characterSelectionScreen) characterSelectionScreen.style.transform = 'scale(1)';
        if (gameContainer) gameContainer.style.transform = 'scale(1)';
    }
}

    function handleKeyDown_FN(e) { if (isPaused || isCountingDown || (gameOverScreen && !gameOverScreen.classList.contains('hidden')) || gameOver || isInStartingAnimation) return; if (isBoosting) { if (touchActionIdentifier === null) { if (e.code === 'ArrowUp' || e.key === 'ArrowUp') { e.preventDefault(); boostVelocityY = BOOST_VERTICAL_SPEED_CONST; } else if (e.code === 'ArrowDown' || e.key === 'ArrowDown') { e.preventDefault(); boostVelocityY = -BOOST_VERTICAL_SPEED_CONST; } } } else { if (e.code === 'Escape' || e.code === 'KeyP') { playSoundEffect_FN(sfxButtonClick); togglePause_FN(); return; } if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key === 'Shift') && powerGaugeValue >= POWER_GAUGE_MAX_CONST) { e.preventDefault(); activateBoost_FN(); return; } if ((e.code === 'Space' || e.code === 'ArrowUp' || e.key === ' ' || e.key === 'ArrowUp')) { e.preventDefault(); if (!isJumping && !isSliding && !isBoosting) jump_FN(); if (!isSliding && !isBoosting) isHoldingJump = true; } else if ((e.code === 'ArrowDown' || e.key === 'ArrowDown')) { e.preventDefault(); if (!isSliding && !isBoosting) { if (isJumping) slamDown_FN(); else startSlide_FN(); } } } }
    function handleKeyUp_FN(e) { if (isPaused || isCountingDown || gameOver || isInStartingAnimation) return; if (isBoosting) { if (((e.code === 'ArrowUp' || e.key === 'ArrowUp') && boostVelocityY > 0) || ((e.code === 'ArrowDown' || e.key === 'ArrowDown') && boostVelocityY < 0)) boostVelocityY = 0; } else { if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === ' ' || e.key === 'ArrowUp') isHoldingJump = false; else if (e.code === 'ArrowDown' || e.key === 'ArrowDown') { if (isSliding || currentPlayerState === 'crouching') stopSlide_FN(); } } }
    function handleTouchStart_FN(e) { if (isPaused || isCountingDown || isInStartingAnimation) return; e.preventDefault(); if (gameOver && gameOverScreen && gameOverScreen.classList.contains('hidden')) return; if (touchActionIdentifier !== null) return; const touch = e.changedTouches[0]; touchActionIdentifier = touch.identifier; touchStartY = touch.clientY; touchStartTime = Date.now(); isTouchSliding = false; if (isBoosting) { playerBoostStartY = parseFloat(player.style.bottom); boostTargetY = playerBoostStartY; boostVelocityY = 0; } else { const gaugeRect = powerGaugeContainer.getBoundingClientRect(); if (powerGaugeValue >= POWER_GAUGE_MAX_CONST && touch.clientX >= gaugeRect.left && touch.clientX <= gaugeRect.right && touch.clientY >= gaugeRect.top && touch.clientY <= gaugeRect.bottom) { activateBoost_FN(); touchActionIdentifier = null; return; } if (gameOverScreen && !gameOverScreen.classList.contains('hidden')) { const rR = restartButton.getBoundingClientRect(), cCR = changeCharButton.getBoundingClientRect(); if (touch.clientX >= rR.left && touch.clientX <= rR.right && touch.clientY >= rR.top && touch.clientY <= rR.bottom) { playSoundEffect_FN(sfxButtonClick); restartButton.click(); } else if (touch.clientX >= cCR.left && touch.clientX <= cCR.right && touch.clientY >= cCR.top && touch.clientY <= cCR.bottom) { playSoundEffect_FN(sfxButtonClick); changeCharButton.click();} touchActionIdentifier = null; return; } if (gameOver) { touchActionIdentifier = null; return; } isPotentialTap = true; clearTimeout(tapTimeout); tapTimeout = setTimeout(() => { isPotentialTap = false; }, TAP_DURATION_THRESHOLD_CONST * 1.5); if (!isSliding && !isBoosting && currentPlayerState !== 'crouching') { const cB = parseFloat(player.style.bottom); if (!isJumping && cB <= playerBaseBottom_CONST + 5) { jump_FN(); isHoldingJump = true; } else if (isJumping) isHoldingJump = true; } else isHoldingJump = false; } }
    function handleTouchMove_FN(e) { if (isPaused || isCountingDown || isInStartingAnimation) return; e.preventDefault(); if (gameOver || touchActionIdentifier === null) return; let cT = null; for (let i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === touchActionIdentifier) { cT = e.changedTouches[i]; break; } if (!cT) return; if (isBoosting) { const cY = cT.clientY, dY = cY - touchStartY; let tPB = playerBoostStartY - (dY / currentScale); boostTargetY = Math.max(BOOST_MIN_BOTTOM_CONST, Math.min(tPB, BOOST_MAX_BOTTOM_CONST)); } else if (!isTouchSliding) { const tCY = cT.clientY, dY = tCY - touchStartY, dT = Date.now() - touchStartTime; if (dY > SWIPE_THRESHOLD_Y_CONST && dT < SWIPE_MAX_TIME_CONST) { isPotentialTap = false; clearTimeout(tapTimeout); isHoldingJump = false; if (isJumping && !isSliding && currentPlayerState !== 'crouching') slamDown_FN(); else if (!isJumping && !isSliding && currentPlayerState !== 'crouching') { startSlide_FN(); isTouchSliding = true; } } else if (dY < -SWIPE_THRESHOLD_Y_CONST / 2) { if (isPotentialTap) { isPotentialTap = false; clearTimeout(tapTimeout); } } } }
    function handleTouchEnd_FN(e) { if (isPaused || isCountingDown || isInStartingAnimation) return; e.preventDefault(); if (touchActionIdentifier === null) return; let eT = null; for (let i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === touchActionIdentifier) { eT = e.changedTouches[i]; break; } if (!eT) return; clearTimeout(tapTimeout); isHoldingJump = false; isPotentialTap = false; if (!isBoosting && isSliding) stopSlide_FN(); touchActionIdentifier = null; isTouchSliding = false; }
    function clearSlideTimeouts_FN() { clearTimeout(slideEnterTimeout); slideEnterTimeout = null; clearTimeout(slideExitTimeout); slideExitTimeout = null; }
    function forceStopSlideMechanics_FN() { const wasSlidingOrCrouching = isSliding || currentPlayerState === 'sliding' || currentPlayerState === 'crouching'; isSliding = false; isSlammingDown = false; clearSlideTimeouts_FN(); if (wasSlidingOrCrouching && sfxSlide) stopSoundEffect_FN(sfxSlide); if (player && (currentPlayerState === 'sliding' || currentPlayerState === 'crouching')) { player.style.height = `${playerHeight_CONST}px`; if (parseFloat(player.style.bottom) <= playerBaseBottom_CONST + 5 && !isJumping && !isBoosting) { player.style.bottom = `${playerBaseBottom_CONST}px`; setPlayerState_FN('running'); } } }
    function createDebrisParticle_FN(impactX, impactY) { if (!gameContainer) return; const p = document.createElement('div'); p.classList.add('debris-particle'); const s = Math.random()*6+3; p.style.width=`${s}px`; p.style.height=`${s}px`; p.style.left=`${impactX+(Math.random()-.5)*20}px`; p.style.top=`${impactY+(Math.random()-.5)*20}px`; gameContainer.appendChild(p); const a=Math.random()*Math.PI*2,eX=Math.cos(a)*(Math.random()*DEBRIS_SPREAD_CONST+30),eY=Math.sin(a)*(Math.random()*DEBRIS_SPREAD_CONST+30)-20; p.animate([{transform:'translate(0,0) scale(1)',opacity:.9},{transform:`translate(${eX}px, ${eY}px) scale(.3)`,opacity:0}],{duration:Math.random()*700+600,easing:'cubic-bezier(.25,.1,.25,1)'}).onfinish=()=>{if(p.parentNode)p.remove();};}
    function spawnSmokePlume_FN(x,y){if(!gameContainer)return;const p=document.createElement('div');p.classList.add('smoke-plume');p.style.left=`${x-SMOKE_PLUME_ASSET_SIZE_CONST/2}px`;p.style.top=`${y-SMOKE_PLUME_ASSET_SIZE_CONST/2}px`;gameContainer.appendChild(p);p.addEventListener('animationend',()=>{if(p.parentNode)p.remove();},{once:true});}

    function startGame_FN() {
        console.log("startGame_FN: Called");
        isPaused = false; isCountingDown = false;
        if (gameOverScreen && !gameOverScreen.classList.contains('hidden')) gameOverScreen.classList.add('hidden');
        if (pauseOverlay && !pauseOverlay.classList.contains('hidden')) pauseOverlay.classList.add('hidden');
        if (countdownDisplay && !countdownDisplay.classList.contains('hidden')) countdownDisplay.classList.add('hidden');
        if(pauseMessageElement) pauseMessageElement.textContent = "PAUSED";
        if(pauseButton) pauseButton.classList.remove('paused');
        if(countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
        forceStopSlideMechanics_FN(); hideConfirmationDialog_FN();
        gameOver = false;
        isInStartingAnimation = true;
        wallBroken = false; wallTextureSwapped = false; playerInitiallyHidden = true; playerStartFalling = false;
        isQhkInvincible = false; clearTimeout(qhkInvincibilityTimer); qhkInvincibilityTimer = null; qhkInvincibilityTimeRemaining = 0;
        isSpawningQhkCoinStream = false; clearTimeout(qhkCoinSpawnStopTimer); qhkCoinSpawnStopTimer = null;
        stopHueAnimationLoop_FN(); if(player) {player.classList.remove('qhk-invincible-effect'); player.style.filter = '';}
        stopAllMusic_FN(); activeMusicTrack = backgroundMusic;
        lastObstacleTypeSpawned = null; consecutiveObstacleTypeSpawns = 0;
        if (startWall) { startWall.style.display = 'block'; startWall.classList.remove('breaking'); startWall.style.opacity = '1'; startWall.style.transform = 'scale(1)'; startWall.style.backgroundImage = "url('img/wall-texture-solid.png')"; startWall.style.left = '0px'; }
        resetPlayerVisuals_FN();
        if(player) { player.style.display = 'block'; player.style.left = `${PLAYER_ANIM_START_X_CONST}px`; player.style.bottom = `${playerBaseBottom_CONST + PLAYER_ANIM_START_Y_OFFSET_CONST}px`; }
        setPlayerState_FN('jumping-down'); playerDY = 0;
        bg1PosX = 0; bg2PosX = 0; groundPosX = 0; ceilingPosX = 0;
        if (bgLayer1) bgLayer1.style.backgroundPositionX = '0px'; if (bgLayer2) bgLayer2.style.backgroundPositionX = '0px';
        if (ground) ground.style.backgroundPositionX = '0px'; if (ceiling) ceiling.style.backgroundPositionX = '0px';
        score = 0; if(scoreDisplay) scoreDisplay.textContent = score;
        isJumping = false; isSliding = false; isBoosting = false; isHoldingJump = false; boostVelocityY = 0; isSlammingDown = false;
        touchActionIdentifier = null; isPotentialTap = false; isTouchSliding = false; playerBoostStartY=0; boostTargetY = 0; clearTimeout(tapTimeout);
        scoreMultiplier = 1; playerLives = MAX_LIVES_CONST; isPostHitInvincible = false;
        if(player) player.classList.remove('flashing'); clearTimeout(postHitInvincibilityTimer); postHitInvincibilityTimer = null; postHitInvincibilityTimeRemaining = 0;
        updateHeartDisplay_FN(); gameSpeed = INITIAL_GAME_SPEED_CONST; originalGameSpeed = INITIAL_GAME_SPEED_CONST;
        resetPowerGauge_FN(); clearTimeout(boostTimer); boostTimer = null; boostTimeRemaining = 0;
        lastSpawnedObstacleImage = { short: null, tall: null, high: null };
        timeSinceLastObstacle = 0; timeSinceLastBeer = 0; timeSinceLastKiwiCheck = 0; timeSinceLastBottle = 0; timeSinceLastQhkLogoCheck = 0; timeSinceLastBoostCoinSpawn = 0; timeSinceLastQhkStreamCoin = 0;
        currentObstacleIntervalSeconds = (BASE_OBSTACLE_INTERVAL_MS_CONST / 1000); currentBeerIntervalSeconds = beerInterval / 1000; currentKiwiIntervalSeconds = KIWI_SPAWN_INTERVAL_CONST / 1000; currentBottleIntervalSeconds = BASE_BOTTLE_INTERVAL_MS_CONST / 1000;
        clearGameElements_FN('.obstacle'); clearGameElements_FN('.beer'); clearGameElements_FN('.kiwi'); clearGameElements_FN('.qhk-logo'); clearGameElements_FN('.boost-coin');
        clearGameElements_FN('.thrown-bottle'); clearGameElements_FN('.explosion'); clearGameElements_FN('.obstacle-debug'); clearGameElements_FN('.boost-particle');
        clearGameElements_FN('.debris-particle'); clearGameElements_FN('.smoke-plume');
        if(playerDebugElement) playerDebugElement.style.display = 'none';
        if(scalerWrapper) scalerWrapper.classList.remove('screen-shaking');
        timeSinceLastParticle = 0; clearAllIntervalsAndFrames_FN(); lastTimestamp = 0;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(startingAnimationLoop_FN);
        resizeGame_FN(); if(gameContainer) gameContainer.classList.remove('game-paused');
    }

    function startingAnimationLoop_FN(timestamp) {
        if (!player) return;
        if (!isInStartingAnimation) { if (animationFrameId) cancelAnimationFrame(animationFrameId); animationFrameId = null; lastTimestamp = 0; animationFrameId = requestAnimationFrame(gameLoop_FN); return; }
        if (!lastTimestamp) { lastTimestamp = timestamp; if (animationFrameId) cancelAnimationFrame(animationFrameId); animationFrameId = requestAnimationFrame(startingAnimationLoop_FN); return; }
        const deltaTime = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;
        const dt = Math.min(deltaTime, 0.1);
        let playerCurrentLeft = parseFloat(player.style.left);
        let playerCurrentBottom = parseFloat(player.style.bottom);
        const playerFrontEdgeX = playerCurrentLeft + playerWidth_CONST;

        if (playerCurrentLeft < PLAYER_ANIM_TARGET_X_CONST) { playerCurrentLeft += PLAYER_ENTRY_FORWARD_SPEED_CONST * dt; if (playerCurrentLeft > PLAYER_ANIM_TARGET_X_CONST) playerCurrentLeft = PLAYER_ANIM_TARGET_X_CONST; player.style.left = `${playerCurrentLeft}px`; }
        if (playerCurrentBottom > playerBaseBottom_CONST) { playerDY -= PLAYER_LANDING_GRAVITY_CONST * dt * 60; playerCurrentBottom += playerDY * dt * 60; if (playerCurrentBottom < playerBaseBottom_CONST) { playerCurrentBottom = playerBaseBottom_CONST; playerDY = 0; if(!isBoosting && !isJumping) { setPlayerState_FN('running'); if (sfxFootsteps.length > 0) { const randomFootstepSfx = getRandomElement_FN(sfxFootsteps); if (randomFootstepSfx) playSoundEffect_FN(randomFootstepSfx); timeSinceLastFootstep = 0; footstepSfxPlaying = true; } } } player.style.bottom = `${playerCurrentBottom}px`; if (playerCurrentBottom > playerBaseBottom_CONST && currentPlayerState !== 'jumping-down') setPlayerState_FN('jumping-down');
        } else if (currentPlayerState === 'jumping-down' && !isBoosting && !isJumping && playerCurrentBottom <= playerBaseBottom_CONST) { setPlayerState_FN('running'); if (sfxFootsteps.length > 0 && !footstepSfxPlaying) { const randomFootstepSfx = getRandomElement_FN(sfxFootsteps); if (randomFootstepSfx) playSoundEffect_FN(randomFootstepSfx); timeSinceLastFootstep = 0; footstepSfxPlaying = true; } }

        if (!wallBroken && playerFrontEdgeX >= WALL_HIT_POINT_X_CONST) {
            wallBroken = true;
            if (startWall) { applyScreenShake_FN(SCREEN_SHAKE_DURATION_WALL_CONST); playSoundEffect_FN(sfxWallBreak); const wallVisualCenterX = (parseFloat(startWall.style.width) || 150) / 2; const wallHeightGame = parseFloat(startWall.style.height) || (GAME_DESIGN_HEIGHT_CONST - CEILING_HEIGHT_CONST - groundHeight_CONST); const wallTopGame = parseFloat(startWall.style.top) || CEILING_HEIGHT_CONST; const debrisImpactY = wallTopGame + (wallHeightGame * DEBRIS_Y_MULTIPLIER_ON_WALL_CONST); const smokeBaseY = wallTopGame + (wallHeightGame * 0.65) + SMOKE_PLUME_Y_BASE_OFFSET_ON_WALL_CONST / 2; for (let i = 0; i < DEBRIS_PARTICLE_COUNT_CONST; i++) createDebrisParticle_FN(wallVisualCenterX, debrisImpactY); for (let i = 0; i < SMOKE_PLUME_COUNT_CONST; i++) { const offsetX = (Math.random() - 0.5) * SMOKE_PLUME_HORIZONTAL_SPREAD_CONST; const offsetY = (Math.random() - 0.5) * SMOKE_PLUME_VERTICAL_SPREAD_CONST; setTimeout(() => { spawnSmokePlume_FN(wallVisualCenterX + offsetX, smokeBaseY + offsetY); }, i * 40); } setTimeout(() => { if (playerInitiallyHidden) { player.style.opacity = '1'; playerInitiallyHidden = false; } }, PLAYER_REVEAL_DELAY_CONST); setTimeout(() => { if (startWall && !wallTextureSwapped) { const holeImg = new Image(); holeImg.onload = () => { startWall.style.backgroundImage = "url('img/wall-texture-hole.png')"; wallTextureSwapped = true; }; holeImg.onerror = () => { startWall.style.backgroundImage = "url('img/wall-texture-hole.png')"; wallTextureSwapped = true; }; holeImg.src = "img/wall-texture-hole.png"; } }, 50 + PLAYER_REVEAL_DELAY_CONST);
            }
        }

        if (playerCurrentLeft >= PLAYER_ANIM_TARGET_X_CONST && playerCurrentBottom <= playerBaseBottom_CONST) {
            isInStartingAnimation = false;
            if (playerInitiallyHidden) { player.style.opacity = '1'; playerInitiallyHidden = false; }
            if (currentPlayerState === 'jumping-down') setPlayerState_FN('running');
            if (startWall && startWall.style.backgroundImage.includes('solid') && !wallTextureSwapped) { startWall.style.backgroundImage = "url('img/wall-texture-hole.png')"; wallTextureSwapped = true; }
            if (activeMusicTrack === backgroundMusic) { playActiveMusic_FN(); } else if (menuMusic && activeMusicTrack === menuMusic && !menuMusic.paused) { menuMusic.pause(); menuMusic.currentTime = 0; activeMusicTrack = backgroundMusic; playActiveMusic_FN(); }
            lastTimestamp = 0;
            if (playerShadow) playerShadow.style.display = 'block';
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = null; animationFrameId = requestAnimationFrame(gameLoop_FN);
        } else if (isInStartingAnimation) {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(startingAnimationLoop_FN);
        }
    }

    function endGame_FN() { if(isPaused) isPaused = false; isCountingDown = false; if(countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; } if(gameContainer) gameContainer.classList.remove('game-paused'); if (gameOver) return; gameOver = true; forceStopSlideMechanics_FN(); if(sfxSlide) stopSoundEffect_FN(sfxSlide); clearAllIntervalsAndFrames_FN(); isHoldingJump = false; scoreMultiplier = 1; boostVelocityY = 0; isPostHitInvincible = false; if(player) player.style.opacity = 1; isQhkInvincible = false; isSpawningQhkCoinStream = false; stopHueAnimationLoop_FN(); if(player) {player.classList.remove('qhk-invincible-effect'); player.style.filter = ''; player.classList.remove('flashing');} touchActionIdentifier = null; isPotentialTap = false; isTouchSliding = false; playerBoostStartY=0; boostTargetY = 0; clearTimeout(tapTimeout); clearGameElements_FN('.boost-particle'); clearGameElements_FN('.debris-particle'); clearGameElements_FN('.smoke-plume'); if(scalerWrapper) scalerWrapper.classList.remove('screen-shaking'); if(player && gameContainer){ const playerRect = player.getBoundingClientRect(), containerRect = gameContainer.getBoundingClientRect(); createExplosion_FN(playerRect, containerRect); } if(player) player.style.display = 'none'; if(playerShadow) playerShadow.style.display = 'none'; timeSinceLastFootstep = 0; footstepSfxPlaying = false; if(finalScoreDisplay) finalScoreDisplay.textContent = Math.floor(score); let highScore = getHighScore_FN(); if (Math.floor(score) > highScore) { highScore = Math.floor(score); localStorage.setItem(HIGH_SCORE_KEY_CONST, highScore.toString()); } if(gameOverHighScoreDisplay) gameOverHighScoreDisplay.textContent = highScore; if(gameOverScreen) gameOverScreen.classList.remove('hidden'); originalGameSpeed = INITIAL_GAME_SPEED_CONST; gameSpeed = INITIAL_GAME_SPEED_CONST; stopAllMusic_FN(); playSoundEffect_FN(sfxGameOver); isInStartingAnimation = false; wallBroken = false; wallTextureSwapped = false; playerInitiallyHidden = true; playerStartFalling = false; if(startWall) { startWall.style.display = 'none'; startWall.style.left = '0px'; startWall.classList.remove('breaking'); startWall.style.backgroundImage = "url('img/wall-texture-solid.png')"; } }
    function resetPlayerVisuals_FN() { forceStopSlideMechanics_FN(); if(player) player.className = ''; if (selectedCharacterClass && player) player.classList.add(selectedCharacterClass); if(player) player.style.filter = ''; if(player) { player.style.backgroundImage = ''; player.style.backgroundSize = ''; player.style.backgroundPosition = '0 0'; player.style.height = `${playerHeight_CONST}px`; player.style.width = `${playerWidth_CONST}px`; player.style.bottom = `${playerBaseBottom_CONST}px`; player.style.boxShadow = 'none'; if (isInStartingAnimation && playerInitiallyHidden) player.style.opacity = '0'; else player.style.opacity = '1'; } if(playerShadow) playerShadow.style.display = 'none'; timeSinceLastFootstep = 0; footstepSfxPlaying = false; currentPlayerState = 'idle'; setPlayerState_FN('idle'); if(player) player.style.display = 'block'; }
    function updatePowerGaugeVisual_FN() { if (!powerGaugeContainer || !powerGaugeFill) return; const wasFull = powerGaugeContainer.classList.contains('full'); const fill = Math.min(100, (powerGaugeValue / POWER_GAUGE_MAX_CONST) * 100); powerGaugeFill.style.height = `${fill}%`; if (powerGaugeValue >= POWER_GAUGE_MAX_CONST) { powerGaugeContainer.classList.add('full'); if (powerGaugeText) powerGaugeText.textContent = "READY!"; if (!wasFull && !isQhkInvincible && !isBoosting && sfxKiwi) playSoundEffect_FN(sfxKiwi); } else { powerGaugeContainer.classList.remove('full'); if (powerGaugeText) powerGaugeText.textContent = "BOOST"; } }
    function fillPowerGauge_FN() { if (isBoosting) return; powerGaugeValue = POWER_GAUGE_MAX_CONST; updatePowerGaugeVisual_FN(); }
    function resetPowerGauge_FN() { powerGaugeValue = 0; isBoosting = false; if(player) {player.classList.remove('boosting', 'boosting-anim'); player.style.boxShadow = 'none';} clearTimeout(boostTimer); boostTimer = null; boostTimeRemaining = 0; if(powerGaugeContainer) powerGaugeContainer.classList.remove('full'); updatePowerGaugeVisual_FN(); }
    function setPlayerState_FN(newState) { if (!player) return; if (isBoosting && newState !== 'idle' && !newState.startsWith('boosting')) { newState = 'boosting-anim'; } const oldState = currentPlayerState; if (newState !== 'sliding' && newState !== 'crouching' && sfxSlide && !sfxSlide.paused) { stopSoundEffect_FN(sfxSlide); } const charSprites = spritePaths_CONST[selectedCharacterClass]; if (!charSprites) { console.warn("Sprites missing for:", selectedCharacterClass); return; } const classesToPreserve = [selectedCharacterClass]; if (player.classList.contains('qhk-invincible-effect')) classesToPreserve.push('qhk-invincible-effect'); if (player.classList.contains('flashing')) classesToPreserve.push('flashing'); player.className = classesToPreserve.join(' '); let targetAnimationClass = ''; let spriteUrl = ''; let newH = playerHeight_CONST, newW = playerWidth_CONST, newB = player.style.bottom; let newBackgroundSize = `${playerWidth_CONST}px ${playerHeight_CONST}px`; player.style.animation = 'none'; switch (newState) { case 'running': targetAnimationClass = 'running'; spriteUrl = charSprites.run; if (!isJumping && !isBoosting) newB = `${playerBaseBottom_CONST}px`; player.style.animation = ''; newBackgroundSize = `${playerWidth_CONST * 10}px ${playerHeight_CONST}px`; break; case 'jumping-up': targetAnimationClass = 'jumping-up'; spriteUrl = charSprites.jumpUp; if (oldState === 'sliding' || oldState === 'crouching') stopSoundEffect_FN(sfxSlide); break; case 'jumping-down': targetAnimationClass = 'jumping-down'; spriteUrl = charSprites.jumpDown; if (oldState === 'sliding' || oldState === 'crouching') stopSoundEffect_FN(sfxSlide); break; case 'sliding': targetAnimationClass = 'slide'; spriteUrl = charSprites.slide; newH = playerSlideHeight_CONST; newW = playerWidth_CONST; newB = `${playerBaseBottom_CONST}px`; playSoundEffect_FN(sfxSlide, true); newBackgroundSize = `${playerWidth_CONST}px ${playerSlideHeight_CONST}px`; break; case 'crouching': targetAnimationClass = 'crouching'; spriteUrl = charSprites.crouch; newH = playerCrouchHeight_CONST; newW = playerWidth_CONST; newB = `${playerBaseBottom_CONST}px`; newBackgroundSize = `${playerWidth_CONST}px ${playerCrouchHeight_CONST}px`; break; case 'boosting-anim': case 'boosting': targetAnimationClass = 'boosting-anim'; player.classList.add('boosting'); spriteUrl = charSprites.boostAnim; newH = playerBoostHeight_CONST; newW = playerBoostWidth_CONST; if (oldState === 'sliding' || oldState === 'crouching') stopSoundEffect_FN(sfxSlide); player.style.animation = ''; newBackgroundSize = `${playerBoostWidth_CONST * 3}px ${playerBoostHeight_CONST}px`; break; case 'idle': spriteUrl = charSprites.run; newB = `${playerBaseBottom_CONST}px`; newBackgroundSize = `${playerWidth_CONST * 10}px ${playerHeight_CONST}px`; player.style.backgroundPositionX = '0px'; break; default: console.warn("Unknown player state:", newState); return; } if (spriteUrl && player.style.backgroundImage !== `url('${spriteUrl}')`) { player.style.backgroundImage = `url('${spriteUrl}')`; } if (player.style.backgroundSize !== newBackgroundSize) { player.style.backgroundSize = newBackgroundSize; } if (targetAnimationClass && !player.classList.contains(targetAnimationClass)) { player.classList.add(targetAnimationClass); } if (player.style.height !== `${newH}px`) player.style.height = `${newH}px`; if (player.style.width !== `${newW}px`) player.style.width = `${newW}px`; if (player.style.bottom !== newB) player.style.bottom = newB; if (newState !== 'running' && newState !== 'boosting-anim' && newState !== 'boosting') { if (player.style.backgroundPositionX !== '0px') player.style.backgroundPositionX = '0px'; if (player.style.backgroundPositionY !== '0px') player.style.backgroundPositionY = '0px'; } currentPlayerState = newState; }
    function clearAllIntervalsAndFrames_FN() { clearTimeout(boostTimer); boostTimer = null; clearTimeout(postHitInvincibilityTimer); postHitInvincibilityTimer = null; clearTimeout(qhkInvincibilityTimer); qhkInvincibilityTimer = null; clearTimeout(qhkCoinSpawnStopTimer); qhkCoinSpawnStopTimer = null; stopHueAnimationLoop_FN(); if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; } }
    function clearGameElements_FN(selector) { if(!gameContainer) return; const elements = gameContainer.querySelectorAll(selector); elements.forEach(el => { if (DEBUG_HITBOXES_CONST && (el.classList.contains('obstacle') || el.classList.contains('thrown-bottle')) && el.debugBox && el.debugBox.parentNode) el.debugBox.remove(); if (el.classList.contains('obstacle-debug') && el.parentNode) el.remove(); if (el.classList.contains('boost-particle') && el.parentNode) el.remove(); if (el.classList.contains('debris-particle') && el.parentNode) el.remove(); if (el.classList.contains('smoke-plume') && el.parentNode) el.remove(); if (!el.classList.contains('obstacle-debug') && !el.classList.contains('boost-particle') && !el.classList.contains('debris-particle') && !el.classList.contains('smoke-plume') && el.parentNode && el.id !== 'start-wall') el.remove(); }); }
    function jump_FN() { if (!player) return; if (currentPlayerState === 'crouching' || isSliding || isBoosting || parseFloat(player.style.bottom) > playerBaseBottom_CONST + 5 || isJumping) return; forceStopSlideMechanics_FN(); isSlammingDown = false; isJumping = true; playerDY = jumpForce_CONST; setPlayerState_FN('jumping-up'); if(sfxJump) playSoundEffect_FN(sfxJump); }
    function startSlide_FN() { if (!player) return; if (isSliding || isBoosting || isJumping || currentPlayerState === 'crouching' || parseFloat(player.style.bottom) > playerBaseBottom_CONST + 5) return; forceStopSlideMechanics_FN(); isJumping = false; isSlammingDown = false; isSliding = true; playerDY = 0; isHoldingJump = false; setPlayerState_FN('crouching'); slideEnterTimeout = setTimeout(() => { if (isSliding && currentPlayerState === 'crouching') setPlayerState_FN('sliding'); slideEnterTimeout = null; }, CROUCH_TRANSITION_DURATION_CONST); }
    function slamDown_FN() { if (!player) return; if (!isJumping || isSliding || isBoosting || currentPlayerState === 'crouching') return; forceStopSlideMechanics_FN(); playerDY = -jumpForce_CONST * 1.5; isHoldingJump = false; isSlammingDown = true; setPlayerState_FN('jumping-down'); }
    function stopSlide_FN() { const wasSliding = isSliding, wasCrouchSlide = currentPlayerState === 'sliding' || currentPlayerState === 'crouching'; clearTimeout(slideEnterTimeout); slideEnterTimeout = null; isSliding = false; if (wasSliding && currentPlayerState === 'crouching' && sfxSlide) stopSoundEffect_FN(sfxSlide); if (!wasSliding && !wasCrouchSlide) return; if (wasCrouchSlide) { if (currentPlayerState === 'sliding' && !isJumping) setPlayerState_FN('crouching'); if (slideExitTimeout === null) slideExitTimeout = setTimeout(() => { if (currentPlayerState === 'crouching' && !isSliding && !isBoosting && !isJumping) setPlayerState_FN('running'); slideExitTimeout = null; }, CROUCH_TRANSITION_DURATION_CONST); } }
    function activateBoost_FN() { if (!player || !scalerWrapper) return; if (isBoosting || gameOver || powerGaugeValue < POWER_GAUGE_MAX_CONST) return; forceStopSlideMechanics_FN(); isSlammingDown = false; isJumping = false; playerDY = 0; boostVelocityY = 0; isBoosting = true; scoreMultiplier = BOOST_SCORE_MULTIPLIER_CONST; powerGaugeValue = 0; updatePowerGaugeVisual_FN(); gameSpeed = originalGameSpeed * BOOST_SPEED_MULTIPLIER_CONST; boostTargetY = parseFloat(player.style.bottom); setPlayerState_FN('boosting-anim'); timeSinceLastParticle = 0; scalerWrapper.classList.add('screen-shaking'); clearTimeout(boostTimer); boostStartTime = Date.now(); boostTimer = setTimeout(deactivateBoost_FN, BOOST_DURATION_CONST); if(sfxBoost) playSoundEffect_FN(sfxBoost); }
    function deactivateBoost_FN() { if (!player || !scalerWrapper) return; if (!isBoosting) return; isBoosting = false; scoreMultiplier = 1; boostVelocityY = 0; gameSpeed = originalGameSpeed; clearTimeout(boostTimer); boostTimer = null; boostTimeRemaining = 0; resetPowerGauge_FN(); scalerWrapper.classList.remove('screen-shaking'); let cB = parseFloat(player.style.bottom); if (cB > playerBaseBottom_CONST + 5) { isJumping = true; playerDY = 0; setPlayerState_FN('jumping-down'); } else { isJumping = false; playerDY = 0; setPlayerState_FN('running'); } startPostHitInvincibility_FN(); }
    function updateScore_FN(dt) { if (!gameOver && scoreDisplay) { score += SCORE_INCREMENT_PER_SECOND_CONST * dt * scoreMultiplier; scoreDisplay.textContent = Math.floor(score); } }
    function spawnParticle_FN() { if (gameOver || !gameContainer || !gameContainer.offsetParent || !isBoosting || !player) return; const p=document.createElement('div');p.classList.add('boost-particle');const pW=parseFloat(player.style.width)||playerBoostWidth_CONST,pH=parseFloat(player.style.height)||playerBoostHeight_CONST,pL=parseFloat(player.style.left),pB=parseFloat(player.style.bottom);const sX=pL-(pW*.1),sY=pB+(pH/2),sTop=GAME_DESIGN_HEIGHT_CONST-sY;const oX=(Math.random()-.5)*BOOST_PARTICLE_SPAWN_SPREAD_X_CONST,oY=(Math.random()-.5)*BOOST_PARTICLE_SPAWN_SPREAD_Y_CONST;p.style.left=`${sX+oX}px`;p.style.top=`${sTop+oY}px`;gameContainer.appendChild(p);const tX=-(Math.random()*BOOST_PARTICLE_TRAVEL_DISTANCE_X_CONST+10),tY=(Math.random()-.5)*BOOST_PARTICLE_TRAVEL_DISTANCE_Y_CONST*2,dur=Math.random()*(BOOST_PARTICLE_MAX_DURATION_CONST-BOOST_PARTICLE_MIN_DURATION_CONST)+BOOST_PARTICLE_MIN_DURATION_CONST,iS=Math.random()*.5+.8,fS=Math.random()*.3+.1;p.animate([{transform:`translate(0,0)scale(${iS})`,opacity:.9},{transform:`translate(${tX}px,${tY}px)scale(${fS})`,opacity:0}],{duration:dur,easing:'ease-out'}).onfinish=()=>{if(p.parentNode)p.remove();};}
    function startHueAnimationLoop_FN() { if (!player) return; if (hueAnimationId) cancelAnimationFrame(hueAnimationId); hueAngle = 0; function animateHue() { if (!isQhkInvincible || isPaused || isCountingDown || !player) { stopHueAnimationLoop_FN(); return; } hueAngle = (hueAngle + 5) % 360; player.style.setProperty('--hue-angle', hueAngle.toString()); hueAnimationId = requestAnimationFrame(animateHue); } hueAnimationId = requestAnimationFrame(animateHue); }
    function stopHueAnimationLoop_FN() { if (hueAnimationId) { cancelAnimationFrame(hueAnimationId); hueAnimationId = null; } }
    function togglePause_FN() { if (gameOver || isInStartingAnimation || (confirmationDialog && !confirmationDialog.classList.contains('hidden'))) return; if (isCountingDown) { clearInterval(countdownTimer); countdownTimer = null; isCountingDown = false; isPaused = true; if(pauseMenuButtonsContainer)pauseMenuButtonsContainer.classList.remove('hidden'); if(pauseMessageElement)pauseMessageElement.classList.remove('hidden'); if(countdownDisplay)countdownDisplay.classList.add('hidden'); if(pauseButton)pauseButton.classList.add('paused'); if(gameContainer)gameContainer.classList.add('game-paused'); return; } isPaused = !isPaused; if (isPaused) { pauseStartTime = Date.now(); if(pauseButton)pauseButton.classList.add('paused'); if(pauseOverlay)pauseOverlay.classList.remove('hidden'); if(pauseMenuButtonsContainer)pauseMenuButtonsContainer.classList.remove('hidden'); if(pauseMessageElement)pauseMessageElement.classList.remove('hidden'); if(countdownDisplay)countdownDisplay.classList.add('hidden'); if(gameContainer)gameContainer.classList.add('game-paused'); pauseActiveMusic_FN(); if (hueAnimationId) cancelAnimationFrame(hueAnimationId); if (sfxSlide && !sfxSlide.paused && currentPlayerState === 'sliding') { slideSfxWasPlayingBeforePause = true; sfxSlide.pause(); } else slideSfxWasPlayingBeforePause = false; if (boostTimer) { boostTimeRemaining = BOOST_DURATION_CONST - (pauseStartTime - boostStartTime); if (boostTimeRemaining < 0) boostTimeRemaining = 0; clearTimeout(boostTimer); boostTimer = null; } if (postHitInvincibilityTimer) { postHitInvincibilityTimeRemaining = POST_HIT_INVINCIBILITY_DURATION_CONST - (pauseStartTime - postHitInvincibilityStartTime); if (postHitInvincibilityTimeRemaining < 0) postHitInvincibilityTimeRemaining = 0; clearTimeout(postHitInvincibilityTimer); postHitInvincibilityTimer = null; } if (qhkInvincibilityTimer) { qhkInvincibilityTimeRemaining = QHK_INVINCIBILITY_DURATION_CONST - (pauseStartTime - qhkInvincibilityStartTime); if (qhkInvincibilityTimeRemaining < 0) qhkInvincibilityTimeRemaining = 0; clearTimeout(qhkInvincibilityTimer); qhkInvincibilityTimer = null; } if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; } if(isBoosting && scalerWrapper) scalerWrapper.classList.remove('screen-shaking'); } else { isCountingDown = true; if(pauseButton)pauseButton.classList.remove('paused'); if(pauseMenuButtonsContainer)pauseMenuButtonsContainer.classList.add('hidden'); if(pauseMessageElement)pauseMessageElement.classList.add('hidden'); if(countdownDisplay)countdownDisplay.classList.remove('hidden'); if(pauseOverlay && pauseOverlay.classList.contains('hidden'))pauseOverlay.classList.remove('hidden'); countdownValue = 3; if(countdownDisplay)countdownDisplay.textContent = countdownValue; if(gameContainer)gameContainer.classList.add('game-paused'); countdownTimer = setInterval(() => { countdownValue--; if(countdownDisplay)countdownDisplay.textContent = countdownValue; if (countdownValue <= 0) { clearInterval(countdownTimer); countdownTimer = null; isCountingDown = false; if(pauseOverlay)pauseOverlay.classList.add('hidden'); if(gameContainer)gameContainer.classList.remove('game-paused'); resumeActiveMusic_FN(); if (isQhkInvincible && !hueAnimationId && player) startHueAnimationLoop_FN(); if (slideSfxWasPlayingBeforePause && isSfxOn && currentPlayerState === 'sliding' && sfxSlide) playSoundEffect_FN(sfxSlide, true); slideSfxWasPlayingBeforePause = false; if (boostTimeRemaining > 0 && isBoosting) { boostStartTime = Date.now(); boostTimer = setTimeout(deactivateBoost_FN, boostTimeRemaining); if(scalerWrapper)scalerWrapper.classList.add('screen-shaking'); } boostTimeRemaining = 0; if (postHitInvincibilityTimeRemaining > 0 && isPostHitInvincible) { postHitInvincibilityStartTime = Date.now(); postHitInvincibilityTimer = setTimeout(() => { isPostHitInvincible = false; if(!isQhkInvincible && player)player.classList.remove('flashing'); postHitInvincibilityTimeRemaining = 0; if(player) setPlayerState_FN(currentPlayerState); }, postHitInvincibilityTimeRemaining); } postHitInvincibilityTimeRemaining = 0; if (qhkInvincibilityTimeRemaining > 0 && isQhkInvincible) { qhkInvincibilityStartTime = Date.now(); qhkInvincibilityTimer = setTimeout(deactivateQhkInvincibility_FN, qhkInvincibilityTimeRemaining); } qhkInvincibilityTimeRemaining = 0; lastTimestamp = 0; if (animationFrameId) cancelAnimationFrame(animationFrameId); animationFrameId = requestAnimationFrame(gameLoop_FN); } }, 500); } }
    function gameLoop_FN(timestamp) { if (!player || !gameContainer) return; if (gameOver || isInStartingAnimation || isPaused || isCountingDown) { if (gameOver || isInStartingAnimation) { if (animationFrameId) cancelAnimationFrame(animationFrameId); animationFrameId = null; } return; } if (!lastTimestamp) { lastTimestamp = timestamp; if (animationFrameId) cancelAnimationFrame(animationFrameId); animationFrameId = requestAnimationFrame(gameLoop_FN); return; } const deltaTime = (timestamp - lastTimestamp) / 1000; lastTimestamp = timestamp; const dt = Math.min(deltaTime, 0.1); if (dt <= 0) { if (animationFrameId) cancelAnimationFrame(animationFrameId); animationFrameId = requestAnimationFrame(gameLoop_FN); return; } updateScore_FN(dt); if (!gameOver && !isBoosting) { originalGameSpeed += SPEED_INCREASE_PER_SECOND_CONST * dt; originalGameSpeed = Math.min(originalGameSpeed, MAX_GAME_SPEED_CONST); } gameSpeed = isBoosting ? originalGameSpeed * BOOST_SPEED_MULTIPLIER_CONST : originalGameSpeed; const pixelsToMoveHorizontally = gameSpeed * 60 * dt; if (pixelsToMoveHorizontally > 0) { bg1PosX -= pixelsToMoveHorizontally * bg1ScrollFactor_CONST; bg2PosX -= pixelsToMoveHorizontally * bg2ScrollFactor_CONST; if (bg1PosX <= -bgImageWidth_CONST) bg1PosX += bgImageWidth_CONST; if (bg2PosX <= -bgImageWidth_CONST) bg2PosX += bgImageWidth_CONST; if(bgLayer1) bgLayer1.style.backgroundPositionX = `${bg1PosX}px`; if(bgLayer2) bgLayer2.style.backgroundPositionX = `${bg2PosX}px`; groundPosX -= pixelsToMoveHorizontally; ceilingPosX -= pixelsToMoveHorizontally; if (groundPosX <= -tileImageWidth_CONST) groundPosX += tileImageWidth_CONST; if (ceilingPosX <= -tileImageWidth_CONST) ceilingPosX += tileImageWidth_CONST; if(ground) ground.style.backgroundPositionX = `${groundPosX}px`; if(ceiling) ceiling.style.backgroundPositionX = `${ceilingPosX}px`; moveGameElements_FN('.obstacle', pixelsToMoveHorizontally); moveGameElements_FN('.beer', pixelsToMoveHorizontally); moveGameElements_FN('.kiwi', pixelsToMoveHorizontally); moveGameElements_FN('.qhk-logo', pixelsToMoveHorizontally); moveGameElements_FN('.boost-coin', pixelsToMoveHorizontally); moveGameElements_FN('.boost-particle', pixelsToMoveHorizontally); moveGameElements_FN('.debris-particle', pixelsToMoveHorizontally); moveGameElements_FN('.smoke-plume', pixelsToMoveHorizontally); moveGameElements_FN('.explosion', pixelsToMoveHorizontally); if (startWall && startWall.style.display !== 'none' && wallTextureSwapped) { let wallCurrentLeft = parseFloat(startWall.style.left); if (isNaN(wallCurrentLeft)) wallCurrentLeft = 0; wallCurrentLeft -= pixelsToMoveHorizontally; startWall.style.left = `${wallCurrentLeft}px`; const wallWidth = parseFloat(startWall.style.width) || 150; if (wallCurrentLeft + wallWidth < -20) startWall.style.display = 'none'; } const bottles = gameContainer.querySelectorAll('.thrown-bottle'); const bottleBaseSpeed = gameSpeed * 60 * dt; bottles.forEach(bottle => { let currentLeft = parseFloat(bottle.style.left); currentLeft -= bottleBaseSpeed * THROWN_BOTTLE_SPEED_X_FACTOR_CONST; bottle.style.left = `${currentLeft}px`; if (currentLeft + THROWN_BOTTLE_WIDTH_CONST < -10) { if (bottle.debugBox && bottle.debugBox.parentNode) bottle.debugBox.remove(); bottle.remove(); } }); } let currentBottom = parseFloat(player.style.bottom); let newBottom = currentBottom; if (isBoosting) { if (currentPlayerState !== 'boosting-anim') setPlayerState_FN('boosting-anim'); if (touchActionIdentifier !== null) { const difference = boostTargetY - currentBottom; newBottom = currentBottom + difference * BOOST_SMOOTH_FACTOR_CONST; if (Math.abs(difference) < 0.5) newBottom = boostTargetY; } else { if (boostVelocityY !== 0) { let boostMove = boostVelocityY * dt * 60; newBottom = currentBottom + boostMove; } } newBottom = Math.max(BOOST_MIN_BOTTOM_CONST, Math.min(newBottom, BOOST_MAX_BOTTOM_CONST)); player.style.bottom = newBottom + 'px'; timeSinceLastParticle += dt; if (timeSinceLastParticle >= PARTICLE_SPAWN_INTERVAL_CONST) { spawnParticle_FN(); timeSinceLastParticle = 0; } } else if (isJumping) { playerDY -= gravity_CONST * dt * 60; if (isHoldingJump && playerDY > 0) { playerDY += JUMP_HOLD_BOOST_CONST * dt * 60; } let verticalChange = playerDY * dt * 60; newBottom = currentBottom + verticalChange; const jumpCeiling = playerBaseBottom_CONST + MAX_JUMP_HEIGHT_CONST; if (newBottom >= jumpCeiling && playerDY > 0) { newBottom = jumpCeiling; playerDY = 0; } if (newBottom <= playerBaseBottom_CONST && playerDY <= 0) { newBottom = playerBaseBottom_CONST; player.style.bottom = `${newBottom}px`; isJumping = false; playerDY = 0; if (isSlammingDown) { isSlammingDown = false; isSliding = true; setPlayerState_FN('crouching'); slideEnterTimeout = setTimeout(() => { if (currentPlayerState === 'crouching' && isSliding) setPlayerState_FN('sliding'); slideEnterTimeout = null; }, CROUCH_TRANSITION_DURATION_CONST); } else { setPlayerState_FN('running'); if (sfxFootsteps.length > 0 && !isBoosting && !isSliding) { const randomFootstepSfx = getRandomElement_FN(sfxFootsteps); if (randomFootstepSfx) playSoundEffect_FN(randomFootstepSfx); timeSinceLastFootstep = 0; footstepSfxPlaying = true; } } } else { player.style.bottom = `${newBottom}px`; setPlayerState_FN(playerDY < JUMP_DOWN_THRESHOLD_CONST ? 'jumping-down' : 'jumping-up'); } } else if (isSliding || currentPlayerState === 'crouching') { if (currentBottom !== playerBaseBottom_CONST) player.style.bottom = `${playerBaseBottom_CONST}px`; } else { if (currentBottom !== playerBaseBottom_CONST) player.style.bottom = `${playerBaseBottom_CONST}px`; if (currentPlayerState !== 'running' && currentPlayerState !== 'idle' && !isPaused && !isCountingDown && !gameOver) { setPlayerState_FN('running'); } } if (!isJumping && !isBoosting && parseFloat(player.style.bottom) < playerBaseBottom_CONST ) { player.style.bottom = `${playerBaseBottom_CONST}px`; } if (playerShadow && player && player.style.display !== 'none' && !gameOver && !isPaused && !isCountingDown && !isInStartingAnimation) { const playerSpriteBottom = parseFloat(player.style.bottom); const playerLeft = parseFloat(player.style.left); const playerWidth = parseFloat(player.style.width) || playerWidth_CONST; playerShadow.style.left = `${playerLeft + (playerWidth / 2) - (SHADOW_BASE_WIDTH_CONST / 2)}px`; playerShadow.style.bottom = `${groundHeight_CONST - (SHADOW_BASE_HEIGHT_CONST / 2) + SHADOW_GROUND_OFFSET_Y_CONST}px`; let distanceFromPlayerBase = Math.max(0, playerSpriteBottom - playerBaseBottom_CONST); if (isBoosting) distanceFromPlayerBase = MAX_JUMP_HEIGHT_CONST * 1.5; let scale = 1 - (distanceFromPlayerBase / (MAX_JUMP_HEIGHT_CONST * 1.2)); scale = Math.max(SHADOW_MIN_SCALE_CONST, Math.min(1.0, scale)); const minOpacity = 0.15, maxOpacity = 0.35; let opacity = minOpacity + (scale - SHADOW_MIN_SCALE_CONST) * (maxOpacity - minOpacity) / (1.0 - SHADOW_MIN_SCALE_CONST); opacity = Math.max(minOpacity, Math.min(maxOpacity, opacity)); if (distanceFromPlayerBase > MAX_JUMP_HEIGHT_CONST * 1.1 || isBoosting || scale <= SHADOW_MIN_SCALE_CONST + 0.01) { playerShadow.style.display = 'none'; } else { playerShadow.style.display = 'block'; playerShadow.style.transform = `scale(${scale})`; playerShadow.style.opacity = opacity; } } else if (playerShadow) { playerShadow.style.display = 'none'; } if (sfxFootsteps.length > 0 && !isBoosting && !isJumping && !isSliding && currentPlayerState === 'running' && parseFloat(player.style.bottom) <= playerBaseBottom_CONST + 5 && !gameOver && !isPaused && !isCountingDown && !isInStartingAnimation) { timeSinceLastFootstep += dt; if (timeSinceLastFootstep >= FOOTSTEP_INTERVAL_CONST) { const randomFootstepSfx = getRandomElement_FN(sfxFootsteps); if (randomFootstepSfx) playSoundEffect_FN(randomFootstepSfx); timeSinceLastFootstep = 0; footstepSfxPlaying = true; } } else { if (currentPlayerState !== 'running' || isJumping || isSliding || isBoosting) { timeSinceLastFootstep = FOOTSTEP_INTERVAL_CONST; footstepSfxPlaying = false; } } if (isSpawningQhkCoinStream) { timeSinceLastQhkStreamCoin += dt; if (timeSinceLastQhkStreamCoin >= QHK_STREAM_COIN_SPAWN_INTERVAL_SECONDS_CONST) { spawnSingleQhkStreamCoin_FN(); timeSinceLastQhkStreamCoin = 0; } } if (DEBUG_HITBOXES_CONST && gameContainer.offsetParent !== null) { if (playerDebugElement) { const playerBaseLeft = parseFloat(player.style.left); const playerBaseBottomVal = parseFloat(player.style.bottom); const currentUnscaledPlayerHeight = parseFloat(player.style.height) || playerHeight_CONST; const currentUnscaledPlayerWidth = parseFloat(player.style.width) || playerWidth_CONST; const unscaledHitboxWidth = currentUnscaledPlayerWidth - 2 * HITBOX_HORIZONTAL_PADDING_CONST; const unscaledHitboxHeight = currentUnscaledPlayerHeight - 2 * HITBOX_VERTICAL_PADDING_CONST; const unscaledHitboxOffsetX = HITBOX_HORIZONTAL_PADDING_CONST; const unscaledHitboxOffsetY = HITBOX_VERTICAL_PADDING_CONST; const playerBaseTop = GAME_DESIGN_HEIGHT_CONST - playerBaseBottomVal - currentUnscaledPlayerHeight; const isValid = !(unscaledHitboxHeight <= 0 || unscaledHitboxWidth <= 0); playerDebugElement.style.top = `${playerBaseTop + unscaledHitboxOffsetY}px`; playerDebugElement.style.left = `${playerBaseLeft + unscaledHitboxOffsetX}px`; playerDebugElement.style.width = isValid ? `${unscaledHitboxWidth}px` : '0px'; playerDebugElement.style.height = isValid ? `${unscaledHitboxHeight}px` : '0px'; playerDebugElement.style.display = isValid ? 'block' : 'none'; } const gameElementsWithDebug = gameContainer.querySelectorAll('.obstacle, .thrown-bottle'); gameElementsWithDebug.forEach(element => { if (element.debugBox && element.debugBox.parentNode) { const baseLeft = parseFloat(element.style.left); let baseWidth, baseHeight, baseTopVal; if (element.classList.contains('obstacle')) { if (element.classList.contains('tall')) { baseWidth = tallObstacleWidth_CONST; baseHeight = tallObstacleHeight_CONST; } else if (element.classList.contains('short')) { baseWidth = shortObstacleWidth_CONST; baseHeight = shortObstacleHeight_CONST; } else if (element.classList.contains('high')) { baseWidth = highObstacleWidth_CONST; baseHeight = highObstacleHeight_CONST; } else { baseWidth = 50; baseHeight = 50; } if (element.classList.contains('high')) { baseTopVal = parseFloat(element.style.top) || CEILING_HEIGHT_CONST; } else { const baseBottomVal = parseFloat(element.style.bottom) || groundHeight_CONST; baseTopVal = GAME_DESIGN_HEIGHT_CONST - baseBottomVal - baseHeight;} } else if (element.classList.contains('thrown-bottle')) { baseWidth = THROWN_BOTTLE_WIDTH_CONST; baseHeight = THROWN_BOTTLE_HEIGHT_CONST; baseTopVal = parseFloat(element.style.top); } const isVisible = (baseWidth > 0 && baseHeight > 0 && baseLeft < GAME_DESIGN_WIDTH_CONST && baseLeft + baseWidth > 0 && baseTopVal !== null && baseTopVal + baseHeight > 0 && baseTopVal < GAME_DESIGN_HEIGHT_CONST); if (isVisible) { element.debugBox.style.top = `${baseTopVal}px`; element.debugBox.style.left = `${baseLeft}px`; element.debugBox.style.width = `${baseWidth}px`; element.debugBox.style.height = `${baseHeight}px`; element.debugBox.style.display = 'block'; } else { element.debugBox.style.display = 'none'; } } }); } else if (DEBUG_HITBOXES_CONST) { if(playerDebugElement) playerDebugElement.style.display = 'none'; const obstacleDebugs = gameContainer.querySelectorAll('.obstacle-debug'); obstacleDebugs.forEach(box => box.style.display = 'none'); } const playerRectForCollision = player.getBoundingClientRect(); if (!gameOver) { if (!isPostHitInvincible && !isQhkInvincible) { checkCollisions_FN('.obstacle', handleObstacleCollision_FN, playerRectForCollision); checkCollisions_FN('.thrown-bottle', handleBottleCollision_FN, playerRectForCollision); } else if (isBoosting) { checkCollisions_FN('.obstacle', handleObstacleCollision_FN, playerRectForCollision); checkCollisions_FN('.thrown-bottle', handleBottleCollision_FN, playerRectForCollision); } } if (!gameOver) { checkCollisions_FN('.beer', handleBeerCollision_FN, playerRectForCollision); checkCollisions_FN('.kiwi', handleKiwiCollision_FN, playerRectForCollision); checkCollisions_FN('.qhk-logo', handleQhkLogoCollision_FN, playerRectForCollision); checkCollisions_FN('.boost-coin', handleBoostCoinCollision_FN, playerRectForCollision); } if (!gameOver) { timeSinceLastObstacle += dt; let speedRatio = INITIAL_GAME_SPEED_CONST / gameSpeed; let adjustedSpeedRatio = Math.pow(speedRatio, OBSTACLE_SPAWN_SPEED_SENSITIVITY_CONST); let dynamicObstacleIntervalSeconds = (BASE_OBSTACLE_INTERVAL_MS_CONST / 1000) * adjustedSpeedRatio; currentObstacleIntervalSeconds = Math.max(MIN_OBSTACLE_INTERVAL_SECONDS_CONST, dynamicObstacleIntervalSeconds); if (timeSinceLastObstacle >= currentObstacleIntervalSeconds) { spawnObstacle_FN(); timeSinceLastObstacle = 0 - (Math.random() * 0.1); } timeSinceLastBeer += dt; if (timeSinceLastBeer >= currentBeerIntervalSeconds) { spawnBeer_FN(); timeSinceLastBeer = 0 - (Math.random() * 0.1); } timeSinceLastKiwiCheck += dt; if (timeSinceLastKiwiCheck >= currentKiwiIntervalSeconds) { trySpawnKiwi_FN(); timeSinceLastKiwiCheck = 0; } timeSinceLastQhkLogoCheck += dt; if (timeSinceLastQhkLogoCheck >= (QHK_LOGO_SPAWN_INTERVAL_CONST / 1000)) { trySpawnQhkLogo_FN(); timeSinceLastQhkLogoCheck = 0; } timeSinceLastBottle += dt; let bottleSpeedRatio = INITIAL_GAME_SPEED_CONST / gameSpeed; let bottleAdjustedSpeedRatio = Math.pow(bottleSpeedRatio, BOTTLE_SPAWN_SENSITIVITY_CONST); currentBottleIntervalSeconds = Math.max(MIN_BOTTLE_INTERVAL_SECONDS_CONST, (BASE_BOTTLE_INTERVAL_MS_CONST / 1000) * bottleAdjustedSpeedRatio); if (timeSinceLastBottle >= currentBottleIntervalSeconds) { if (Math.random() < BOTTLE_SPAWN_CHANCE_CONST) { spawnThrownBottle_FN(); } timeSinceLastBottle = 0; } if (isBoosting && !isQhkInvincible) { timeSinceLastBoostCoinSpawn += dt; const nextCoinSpawnDelay = Math.random() * (BOOST_COIN_SPAWN_INTERVAL_MAX_CONST - BOOST_COIN_SPAWN_INTERVAL_MIN_CONST) + BOOST_COIN_SPAWN_INTERVAL_MIN_CONST; if (timeSinceLastBoostCoinSpawn >= nextCoinSpawnDelay) { trySpawnBoostCoin_FN(); timeSinceLastBoostCoinSpawn = 0; } } } if (!gameOver) { if (animationFrameId) cancelAnimationFrame(animationFrameId); animationFrameId = requestAnimationFrame(gameLoop_FN); } else { if (animationFrameId) cancelAnimationFrame(animationFrameId); animationFrameId = null; } }
    function moveGameElements_FN(selector, pixelsToMove) { if(!gameContainer) return; const elements = gameContainer.querySelectorAll(selector); elements.forEach(element => { if (element.id === 'start-wall') return; let currentLeft = parseFloat(element.style.left); if (isNaN(currentLeft)) currentLeft = GAME_DESIGN_WIDTH_CONST; const newLeft = currentLeft - pixelsToMove; element.style.left = `${newLeft}px`; let elementWidth = 0; if(element.classList.contains('boost-particle')) elementWidth = 4; else if (element.classList.contains('debris-particle')) elementWidth = parseFloat(element.style.width) || 5; else if (element.classList.contains('smoke-plume')) elementWidth = parseFloat(element.style.width) || SMOKE_PLUME_ASSET_SIZE_CONST; else if (element.classList.contains('thrown-bottle')) elementWidth = THROWN_BOTTLE_WIDTH_CONST; else if (element.classList.contains('explosion')) elementWidth = 120; else elementWidth = element.offsetWidth || parseFloat(element.style.width) || 50; if (newLeft + elementWidth < -20) { if (DEBUG_HITBOXES_CONST && (element.classList.contains('obstacle') || element.classList.contains('thrown-bottle')) && element.debugBox && element.debugBox.parentNode) element.debugBox.remove(); if (!element.classList.contains('explosion')) { element.remove(); } } }); }
    function checkCollisions_FN(selector, collisionHandler, playerRect) { if(!gameContainer || !playerRect) return; const items = gameContainer.querySelectorAll(selector); if (items.length === 0) return; const hitboxTop = playerRect.top + (HITBOX_VERTICAL_PADDING_CONST*currentScale), hitboxBottom = playerRect.bottom - (HITBOX_VERTICAL_PADDING_CONST*currentScale), hitboxLeft = playerRect.left + (HITBOX_HORIZONTAL_PADDING_CONST*currentScale), hitboxRight = playerRect.right - (HITBOX_HORIZONTAL_PADDING_CONST*currentScale); if (hitboxTop >= hitboxBottom || hitboxLeft >= hitboxRight) return; items.forEach(item => { if (!item.parentNode) return; const itemRect = item.getBoundingClientRect(); if (itemRect.width === 0 || itemRect.height === 0) return; const collision = !(hitboxRight < itemRect.left || hitboxLeft > itemRect.right || hitboxBottom < itemRect.top || hitboxTop > itemRect.bottom); if (collision) collisionHandler(item, itemRect); }); }
    function handleObstacleCollision_FN(obstacle, obstacleRect) { if (isBoosting) { if(!gameContainer) return; const containerRect = gameContainer.getBoundingClientRect(); createExplosion_FN(obstacleRect, containerRect); if(sfxWallBreak) playSoundEffect_FN(sfxWallBreak); if (DEBUG_HITBOXES_CONST && obstacle.debugBox && obstacle.debugBox.parentNode) obstacle.debugBox.remove(); obstacle.remove(); return; } if (isPostHitInvincible || isQhkInvincible || gameOver || !player || !gameContainer) return; forceStopSlideMechanics_FN(); if(sfxHit) playSoundEffect_FN(sfxHit); playerLives--; updateHeartDisplay_FN(); const playerRect = player.getBoundingClientRect(), containerRect = gameContainer.getBoundingClientRect(); createExplosion_FN(playerRect, containerRect); if (DEBUG_HITBOXES_CONST && obstacle.debugBox && obstacle.debugBox.parentNode) obstacle.debugBox.remove(); obstacle.remove(); if (playerLives <= 0) endGame_FN(); else startPostHitInvincibility_FN(); }
    function handleBottleCollision_FN(bottle, bottleRect) { if (isBoosting) { if(!gameContainer) return; const containerRect = gameContainer.getBoundingClientRect(); createExplosion_FN(bottleRect, containerRect); if(sfxWallBreak) playSoundEffect_FN(sfxWallBreak); if (DEBUG_HITBOXES_CONST && bottle.debugBox && bottle.debugBox.parentNode) bottle.debugBox.remove(); bottle.remove(); return; } if (isPostHitInvincible || isQhkInvincible || gameOver || !player || !gameContainer) return; forceStopSlideMechanics_FN(); if(sfxHit) playSoundEffect_FN(sfxHit); playerLives--; updateHeartDisplay_FN(); const playerRect = player.getBoundingClientRect(), containerRect = gameContainer.getBoundingClientRect(); createExplosion_FN(playerRect, containerRect); if (DEBUG_HITBOXES_CONST && bottle.debugBox && bottle.debugBox.parentNode) bottle.debugBox.remove(); bottle.remove(); if (playerLives <= 0) endGame_FN(); else startPostHitInvincibility_FN(); }
    function handleBeerCollision_FN(beer) { if (!beer.parentNode || gameOver) return; score += POINTS_PER_BEER_CONST * scoreMultiplier; if(scoreDisplay) scoreDisplay.textContent = Math.floor(score); if (!isBoosting) { powerGaugeValue += POWER_PER_BEER_CONST; powerGaugeValue = Math.min(powerGaugeValue, POWER_GAUGE_MAX_CONST); updatePowerGaugeVisual_FN(); } if(sfxBeer) playSoundEffect_FN(sfxBeer); beer.remove(); }
    function handleKiwiCollision_FN(kiwi) { if (!kiwi.parentNode || gameOver) return; if (playerLives < MAX_LIVES_CONST) { playerLives++; updateHeartDisplay_FN(); } fillPowerGauge_FN(); if(sfxKiwi) playSoundEffect_FN(sfxKiwi); kiwi.remove(); }
    function handleBoostCoinCollision_FN(coin) { if (!coin.parentNode || gameOver) return; score += POINTS_PER_BOOST_COIN_CONST * scoreMultiplier; if(scoreDisplay) scoreDisplay.textContent = Math.floor(score); if(sfxCoin) playSoundEffect_FN(sfxCoin); coin.remove(); }
    function handleQhkLogoCollision_FN(logo) { if (!logo.parentNode || gameOver || isQhkInvincible || !player) return; logo.remove(); if(sfxKiwi) playSoundEffect_FN(sfxKiwi); isQhkInvincible = true; isPostHitInvincible = false; player.classList.remove('flashing'); player.classList.add('qhk-invincible-effect'); startHueAnimationLoop_FN(); stopAllMusic_FN(); activeMusicTrack = invincibilityMusic; playActiveMusic_FN(); clearTimeout(qhkInvincibilityTimer); qhkInvincibilityStartTime = Date.now(); qhkInvincibilityTimer = setTimeout(deactivateQhkInvincibility_FN, QHK_INVINCIBILITY_DURATION_CONST); isSpawningQhkCoinStream = true; timeSinceLastQhkStreamCoin = 0; clearTimeout(qhkCoinSpawnStopTimer); qhkCoinSpawnStopTimer = setTimeout(() => { isSpawningQhkCoinStream = false; }, QHK_COIN_SPAWN_DURATION_CONST); }
    function spawnSingleQhkStreamCoin_FN() { if (gameOver || !gameContainer || !isSpawningQhkCoinStream) return; const spawnStartX = GAME_DESIGN_WIDTH_CONST + QHK_COIN_START_OFFSET_X_CONST; const coin = document.createElement('div'); coin.classList.add('boost-coin'); coin.style.width = `${BOOST_COIN_WIDTH_CONST}px`; coin.style.height = `${BOOST_COIN_HEIGHT_CONST}px`; coin.style.left = spawnStartX + 'px'; coin.style.bottom = `${QHK_COIN_Y_POSITION_BOTTOM_CONST}px`; gameContainer.appendChild(coin); }
    function deactivateQhkInvincibility_FN() { isQhkInvincible = false; isSpawningQhkCoinStream = false; clearTimeout(qhkInvincibilityTimer); qhkInvincibilityTimer = null; qhkInvincibilityTimeRemaining = 0; clearTimeout(qhkCoinSpawnStopTimer); qhkCoinSpawnStopTimer = null; stopHueAnimationLoop_FN(); if(player) {player.classList.remove('qhk-invincible-effect'); player.style.filter = '';} stopAllMusic_FN(); activeMusicTrack = backgroundMusic; if (!isPaused && !isCountingDown && !gameOver) playActiveMusic_FN(); if (!gameOver && player) { setPlayerState_FN(currentPlayerState); startPostHitInvincibility_FN(); } }
    function updateHeartDisplay_FN() { if(!heartContainer) return; heartContainer.innerHTML = ''; for (let i = 0; i < MAX_LIVES_CONST; i++) { const heart = document.createElement('div'); heart.classList.add('heart'); if (i >= playerLives) heart.classList.add('empty'); heartContainer.appendChild(heart); } }
    function startPostHitInvincibility_FN() { if (!player) return; if (isQhkInvincible || isPostHitInvincible) return; isPostHitInvincible = true; player.classList.add('flashing'); clearTimeout(postHitInvincibilityTimer); postHitInvincibilityStartTime = Date.now(); postHitInvincibilityTimer = setTimeout(() => { isPostHitInvincible = false; if (!isQhkInvincible) { player.classList.remove('flashing'); player.style.opacity = '1'; if (!gameOver && !isBoosting) setPlayerState_FN(currentPlayerState); } postHitInvincibilityTimeRemaining = 0; }, POST_HIT_INVINCIBILITY_DURATION_CONST); }
    function createExplosion_FN(targetRect, containerRect) { if(!gameContainer || !targetRect || !containerRect) return; const exp = document.createElement('div'); exp.classList.add('explosion'); const expSize = 120, cScale = currentScale || 1; const expLeft = (targetRect.left - containerRect.left) / cScale + (targetRect.width / cScale / 2) - (expSize / 2); const expTop = (targetRect.top - containerRect.top) / cScale + (targetRect.height / cScale / 2) - (expSize / 2); exp.style.left = `${expLeft}px`; exp.style.top = `${expTop}px`; gameContainer.appendChild(exp); exp.addEventListener('animationend', () => { if(exp.parentNode) exp.remove(); }, { once: true }); }
    function spawnObstacle_FN() { if (gameOver || isQhkInvincible || !gameContainer) return null; const obs = document.createElement('div'); obs.classList.add('obstacle'); let possibleTypes = ['tall', 'short', 'high']; if (consecutiveObstacleTypeSpawns >= MAX_CONSECUTIVE_OBSTACLE_TYPE_CONST && lastObstacleTypeSpawned !== null) { possibleTypes = possibleTypes.filter(type => type !== lastObstacleTypeSpawned); if (possibleTypes.length === 0) possibleTypes = ['tall', 'short', 'high']; } const obstacleType = getRandomElement_FN(possibleTypes); let selectedImageUrl = null, obstacleW = 0, obstacleH = 0; if (obstacleType === 'tall') { obstacleW = tallObstacleWidth_CONST; obstacleH = tallObstacleHeight_CONST; } else if (obstacleType === 'short') { obstacleW = shortObstacleWidth_CONST; obstacleH = shortObstacleHeight_CONST; } else if (obstacleType === 'high') { obstacleW = highObstacleWidth_CONST; obstacleH = highObstacleHeight_CONST; } else { return null; } obs.classList.add(obstacleType); let availableImages = obstacleImages_CONST[obstacleType]; if (availableImages && availableImages.length > 0) { if (availableImages.length === 1) selectedImageUrl = availableImages[0]; else { let possibleImages = availableImages.filter(imgUrl => imgUrl !== lastSpawnedObstacleImage[obstacleType]); if (possibleImages.length === 0) possibleImages = availableImages; selectedImageUrl = getRandomElement_FN(possibleImages); } lastSpawnedObstacleImage[obstacleType] = selectedImageUrl; } if (selectedImageUrl) obs.style.backgroundImage = `url('${selectedImageUrl}')`; else { obs.style.backgroundColor = '#F0F'; console.warn(`No image for ${obstacleType}`); } obs.style.left = `${GAME_DESIGN_WIDTH_CONST}px`; obs.style.width = `${obstacleW}px`; obs.style.height = `${obstacleH}px`; if (obstacleType === 'high') { obs.style.top = `${CEILING_HEIGHT_CONST}px`; obs.style.bottom = ''; } else { obs.style.bottom = `${groundHeight_CONST}px`; obs.style.top = ''; } gameContainer.appendChild(obs); if (obstacleType === lastObstacleTypeSpawned) consecutiveObstacleTypeSpawns++; else { lastObstacleTypeSpawned = obstacleType; consecutiveObstacleTypeSpawns = 1; } if (DEBUG_HITBOXES_CONST && player) { const db = document.createElement('div'); db.classList.add('debug-hitbox', 'obstacle-debug'); obs.debugBox = db; gameContainer.insertBefore(db, player); } return obstacleType; }
    function spawnThrownBottle_FN() { if (gameOver || isBoosting || isQhkInvincible || !gameContainer) return; const b = document.createElement('div'); b.classList.add('thrown-bottle'); b.style.left = `${GAME_DESIGN_WIDTH_CONST + THROWN_BOTTLE_WIDTH_CONST}px`; const minTop = CEILING_HEIGHT_CONST + BOTTLE_VERTICAL_MARGIN_CONST; const maxTop = GAME_DESIGN_HEIGHT_CONST - groundHeight_CONST - THROWN_BOTTLE_HEIGHT_CONST - BOTTLE_VERTICAL_MARGIN_CONST; if (minTop >= maxTop) { console.warn("No vertical space for bottle."); return; } b.style.top = `${Math.random() * (maxTop - minTop) + minTop}px`; gameContainer.appendChild(b); if (DEBUG_HITBOXES_CONST && player) { const db=document.createElement('div');db.classList.add('debug-hitbox','obstacle-debug');b.debugBox=db;gameContainer.insertBefore(db,player); } }
    function spawnBeer_FN() { if (gameOver || isQhkInvincible || !gameContainer) return; const X_START = GAME_DESIGN_WIDTH_CONST / 2, X_END = GAME_DESIGN_WIDTH_CONST + 100, Y_SHIFT = 60, MAX_ATTEMPTS = 2, spawnX = GAME_DESIGN_WIDTH_CONST; let attempt = 0, spawnBottom = beerBaseBottom_CONST + (Math.random() - 0.5) * 40, blocked; do { blocked = false; const beerB = spawnBottom, beerT = spawnBottom + beerHeight_CONST; const items = gameContainer.querySelectorAll('.obstacle, .thrown-bottle'); for (const item of items) { const itemL = parseFloat(item.style.left); if (isNaN(itemL)) continue; let iW, iH; if (item.classList.contains('thrown-bottle')) { iW=THROWN_BOTTLE_WIDTH_CONST; iH=THROWN_BOTTLE_HEIGHT_CONST; } else { iW=parseFloat(item.style.width)||(item.classList.contains('tall')?tallObstacleWidth_CONST:(item.classList.contains('short')?shortObstacleWidth_CONST:highObstacleWidth_CONST)); iH=parseFloat(item.style.height)||(item.classList.contains('tall')?tallObstacleHeight_CONST:(item.classList.contains('short')?shortObstacleHeight_CONST:highObstacleHeight_CONST));} if (itemL + iW > X_START && itemL < X_END) { let itemBottomGame, itemTopGame; if (item.classList.contains('high')) { const iTopGame = parseFloat(item.style.top)||CEILING_HEIGHT_CONST; itemBottomGame = GAME_DESIGN_HEIGHT_CONST - iTopGame - iH; itemTopGame = itemBottomGame + iH; } else if (item.classList.contains('thrown-bottle')) { const iTopGame = parseFloat(item.style.top); itemBottomGame = GAME_DESIGN_HEIGHT_CONST - iTopGame - iH; itemTopGame = itemBottomGame + iH; } else { itemBottomGame = parseFloat(item.style.bottom)||groundHeight_CONST; itemTopGame = itemBottomGame + iH; } if (!(beerT <= itemBottomGame || beerB >= itemTopGame)) { blocked = true; break; } } } if (blocked) { attempt++; if (attempt <= MAX_ATTEMPTS) { spawnBottom += Y_SHIFT; if (spawnBottom + beerHeight_CONST > GAME_DESIGN_HEIGHT_CONST - CEILING_HEIGHT_CONST - 10) return; } else return; } } while (blocked); const beer = document.createElement('div'); beer.classList.add('beer'); beer.style.left = `${spawnX}px`; beer.style.bottom = `${spawnBottom}px`; gameContainer.appendChild(beer); }
    function trySpawnKiwi_FN() { if (gameOver || isBoosting || isQhkInvincible || !gameContainer) return; if (Math.random() < KIWI_SPAWN_CHANCE_CONST) { const kiwi = document.createElement('div'); kiwi.classList.add('kiwi'); kiwi.style.left = `${GAME_DESIGN_WIDTH_CONST}px`; kiwi.style.bottom = `${kiwiBaseBottom_CONST + (Math.random() - 0.5) * 30}px`; gameContainer.appendChild(kiwi); } }
    function trySpawnBoostCoin_FN() { if (gameOver || !isBoosting || isQhkInvincible || !gameContainer) return; const coin = document.createElement('div'); coin.classList.add('boost-coin'); coin.style.width = `${BOOST_COIN_WIDTH_CONST}px`; coin.style.height = `${BOOST_COIN_HEIGHT_CONST}px`; coin.style.left = GAME_DESIGN_WIDTH_CONST + 'px'; const randomBottom = Math.random() * (BOOST_COIN_VERTICAL_RANGE_MAX_CONST - BOOST_COIN_VERTICAL_RANGE_MIN_CONST) + BOOST_COIN_VERTICAL_RANGE_MIN_CONST; coin.style.bottom = randomBottom + 'px'; gameContainer.appendChild(coin); }
    function trySpawnQhkLogo_FN() { if (gameOver || isBoosting || isQhkInvincible || !gameContainer) return; if (Math.random() < QHK_LOGO_SPAWN_CHANCE_CONST) { const logo = document.createElement('div'); logo.classList.add('qhk-logo'); logo.style.width = `${QHK_LOGO_WIDTH_CONST}px`; logo.style.height = `${QHK_LOGO_HEIGHT_CONST}px`; logo.style.left = `${GAME_DESIGN_WIDTH_CONST}px`; logo.style.bottom = `${QHK_LOGO_BASE_BOTTOM_CONST + (Math.random() - 0.5) * 40}px`; gameContainer.appendChild(logo); } }

});