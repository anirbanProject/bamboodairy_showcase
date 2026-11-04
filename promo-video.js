/**
 * PROMOTIONAL SHOWCASE VIDEO GENERATOR (9:16 - 1080x1920)
 * Choreographed 38-second high-end portfolio advertisement for:
 * Instagram Reels, YouTube Shorts, TikTok, LinkedIn & Facebook.
 */

(function () {
  'use strict';

  const DURATION = 38.0; // 38 seconds
  const FPS = 30;
  const CANVAS_W = 1080;
  const CANVAS_H = 1920;
  const TOTAL_FRAMES = 230;

  // DOM Elements
  const canvas = document.getElementById('promoCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const timelineSlider = document.getElementById('timelineSlider');
  const currentTimeLabel = document.getElementById('currentTimeLabel');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const restartBtn = document.getElementById('restartBtn');
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioOnIcon = document.getElementById('audioOnIcon');
  const audioOffIcon = document.getElementById('audioOffIcon');
  const currentSceneBadge = document.getElementById('currentSceneBadge');
  const recordExportBtn = document.getElementById('recordExportBtn');
  const recordBtnText = document.getElementById('recordBtnText');
  const recordStatus = document.getElementById('recordStatus');
  const customDeveloperName = document.getElementById('customDeveloperName');
  const customCallToAction = document.getElementById('customCallToAction');

  // Video State
  const state = {
    currentTime: 0,
    isPlaying: true,
    isRecording: false,
    audioEnabled: true,
    lastRafTime: 0,
    images: {},
    productFrames: [],
    mediaRecorder: null,
    recordedChunks: [],
    audioCtx: null,
    audioDest: null
  };

  // Preload key images for mockups
  const assetUrls = {
    frame1: 'ezgif-51777e019c6fdfc6-jpg/ezgif-frame-001.jpg',
    frame48: 'ezgif-51777e019c6fdfc6-jpg/ezgif-frame-048.jpg',
    frame80: 'ezgif-51777e019c6fdfc6-jpg/ezgif-frame-080.jpg',
    frame140: 'ezgif-51777e019c6fdfc6-jpg/ezgif-frame-140.jpg',
    frame185: 'ezgif-51777e019c6fdfc6-jpg/ezgif-frame-185.jpg',
    frame220: 'ezgif-51777e019c6fdfc6-jpg/ezgif-frame-220.jpg'
  };

  // Preload rotating frames (every 2nd frame for 360 simulation)
  const rotatingFrameIndices = [];
  for (let i = 1; i <= TOTAL_FRAMES; i += 2) {
    rotatingFrameIndices.push(i);
  }

  function preloadAssets() {
    // Preload key assets
    for (const [key, url] of Object.entries(assetUrls)) {
      const img = new Image();
      img.src = url;
      img.onload = () => { state.images[key] = img; };
    }

    // Preload rotation frames
    rotatingFrameIndices.forEach((idx, i) => {
      const pad = String(idx).padStart(3, '0');
      const img = new Image();
      img.src = `ezgif-51777e019c6fdfc6-jpg/ezgif-frame-${pad}.jpg`;
      img.onload = () => { state.productFrames[i] = img; };
    });
  }

  preloadAssets();

  // ==========================================================================
  // BACKGROUND AUDIO SYNTHESIZER (Luxury Ambient Lo-Fi Chill Chords)
  // ==========================================================================
  let synthInterval = null;

  function initAudio() {
    if (state.audioCtx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    state.audioCtx = new AudioCtx();
    state.audioDest = state.audioCtx.createMediaStreamDestination();
    
    // Master gain
    const masterGain = state.audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.18, state.audioCtx.currentTime);
    masterGain.connect(state.audioDest);
    masterGain.connect(state.audioCtx.destination);
    state.masterGain = masterGain;

    // Ambient chords progression: Fmaj7 -> Gsus4 -> Am7 -> Em7
    const chords = [
      [349.23, 440.00, 523.25, 659.25], // Fmaj7
      [392.00, 493.88, 587.33, 659.25], // G
      [440.00, 523.25, 659.25, 783.99], // Am7
      [329.63, 392.00, 493.88, 587.33]  // Em7
    ];

    let chordIdx = 0;
    function playChord() {
      if (!state.audioCtx || !state.audioEnabled) return;
      const now = state.audioCtx.currentTime;
      const chord = chords[chordIdx % chords.length];
      chordIdx++;

      chord.forEach((freq, i) => {
        const osc = state.audioCtx.createOscillator();
        const gain = state.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.04 - i * 0.005, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        // Lowpass filter for warm velvety tone
        const filter = state.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(state.masterGain);

        osc.start(now);
        osc.stop(now + 4.0);
      });

      // Subtle soft kick pulse
      const kick = state.audioCtx.createOscillator();
      const kickGain = state.audioCtx.createGain();
      kick.frequency.setValueAtTime(110, now);
      kick.frequency.exponentialRampToValueAtTime(35, now + 0.25);
      kickGain.gain.setValueAtTime(0.12, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      kick.connect(kickGain);
      kickGain.connect(state.masterGain);
      kick.start(now);
      kick.stop(now + 0.26);
    }

    playChord();
    synthInterval = setInterval(playChord, 3800);
  }

  // ==========================================================================
  // SCENE DRAWING ROUTINES (1080 x 1920 CANVAS)
  // ==========================================================================

  // Background atmosphere: dark moss gradient, ambient aura, particles
  function drawBackground(t) {
    // Base gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bgGrad.addColorStop(0, '#040d07');
    bgGrad.addColorStop(0.35, '#08170d');
    bgGrad.addColorStop(0.7, '#0a1d10');
    bgGrad.addColorStop(1, '#030805');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Glowing ambient circular auras
    const auraX = 540 + Math.sin(t * 0.8) * 80;
    const auraY = 960 + Math.cos(t * 0.6) * 120;
    const radGrad = ctx.createRadialGradient(auraX, auraY, 50, auraX, auraY, 650);
    radGrad.addColorStop(0, 'rgba(184, 240, 76, 0.16)');
    radGrad.addColorStop(0.5, 'rgba(25, 75, 40, 0.12)');
    radGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Floating subtle particles / light motes
    ctx.fillStyle = 'rgba(184, 240, 76, 0.25)';
    for (let i = 0; i < 20; i++) {
      const px = (Math.sin(i * 12.3 + t * 0.4) * 0.5 + 0.5) * CANVAS_W;
      const py = ((i * 96 + t * 45) % CANVAS_H);
      const pr = (Math.sin(i + t) * 0.5 + 1.5) * 2;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Top Hook Badge (Pill)
  function drawTopPill(badgeText) {
    const pillY = 120;
    ctx.save();
    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    const textWidth = ctx.measureText(badgeText).width;
    const pillW = textWidth + 60;
    const pillH = 54;
    const pillX = (CANVAS_W - pillW) / 2;

    // Pill background
    ctx.fillStyle = 'rgba(184, 240, 76, 0.12)';
    ctx.strokeStyle = 'rgba(184, 240, 76, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 27);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = '#b8f04c';
    ctx.fillText(badgeText, CANVAS_W / 2, pillY + 35);
    ctx.restore();
  }

  // Main Typography Block
  function drawHeadline(line1, line2, line3 = '', accentColor = '#b8f04c') {
    ctx.save();
    ctx.textAlign = 'center';

    ctx.font = '800 68px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 24;
    ctx.fillText(line1, CANVAS_W / 2, 240);

    ctx.fillText(line2, CANVAS_W / 2, 320);

    if (line3) {
      ctx.fillStyle = accentColor;
      ctx.font = '700 78px "Caveat", cursive';
      ctx.shadowColor = 'rgba(184, 240, 76, 0.4)';
      ctx.shadowBlur = 30;
      ctx.fillText(line3, CANVAS_W / 2, 410);
    }
    ctx.restore();
  }

  // Draw realistic MacBook Pro frame with live rotating product website inside!
  function drawMacBookMockup(x, y, w, h, t, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const screenW = w;
    const screenH = h;
    const cornerR = 24;

    // Outer Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 50;
    ctx.shadowOffsetY = 30;

    // Aluminum Bezel
    ctx.fillStyle = '#1c221e';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-screenW / 2, -screenH / 2, screenW, screenH, cornerR);
    ctx.fill();
    ctx.stroke();
    ctx.shadowColor = 'transparent';

    // Screen Glass
    const inset = 16;
    const innerW = screenW - inset * 2;
    const innerH = screenH - inset * 2 - 20;
    const innerX = -screenW / 2 + inset;
    const innerY = -screenH / 2 + inset;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(innerX, innerY, innerW, innerH, 12);
    ctx.clip();

    // Draw rotating video product frame inside MacBook screen
    const frameIndex = Math.floor((t * 22) % (state.productFrames.length || 1));
    const activeFrame = state.productFrames[frameIndex] || state.images.frame1;

    if (activeFrame && activeFrame.complete) {
      ctx.drawImage(activeFrame, innerX, innerY, innerW, innerH);
    } else {
      ctx.fillStyle = '#07120a';
      ctx.fillRect(innerX, innerY, innerW, innerH);
    }

    // Mini Floating Pill Nav on MacBook Screen
    const navW = 380;
    const navH = 28;
    const navX = innerX + (innerW - navW) / 2;
    const navY = innerY + 16;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(navX, navY, navW, navH, 14);
    ctx.fill();

    ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#07120a';
    ctx.textAlign = 'center';
    ctx.fillText('ANIRBAN MANDAL    Showcase    Specs    Contact', navX + navW / 2, navY + 18);

    // Mini Headline Over Product
    ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 10;
    ctx.fillText('Crafted by Nature.', innerX + 40, innerY + 120);

    ctx.font = '700 28px "Caveat", cursive';
    ctx.fillStyle = '#b8f04c';
    ctx.fillText('Engineered for Focus.', innerX + 40, innerY + 155);

    // Mini CTA Pill
    ctx.fillStyle = '#b8f04c';
    ctx.beginPath();
    ctx.roundRect(innerX + 40, innerY + 180, 110, 32, 16);
    ctx.fill();
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#07120a';
    ctx.fillText('Order Now →', innerX + 60, innerY + 200);

    ctx.restore();

    // MacBook Base / Notch
    ctx.fillStyle = '#2a332d';
    ctx.beginPath();
    ctx.roundRect(-screenW / 2 - 40, screenH / 2 - 4, screenW + 80, 18, [0, 0, 12, 12]);
    ctx.fill();

    ctx.fillStyle = '#1c221e';
    ctx.beginPath();
    ctx.roundRect(-50, screenH / 2 - 4, 100, 8, [0, 0, 6, 6]);
    ctx.fill();

    ctx.restore();
  }

  // Draw realistic iPhone 15 Pro frame with mobile responsive view
  function drawIPhoneMockup(x, y, w, h, t, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const cornerR = 52;

    // Phone Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 35;

    // Titanium Edge
    ctx.fillStyle = '#1d231f';
    ctx.strokeStyle = 'rgba(184, 240, 76, 0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, cornerR);
    ctx.fill();
    ctx.stroke();
    ctx.shadowColor = 'transparent';

    // Screen Area
    const bezel = 14;
    const sW = w - bezel * 2;
    const sH = h - bezel * 2;
    const sX = -w / 2 + bezel;
    const sY = -h / 2 + bezel;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(sX, sY, sW, sH, cornerR - 10);
    ctx.clip();

    // Mobile Background
    const frameIndex = Math.floor((t * 22) % (state.productFrames.length || 1));
    const activeFrame = state.productFrames[frameIndex] || state.images.frame1;

    if (activeFrame && activeFrame.complete) {
      // Draw zoomed crop to simulate responsive vertical portrait cover
      const srcW = activeFrame.width * 0.55;
      const srcH = activeFrame.height;
      const srcX = activeFrame.width * 0.25;
      ctx.drawImage(activeFrame, srcX, 0, srcW, srcH, sX, sY, sW, sH);
    }

    // Dynamic Island
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(-60, sY + 14, 120, 32, 16);
    ctx.fill();

    // Mobile Glass Header Bar
    ctx.fillStyle = 'rgba(10, 24, 15, 0.75)';
    ctx.fillRect(sX, sY, sW, 85);
    ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText('ANIRBAN MANDAL', sX + 24, sY + 60);

    // Mobile Hamburger Icon
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sX + sW - 50, sY + 48, 24, 3);
    ctx.fillRect(sX + sW - 50, sY + 56, 24, 3);
    ctx.fillRect(sX + sW - 50, sY + 64, 24, 3);

    // Mobile Glassmorphic Card
    const cardY = sY + 220;
    ctx.fillStyle = 'rgba(10, 24, 15, 0.65)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(sX + 20, cardY, sW - 40, 290, 20);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#b8f04c';
    ctx.fillText('100% ORGANIC TIMBER', sX + 40, cardY + 36);

    ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Crafted by Nature.', sX + 40, cardY + 70);

    ctx.font = '700 26px "Caveat", cursive';
    ctx.fillStyle = '#b8f04c';
    ctx.fillText('Engineered for Focus.', sX + 40, cardY + 104);

    ctx.font = '400 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#a3b8aa';
    ctx.fillText('Sustainable bamboo stationery for everyday ideas.', sX + 40, cardY + 135);

    // Mobile Order Button
    ctx.fillStyle = '#b8f04c';
    ctx.beginPath();
    ctx.roundRect(sX + 40, cardY + 165, sW - 80, 44, 22);
    ctx.fill();
    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#07120a';
    ctx.textAlign = 'center';
    ctx.fillText('Order Now →', sX + sW / 2, cardY + 192);

    // Mini 360 Scrubber indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(sX + 40, cardY + 235, sW - 80, 8, 4);
    ctx.fill();

    const sliderDotX = sX + 40 + ((t * 40) % (sW - 80));
    ctx.fillStyle = '#b8f04c';
    ctx.beginPath();
    ctx.arc(sliderDotX, cardY + 239, 8, 0, Math.PI * 2);
    ctx.fill();

    // Mobile Home Indicator Bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.roundRect(-70, sY + sH - 18, 140, 5, 2.5);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }

  // Draw 3 Feature Glass Cards
  function drawFeatureCards(y, t) {
    const cards = [
      { num: '01', title: 'Solid Bamboo Cover', desc: 'Laser-cut & Hand Sanded', img: state.images.frame1 },
      { num: '02', title: 'Precision Pen Dock', desc: 'Weighted Stylus Ballpoint', img: state.images.frame48 },
      { num: '03', title: 'Twin-Wire Binding', desc: '360° Lay-Flat Steel Wire', img: state.images.frame185 }
    ];

    const cardW = 920;
    const cardH = 150;
    const startY = y;

    cards.forEach((c, idx) => {
      const curY = startY + idx * 175;
      const stagger = Math.sin(t * 1.5 + idx * 0.6) * 6;

      ctx.save();
      ctx.translate(540, curY + stagger);

      // Card Background
      ctx.fillStyle = 'rgba(16, 36, 22, 0.75)';
      ctx.strokeStyle = 'rgba(184, 240, 76, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
      ctx.fill();
      ctx.stroke();

      // Thumbnail Image
      if (c.img && c.img.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(-cardW / 2 + 15, -cardH / 2 + 15, 150, cardH - 30, 12);
        ctx.clip();
        ctx.drawImage(c.img, -cardW / 2 + 15, -cardH / 2 + 15, 150, cardH - 30);
        ctx.restore();
      }

      // Card Copy
      ctx.textAlign = 'left';
      ctx.font = '700 16px "Space Grotesk", monospace';
      ctx.fillStyle = '#b8f04c';
      ctx.fillText(c.num + ' • FEATURE', -cardW / 2 + 190, -cardH / 2 + 48);

      ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(c.title, -cardW / 2 + 190, -cardH / 2 + 88);

      ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#a3b8aa';
      ctx.fillText(c.desc, -cardW / 2 + 190, -cardH / 2 + 120);

      ctx.restore();
    });
  }

  // Draw Bottom Client Acquisition Banner
  function drawBottomCTA(t) {
    const bottomY = 1720;
    const devName = (customDeveloperName ? customDeveloperName.value : '') || 'Anirban Mandal';
    const ctaText = (customCallToAction ? customCallToAction.value : '') || 'Contact Anirban Mandal for Website Projects';

    ctx.save();
    ctx.translate(540, bottomY);

    // Glowing CTA Box
    ctx.fillStyle = 'rgba(10, 24, 15, 0.9)';
    ctx.strokeStyle = 'rgba(184, 240, 76, 0.45)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(184, 240, 76, 0.3)';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.roundRect(-480, -90, 960, 160, 24);
    ctx.fill();
    ctx.stroke();

    // Pulse dot
    const pulse = (Math.sin(t * 3) + 1) * 0.5;
    ctx.fillStyle = `rgba(184, 240, 76, ${0.4 + pulse * 0.6})`;
    ctx.beginPath();
    ctx.arc(-430, -25, 10 + pulse * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.font = '800 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(devName, -400, -15);

    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#b8f04c';
    ctx.fillText(ctaText, -400, 30);

    ctx.restore();
  }

  // ==========================================================================
  // MASTER TIMELINE RENDERER (0.0s – 38.0s)
  // ==========================================================================
  function renderTimeline(t) {
    if (!ctx) return;
    drawBackground(t);

    // --- SCENE 1 (0.0s – 7.5s): THE HOOK ---
    if (t < 7.5) {
      if (currentSceneBadge) currentSceneBadge.textContent = 'Scene 1: Intro by Anirban Mandal';
      drawTopPill('🚀 ANIRBAN MANDAL • WEB DEVELOPMENT');
      drawHeadline('Looking for a', 'Premium Website', 'for Your Business?');

      const mockY = 1040 + Math.sin(t * 1.5) * 12;
      drawMacBookMockup(540, mockY, 820, 520, t, 1.0);

      // Feature Badge
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#a3b8aa';
      ctx.fillText('Custom Web Architecture & 3D Experiences by Anirban Mandal', 540, 1420);
      ctx.restore();

      drawBottomCTA(t);
    }
    // --- SCENE 2 (7.5s – 15.0s): CINEMATIC 3D VIDEO SHOWCASE ---
    else if (t < 15.0) {
      if (currentSceneBadge) currentSceneBadge.textContent = 'Scene 2: Cinematic 3D Hero';
      drawTopPill('✨ ANIRBAN MANDAL • 3D WEB DESIGN');
      drawHeadline('Cinematic Background.', 'Smooth 360° Interaction.', 'Engineered for Focus.');

      // Centered larger rotating 3D view
      const mockY = 1000 + Math.sin(t * 1.2) * 10;
      drawMacBookMockup(540, mockY, 940, 580, t, 1.08);

      // Floating Feature Ribbon
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '700 26px "Space Grotesk", monospace';
      ctx.fillStyle = '#b8f04c';
      const angle = Math.round(((t * 30) % 360));
      ctx.fillText(`↺ 360° Real-Time Rotation • Angle: ${angle}° • 60 FPS`, 540, 1440);
      ctx.restore();

      drawBottomCTA(t);
    }
    // --- SCENE 3 (15.0s – 23.0s): INTERACTIVE PRODUCT EXPERIENCE ---
    else if (t < 23.0) {
      if (currentSceneBadge) currentSceneBadge.textContent = 'Scene 3: Product Highlights';
      drawTopPill('💡 ANIRBAN MANDAL • INTERACTIVE ENGINEERING');
      drawHeadline('Engaging Details That', 'Turn Visitors Into Buyers.');

      // 3 High-resolution feature cards
      drawFeatureCards(580, t);

      // Value prop pill
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#a3b8aa';
      ctx.fillText('✓ Custom Ruling Selector  ✓ Live Laser Engraving  ✓ Instant Cart', 540, 1340);
      ctx.restore();

      drawBottomCTA(t);
    }
    // --- SCENE 4 (23.0s – 31.0s): 100% MOBILE RESPONSIVE ---
    else if (t < 31.0) {
      if (currentSceneBadge) currentSceneBadge.textContent = 'Scene 4: Mobile Responsive';
      drawTopPill('📱 ANIRBAN MANDAL • RESPONSIVE LAB');
      drawHeadline('Flawless on Every Device.', 'Desktop, Tablet & Mobile.', 'Responsive Design.');

      // iPhone 15 Pro Showcase
      const phoneY = 1050 + Math.sin(t * 1.5) * 10;
      drawIPhoneMockup(540, phoneY, 440, 880, t, 1.0);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#a3b8aa';
      ctx.fillText('Engineered by Anirban Mandal  •  Zero Horizontal Overflow', 540, 1560);
      ctx.restore();

      drawBottomCTA(t);
    }
    // --- SCENE 5 (31.0s – 38.0s): CALL TO ACTION & OUTRO ---
    else {
      if (currentSceneBadge) currentSceneBadge.textContent = 'Scene 5: Outro by Anirban Mandal';
      drawTopPill('🚀 WORK WITH ANIRBAN MANDAL');
      drawHeadline("Let's Build Your", 'Digital Presence.', 'Contact Anirban Mandal.');

      // Agency Card Centerpiece
      ctx.save();
      ctx.translate(540, 960);

      ctx.fillStyle = 'rgba(16, 36, 22, 0.85)';
      ctx.strokeStyle = 'rgba(184, 240, 76, 0.4)';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(184, 240, 76, 0.35)';
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.roundRect(-440, -320, 880, 640, 32);
      ctx.fill();
      ctx.stroke();

      const devName = (customDeveloperName ? customDeveloperName.value : '') || 'Anirban Mandal';
      const ctaText = (customCallToAction ? customCallToAction.value : '') || 'Contact Anirban Mandal';

      ctx.textAlign = 'center';
      ctx.font = '800 52px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(184, 240, 76, 0.4)';
      ctx.shadowBlur = 15;
      ctx.fillText(devName, 0, -180);
      ctx.shadowColor = 'transparent';

      ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#b8f04c';
      ctx.fillText('Premium Website Development & Creative Engineering', 0, -120);

      // Bullet checklist
      const bullets = [
        '✓ Bespoke 3D & Cinematic Web Design by Anirban Mandal',
        '✓ High-Performance Smooth 60 FPS Web Experiences',
        '✓ Full-Stack Custom Web Architecture & E-Commerce',
        '✓ 100% Responsive on Desktop, Tablet & Mobile'
      ];

      ctx.font = '600 23px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#a3b8aa';
      ctx.textAlign = 'left';
      bullets.forEach((b, i) => {
        ctx.fillText(b, -380, -40 + i * 50);
      });

      // Big Pulsing CTA Button
      const pulse = (Math.sin(t * 4) + 1) * 0.5;
      ctx.fillStyle = '#b8f04c';
      ctx.shadowColor = 'rgba(184, 240, 76, 0.6)';
      ctx.shadowBlur = 20 + pulse * 15;
      ctx.beginPath();
      ctx.roundRect(-360, 180, 720, 80, 40);
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#07120a';
      ctx.fillText(ctaText + ' →', 0, 232);

      ctx.restore();

      drawBottomCTA(t);
    }
  }

  // ==========================================================================
  // PLAYBACK & RECORDING ENGINE
  // ==========================================================================
  function animate(timestamp) {
    if (!state.lastRafTime) state.lastRafTime = timestamp;
    const delta = (timestamp - state.lastRafTime) / 1000;
    state.lastRafTime = timestamp;

    if (state.isPlaying) {
      state.currentTime += delta;
      if (state.currentTime >= DURATION) {
        if (state.isRecording) {
          stopRecording();
          state.currentTime = DURATION;
          state.isPlaying = false;
        } else {
          state.currentTime = 0; // loop
        }
      }

      if (timelineSlider && !state.isDraggingSlider) {
        timelineSlider.value = state.currentTime;
      }
      updateTimerDisplay();
    }

    renderTimeline(state.currentTime);
    requestAnimationFrame(animate);
  }

  function updateTimerDisplay() {
    const mins = Math.floor(state.currentTime / 60);
    const secs = Math.floor(state.currentTime % 60);
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (currentTimeLabel) currentTimeLabel.textContent = formatted;
  }

  // Play / Pause Toggle
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      initAudio();
      state.isPlaying = !state.isPlaying;
      if (playIcon && pauseIcon) {
        playIcon.style.display = state.isPlaying ? 'none' : 'block';
        pauseIcon.style.display = state.isPlaying ? 'block' : 'none';
      }
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      state.currentTime = 0;
      state.isPlaying = true;
      if (playIcon && pauseIcon) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
      }
    });
  }

  // Timeline Slider
  if (timelineSlider) {
    timelineSlider.addEventListener('input', (e) => {
      state.currentTime = parseFloat(e.target.value);
      updateTimerDisplay();
    });
  }

  // Scene Jump Buttons
  document.querySelectorAll('.scene-item').forEach(item => {
    item.addEventListener('click', () => {
      const time = parseFloat(item.getAttribute('data-time'));
      if (!isNaN(time)) {
        state.currentTime = time;
        if (timelineSlider) timelineSlider.value = time;
        updateTimerDisplay();
        document.querySelectorAll('.scene-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      }
    });
  });

  // Audio Toggle
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      initAudio();
      state.audioEnabled = !state.audioEnabled;
      if (audioOnIcon && audioOffIcon) {
        audioOnIcon.style.display = state.audioEnabled ? 'block' : 'none';
        audioOffIcon.style.display = state.audioEnabled ? 'none' : 'block';
      }
    });
  }

  // ==========================================================================
  // EXPORT RECORDING VIA MEDIARECORDER (1080x1920 Full HD Video)
  // ==========================================================================
  function startRecording() {
    initAudio();
    state.isRecording = true;
    state.currentTime = 0;
    state.isPlaying = true;
    state.recordedChunks = [];

    if (recordExportBtn) recordExportBtn.classList.add('recording');
    if (recordBtnText) recordBtnText.textContent = 'Recording Video (0%...)';
    if (recordStatus) recordStatus.textContent = 'Rendering 1080x1920 video at 30 FPS. Please wait...';

    // Canvas video stream (30 FPS)
    const canvasStream = canvas.captureStream(30);

    // Audio stream if available
    let combinedStream;
    if (state.audioDest && state.audioDest.stream) {
      const audioTracks = state.audioDest.stream.getAudioTracks();
      combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioTracks
      ]);
    } else {
      combinedStream = canvasStream;
    }

    // Try VP9 or VP8
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    try {
      state.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: mimeType,
        videoBitsPerSecond: 10000000 // 10 Mbps crisp quality
      });
    } catch (e) {
      console.warn('Fallback standard MediaRecorder', e);
      state.mediaRecorder = new MediaRecorder(combinedStream);
    }

    state.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        state.recordedChunks.push(e.data);
      }
    };

    state.mediaRecorder.onstop = () => {
      downloadRecordedVideo();
    };

    state.mediaRecorder.start();

    // Track recording progress
    const progressInterval = setInterval(() => {
      if (!state.isRecording) {
        clearInterval(progressInterval);
        return;
      }
      const pct = Math.min(100, Math.round((state.currentTime / DURATION) * 100));
      if (recordBtnText) recordBtnText.textContent = `Recording (${pct}%)...`;
    }, 500);
  }

  function stopRecording() {
    if (!state.isRecording) return;
    state.isRecording = false;

    if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
      state.mediaRecorder.stop();
    }

    if (recordExportBtn) recordExportBtn.classList.remove('recording');
    if (recordBtnText) recordBtnText.textContent = 'Record & Download Video';
    if (recordStatus) recordStatus.textContent = 'Video processed successfully! Downloading...';
  }

  function downloadRecordedVideo() {
    const blob = new Blob(state.recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'web-development-showcase-1080x1920.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
  }

  if (recordExportBtn) {
    recordExportBtn.addEventListener('click', () => {
      if (!state.isRecording) {
        startRecording();
      } else {
        stopRecording();
      }
    });
  }

  // Start animation loop
  requestAnimationFrame(animate);

})();
