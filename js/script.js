const grid = document.querySelector('#grid');
const spanPlayer = document.querySelector('#player-name');
const timer = document.querySelector('#timer');
const playerInput = document.querySelector('#player-input');
const startButton = document.querySelector('#start-button');
const restartButton = document.querySelector('#restart-button');
const inputContainer = document.querySelector('.input-container');
const rankingTableBody = document.querySelector('#ranking-table-body');
const clearRankingButton = document.querySelector('#clear-ranking');
const flipSound = document.querySelector('#flip-sound');
const matchSound = document.querySelector('#match-sound');
const victorySound = document.querySelector('#victory-sound');
const backgroundSound = document.querySelector('#background-music');
const buttonSound = document.querySelector('#button-sound');
const volumeControlButton = document.querySelector('#volume-control');

flipSound.volume = 0.3; 
matchSound.volume = 1; 
victorySound.volume = 0.5; 
backgroundSound.volume = 0.015; 
buttonSound.volume = 1; 


const characters = [
  'computador-portatil',
  'educacao-online',
  'escola',
  'espiando',
  'laboratorio',
  'ler',
  'macarrao',
  'notebook'
];

const createElement = (tag, className) => {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}

let firstCard = null;
let secondCard = null;
let loop = null;
let gameStarted = false;
let attempts = 0;

const getRanking = () => {
  const ranking = localStorage.getItem('ranking');
  return ranking ? JSON.parse(ranking) : [];
}

const saveRanking = (name, time, attempts) => {
  const ranking = getRanking();
  ranking.push({ name, time, attempts });
  ranking.sort((a, b) => a.time - b.time); 
  localStorage.setItem('ranking', JSON.stringify(ranking));
  displayRanking();
}

const displayRanking = () => {
  const ranking = getRanking();
  rankingTableBody.innerHTML = ranking.map(({ name, time, attempts }) => `
    <tr>
      <td>${name}</td>
      <td>${time}</td>
      <td>${attempts}</td>
    </tr>
  `).join('');
}

const clearRanking = () => {
  localStorage.removeItem('ranking');
  displayRanking();
}

const checkEndGame = () => {
  const disabledCards = document.querySelectorAll('.disabled-card');

  if (disabledCards.length === characters.length * 2) {
    clearInterval(loop);
    const time = +timer.innerHTML;
    const playerName = spanPlayer.innerHTML;
    alert(`Parabéns, ${playerName}! Seu tempo foi de: ${time}s!`);
    saveRanking(playerName, time, attempts);
    victorySound.play();
    backgroundSound.pause();
    backgroundSound.currentTime = 0;
  }
}

const createCard = (character) => {
  const card = createElement('div', 'card');
  const front = createElement('div', 'face front');
  const back = createElement('div', 'face back');

  front.style.backgroundImage = `url('./img/${character}.png')`;

  card.appendChild(front);
  card.appendChild(back);

  card.addEventListener('click', revealCard);
  card.setAttribute('data-character', character);

  return card;
}

const checkCards = () => {
  const firstCharacter = firstCard.getAttribute('data-character');
  const secondCharacter = secondCard.getAttribute('data-character');

  if (firstCharacter === secondCharacter) {
    firstCard.firstChild.classList.add('disabled-card', 'matched');
    secondCard.firstChild.classList.add('disabled-card', 'matched');
    matchSound.play();
    firstCard = null;
    secondCard = null;
    checkEndGame();
  } else {
    setTimeout(() => {
      firstCard.classList.remove('reveal-card');
      secondCard.classList.remove('reveal-card');
      firstCard = null;
      secondCard = null;
    }, 500);
  }
}

const revealCard = ({ target }) => {
  if (target.parentNode.className.includes('reveal-card') || target.parentNode.firstChild.className.includes('disabled-card') || !gameStarted) {
    return;
  }

  if (firstCard === null) {
    target.parentNode.classList.add('reveal-card');
    firstCard = target.parentNode;
    flipSound.play();
  } else if (secondCard === null) {
    target.parentNode.classList.add('reveal-card');
    secondCard = target.parentNode;
    flipSound.play();
    attempts++;
    checkCards();
  }
}

const loadGame = () => {
  grid.innerHTML = ''; 
  const duplicateCharacters = [...characters, ...characters];
  const shuffledArray = duplicateCharacters.sort(() => Math.random() - 0.5);

  shuffledArray.forEach((character) => {
    const card = createCard(character);
    grid.appendChild(card);
  });

  const cards = document.querySelectorAll('.card');
  cards.forEach(card => card.classList.add('reveal-card'));

  setTimeout(() => {
    cards.forEach(card => card.classList.remove('reveal-card'));
    gameStarted = true;
  }, 1500);
}

const startTimer = () => {
  clearInterval(loop);
  timer.innerHTML = '0';
  loop = setInterval(() => {
    const currentTime = +timer.innerHTML;
    timer.innerHTML = currentTime + 1;
  }, 1000);
}

const startGame = () => {
  const playerName = playerInput.value.trim();
  if (playerName) {
    localStorage.setItem('player', playerName);
    spanPlayer.innerHTML = playerName;
    inputContainer.style.display = 'none';
    gameStarted = false;
    attempts = 0;
    startTimer();
    loadGame();
    playButtonSound();
    
    backgroundSound.play().catch(error => console.error('Error playing background sound:', error));
  } else {
    alert('Para começar o jogo, não esqueça de digitar o seu nome na caixinha abaixo!🥰😺.');
  }
}

const resetGame = () => {
  clearInterval(loop);
  timer.innerHTML = '0';
  grid.innerHTML = '';
  inputContainer.style.display = 'flex';
  gameStarted = false;
  backgroundSound.pause();  
  backgroundSound.currentTime = 0;  
}

startButton.addEventListener('click', () => {
  playButtonSound();
  startGame();
});

restartButton.addEventListener('click', () => {
  playButtonSound();
  resetGame();
});

clearRankingButton.addEventListener('click', () => {
  playButtonSound();
  clearRanking();
});

window.onload = () => {
  resetGame();
  displayRanking();
}

const playButtonSound = () => {
  buttonSound.play();
}

// Função para controlar o volume
const toggleVolume = () => {
  if (backgroundSound.muted) {
    backgroundSound.muted = false;
    volumeControlButton.innerHTML = '🔊'; // Alterar ícone para som ativado
  } else {
    backgroundSound.muted = true;
    volumeControlButton.innerHTML = '🔈'; // Alterar ícone para som desativado
  }
}

// Evento do botão de controle de volume
volumeControlButton.addEventListener('click', toggleVolume);
