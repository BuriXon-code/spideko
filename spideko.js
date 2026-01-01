// Project: Spideko - Your little helper in catching bugs;
// Description: JavaScript decoration script that animates a spider walking across a webpage                                                                    //              and catching bugs that appear on it. Designed purely for visual fun and web
//              experimentation.
//              Created as an alternative to Oneko Cat for spider lovers.
// Author: Kamil BuriXon Burek
// Version: 2026.1.1
// License: GNU General Public License v3.0 (GPLv3)
//
// This program is free software: you can redistribute it and/or modify it under the terms of
// the GNU General Public License as published by the Free Software Foundation, either version 3
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
// without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
// See the GNU General Public License for more details.
//
// A copy of the GNU General Public License should have been received along with this program.
// If not, see <https://www.gnu.org/licenses/gpl-3.0.html> for the full license text.
;(function spiderTheatre() {
    'use strict';

    // CONFIG
    const S = {
        // SIZES/PATHS

        // DIMENSIONS
        spiderSize: 72, // spiders width [px]
        roachMinSize: 20, // roaches min width [px]
        roachMaxSize: 56, // roaches max eidth [px]

        // FILES
        // IMPORTANT - The paths provided are relative. To use a single file directory on multiple subpages, you must change the paths to your own absolute paths and place the files there.
        // If you don't know how to do this or what it is, please refer to the README.md file or visit https://github.com/BuriXon-code/BugFinder
        spiderFramesPath: i => `./spider_anim/frame_${String(i).padStart(2,'0')}.gif`,
        roachFramesPath: i => `./roach_anim/frame_${String(i).padStart(2,'0')}.gif`,
        webImgPath: './spider_anim/web.png',

        // FRAME COUNT - For the gifs provided in the original repository, this should not be changed
        spiderFramesCount: 12, // spiders frame count
        roachFramesCount: 25, // roaches frame count

        // SPEEDS (PX/S)
        spiderBaseSpeed: 65,
        spiderAngrySpeed: 180,
        spiderChaseSpeed: 350,
        roachSpeed: 40,

        // DISTANCES
        catchDist: 15, // CATCH ROACH
        grabDist: 5, // CATCH CURSOR

        // WANDER
        // You can edit these values if you think the spider is too boring at the moment
        idleWanderAfterMs: 10000,
        idleWanderPauseMin: 500,
        idleWanderPauseMax: 5000,

        // POSITION COOKIE
        cookieDays: 1,

        // CURSOR HUNTING
        // You can edit these values if you think the spider is too boring at the moment
        attackChance: 0.40,
        webChance: 0.40,
        cursorSitChance: 0.20,
        attackMinHits: 2,
        attackMaxHits: 4,
        webMinMs: 3000,
        webMaxMs: 7500,
        webSizeMin: 48,
        webSizeMax: 86,

        // IGNORE CURSOR
        // You can edit these values if you think the spider is too boring at the moment
        ignoreCursorChance: 0.15,
        ignoreCursorDurationMin: 1000,
        ignoreCursorDurationMax: 5000,

        // MOVEMENT/ANIMATIONS
        wobbleAmplitude: 8,
        wanderWobbleAmplitude: 15,
        spiderAnimSpeedMul: 1.3, // FRAME-CHANGE SPEED

        // ROACH SPAWN TIMING
        //  You can edit these times if you think there are too many or too few cockroaches
        roachSpawnMinMs: 7500,
        roachSpawnMaxMs: 30000,

        // COCROACH COUNT
        roachSpawnMaxCount: 5,
    };

    // CHECK IF ANIMATIONS ARE ALLOWED
	if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Some users may have optimization enabled that disables certain animations.
        // In this case, the script will not execute (return) and the spider will not appear.
        // If you would also like to display a message to the user about this fact, please uncomment on the "alert" below.
        //
	    // alert("Due to browser motion optimization settings, the spider and worm animations cannot be run.");
	    //
	    return;
	}

    // HELPERS
    function rand(min, max) { return Math.random() * (max - min) + min; }
    function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }
    function nowMs() { return performance.now(); }
    function setCookie(n, v, d) { const D = new Date(); D.setTime(D.getTime() + (d || S.cookieDays) * 24 * 60 * 60 * 1000); document.cookie = n + "=" + encodeURIComponent(v) + ";path=/;expires=" + D.toUTCString(); }
    function getCookie(n) { const m = document.cookie.match('(^|;)\\s*' + n + '\\s*=\\s*([^;]+)'); return m ? decodeURIComponent(m.pop()) : null; }
    // PRELOAD - turns out to be necessary, because with a weak Internet connection the spider blinks intensely and jumps from place to place
    function preloadImages(arr, cb) {
        let loaded = 0;
        const total = arr.length;
        arr.forEach(src => {
            const img = new Image();
            img.onload = () => {
                loaded++;
                if (loaded === total) cb();
            };
            img.onerror = () => {
                loaded++;
                if (loaded === total) cb();
            };
            img.src = src;
        });
    }

    // DOM ELEMENTS
    // SPIDER
    const spiderEl = document.createElement('div');
    spiderEl.style.position = 'fixed';
    spiderEl.style.width = S.spiderSize + 'px';
    spiderEl.style.height = S.spiderSize + 'px';
    spiderEl.style.pointerEvents = 'auto';
    spiderEl.style.zIndex = 99998;
    spiderEl.style.imageRendering = 'pixelated';
    spiderEl.style.backgroundRepeat = 'no-repeat';
    spiderEl.style.backgroundSize = `${S.spiderSize}px auto`;
    spiderEl.style.transformOrigin = '50% 50%';
    spiderEl.style.cursor = 'pointer';
    spiderEl.style.userSelect = 'none';
    spiderEl.style.webkitTapHighlightColor = 'transparent';
    document.body.appendChild(spiderEl);
    // Let's make sure that the spider doesn't disappear after losing focus on the card for a long time
    // I decided to spawn it in a random place - since the user wasn't there, he doesn't know where the spider went anyway
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {    
            const w = window.innerWidth;
            const h = window.innerHeight;    
            spiderX = Math.max(64, Math.min(w - 64, Math.random() * w));
            spiderY = Math.max(64, Math.min(h - 64, Math.random() * h));    
            spiderAngle = 0;
            spiderFrameIndex = 0;
            spiderFrameTimer = 0;    
            state = 'wander';
            wanderState = true;
            wanderTargetX = spiderX + Math.random() * 120 - 60;
            wanderTargetY = spiderY + Math.random() * 120 - 60;    
            spiderPauseUntil = performance.now() + 300;
            ignoreCursorUntil = performance.now() + 3000;    
            spiderEl.style.left = (spiderX - S.spiderSize / 2) + 'px';
            spiderEl.style.top  = (spiderY - S.spiderSize / 2) + 'px';
            spiderEl.style.transform = 'rotate(0deg)';
            spiderEl.style.display = 'block';    
            lastTime = performance.now();
        }
    });
    // ROACHES
    const roachContainer = document.createElement('div');
    roachContainer.style.position = 'fixed';
    roachContainer.style.left = '0px';
    roachContainer.style.top = '0px';
    roachContainer.style.width = '100%';
    roachContainer.style.height = '100%';
    roachContainer.style.pointerEvents = 'none';
    roachContainer.style.zIndex = 99997;
    roachContainer.style.userSelect = 'none';
    roachContainer.style.webkitTapHighlightColor = 'transparent';
    document.body.appendChild(roachContainer);

    // SETTING FRAMES
    const spiderFrames = [];
    for (let i = 0; i < S.spiderFramesCount; i++) { const p = S.spiderFramesPath(i); spiderFrames.push(p); new Image().src = p; }
    const roachFrames = [];
    for (let i = 0; i < S.roachFramesCount; i++) { const p = S.roachFramesPath(i); roachFrames.push(p); new Image().src = p; }

    // STATES
    let spiderX = parseFloat(getCookie('spiderX')) || 120;
    let spiderY = parseFloat(getCookie('spiderY')) || 120;
    let spiderAngle = parseFloat(getCookie('spiderA')) || 0;

    // MOUSE
    let mouseX = spiderX, mouseY = spiderY, realMouseX = spiderX, realMouseY = spiderY, mouseInitialized = false, lastMouseMove = nowMs();
    let wanderState = false, wanderTargetX = spiderX, wanderTargetY = spiderY, wanderPauseUntil = 0, spiderPauseUntil = 0, ignoreCursorUntil = 0;

    // VARIABLES
    const roaches = [];
    let roachIdCounter = 1;
    let nextRoachSpawnAt = nowMs() + rand(2000, 5000);
    let spiderFrameIndex = 0, spiderFrameTimer = 0;
    let state = 'wander'; // 'wander'|'followCursor'|'attack'
    let attackState = null;
    let wanderPhase = rand(0, Math.PI * 2);
    let cursorFocusUntil = 0;
    let cursorIgnoreUntil = 0;
    function resetCursorCycle() {
        const on = Math.floor(rand(3000, 5000));
        const off = Math.floor(rand(3000, 8000));
        cursorFocusUntil = nowMs() + on;
        cursorIgnoreUntil = cursorFocusUntil + off;
    }
    resetCursorCycle();

    // UTILS
    function saveSpider() { setCookie('spiderX', Math.round(spiderX), S.cookieDays); setCookie('spiderY', Math.round(spiderY), S.cookieDays); setCookie('spiderA', Math.round(spiderAngle), S.cookieDays); }
    //function setSpiderFrame(i) { spiderEl.style.backgroundImage = `url(${spiderFrames[i % spiderFrames.length]})`; }
    let lastSpiderFrame = spiderFrames[0];

    function setSpiderFrame(i){
        const src = spiderFrames[i % spiderFrames.length];
        lastSpiderFrame = src;
        spiderEl.style.backgroundImage = `url(${src})`;
    }
    function setRoachFrame(roach, i) { if (!roach || !roach.el) return; roach.el.style.backgroundImage = `url(${roachFrames[i % roachFrames.length]})`; }

    // MOUSE HANDLING
    document.addEventListener('mousemove', e => {
        mouseInitialized = true;
        realMouseX = e.clientX;
        realMouseY = e.clientY;
        lastMouseMove = nowMs();
    });


    // SPEECH BUBBLE CONFIG
    const SPEECH_MESSAGES = [
        "I eat bugs",
        "I love web development",
        "I'm your assistant",
        "I'm a little spider",
        "Careful. I bite",
        "Debugging mode: active",
        "I spin webs",
        "CSS is my jam",
        "Hello, developer!",
        "I catch bugs for you",
        "Feed me pixels",
        "I'm watching your DOM",
        "I like cookies (not the HTTP kind)",
        "Need help? Ask me",
        "I enjoy crawling",
        "Spiders > bugs",
        "I compile happiness",
        "I prefer coffee over tea",
        "I shall not crash",
        "Keep calm and code on"
    ];

    // CLICK ACTION: speech bubble
    spiderEl.addEventListener('click', e => {
        e.stopPropagation();
        const msg = SPEECH_MESSAGES[Math.floor(Math.random() * SPEECH_MESSAGES.length)];
        const duration = Math.floor(rand(3000, 5000));
        spiderPauseUntil = nowMs() + duration;
        ignoreCursorUntil = spiderPauseUntil;
        const bubble = document.createElement('div');
        // STYLES
        bubble.textContent = msg;
        bubble.style.position = 'fixed';
        bubble.style.zIndex = 1000000;
        bubble.style.pointerEvents = 'none';
        bubble.style.background = '#ffffff';
        bubble.style.color = '#000000';
        bubble.style.padding = '8px 12px';
        bubble.style.borderRadius = '10px';
        bubble.style.boxShadow = '0 6px 18px rgba(0,0,0,0.18)';
        bubble.style.fontSize = '14px';
        bubble.style.lineHeight = '1.2';
        bubble.style.whiteSpace = 'nowrap';
        bubble.style.userSelect = 'none';
        const bw = 200;
        bubble.style.maxWidth = '260px';
        bubble.style.textAlign = 'center';
        // SHOW MESSAGE
        document.body.appendChild(bubble);
        const rect = bubble.getBoundingClientRect();
        const w = rect.width || bw;
        const h = rect.height || 24;
        const left = clamp(spiderX - w/2 + S.spiderSize/2, 6, window.innerWidth - w - 6);
        const top = clamp(spiderY - h - S.spiderSize - 8, 6, window.innerHeight - h - 6);
        bubble.style.left = left + 'px';
        bubble.style.top = top + 'px';
        bubble.style.opacity = '1';
        // HIDE MESSAGE
        setTimeout(() => {
            bubble.style.transition = 'opacity 280ms linear, transform 280ms ease';
            bubble.style.opacity = '0';
            bubble.style.transform = 'translateY(-6px)';
            setTimeout(() => { if (bubble && bubble.parentNode) bubble.parentNode.removeChild(bubble); }, 300);
        }, duration);
    });

    // ROACH CREATION
    // SET COUNT
    function sampleRoachCount() {
        const r = Math.random();
        if (r < 0.80) return 1;
        if (r < 0.95) return 2;
        return Math.floor(rand(3, 6));
    }
    // SHOW ROACHES
    function createRoachAt(x, y, size) {
        const el = document.createElement('div');
        el.style.position = 'fixed';
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.pointerEvents = 'none';
        el.style.imageRendering = 'pixelated';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundSize = `${size}px auto`;
        el.style.transformOrigin = '50% 50%';
        el.style.left = (x - size / 2) + 'px';
        el.style.top = (y - size / 2) + 'px';
        el.style.userSelect = 'none';
        el.style.webkitTapHighlightColor = 'transparent';
        roachContainer.appendChild(el);
        // LETS ROACHES MOVE
        const rObj = {
            id: roachIdCounter++,
            el,
            x,y,
            size,
            targetX: x + rand(-80, 80),
            targetY: y + rand(-80, 80),
            pauseUntil: 0,
            frameIndex: Math.floor(rand(0, S.roachFramesCount)),
            frameTimer: 0,
            arcPhase: rand(0, Math.PI * 2),
            arcSpeed: rand(1, 3),
            arcAmplitude: rand(6, 24),
            roamNextAt: nowMs(),
            agility: rand(0.3, 1.0)
        };
        setRoachFrame(rObj, rObj.frameIndex);
        roaches.push(rObj);
        return rObj;
    }
    // MAKE ROUCHES SPAWN FROM EDGES
    function spawnRoachesFromEdge() {
        const count = clamp(sampleRoachCount(), 1, S.roachSpawnMaxCount);
        for (let i = 0; i < count; i++) {
            const size = Math.floor(rand(S.roachMinSize, S.roachMaxSize));
            const side = Math.floor(rand(0, 4));
            const margin = 20;
            let x, y, tx, ty;
            if (side === 0) { x = -margin; y = rand(20, window.innerHeight - 20); tx = rand(80, window.innerWidth - 80); ty = rand(20, window.innerHeight - 20); }
            else if (side === 1) { x = window.innerWidth + margin; y = rand(20, window.innerHeight - 20); tx = rand(80, window.innerWidth - 80); ty = rand(20, window.innerHeight - 20); }
            else if (side === 2) { y = -margin; x = rand(20, window.innerWidth - 20); ty = rand(80, window.innerHeight - 80); tx = rand(20, window.innerWidth - 20); }
            else { y = window.innerHeight + margin; x = rand(20, window.innerWidth - 20); ty = rand(80, window.innerHeight - 80); tx = rand(20, window.innerWidth - 20); }
            const r = createRoachAt(x, y, size);
            r.targetX = tx;
            r.targetY = ty;
            r.pauseUntil = 0;
            r.roamNextAt = nowMs();
        }
        nextRoachSpawnAt = nowMs() + Math.floor(rand(S.roachSpawnMinMs, S.roachSpawnMaxMs));
    }
    // REMOVE ROACH
    function removeRoach(r) {
        if (!r) return;
        if (r.el && r.el.parentNode) r.el.parentNode.removeChild(r.el);
        const idx = roaches.findIndex(x => x.id === r.id);
        if (idx >= 0) roaches.splice(idx, 1);
    }
    // ROACH AI
    function updateRoaches(dt) {
        const now = nowMs();
        for (let i = roaches.length - 1; i >= 0; i--) {
            const r = roaches[i];
            r.frameTimer += dt;
            if (r.frameTimer > 40) { r.frameTimer = 0; r.frameIndex = (r.frameIndex + 1) % S.roachFramesCount; setRoachFrame(r, r.frameIndex); }

            if (now < r.pauseUntil) {
                r.el.style.left = (r.x - r.size / 2) + 'px';
                r.el.style.top = (r.y - r.size / 2) + 'px';
                continue;
            }
            const dx = r.targetX - r.x, dy = r.targetY - r.y;
            const d = Math.hypot(dx, dy);
            if (d < 6 || now > r.roamNextAt + 8000) {
                r.targetX = rand(20, Math.max(20, window.innerWidth - 20));
                r.targetY = rand(20, Math.max(20, window.innerHeight - 20));
                if (Math.random() < 0.45) r.pauseUntil = now + rand(200, 1800); else r.pauseUntil = 0;
                r.roamNextAt = now;
            } else {
                const speed = S.roachSpeed * (0.6 + r.agility * 0.8);
                const moveStep = speed * (dt / 1000);
                const nx = dx / d, ny = dy / d;
                r.arcPhase += (dt / 1000) * r.arcSpeed;
                const lateral = Math.sin(r.arcPhase) * r.arcAmplitude * r.agility;
                const perpX = -ny, perpY = nx;
                const stepX = nx * moveStep + perpX * (lateral * (dt / 1000));
                const stepY = ny * moveStep + perpY * (lateral * (dt / 1000));
                r.x += stepX;
                r.y += stepY;
                const ang = Math.atan2(dy, dx) * 180 / Math.PI;
                r.el.style.transform = `rotate(${ang + 180}deg)`;
                r.el.style.left = (r.x - r.size / 2) + 'px';
                r.el.style.top = (r.y - r.size / 2) + 'px';
            }

            if (r.x < -400 || r.x > window.innerWidth + 400 || r.y < -400 || r.y > window.innerHeight + 400) {
                removeRoach(r);
            }
        }
    }
    function findNearestRoach(x, y) {
        let best = null, bestD = Infinity;
        for (const r of roaches) {
            const d = Math.hypot(r.x - x, r.y - y);
            if (d < bestD) { bestD = d; best = r; }
        }
        return { roach: best, dist: bestD };
    }

    // CHASE ROACH
    function startChaseRoach(targetRoach) {
        if (!targetRoach) return;
        attackState = null;
        state = { kind: 'chaseRoach', targetId: targetRoach.id, phase: 'face', phaseTimer: 0, faceDuration: Math.floor(rand(120, 380)) };
    }
    function doChaseRoachStep(dt) {
        if (!state || typeof state !== 'object' || state.kind !== 'chaseRoach') return;
        const now = nowMs();
        const target = roaches.find(r => r.id === state.targetId);
        if (!target) {
            state = 'wander';
            wanderState = true;
            wanderTargetX = spiderX + rand(-120,120);
            wanderTargetY = spiderY + rand(-120,120);
            return;
        }
        state.phaseTimer += dt;
        const rx = target.x, ry = target.y;
        const dx = rx - spiderX, dy = ry - spiderY;
        const d = Math.hypot(dx, dy);
        if (state.phase === 'face') {
            const angDeg = Math.atan2(dy, dx) * 180 / Math.PI + 90;
            spiderEl.style.transform = `rotate(${angDeg}deg)`;
            spiderFrameTimer += dt;
            const faceInterval = 160 / S.spiderAnimSpeedMul;
            if (spiderFrameTimer > faceInterval) { spiderFrameTimer = 0; spiderFrameIndex = (spiderFrameIndex + 1) % S.spiderFramesCount; setSpiderFrame(spiderFrameIndex); }
            if (state.phaseTimer > state.faceDuration) { state.phase = 'approach'; state.phaseTimer = 0; }
        } else if (state.phase === 'approach') {
            const sp = S.spiderBaseSpeed * 0.9;
            if (d > 3) {
                spiderX += (dx/d) * sp * (dt/1000);
                spiderY += (dy/d) * sp * (dt/1000);
                spiderFrameTimer += dt;
                const interval = 80 / S.spiderAnimSpeedMul;
                if (spiderFrameTimer > interval) { spiderFrameTimer = 0; spiderFrameIndex = (spiderFrameIndex + 1) % S.spiderFramesCount; setSpiderFrame(spiderFrameIndex); }
            }
            if (d < 64) { state.phase = 'charge'; state.phaseTimer = 0; state.chargeSpeed = S.spiderChaseSpeed; }
        } else if (state.phase === 'charge') {
            const sp = state.chargeSpeed;
            if (d > S.catchDist) {
                spiderX += (dx/d) * sp * (dt/1000);
                spiderY += (dy/d) * sp * (dt/1000);
                spiderFrameTimer += dt;
                const interval = 40 / S.spiderAnimSpeedMul;
                if (spiderFrameTimer > interval) { spiderFrameTimer = 0; spiderFrameIndex = (spiderFrameIndex + 1) % S.spiderFramesCount; setSpiderFrame(spiderFrameIndex); }
            } else {
                onCatchRoach(target);
                removeRoach(target);
                spiderPauseUntil = now + rand(2000,3000);
                state = 'wander';
                wanderState = true;
                wanderTargetX = spiderX + rand(-120,120);
                wanderTargetY = spiderY + rand(-120,120);
                ignoreCursorUntil = now + rand(1500,3500);
            }
        }
        const angDeg = Math.atan2( (target ? target.y : mouseY) - spiderY, (target ? target.x : mouseX) - spiderX) * 180/Math.PI + 90;
        spiderAngle = angDeg;
        spiderEl.style.transform = `rotate(${angDeg}deg)`;
        spiderEl.style.left = (spiderX - S.spiderSize/2) + 'px';
        spiderEl.style.top = (spiderY - S.spiderSize/2) + 'px';
    }
    
    // CATCH ROACH
    function onCatchRoach(roach) {
        if (!roach) return;
        const r = Math.random();
        if (r < 0.28) {
            const webTime = Math.floor(rand(S.webMinMs,S.webMaxMs));
            placeWebAt(roach.x, roach.y, webTime);
            const thrashI = setInterval(()=>{ if (roach && roach.el) roach.el.style.transform = `rotate(${Math.random()*360}deg)`; }, 80);
            setTimeout(()=>{ clearInterval(thrashI); removeRoach(roach); }, webTime);
        } else {
            removeRoach(roach);
        }
    }

    // INTERACT WITH CURSOR
    function onCatchCursor() {
        const r = Math.random();
        const sitMs = Math.floor(rand(700,1600));
        spiderPauseUntil = nowMs() + sitMs;
        ignoreCursorUntil = nowMs() + rand(3000,12000);
        if (r < S.webChance) {
            placeWebAt(realMouseX, realMouseY, Math.floor(rand(S.webMinMs,S.webMaxMs)));
            wanderState = true;
            wanderTargetX = rand(40, Math.max(40, window.innerWidth - 40));
            wanderTargetY = rand(40, Math.max(40, window.innerHeight - 40));
            ignoreCursorUntil = nowMs() + rand(1200,3200);
            return;
        }
        if (r < S.webChance + S.attackChance) {
            const hits = Math.floor(rand(S.attackMinHits, S.attackMaxHits+0.999));
            startMultiAttackSequence(hits, ()=>{
                wanderState = true;
                wanderTargetX = rand(40, Math.max(40, window.innerWidth - 40));
                wanderTargetY = rand(40, Math.max(40, window.innerHeight - 40));
                spiderPauseUntil = nowMs()+rand(800,1600);
                ignoreCursorUntil = nowMs()+rand(2000,5000);
            });
            return;
        }
        if (r < S.webChance + S.attackChance + S.cursorSitChance) {
            wanderState = false;
            spiderPauseUntil = nowMs() + rand(800,2200);
            ignoreCursorUntil = nowMs() + rand(1500,7000);
            return;
        }
        const hits2 = 1;
        startAttackSequence(hits2, ()=>{
            wanderState = true;
            wanderTargetX = rand(40, Math.max(40, window.innerWidth - 40));
            wanderTargetY = rand(40, Math.max(40, window.innerHeight - 40));
            spiderPauseUntil = nowMs()+rand(800,1600);
            ignoreCursorUntil = nowMs()+rand(2000,5000);
        });
    }
    function startAttackSequence(hits, cb) {
        attackState = { hits, current:0, phase:'approach', phaseTimer:0, retreatDist: rand(12,28), approachSpeed: S.spiderChaseSpeed, retreatSpeed: S.spiderChaseSpeed*0.45, cb };
        state = 'attack';
    }
    function startMultiAttackSequence(hits, cb) {
        attackState = { mode: 'multi', hits, current:0, phase:'approach', phaseTimer:0, retreatDist: rand(24,48), approachSpeed: S.spiderChaseSpeed, retreatSpeed: S.spiderChaseSpeed*0.45, cb, circleTimer:0, circleDir: (Math.random()<0.5?1:-1) };
        state = 'attack';
    }
    function doAttackStep(dt) {
        if (!attackState) return;
        if (roaches.length > 0) {
            const nearest = findNearestRoach(spiderX, spiderY);
            if (nearest.roach) {
                startChaseRoach(nearest.roach);
                attackState = null;
                return;
            }
        }
        attackState.phaseTimer += dt;
        if (attackState.mode === 'multi') {
            handleMultiAttack(dt);
            return;
        }
        if (attackState.phase === 'approach') {
            const tx = mouseX, ty = mouseY;
            const dx = tx - spiderX, dy = ty - spiderY, d = Math.hypot(dx,dy);
            const wantDist = 6;
            const sp = attackState.approachSpeed;
            if (d > wantDist) { spiderX += (dx/d)*sp*(dt/1000); spiderY += (dy/d)*sp*(dt/1000); }
            else { attackState.phase = 'retreat'; attackState.phaseTimer = 0; attackState.retx = spiderX + (dx/d)*(-attackState.retreatDist); attackState.rety = spiderY + (dy/d)*(-attackState.retreatDist); }
            spiderFrameTimer += dt;
            if (spiderFrameTimer > (40 / S.spiderAnimSpeedMul)) { spiderFrameTimer = 0; spiderFrameIndex = (spiderFrameIndex+1)%S.spiderFramesCount; setSpiderFrame(spiderFrameIndex); }
        } else if (attackState.phase === 'retreat') {
            const tx = attackState.retx, ty = attackState.rety;
            const dx = tx - spiderX, dy = ty - spiderY, d = Math.hypot(dx,dy);
            const sp = attackState.retreatSpeed;
            if (d > 2) { spiderX += (dx/d)*sp*(dt/1000); spiderY += (dy/d)*sp*(dt/1000); }
            else { attackState.current++; if (attackState.current >= attackState.hits) { const cb = attackState.cb; attackState = null; state = 'wander'; if (cb) cb(); } else { attackState.phase = 'approach'; } }
            spiderFrameTimer += dt;
            if (spiderFrameTimer > (60 / S.spiderAnimSpeedMul)) { spiderFrameTimer = 0; spiderFrameIndex = (spiderFrameIndex+1)%S.spiderFramesCount; setSpiderFrame(spiderFrameIndex); }
        }
    }
    // MAKE SPIDER ANGRIER
    function handleMultiAttack(dt) {
        const a = attackState;
        const tx = mouseX, ty = mouseY;
        const dx = tx - spiderX, dy = ty - spiderY, d = Math.hypot(dx,dy);
        if (a.phase === 'approach') {
            const sp = S.spiderBaseSpeed * 0.9;
            if (d > 6) { spiderX += (dx/d)*sp*(dt/1000); spiderY += (dy/d)*sp*(dt/1000); }
            spiderFrameTimer += dt;
            if (spiderFrameTimer > (80 / S.spiderAnimSpeedMul)) { spiderFrameTimer = 0; spiderFrameIndex = (spiderFrameIndex+1)%S.spiderFramesCount; setSpiderFrame(spiderFrameIndex); }
            if (d < 60) { a.phase = 'charge'; a.phaseTimer = 0; a.chargeSpeed = S.spiderChaseSpeed; }
        } else if (a.phase === 'charge') {
            const sp = a.chargeSpeed;
            if (d > S.catchDist) { spiderX += (dx/d)*sp*(dt/1000); spiderY += (dy/d)*sp*(dt/1000); }
            else {
                a.phase = 'retreat';
                a.phaseTimer = 0;
                a.retx = spiderX - (dx/d)*a.retreatDist;
                a.rety = spiderY - (dy/d)*a.retreatDist;
            }
            spiderFrameTimer += dt;
            if (spiderFrameTimer > (40 / S.spiderAnimSpeedMul)) { spiderFrameTimer = 0; spiderFrameIndex = (spiderFrameIndex+1)%S.spiderFramesCount; setSpiderFrame(spiderFrameIndex); }
        } else if (a.phase === 'retreat') {
            const txr = a.retx, tyr = a.rety;
            const dxr = txr - spiderX, dyr = tyr - spiderY, dr = Math.hypot(dxr,dyr);
            const sp = a.retreatSpeed;
            if (dr > 2) { spiderX += (dxr/dr)*sp*(dt/1000); spiderY += (dyr/dr)*sp*(dt/1000); }
            else {
                a.phase = 'circle';
                a.phaseTimer = 0;
                a.circleTimer = 0;
                a.circleDuration = 400 + Math.random()*900;
                a.circleDir = (Math.random()<0.5?1:-1);
                a.circleRadius = clamp(rand(36, 96), 20, 200);
            }
            spiderFrameTimer += dt;
            if (spiderFrameTimer > (60 / S.spiderAnimSpeedMul)) { spiderFrameTimer = 0; spiderFrameIndex = (spiderFrameIndex+1)%S.spiderFramesCount; setSpiderFrame(spiderFrameIndex); }
        } else if (a.phase === 'circle') {
            a.circleTimer += dt;
            const cx = mouseX, cy = mouseY;
            const ang = Math.atan2(spiderY - cy, spiderX - cx);
            const omega = (a.circleDir * 1.8) / (a.circleRadius || 40);
            const newAng = ang + omega * (dt/1000);
            const targetX = cx + Math.cos(newAng) * a.circleRadius;
            const targetY = cy + Math.sin(newAng) * a.circleRadius;
            const dxn = targetX - spiderX, dyn = targetY - spiderY, dn = Math.hypot(dxn,dyn);
            if (dn > 1) { spiderX += (dxn/dn) * Math.min(dn, S.spiderBaseSpeed * (dt/1000)); spiderY += (dyn/dn) * Math.min(dn, S.spiderBaseSpeed * (dt/1000)); }
            spiderFrameTimer += dt;
            if (spiderFrameTimer > (80 / S.spiderAnimSpeedMul)) { spiderFrameTimer = 0; spiderFrameIndex = (spiderFrameIndex+1)%S.spiderFramesCount; setSpiderFrame(spiderFrameIndex); }
            if (a.circleTimer > a.circleDuration) {
                a.current++;
                if (a.current >= a.hits) {
                    const cb = a.cb;
                    attackState = null;
                    state = 'wander';
                    if (cb) cb();
                } else {
                    a.phase = 'approach';
                    a.phaseTimer = 0;
                }
            }
        }
    }

    // CREATE WEB IMG
    function placeWebAt(x, y, duration) {
        const img = document.createElement('img');
        img.src = S.webImgPath;
        const ws = Math.floor(rand(S.webSizeMin, S.webSizeMax));
        img.style.position = 'fixed';
        img.style.width = ws + 'px';
        img.style.height = ws + 'px';
        img.style.left = (clamp(x - ws/2, 0, window.innerWidth - ws)) + 'px';
        img.style.top = (clamp(y - ws/2, 0, window.innerHeight - ws)) + 'px';
        img.style.zIndex = 999996;
        img.style.pointerEvents = 'none';
        img.style.opacity = '1';
        img.style.transition = 'opacity 400ms linear';
        img.style.webkitTapHighlightColor = 'transparent';
        document.body.appendChild(img);
        setTimeout(()=>{ img.style.opacity='0'; setTimeout(()=>{ if (img && img.parentNode) img.parentNode.removeChild(img); }, 420); }, duration);
    }

    // MAIN LOOP
    let lastTime = nowMs();
    function loop(now) {
        const dt = now - lastTime;
        lastTime = now;

        // 1) update roaches
        updateRoaches(dt);

        // 2) spawn roaches
        if (now > nextRoachSpawnAt) {
            spawnRoachesFromEdge();
        }

        // 3) catching roaches priority
        if (roaches.length > 0) {
            const nearest = findNearestRoach(spiderX, spiderY);
            if (nearest.roach) {
                if (!(state && typeof state === 'object' && state.kind === 'chaseRoach' && state.targetId === nearest.roach.id)) {
                    startChaseRoach(nearest.roach);
                }
            }
        }

        // 4) choose roach
        if (state && typeof state === 'object' && state.kind === 'chaseRoach') {
            doChaseRoachStep(dt);
            preloadImages(spiderFrames.concat(roachFrames), () => {
                requestAnimationFrame(loop);
            });
            return;
        }

        // 5) attack on cursor
        if (state === 'attack' && attackState) {
            doAttackStep(dt);
            const ang = Math.atan2((mouseY - spiderY), (mouseX - spiderX)) * 180/Math.PI + 90;
            spiderEl.style.transform = `rotate(${ang}deg)`;
            spiderEl.style.left = (spiderX - S.spiderSize/2) + 'px';
            spiderEl.style.top = (spiderY - S.spiderSize/2) + 'px';
            requestAnimationFrame(loop); return;
        }

        // 6) walk
        const nowt = nowMs();
        if (nowt > cursorIgnoreUntil) {
            if (nowt > cursorFocusUntil && nowt > cursorIgnoreUntil) {
                if (nowt > cursorIgnoreUntil) resetCursorCycle();
            }
        }
        let targetX = spiderX, targetY = spiderY;
        let chasing = false;
        const cursorActive = mouseInitialized && nowt > cursorFocusUntil && nowt < cursorIgnoreUntil && nowt > ignoreCursorUntil;

        if (cursorActive) {
            mouseX = realMouseX; mouseY = realMouseY;
            targetX = mouseX; targetY = mouseY;
            chasing = true;
            state = 'followCursor';
        } else {
            if (!wanderState && nowt > wanderPauseUntil) {
                wanderState = true;
                wanderTargetX = rand(40, Math.max(40, window.innerWidth - 40));
                wanderTargetY = rand(40, Math.max(40, window.innerHeight - 40));
            }
            targetX = wanderTargetX; targetY = wanderTargetY;
            if (state === 'followCursor') state = 'wander';
        }
        if (nowt < spiderPauseUntil) {
            spiderFrameIndex = 0;
            setSpiderFrame(0);
        } else {
            const dx = targetX - spiderX, dy = targetY - spiderY;
            const dist = Math.hypot(dx,dy);
            const nearCursor = mouseInitialized && Math.hypot(realMouseX - spiderX, realMouseY - spiderY) < 48;
            let speed = S.spiderBaseSpeed;
            if (state === 'attack') speed = S.spiderChaseSpeed;
            else if (chasing) speed = S.spiderBaseSpeed * 0.9;
            else if (nearCursor) speed = S.spiderAngrySpeed;
            if (dist > 3 && state !== 'attack') {
                const phase = (now / 1000) + wanderPhase;
                const perpX = -dy / (dist || 1) || 0;
                const perpY = dx / (dist || 1) || 0;
                const wobble = (!chasing && !wanderState) ? Math.sin(phase * 2) * S.wobbleAmplitude : 0;
                spiderX += (dx / (dist || 1)) * speed * (dt/1000) + perpX * (wobble * (dt/1000));
                spiderY += (dy / (dist || 1)) * speed * (dt/1000) + perpY * (wobble * (dt/1000));

                spiderFrameTimer += dt;
                const interval = chasing ? (80 / S.spiderAnimSpeedMul) : (nearCursor ? (50 / S.spiderAnimSpeedMul) : (80 / S.spiderAnimSpeedMul));
                if (spiderFrameTimer > interval) { spiderFrameTimer = 0; spiderFrameIndex = (spiderFrameIndex+1)%S.spiderFramesCount; setSpiderFrame(spiderFrameIndex); }
            } else {
                spiderFrameIndex = 0;
                setSpiderFrame(0);
            }
        }
        const dxA = ( (state === 'followCursor') ? (mouseX - spiderX) : (targetX - spiderX) );
        const dyA = ( (state === 'followCursor') ? (mouseY - spiderY) : (targetY - spiderY) );
        const desiredAng = Math.atan2(dyA, dxA) * 180/Math.PI + 90;
        spiderAngle = desiredAng;
        spiderEl.style.transform = `rotate(${desiredAng}deg)`;
        spiderEl.style.left = (spiderX - S.spiderSize/2) + 'px';
        spiderEl.style.top = (spiderY - S.spiderSize/2) + 'px';
        if (Math.floor(now / 1000) % 3 === 0) saveSpider();
        if (mouseInitialized && nowt > ignoreCursorUntil && Math.hypot(realMouseX - spiderX, realMouseY - spiderY) < S.grabDist && nowt > spiderPauseUntil && (!attackState || state !== 'attack')) {
            onCatchCursor();
        }
        if (roaches.length > 0) {
            for (const r of roaches.slice()) {
                const dr = Math.hypot(r.x - spiderX, r.y - spiderY);
                if (dr < S.catchDist) {
                    onCatchRoach(r);
                    removeRoach(r);
                    spiderPauseUntil = now + rand(2000,3000);
                    break;
                }
            }
        }
        requestAnimationFrame(loop);
    }

    // INIT
    setSpiderFrame(0);
    spiderEl.style.backgroundImage = `url(${lastSpiderFrame})`;
    spiderEl.style.left = (spiderX - S.spiderSize/2) + 'px';
    spiderEl.style.top = (spiderY - S.spiderSize/2) + 'px';
    spiderEl.style.display = 'block';
    lastTime = nowMs();
    requestAnimationFrame(loop);
    window.addEventListener('resize', () => {
        wanderTargetX = clamp(wanderTargetX, 20, Math.max(20, window.innerWidth - 20));
        wanderTargetY = clamp(wanderTargetY, 20, Math.max(20, window.innerHeight - 20));
    });
    Object.defineProperty(window, 'SpiderTheatreConfig', { value: S, writable: false, configurable: true });
})();
// END
