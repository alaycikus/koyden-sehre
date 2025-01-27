// Seviye tıklama olayını tanımla
document.querySelectorAll('.level').forEach(level => {
  level.addEventListener('click', () => {
    const selectedLevel = level.getAttribute('data-level');
    if (selectedLevel === 'mesutlu') {
      window.location.href = 'mesutlu.html';
    }
  });
});

// Grid oluşturma
document.addEventListener('DOMContentLoaded', generateGrid);

function generateGrid() {
  const gridContainer = document.querySelector('.grid');
  gridContainer.innerHTML = ''; // Grid'i temizle

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 8; col++) {
      const gridItem = document.createElement('div');
      gridItem.classList.add('grid-item');
      gridItem.style.backgroundColor = (row + col) % 2 === 0 ? '#c4966f' : '#4a7c59';
      gridItem.addEventListener('dragover', allowDrop);
      gridItem.addEventListener('drop', handleDrop);
      gridContainer.appendChild(gridItem);
    }
  }
}

// Drag & Drop işlemleri
let draggedElement = null;

function allowDrop(event) {
  event.preventDefault();
}

function handleDrop(event) {
  event.preventDefault();
  if (event.target.classList.contains('grid-item') && !event.target.hasChildNodes()) {
    event.target.appendChild(draggedElement);
  }
}

function handleDragStart(event) {
  draggedElement = event.target;
  draggedElement.style.opacity = '0.5';
  draggedElement.style.width = '100%'; // Sembol boyutunu ayarla
  draggedElement.style.height = '100%'; // Sembol boyutunu ayarla
}

function handleDragEnd(event) {
  draggedElement.style.opacity = '1';
  draggedElement.style.width = '100%'; // Sembol boyutunu ayarla
  draggedElement.style.height = '100%'; // Sembol boyutunu ayarla
  draggedElement = null;
}

function handleTouchStart(event) {
  draggedElement = event.target;
  draggedElement.style.opacity = '0.5';
}

function handleTouchMove(event) {
  event.preventDefault();
  const touch = event.touches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (target && target.classList.contains('grid-item') && !target.hasChildNodes()) {
    target.appendChild(draggedElement);
  }
}

function handleTouchEnd(event) {
  if (draggedElement) {
    draggedElement.style.opacity = '1';
    draggedElement = null;
  }
}

function setupDragAndDrop() {
  document.querySelectorAll('.grid-item').forEach(item => {
    item.addEventListener('dragover', allowDrop);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('touchmove', handleTouchMove);
  });

  document.querySelectorAll('.symbol').forEach(symbol => {
    symbol.addEventListener('dragstart', handleDragStart);
    symbol.addEventListener('dragend', handleDragEnd);
    symbol.addEventListener('touchstart', handleTouchStart);
    symbol.addEventListener('touchend', handleTouchEnd);
    symbol.style.width = '100%'; // Sembol boyutunu ayarla
    symbol.style.height = '100%'; // Sembol boyutunu ayarla
  });
}

// Sembol oluşturma
function createSymbol(id, content) {
  const symbol = document.createElement('div');
  symbol.id = id;
  symbol.classList.add('symbol');
  symbol.draggable = true;
  symbol.innerHTML = content;

  symbol.addEventListener('dragstart', handleDragStart);
  symbol.addEventListener('dragend', handleDragEnd);
  symbol.addEventListener('touchstart', handleTouchStart);
  symbol.addEventListener('touchend', handleTouchEnd);
  symbol.style.width = '100%'; // Sembol boyutunu ayarla
  symbol.style.height = '100%'; // Sembol boyutunu ayarla

  return symbol;
}
