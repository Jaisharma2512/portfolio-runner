import React, { useRef, useEffect, useState } from 'react';

const GAME_WIDTH = 1200;
const GAME_HEIGHT = 600;
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
  { x: 1150, key: 'certificates' }
];

const GRAVITY = 0.7;
const JUMP_VELOCITY = -15;
const RUN_SPEED = 5;

function RunnerGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const imagesRef = useRef({});

  const playerX = useRef(50);
  const playerY = useRef(GAME_HEIGHT - PLAYER_SIZE - 20);
  const velocityY = useRef(0);
  const isJumping = useRef(false);

  const [score, setScore] = useState(0);
  const [activeInfo, setActiveInfo] = useState(null);
  const [infoText, setInfoText] = useState('');
  const [infoVisible, setInfoVisible] = useState(false);
  const [activeOrbIndex, setActiveOrbIndex] = useState(0);

  const canvasRef = useRef(null);
  const jumpAudioRef = useRef(null);

  // Load assets on game start
  useEffect(() => {
    if (!gameStarted) return;

    const assets = {};
    let loaded = 0;
    const total = 3;

    const handleLoad = () => {
      loaded++;
      if (loaded === total) setAssetsLoaded(true);
    };

    assets.bg = new Image();
    assets.bg.src = '/server_room_bg.png';
    assets.bg.onload = handleLoad;

    assets.player = new Image();
    assets.player.src = '/dev_sprite.png';
    assets.player.onload = handleLoad;

    assets.orb = new Image();
    assets.orb.src = '/orb.png';
    assets.orb.onload = handleLoad;

    imagesRef.current = assets;
  }, [gameStarted]);

  // Handle keyboard: start, jump on UP only, pause/unpause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted && (e.key === 'f' || e.key === 'F')) {
        setGameStarted(true);
      } else if (
        gameStarted &&
        !paused &&
        e.code === 'ArrowUp' &&
        !isJumping.current
      ) {
        velocityY.current = JUMP_VELOCITY;
        isJumping.current = true;
        if (jumpAudioRef.current) {
          jumpAudioRef.current.currentTime = 0;
          jumpAudioRef.current.play();
        }
      } else if (
        gameStarted &&
        (e.key === 'p' || e.key === 'P' || e.key === 'Escape')
      ) {
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, paused]);

  // Main game loop & drawing
  useEffect(() => {
    if (!gameStarted || !assetsLoaded) return;
    if (paused) return;

    const context = canvasRef.current.getContext('2d');
    let animationFrameId;

    function draw() {
      velocityY.current += GRAVITY;
      playerY.current += velocityY.current;
      if (playerY.current > GAME_HEIGHT - PLAYER_SIZE - 20) {
        playerY.current = GAME_HEIGHT - PLAYER_SIZE - 20;
        isJumping.current = false;
        velocityY.current = 0;
      }

      playerX.current += RUN_SPEED;
      if (playerX.current > GAME_WIDTH) playerX.current = 0;

      context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Background
      context.drawImage(imagesRef.current.bg, 0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Ground
      context.fillStyle = 'rgba(30,60,90,0.3)';
      context.fillRect(0, GAME_HEIGHT - 26, GAME_WIDTH, 26);

      // Player
      context.drawImage(
        imagesRef.current.player,
        playerX.current,
        playerY.current,
        PLAYER_SIZE,
        PLAYER_SIZE
      );

      // Orbs
      const currentOrbs = orbs.slice(activeOrbIndex, activeOrbIndex + 2);
      currentOrbs.forEach(({ x, key }) => {
        if (!activeInfo || activeInfo !== key) {
          context.drawImage(imagesRef.current.orb, x, GAME_HEIGHT - 50, ORB_SIZE, ORB_SIZE);

          // Collision detection
          if (
            playerX.current + PLAYER_SIZE > x &&
            playerX.current < x + ORB_SIZE &&
            playerY.current + PLAYER_SIZE > GAME_HEIGHT - 50 &&
            playerY.current + PLAYER_SIZE < GAME_HEIGHT - 18
          ) {
            setActiveInfo(key);
            setScore((s) => s + 1);
            setActiveOrbIndex((idx) => Math.min(idx + 1, orbs.length - 2));
          }
        }
      });

      // Score
      context.fillStyle = '#eee';
      context.font = '22px Arial';
      context.fillText('Orbs collected: ' + score, 18, 38);

      animationFrameId = requestAnimationFrame(draw);
    }
    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameStarted, assetsLoaded, activeInfo, score, activeOrbIndex, paused]);

  // Animate info text typing effect
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
    }, 30);
    return () => clearInterval(intervalId);
  }, [activeInfo]);

  // Hide info overlay after 8 seconds
  useEffect(() => {
    if (!infoVisible) return;
    const timerId = setTimeout(() => {
      setInfoVisible(false);
      setActiveInfo(null);
      setInfoText('');
    }, 8000);
    return () => clearTimeout(timerId);
  }, [infoVisible]);

  const linkStyle = {
    color: '#4cd9ff',
    textDecoration: 'underline',
    cursor: 'pointer',
  };

  const introCloudStyle = {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: 550,
    padding: '30px 40px',
    background: 'linear-gradient(135deg, #cce7ff 0%, #e5f3ff 100%)',
    borderRadius: '60px / 70px',
    boxShadow: '0 20px 30px rgba(0,123,255,0.25)',
    textAlign: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    userSelect: 'none',
    zIndex: 10,
    color: '#333',
  };

  return (
    <>
      <div style={{ position: 'relative', width: GAME_WIDTH, margin: '20px auto' }}>
        {!gameStarted && (
          <div style={introCloudStyle}>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: 20 }}>
              Hi I am Jai a Devops Engineer from Himalayas and this is my cloud journey
            </p>
            <p style={{ marginTop: 12, fontSize: 16, color: '#666' }}>
              Press <strong>F</strong> to start the game
            </p>
          </div>
        )}

        <audio ref={jumpAudioRef} src="/mariojump.mp3" preload="auto" />

        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          style={{
            backgroundColor: '#1a1a23',
            borderRadius: 8,
            boxShadow: '0 0 28px #2af',
            display: 'block',
          }}
        />

        {gameStarted && paused && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 28,
              color: '#4cd9ff',
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '20px 40px',
              borderRadius: 12,
              boxShadow: '0 0 20px #0ef',
              userSelect: 'none',
              zIndex: 20,
              textAlign: 'center',
            }}
          >
            Game Paused
            <div style={{ fontSize: 16, marginTop: 8 }}>Press P or Escape to resume</div>
          </div>
        )}

        {infoVisible && (
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(30,30,60,0.95)',
              color: '#c1eaff',
              borderRadius: 12,
              boxShadow: '0 0 20px #0ef',
              padding: '32px 44px',
              fontSize: 21,
              maxWidth: 600,
              zIndex: 20,
              textAlign: 'center',
              letterSpacing: 1,
              userSelect: 'none',
              pointerEvents: 'auto',
            }}
          >
            <strong style={{ color: '#4cd9ff', fontSize: 24, letterSpacing: 1 }}>
              {activeInfo && activeInfo.charAt(0).toUpperCase() + activeInfo.slice(1)}
            </strong>
            <div style={{ marginTop: 14 }}>{infoText}</div>

            {activeInfo === 'about' && (
              <div style={{ marginTop: 22 }}>
                <a href={links.github} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                  GitHub Profile
                </a>{' '}
                |{' '}
                <a href={links.linkedin} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                  LinkedIn Profile
                </a>
                <p style={{ marginTop: 10, fontStyle: 'italic' }}>
                  Freelancer on Fiverr:{' '}
                  <a href={links.freelancer} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    Visit Fiverr Profile
                  </a>
                </p>
              </div>
            )}

            {activeInfo === 'skills' && (
              <div style={{ marginTop: 22 }}>
                <p>My Cloud and DevOps Skills in action!</p>
              </div>
            )}

            {activeInfo === 'projects' && (
              <div style={{ marginTop: 22 }}>
                <p>
                  <a href={links.smallboyLive} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    Smallboy Live
                  </a>{' '}
                  |{' '}
                  <a href={links.smallboyProject} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    Smallboy GitHub
                  </a>
                </p>
                <p>
                  <a href={links.securityPlaygroundLive} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    Security Playground Live
                  </a>{' '}
                  |{' '}
                  <a href={links.securityPlaygroundProject} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    Security Playground GitHub
                  </a>
                </p>
              </div>
            )}

            {activeInfo === 'certificates' && (
              <div style={{ marginTop: 22 }}>
                <p>
                  <a href={links.gceCert} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    Google Associate Cloud Engineer Certificate
                  </a>
                </p>
                <p>
                  <a href={links.ieeeCert} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    IEEE Certificate of Appreciation
                  </a>
                </p>
              </div>
            )}
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#4cd9ff',
            fontSize: 18,
            fontWeight: 'bold',
            backgroundColor: 'rgba(20,20,40,0.8)',
            padding: '6px 20px',
            borderRadius: 20,
            userSelect: 'none',
            zIndex: 30,
            pointerEvents: 'none',
          }}
        >
          Press UP ARROW to jump, Press P or ESC to pause/resume
        </div>
      </div>
    </>
  );
}

export default RunnerGame;
