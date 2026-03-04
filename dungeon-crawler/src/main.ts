import { Game } from './Game';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

  if (canvas) {
    new Game(canvas);
  } else {
    console.error('Canvas element not found!');
  }
});
