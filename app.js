/**
 * ANIRBAN MANDAL - LUXURY BAMBOO STATIONERY SHOWCASE
 * Features:
 * - 230-Frame Cinematic Canvas Player (Auto-Loop + Interactive 360° Scrubbing)
 * - Inertial Drag & Touch Rotation Controller
 * - Hotspot Camera Jump Targets
 * - Interactive Paper Ruling Simulator
 * - Real-Time Laser Engraving Customizer
 * - Slide-Out Eco-Cart Drawer & Order Calculator
 * - Web Audio Forest Ambience Generator
 * - Active ScrollSpy & Navigation
 */

(function () {
  'use strict';

  // --- Configuration ---
  const TOTAL_FRAMES = 230;
  const ASSET_PATH = 'ezgif-51777e019c6fdfc6-jpg';
  
  // Format frame number to 3-digit string (e.g., 1 -> "001")
  function getFrameSrc(index) {
    const pad = String(index).padStart(3, '0');
    return `${ASSET_PATH}/ezgif-frame-${pad}.jpg`;
  }

  // --- State ---
  const state = {
    currentFrame: 1,
    targetFrame: 1,
    isPlaying: true,
    playbackSpeed: 1.0, // 0.5x, 1.0x, 1.5x, 2.0x
    isDragging: false,
    dragStartX: 0,
    dragStartFrame: 1,
    loadedFramesCount: 0,
    frames: new Array(TOTAL_FRAMES + 1),
    audioEnabled: false,
    audioCtx: null,
    audioGain: null,
    cartQty: 1,
    cartPricePerUnit: 38.00,
    shippingThreshold: 50.00,
    rulingStyle: 'College Ruled',
    engravingText: 'ANIRBAN MANDAL'
  };

  // --- DOM Elements ---
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const fallbackImg = document.getElementById('heroFallbackImg');
  const frameSlider = document.getElementById('frameSlider');
  const hudAngle = document.getElementById('hudAngle');
  const hudModeLabel = document.getElementById('hudModeLabel');
  const togglePlaybackBtn = document.getElementById('togglePlaybackBtn');
  const resetRotationBtn = document.getElementById('resetRotationBtn');
  const hudSpeedBtn = document.getElementById('hudSpeedBtn');
  const overlay = document.getElementById('interactiveCanvasOverlay');
  const dragHint = document.getElementById('dragHint');

  // Cart / Modal Elements
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const openCartBtn = document.getElementById('openCartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartCount = document.getElementById('cartCount');
  const subtotalPrice = document.getElementById('subtotalPrice');
  const totalPrice = document.getElementById('totalPrice');
  const shippingCost = document.getElementById('shippingCost');
  const shippingMsg = document.getElementById('shippingMsg');
  const shippingBar = document.getElementById('shippingBar');
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const qtyDisplay = document.getElementById('qtyDisplay');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const successModal = document.getElementById('successModal');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  const orderRefNum = document.getElementById('orderRefNum');

  // Interactive Ruling & Engraving
  const sheetPaper = document.getElementById('sheetPaper');
  const sheetPattern = document.getElementById('sheetPattern');
  const engraveInput = document.getElementById('engraveInput');
  const applyEngraveBtn = document.getElementById('applyEngraveBtn');
  const engraveTextDisplay = document.getElementById('engraveTextDisplay');
  const modalEngraveInput = document.getElementById('modalEngraveInput');

  // Audio Toggle
  const soundToggle = document.getElementById('soundToggle');

  // Mobile Nav
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');

  // ==========================================================================
  // 1. CINEMATIC 360 CANVAS PLAYER & PROGRESSIVE ASSET STREAMER
  // ==========================================================================

  // Dynamic High-DPI canvas resizing to ensure maximum pixel clarity on all devices
  function updateCanvasDimensions() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // 2x Retina sampling for ultra-crisp detail

    const targetWidth = Math.round((rect.width || window.innerWidth) * dpr);
    const targetHeight = Math.round((rect.height || window.innerHeight) * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    if (state.frames[state.currentFrame]) {
      renderFrame(state.currentFrame);
    }
  }

  // Draw current frame to canvas with responsive 'cover' scaling and smart mobile focus
  function renderFrame(frameIndex) {
    if (!ctx || !canvas) return;
    const img = state.frames[frameIndex];
    if (!img || !img.complete) return;

    // Canvas buffer dimensions
    const cWidth = canvas.width;
    const cHeight = canvas.height;

    // High quality bicubic filtering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Calculate aspect ratio cover
    const imgWidth = img.naturalWidth || img.width || 1920;
    const imgHeight = img.naturalHeight || img.height || 1080;
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = cWidth / cHeight;
    let renderW, renderH, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      renderW = cWidth;
      renderH = cWidth / imgRatio;
      offsetX = 0;
      offsetY = (cHeight - renderH) / 2;
    } else {
      renderH = cHeight;
      renderW = cHeight * imgRatio;
      // On narrow mobile portrait screens, center focus slightly toward the bamboo product (~56% across)
      const focalRatio = canvasRatio < 1.0 ? 0.58 : 0.5;
      offsetX = (cWidth - renderW) * focalRatio;
      offsetY = 0;
    }

    ctx.clearRect(0, 0, cWidth, cHeight);
    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);

    // Update HUD angle (0° to 360°)
    const angle = Math.round(((frameIndex - 1) / TOTAL_FRAMES) * 360);
    if (hudAngle) hudAngle.textContent = `${angle}°`;
    if (frameSlider && !state.isDragging) frameSlider.value = frameIndex;
  }

  // Preload frame helper
  function loadSingleFrame(index) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = getFrameSrc(index);
      img.onload = () => {
        state.frames[index] = img;
        state.loadedFramesCount++;
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Frame ${index} failed to load`);
        resolve(null);
      };
    });
  }

  // Progressive frame loading:
  // Phase 1: Load Frame 1 immediately (0ms perceived load)
  // Phase 2: Load keyframes every 3rd frame (1, 4, 7... ~76 frames) for immediate smooth 30fps spin
  // Phase 3: Fill in remaining frames in background
  async function initProgressiveLoading() {
    // Phase 1: Frame 1
    await loadSingleFrame(1);
    renderFrame(1);
    if (fallbackImg) fallbackImg.style.opacity = '0';

    // Phase 2: Keyframes
    const keyframeIndices = [];
    for (let i = 1; i <= TOTAL_FRAMES; i += 3) {
      if (i !== 1) keyframeIndices.push(i);
    }
    
    // Batch load keyframes
    await Promise.all(keyframeIndices.map(i => loadSingleFrame(i)));

    // Phase 3: Remaining frames
    const remainingIndices = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      if (!state.frames[i]) remainingIndices.push(i);
    }

    // Stream remaining in chunks of 10 to keep browser responsive
    for (let i = 0; i < remainingIndices.length; i += 10) {
      const chunk = remainingIndices.slice(i, i + 10);
      await Promise.all(chunk.map(idx => loadSingleFrame(idx)));
    }
  }

  // Main Animation Loop
  let lastTimestamp = 0;
  const BASE_FPS = 30;

  function animationLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = timestamp - lastTimestamp;
    const frameInterval = 1000 / (BASE_FPS * state.playbackSpeed);

    if (state.isPlaying && !state.isDragging && delta >= frameInterval) {
      lastTimestamp = timestamp;
      state.currentFrame = (state.currentFrame % TOTAL_FRAMES) + 1;
      
      // If frame is loaded, render it; otherwise find nearest loaded frame
      if (state.frames[state.currentFrame]) {
        renderFrame(state.currentFrame);
      } else {
        // Find nearest loaded
        for (let d = 1; d <= 5; d++) {
          const testPlus = ((state.currentFrame + d - 1) % TOTAL_FRAMES) + 1;
          if (state.frames[testPlus]) {
            renderFrame(testPlus);
            break;
          }
        }
      }
    }

    requestAnimationFrame(animationLoop);
  }

  // Smooth jump to specific frame (e.g., from hotspots or highlights)
  function smoothJumpToFrame(target) {
    state.isPlaying = false;
    updatePlaybackHUD();
    
    const start = state.currentFrame;
    let diff = target - start;
    
    // Pick shortest rotational path around 360 circle
    if (diff > TOTAL_FRAMES / 2) diff -= TOTAL_FRAMES;
    if (diff < -TOTAL_FRAMES / 2) diff += TOTAL_FRAMES;

    const steps = 24;
    let stepCount = 0;

    function step() {
      stepCount++;
      const progress = stepCount / steps;
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      let nextFrame = Math.round(start + diff * ease);
      
      while (nextFrame > TOTAL_FRAMES) nextFrame -= TOTAL_FRAMES;
      while (nextFrame < 1) nextFrame += TOTAL_FRAMES;

      state.currentFrame = nextFrame;
      if (state.frames[nextFrame]) renderFrame(nextFrame);

      if (stepCount < steps) {
        requestAnimationFrame(step);
      } else {
        state.currentFrame = target;
        renderFrame(target);
      }
    }

    requestAnimationFrame(step);
  }

  // Update HUD text and buttons
  function updatePlaybackHUD() {
    if (hudModeLabel) {
      hudModeLabel.textContent = state.isPlaying ? 'Cinematic Loop' : '360° Manual';
    }
    if (togglePlaybackBtn) {
      const pauseIcon = togglePlaybackBtn.querySelector('.icon-pause');
      const playIcon = togglePlaybackBtn.querySelector('.icon-play');
      if (pauseIcon && playIcon) {
        pauseIcon.style.display = state.isPlaying ? 'block' : 'none';
        playIcon.style.display = state.isPlaying ? 'none' : 'block';
      }
    }
  }

  // ==========================================================================
  // 2. INTERACTIVE 360 DRAG & SCRUBBING CONTROLLER
  // ==========================================================================
  if (overlay) {
    // Mouse / Touch Start
    const handleStart = (e) => {
      state.isDragging = true;
      state.isPlaying = false;
      updatePlaybackHUD();
      if (dragHint) dragHint.style.opacity = '0';

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      state.dragStartX = clientX;
      state.dragStartFrame = state.currentFrame;
    };

    // Mouse / Touch Move
    const handleMove = (e) => {
      if (!state.isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - state.dragStartX;
      
      // Sensitivity: ~4px drag = 1 frame
      const sensitivity = 4;
      const frameDelta = Math.floor(deltaX / sensitivity);
      
      let newFrame = (state.dragStartFrame - frameDelta) % TOTAL_FRAMES;
      while (newFrame < 1) newFrame += TOTAL_FRAMES;
      while (newFrame > TOTAL_FRAMES) newFrame -= TOTAL_FRAMES;

      state.currentFrame = newFrame;
      if (state.frames[newFrame]) {
        renderFrame(newFrame);
      }
    };

    // Mouse / Touch End
    const handleEnd = () => {
      state.isDragging = false;
    };

    overlay.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    overlay.addEventListener('touchstart', handleStart, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd);
  }

  // Slider Scrubber
  if (frameSlider) {
    frameSlider.addEventListener('input', (e) => {
      state.isPlaying = false;
      updatePlaybackHUD();
      const val = parseInt(e.target.value, 10);
      state.currentFrame = val;
      if (state.frames[val]) renderFrame(val);
    });
  }

  // HUD Controls
  if (togglePlaybackBtn) {
    togglePlaybackBtn.addEventListener('click', () => {
      state.isPlaying = !state.isPlaying;
      updatePlaybackHUD();
      triggerSoftChime(440);
    });
  }

  if (resetRotationBtn) {
    resetRotationBtn.addEventListener('click', () => {
      smoothJumpToFrame(1);
      triggerSoftChime(523.25);
    });
  }

  if (hudSpeedBtn) {
    const speeds = [0.5, 1.0, 1.5, 2.0];
    hudSpeedBtn.addEventListener('click', () => {
      const idx = speeds.indexOf(state.playbackSpeed);
      const nextIdx = (idx + 1) % speeds.length;
      state.playbackSpeed = speeds[nextIdx];
      hudSpeedBtn.textContent = `${state.playbackSpeed.toFixed(1)}x`;
      triggerSoftChime(659.25);
    });
  }

  // Hotspot Pins on Hero
  document.querySelectorAll('.hotspot-pin').forEach(pin => {
    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      const frame = parseInt(pin.getAttribute('data-frame'), 10);
      smoothJumpToFrame(frame);
      triggerSoftChime(587.33);
    });
  });

  // Highlight Cards Jump Click
  document.querySelectorAll('.highlight-card, [data-jump]').forEach(el => {
    el.addEventListener('click', () => {
      const target = el.getAttribute('data-jump-frame') || el.getAttribute('data-jump');
      if (target) {
        const frame = parseInt(target, 10);
        smoothJumpToFrame(frame);
        // Smooth scroll back up to hero if user wants to see it
        const heroSection = document.getElementById('hero');
        if (heroSection && window.scrollY > 400) {
          heroSection.scrollIntoView({ behavior: 'smooth' });
        }
        triggerSoftChime(659.25);
      }
    });
  });

  // ==========================================================================
  // 3. INTERACTIVE RULING SELECTOR & SHEET SIMULATOR
  // ==========================================================================
  const rulingTabs = document.querySelectorAll('.ruling-tab');
  rulingTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      rulingTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const ruling = tab.getAttribute('data-ruling');
      if (sheetPattern) {
        sheetPattern.className = 'sheet-pattern';
        if (ruling === 'ruled') sheetPattern.classList.add('pattern-ruled');
        if (ruling === 'grid') sheetPattern.classList.add('pattern-grid');
        if (ruling === 'blank') sheetPattern.classList.add('pattern-blank');
      }

      // Update state
      state.rulingStyle = tab.textContent.trim();
      updateModalRuling(state.rulingStyle);
      triggerSoftChime(493.88);
    });
  });

  function updateModalRuling(styleName) {
    const pills = document.querySelectorAll('#modalRulingPills .opt-pill');
    pills.forEach(p => {
      if (p.getAttribute('data-ruling') === styleName) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // 4. REAL-TIME LASER ENGRAVING PREVIEW
  // ==========================================================================
  function applyEngraving(val) {
    const cleaned = (val || '').trim() || 'ANIRBAN MANDAL';
    state.engravingText = cleaned;
    if (engraveTextDisplay) engraveTextDisplay.textContent = cleaned;
    if (modalEngraveInput) modalEngraveInput.value = cleaned === 'ANIRBAN MANDAL' ? '' : cleaned;
  }

  if (applyEngraveBtn && engraveInput) {
    applyEngraveBtn.addEventListener('click', () => {
      applyEngraving(engraveInput.value);
      triggerSoftChime(523.25);
    });

    engraveInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        applyEngraving(engraveInput.value);
        triggerSoftChime(523.25);
      }
    });
  }

  if (modalEngraveInput) {
    modalEngraveInput.addEventListener('input', (e) => {
      applyEngraving(e.target.value);
    });
  }

  // ==========================================================================
  // 5. SLIDE-OUT ORDER DRAWER & CHECKOUT CALCULATOR
  // ==========================================================================
  function openCart() {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.add('open');
      cartOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      updateCartTotals();
      triggerSoftChime(659.25);
    }
  }

  function closeCart() {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.remove('open');
      cartOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('.open-order-modal').forEach(btn => {
    btn.addEventListener('click', openCart);
  });

  if (openCartBtn) openCartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Cart Quantity +/-
  if (qtyMinus) {
    qtyMinus.addEventListener('click', () => {
      if (state.cartQty > 1) {
        state.cartQty--;
        updateCartTotals();
        triggerSoftChime(392);
      }
    });
  }

  if (qtyPlus) {
    qtyPlus.addEventListener('click', () => {
      state.cartQty++;
      updateCartTotals();
      triggerSoftChime(587.33);
    });
  }

  // Modal Ruling Pills
  document.querySelectorAll('#modalRulingPills .opt-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#modalRulingPills .opt-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.rulingStyle = pill.getAttribute('data-ruling');
      triggerSoftChime(523.25);
    });
  });

  // Calculate Subtotal, Shipping, Total
  function updateCartTotals() {
    if (qtyDisplay) qtyDisplay.textContent = state.cartQty;
    if (cartCount) cartCount.textContent = state.cartQty;

    const subtotal = state.cartQty * state.cartPricePerUnit;
    const isFreeShipping = subtotal >= state.shippingThreshold;
    const shipping = isFreeShipping ? 0 : 4.95;
    const total = subtotal + shipping;

    if (subtotalPrice) subtotalPrice.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingCost) shippingCost.textContent = isFreeShipping ? 'FREE' : `$${shipping.toFixed(2)}`;
    if (totalPrice) totalPrice.textContent = `$${total.toFixed(2)}`;

    // Progress bar
    if (shippingBar && shippingMsg) {
      if (isFreeShipping) {
        shippingBar.style.width = '100%';
        shippingMsg.textContent = '🎉 Congratulations! You have unlocked FREE Carbon-Neutral Shipping!';
      } else {
        const remaining = state.shippingThreshold - subtotal;
        const pct = Math.min(100, Math.round((subtotal / state.shippingThreshold) * 100));
        shippingBar.style.width = `${pct}%`;
        shippingMsg.textContent = `Add $${remaining.toFixed(2)} more for FREE Carbon-Neutral Shipping!`;
      }
    }
  }

  // Checkout Flow
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      closeCart();
      const randRef = Math.floor(10000 + Math.random() * 90000);
      if (orderRefNum) orderRefNum.textContent = randRef;
      if (successModal) {
        successModal.classList.add('active');
        triggerSoftChime(880);
      }
    });
  }

  if (closeSuccessBtn && successModal) {
    closeSuccessBtn.addEventListener('click', () => {
      successModal.classList.remove('active');
    });
  }

  // ==========================================================================
  // 6. GENERATIVE WEB AUDIO CALM FOREST AMBIENCE & CHIMES
  // ==========================================================================
  function initAudioContext() {
    if (!state.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        state.audioCtx = new AudioCtx();
        state.audioGain = state.audioCtx.createGain();
        state.audioGain.gain.setValueAtTime(0.08, state.audioCtx.currentTime);
        state.audioGain.connect(state.audioCtx.destination);
      }
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
  }

  // Gentle pentatonic bamboo chime tone for tactile feedback
  function triggerSoftChime(freq = 523.25) {
    if (!state.audioCtx) return;
    try {
      const osc = state.audioCtx.createOscillator();
      const gain = state.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, state.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.06, state.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, state.audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(state.audioGain || state.audioCtx.destination);

      osc.start();
      osc.stop(state.audioCtx.currentTime + 1.2);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // Ambient Forest Breeze Synthesizer (Filtered White Noise Generator)
  let noiseNode = null;
  function startForestNoise() {
    if (!state.audioCtx) return;
    const bufferSize = state.audioCtx.sampleRate * 2;
    const noiseBuffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Pink noise generation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    noiseNode = state.audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    // Filter to simulate bamboo leaves rustling in breeze
    const filter = state.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, state.audioCtx.currentTime);

    noiseNode.connect(filter);
    filter.connect(state.audioGain);
    noiseNode.start();
  }

  function stopForestNoise() {
    if (noiseNode) {
      try { noiseNode.stop(); } catch (e) {}
      noiseNode = null;
    }
  }

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      initAudioContext();
      state.audioEnabled = !state.audioEnabled;
      
      const iconOn = soundToggle.querySelector('.sound-icon-on');
      const iconOff = soundToggle.querySelector('.sound-icon-off');
      
      if (state.audioEnabled) {
        if (iconOn) iconOn.style.display = 'block';
        if (iconOff) iconOff.style.display = 'none';
        soundToggle.classList.add('active');
        startForestNoise();
        triggerSoftChime(659.25);
      } else {
        if (iconOn) iconOn.style.display = 'none';
        if (iconOff) iconOff.style.display = 'block';
        soundToggle.classList.remove('active');
        stopForestNoise();
      }
    });
  }

  // ==========================================================================
  // 7. ACTIVE NAVIGATION SCROLLSPY & SMOOTH SCROLLING
  // ==========================================================================
  const navLinks = document.querySelectorAll('.pill-link');
  const sections = document.querySelectorAll('section[id], footer[id]');

  function updateScrollSpy() {
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          if (link.getAttribute('data-nav') === id) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateScrollSpy, { passive: true });

  // Mobile Menu Drawer
  if (mobileMenuBtn && mobileDrawer && drawerBackdrop) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.add('open');
      drawerBackdrop.classList.add('active');
    });

    const closeMobile = () => {
      mobileDrawer.classList.remove('open');
      drawerBackdrop.classList.remove('active');
    };

    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeMobile);
    drawerBackdrop.addEventListener('click', closeMobile);
    document.querySelectorAll('.mobile-nav-link').forEach(l => l.addEventListener('click', closeMobile));
  }

  // Newsletter Form
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterMsg = document.getElementById('newsletterMsg');
  if (newsletterForm && newsletterMsg) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      newsletterMsg.textContent = '🌿 Thank you! Welcome to the Anirban Mandal Atelier.';
      newsletterForm.reset();
      triggerSoftChime(659.25);
    });
  }

  // ==========================================================================
  // 8. INITIALIZATION & RESPONSIVE EVENT HANDLERS
  // ==========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    updateCanvasDimensions();
    initProgressiveLoading();
    requestAnimationFrame(animationLoop);
    updatePlaybackHUD();
    updateCartTotals();
  });

  // Debounced window resize for High-DPI canvas re-sampling
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateCanvasDimensions();
    }, 100);
  }, { passive: true });

  window.addEventListener('orientationchange', () => {
    setTimeout(updateCanvasDimensions, 200);
  }, { passive: true });

  // Pause playback when tab is backgrounded to save mobile battery and resume smoothly
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      state.isTabVisible = false;
    } else {
      state.isTabVisible = true;
      lastTimestamp = performance.now();
      updateCanvasDimensions();
    }
  });

})();
