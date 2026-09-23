"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './EtchASketch.css';

export default function EtchASketch() {
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const [isShaking, setIsShaking] = useState(false);
  const [penColor, setPenColor] = useState('#000000');
  const penColorRef = useRef(penColor);
  penColorRef.current = penColor;

  const gameState = useRef({
    x: 200,
    y: 120,
    activeKeys: {},
    speed: 5,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(gameState.current.x, gameState.current.y);
    ctx.lineTo(gameState.current.x, gameState.current.y);
    ctx.stroke();

    const handleKeyDown = (e) => {
      gameState.current.activeKeys[e.key] = true;
    };
    const handleKeyUp = (e) => {
      gameState.current.activeKeys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationFrameId;
    const updateLoop = () => {
      const state = gameState.current;
      const c = canvasRef.current;
      if (!c) {
        animationFrameId = requestAnimationFrame(updateLoop);
        return;
      }
      const ctx2 = c.getContext('2d');

      let dx = 0;
      let dy = 0;

      if (state.activeKeys['ArrowLeft'] || state.activeKeys['a']) {
        dx = -state.speed;
      }
      if (state.activeKeys['ArrowRight'] || state.activeKeys['d']) {
        dx = state.speed;
      }
      if (state.activeKeys['ArrowUp'] || state.activeKeys['w']) {
        dy = -state.speed;
      }
      if (state.activeKeys['ArrowDown'] || state.activeKeys['s']) {
        dy = state.speed;
      }

      if (dx !== 0 || dy !== 0) {
        ctx2.strokeStyle = penColorRef.current;
        ctx2.beginPath();
        ctx2.moveTo(state.x, state.y);
        state.x = Math.max(0, Math.min(c.width, state.x + dx));
        state.y = Math.max(0, Math.min(c.height, state.y + dy));
        ctx2.lineTo(state.x, state.y);
        ctx2.stroke();
      }

      animationFrameId = requestAnimationFrame(updateLoop);
    };

    animationFrameId = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const startDirection = useCallback((direction) => {
    const state = gameState.current;
    state.activeKeys[direction] = true;

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {}, 16);
  }, []);

  const stopDirection = useCallback((direction) => {
    gameState.current.activeKeys[direction] = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleShake = (e) => {
    e.stopPropagation();
    if (isShaking) return;
    setIsShaking(true);

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        gameState.current.x = canvas.width / 5;
        gameState.current.y = canvas.height / 5;
        ctx.beginPath();
        ctx.moveTo(gameState.current.x, gameState.current.y);
        ctx.lineTo(gameState.current.x, gameState.current.y);
        ctx.stroke();
      }
      setIsShaking(false);
    }, 400);
  };

  const dpadButtons = [
    { direction: 'ArrowUp', symbol: '▲', position: 'top' },
    { direction: 'ArrowRight', symbol: '►', position: 'right' },
    { direction: 'ArrowDown', symbol: '▼', position: 'bottom' },
    { direction: 'ArrowLeft', symbol: '◄', position: 'left' },
  ];

  const colorOptions = [
    '#2E62E6',
    '#22C55E',
    '#EAB308',
    '#EF4444',
    '#000000',
  ];

  return (
    <div className={`etch-toy ${isShaking ? 'shaking' : ''}`}>
      <div className="etch-brand">Etch A Sketch</div>
      <div className="etch-border">
        <canvas ref={canvasRef} width="370" height="240" className="etch-canvas" />
      </div>
      <div className="etch-controls">
        <div className="dpad">
          {dpadButtons.map(({ direction, symbol, position }) => (
            <button
              key={direction}
              className={`dpad-button dpad-button-${position}`}
              onMouseDown={() => startDirection(direction)}
              onMouseUp={() => stopDirection(direction)}
              onMouseLeave={() => stopDirection(direction)}
              onTouchStart={(e) => { e.preventDefault(); startDirection(direction); }}
              onTouchEnd={() => stopDirection(direction)}
            >
              {symbol}
            </button>
          ))}
        </div>
        <button className="shake-button" onClick={handleShake}>
          SHAKE TO ERASE
        </button>
        <div className="color-picker">
          {colorOptions.map((color) => (
            <div
              key={color}
              className={`color-option w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 active:scale-95 ${penColor === color ? 'ring-2 ring-pink-500 ring-offset-2 scale-110' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setPenColor(color)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
