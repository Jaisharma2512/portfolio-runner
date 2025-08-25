import React, { useRef, useEffect, useState } from 'react';
import styles from './RunnerGame.module.css';

const PLAYER_SIZE = 96;
const ORB_SIZE = 48;

const portfolioInfo = {
  about: 'DevOps Engineer with 2 years of experience automating infrastructure and building robust CI/CD pipelines.',
  skills: 'Expert in Google Cloud, Terraform, Jenkins, Kubernetes, Docker, Ansible, ArgoCD, Helm, and more.',
  projects: 'Security Playground & Smallboy: deployed robust cloud-native solutions with automated pipelines.',
  certificates: 'Google Cloud Associate Cloud Engineer & IEEE Appreciation.',
};

const links = {
  github: 'https://github.com/Jaisharma2512/Smallboy',
  linkedin: 'https://www.linkedin.com/in/jaisharma2512/',
  smallboyProject: 'https://github.com/Jaisharma2512/Smallboy/tree/k8s-resources',
  securityPlaygroundProject: 'https://github.com/Jaisharma2512/security-playground',
  smallboyLive: 'https://smallboy.danklofan.com',
  securityPlaygroundLive: 'https://sc.danklofan.com',
  freelancer: 'https://www.fiverr.com/sellers/jaisharma2512/edit',
  gceCert: 'https://www.credly.com/badges/cc43f249-f710-4c80-b8f1-2aee8011d07f/public_url',
  ieeeCert: 'https://drive.google.com/file/d/1C24ksyNmTdIhgfdjhaLbmhy0RD326OR-/view?usp=sharing',
};

const orbs = [
  { x: 300, key: 'about' },
  { x: 650, key: 'skills' },
  { x: 950, key: 'projects' },
  { x: 1150, key: 'certificates' },
];

function getCanvasSize() {
  const isMobile = window.innerWidth <= 800;
  const maxWidth = isMobile ? window.innerWidth * 0.97 : 900;
  const minWidth = 320;
  const width = Math.max(Math.min(window.innerWidth * 0.97, maxWidth), minWidth);
  const height = isMobile
    ? Math.max(window.innerHeight * 0.46, width * 9 / 16, 230)
    : Math.max(width * 9 / 16, 400);
  return { width, height };
}

const GRAVITY = 0.7;
const JUMP_VELOCITY = -15;
const RUN_SPEED = 5;

function RunnerGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState(getCanvasSize());
  const imagesRef = useRef({});
  const playerX = useRef(50);
  const playerY = useRef(canvasSize.height - PLAYER_SIZE - 20);
  const velocityY = useRef(0);
  const isJumping = useRef(false);

  const [score, setScore] = useState(0);
  const [activeInfo, setActiveInfo] = useState(null);
  const [infoText, setInfoText] = useState('');
  const [infoVisible, setInfoVisible] = useState(false);
  const [activeOrbIndex, setActiveOrbIndex] = useState(0);

  const canvasRef = useRef(null);
  const jumpAudioRef = useRef(null);

  // Responsive canvas update on window resize
  useEffect(() => {
    const handleResize = () => {
      const size = getCanvasSize();
      setCanvasSize(size);
      playerY.current = size.height - PLAYER_SIZE - 20;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load assets after game starts
  useEffect(() => {
    if (!gameStarted) return;
    const assets = {};
    let loaded = 0;
    const total = 3;

    const handleLoad = () => {
      loaded++;
      if (loaded === total) setAssetsLoaded(true);
    };

    assets.bg = new window.Image();
    assets.bg.src = '/server_room_bg.png';
    assets.bg.onload = handleLoad;

    assets.player = new window.Image();
    assets.player.src = '/dev_sprite.png';
    assets.player.onload = handleLoad;

    assets.orb = new window.Image();
    assets.orb.src = '/orb.png';
    assets.orb.onload = handleLoad;

    imagesRef.current = assets;
  }, [gameStarted]);

  // Keyboard/touch controls for game interactions
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted && (e.key === 'f' || e.key === 'F')) {
        setGameStarted(true);
      } else if (gameStarted && !paused && e.code === 'ArrowUp' && !isJumping.current) {
        velocityY.current = JUMP_VELOCITY;
        isJumping.current = true;
        if (jumpAudioRef.current) {
          jumpAudioRef.current.currentTime = 0;
          jumpAudioRef.current.play();
        }
      } else if (gameStarted && (e.key === 'p' || e.key === 'P' || e.key === 'Escape')) {
        setPaused((p) => !p);
      }
    };

    const handleTap = () => {
      if (!gameStarted) setGameStarted(true);
      else if (!paused && !isJumping.current) {
        velocityY.current = JUMP_VELOCITY;
        isJumping.current = true;
        if (jumpAudioRef.current) {
          jumpAudioRef.current.currentTime = 0;
          jumpAudioRef.current.play();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchstart', handleTap);
      canvas.addEventListener('click', handleTap);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTap);
        canvas.removeEventListener('click', handleTap);
      }
    };
  }, [gameStarted, paused]);

  // Main game loop & rendering
  useEffect(() => {
    if (!gameStarted || !assetsLoaded) return;
    if (paused) return;

    const ctx = canvasRef.current.getContext('2d');
    let animationFrameId;

    function draw() {
      velocityY.current += GRAVITY;
      playerY.current += velocityY.current;
      if (playerY.current > canvasSize.height - PLAYER_SIZE - 20) {
        playerY.current = canvasSize.height - PLAYER_SIZE - 20;
        isJumping.current = false;
        velocityY.current = 0;
      }

      playerX.current += RUN_SPEED;
      if (playerX.current > canvasSize.width) playerX.current = 0;

      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

      ctx.drawImage(imagesRef.current.bg, 0, 0, canvasSize.width, canvasSize.height);

      ctx.fillStyle = 'rgba(30,60,90,0.3)';
      ctx.fillRect(0, canvasSize.height - 26, canvasSize.width, 26);

      ctx.drawImage(
        imagesRef.current.player,
        playerX.current,
        playerY.current,
        PLAYER_SIZE,
        PLAYER_SIZE
      );

      const currentOrbs = orbs.slice(activeOrbIndex, activeOrbIndex + 2);
      currentOrbs.forEach(({ x, key }, idx) => {
        const orbX = (x / 1200) * canvasSize.width;
        const orbY = canvasSize.height - 50;
        if (!activeInfo || activeInfo !== key) {
          ctx.drawImage(imagesRef.current.orb, orbX, orbY, ORB_SIZE, ORB_SIZE);

          if (
            playerX.current + PLAYER_SIZE > orbX &&
            playerX.current < orbX + ORB_SIZE &&
            playerY.current + PLAYER_SIZE > orbY &&
            playerY.current < orbY + ORB_SIZE
          ) {
            setActiveInfo(key);
            setScore((s) => s + 1);
            setActiveOrbIndex((idx) => Math.min(idx + 1, orbs.length - 2));
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    }
    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameStarted, assetsLoaded, activeInfo, score, activeOrbIndex, paused, canvasSize]);

  // Typing effect for info text display
  useEffect(() => {
    if (!activeInfo) return;
    setInfoVisible(true);
    let i = 0;
    const text = portfolioInfo[activeInfo];
    setInfoText('');
    const intervalId = setInterval(() => {
      setInfoText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(intervalId);
    }, 20);
    return () => clearInterval(intervalId);
  }, [activeInfo]);

  // Hide info overlay after timeout
  useEffect(() => {
    if (!infoVisible) return;
    const timerId = setTimeout(() => {
      setInfoVisible(false);
      setActiveInfo(null);
      setInfoText('');
    }, 7000);
    return () => clearTimeout(timerId);
  }, [infoVisible]);

  // Info window content builder
  function renderInfoWindow() {
    if (!infoVisible || !activeInfo) return null;
    // Colors
    const blue = '#61dfff';
    const textStyle = { color: blue, marginBottom: 12, fontWeight: 700, fontSize: 22, textAlign: 'center', textShadow: "0 0 8px #1119" };
    return (
      <div
        style={{
          position: 'absolute',
          top: '13%',
          left: '50%',
          transform: 'translate(-50%, 0)',
          minWidth: 320,
          maxWidth: 420,
          padding: '28px 18px',
          background: 'rgba(16,32,49,0.87)',
          borderRadius: 18,
          boxShadow: '0 4px 28px #126',
          zIndex: 200,
          border: '1.5px solid #1658ff21',
          fontFamily: 'inherit',
        }}
      >
        <div style={textStyle}>
          {activeInfo.charAt(0).toUpperCase() + activeInfo.slice(1)}
        </div>
        <div style={{ color: '#e8f4ff', fontWeight: 500, fontSize: 16, textAlign: 'center', marginBottom: 18 }}>
          {infoText}
        </div>
        {/* Custom links/sections depending on info key */}
        {activeInfo === 'about' && (
          <div style={{ marginTop: 6 }}>
            <a href={links.github} target="_blank" rel="noopener noreferrer" style={{ color: blue, textDecoration: 'underline', fontSize: 16, marginRight: 10 }}>GitHub</a>
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: blue, textDecoration: 'underline', fontSize: 16 }}>LinkedIn</a>
            <div style={{ marginTop: 8 }}>
              <a href={links.freelancer} target="_blank" rel="noopener noreferrer" style={{ color: blue, textDecoration: 'underline', fontSize: 16 }}>Fiverr</a>
            </div>
          </div>
        )}
        {activeInfo === 'skills' && (
          <div style={{ marginTop: 6 }}>
            <span style={{ color: blue, fontWeight: 600 }}>Cloud • DevOps • Automation</span>
          </div>
        )}
        {activeInfo === 'projects' && (
          <div style={{ marginTop: 6, textAlign: 'left' }}>
            <div style={{ marginBottom: 7 }}>
              <span style={{ color: blue, fontWeight: 600 }}>Smallboy:</span>{' '}
              <a href={links.smallboyProject} target="_blank" rel="noopener noreferrer" style={{ color: blue, textDecoration: 'underline', fontSize: 15 }}>GitHub</a>
              {' | '}
              <a href={links.smallboyLive} target="_blank" rel="noopener noreferrer" style={{ color: blue, textDecoration: 'underline', fontSize: 15 }}>Live Link</a>
            </div>
            <div>
              <span style={{ color: blue, fontWeight: 600 }}>Security Playground:</span>{' '}
              <a href={links.securityPlaygroundProject} target="_blank" rel="noopener noreferrer" style={{ color: blue, textDecoration: 'underline', fontSize: 15 }}>GitHub</a>
              {' | '}
              <a href={links.securityPlaygroundLive} target="_blank" rel="noopener noreferrer" style={{ color: blue, textDecoration: 'underline', fontSize: 15 }}>Live Link</a>
            </div>
          </div>
        )}
        {activeInfo === 'certificates' && (
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <a href={links.gceCert} target="_blank" rel="noopener noreferrer" style={{ color: blue, textDecoration: 'underline', fontSize: 16 }}>Google Associate Cloud Engineer Certificate</a>
            <a href={links.ieeeCert} target="_blank" rel="noopener noreferrer" style={{ color: blue, textDecoration: 'underline', fontSize: 16 }}>IEEE Certificate of Appreciation</a>
          </div>
        )}
      </div>
    );
  }

  // Unified top bar: orbs + instruction
  function renderTopBar() {
    return (
      <div
        style={{
          position: 'absolute',
          top: 15,
          left: 34,
          width: '96%',
          zIndex: 101,
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
          fontFamily: 'inherit',
        }}
      >
        <span style={{
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 23,
          textShadow: '0 0 9px #381',
          marginRight: 30,
        }}>
          Orbs collected: {score}
        </span>
        <span style={{
          color: '#FFA80F',
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 0.5,
          marginLeft: 0,
          whiteSpace: 'nowrap',
          textShadow: '0 0 8px #222'
        }}>
          Press UP ARROW to jump, Press P or ESC to pause/resume
        </span>
      </div>
    );
  }

  return (
    <div className="runner-container" style={{ position: 'relative', width: '100%', maxWidth: 900, margin: '20px auto' }}>
      {renderTopBar()}

      {!gameStarted && (
        <div className={styles.introCloud}>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: 20 }}>
            Hi I am Jai a Devops Engineer from Himalayas and this is my cloud journey
          </p>
          <p style={{ marginTop: 12, fontSize: 16, color: '#666' }}>
            Press <strong>F</strong> to start the game or tap the game area
          </p>
        </div>
      )}

      <audio ref={jumpAudioRef} src="/mariojump.mp3" preload="auto" />
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          backgroundColor: '#1a1a23',
          borderRadius: 8,
          boxShadow: '0 0 28px #2af',
          display: 'block',
          width: '100%',
          maxWidth: canvasSize.width,
        }}
      />

      {gameStarted && paused && (
        <div className={styles.pauseOverlay}>
          Game Paused
          <div style={{ fontSize: 16, marginTop: 8 }}>Press P or Escape to resume</div>
        </div>
      )}

      {renderInfoWindow()}

      <div className={styles.controlsReminder} />
    </div>
  );
}

export default RunnerGame;
