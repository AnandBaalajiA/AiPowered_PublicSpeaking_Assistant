function loadGame(gameName) {
  document.getElementById('game-container').innerHTML = '';
  if (gameName === 'game1') loadGame1();
  if (gameName === 'game2') loadGame2();
  if (gameName === 'game3') loadGame3();
}
