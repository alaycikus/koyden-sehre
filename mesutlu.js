// JavaScript Kodları

const gridContainer = document.querySelector('.grid');
let draggedElement = null;
let isDragging = false;
let dragStartTime = 0;
const dragThreshold = 100; // milisaniye cinsinden sürükleme eşiği

function saveGameState() {
  const gameState = {
    currentEnergy: currentEnergy,
    remainingTime: remainingTime, // Yenilenme süresini kaydet
    lastSavedTime: Date.now(), // Son kaydedilen zamanı kaydet
    symbols: Array.from(document.querySelectorAll('.grid-item')).map(gridItem => {
      if (gridItem.hasChildNodes()) {
        return {
          id: gridItem.querySelector('.symbol').id,
          content: gridItem.querySelector('.symbol').innerHTML
        };
      } else {
        return null;
      }
    }),
    profileImage: document.getElementById('profile-img').src, // Profil resmini kaydet
    rectangles: Array.from(document.querySelectorAll('.character-rectangle')).map(rectangle => {
      return {
        imageSrc: rectangle.querySelector('img').src,
        symbols: Array.from(rectangle.querySelectorAll('.symbol')).map(symbol => symbol.innerHTML)
      };
    }) // Dikdörtgen konteynerları kaydet
  };
  localStorage.setItem('gameState', JSON.stringify(gameState));
  console.log('Oyun durumu kaydedildi!', gameState);
}

// Tarla ve Bahçe sembollerinin hiyerarşisi
const symbolHierarchy = ['🌱', '🌾', '🌽', '🌻', '🥜', '🥕', '🥔', '🍅', '🍆', '🌶️']; // Tarla sembolleri
const gardenSymbols = ['🍎', '🍏', '🍐', '🍊', '🍋', '🍉', '🍇', '🍓', '🍒', '🥭']; // Bahçe sembolleri

document.addEventListener('DOMContentLoaded', () => {
  generateGrid();
  setupDragAndDrop();
  placeRandomCharactersWithRectangles();
  loadGameState(); // Oyun durumunu yükle

  if (!localStorage.getItem('gameState')) {
    placeInitialSymbols(); // Sadece ilk defa sayfa yüklendiğinde çalışır
  }

  // Geri butonunun eklenmesi
  const backButton = document.getElementById("back-button");
  if (backButton) {
    backButton.addEventListener("click", () => {
      console.log("Geri butonuna tıklandı");
      saveGameState(); // Oyun durumunu kaydet
      setTimeout(() => {
        window.location.href = "level.html"; // Level ekranına yönlendir
      }, 500); // 500ms (yarım saniye) bekle
    });
  }

  // Sıfırlama butonunun eklenmesi
  const resetButton = document.getElementById("reset-button");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      console.log("Sıfırlama butonuna tıklandı");
      resetGameState(); // Oyun durumunu sıfırla
      location.reload(); // Sayfayı yeniden yükle
    });
  }

  // Tarla ve Bahçe tıklama işlemleri için event listener'ları ekle
  const tarlaElement = document.getElementById('tarla');
  const bahceElement = document.getElementById('bahce');
  if (tarlaElement) {
    tarlaElement.addEventListener('dblclick', handleTarlaDoubleClick);
    tarlaElement.addEventListener('touchstart', handleTarlaTouchStart);
    tarlaElement.addEventListener('touchmove', handleTarlaTouchMove);
    tarlaElement.addEventListener('touchend', handleTarlaTouchEnd);
  }
  if (bahceElement) {
    bahceElement.addEventListener('dblclick', handleBahceDoubleClick);
    bahceElement.addEventListener('touchstart', handleBahceTouchStart);
    bahceElement.addEventListener('touchmove', handleBahceTouchMove);
    bahceElement.addEventListener('touchend', handleBahceTouchEnd);
  }

  // Profil resimlerine tıklama işlemleri için event listener'ları ekle
  document.querySelectorAll('.profile-img-option').forEach(img => {
    img.addEventListener('click', () => {
      document.getElementById('profile-img').src = img.src; // Profil resmini değiştir
      document.getElementById('selected-profile-img').src = img.src; // Seçili profil resmini güncelle
      saveGameState(); // Oyun durumunu kaydet
    });
  });

  // Pop-up'ı kapatma
  const closePopup = document.getElementById('close-popup');
  closePopup.addEventListener('click', () => {
    profilePopup.style.display = 'none';
  });

  // Mağaza ikonuna tıklama işlemi
  const storeIcon = document.getElementById('store-icon');
  const storePopup = document.getElementById('store-popup');
  const closeStorePopup = document.getElementById('close-store-popup');

  if (storeIcon) {
    storeIcon.addEventListener('click', () => {
      storePopup.style.display = 'flex'; // Mağaza popup'ını göster
    });
  }

  if (closeStorePopup) {
    closeStorePopup.addEventListener('click', () => {
      storePopup.style.display = 'none'; // Mağaza popup'ını gizle
    });
  }

  // Sembollere tıklama işlemleri için event listener'ları ekle
  document.querySelectorAll('.symbol').forEach(symbol => {
    symbol.addEventListener('click', () => {
      document.querySelectorAll('.symbol').forEach(s => s.classList.remove('selected')); // Diğer sembollerin seçimini kaldır
      symbol.classList.add('selected'); // Tıklanan sembolü seç
      const descriptionRectangle = document.querySelector('.description-rectangle');
      const symbolText = symbol.innerHTML.trim();
      let level = '';

      if (symbolHierarchy.includes(symbolText)) {
        level = `Seviye ${symbolHierarchy.indexOf(symbolText) + 1}`;
      } else if (gardenSymbols.includes(symbolText)) {
        level = `Seviye ${gardenSymbols.indexOf(symbolText) + 1}`;
      }

      descriptionRectangle.innerHTML = `<p style="color: black;">${symbolText} - ${level} sembolüne tıkladınız.</p>`;
    });
    symbol.addEventListener('touchstart', () => {
      document.querySelectorAll('.symbol').forEach(s => s.classList.remove('selected')); // Diğer sembollerin seçimini kaldır
      symbol.classList.add('selected'); // Tıklanan sembolü seç
      const descriptionRectangle = document.querySelector('.description-rectangle');
      const symbolText = symbol.innerHTML.trim();
      let level = '';

      if (symbolHierarchy.includes(symbolText)) {
        level = `Seviye ${symbolHierarchy.indexOf(symbolText) + 1}`;
      } else if (gardenSymbols.includes(symbolText)) {
        level = `Seviye ${gardenSymbols.indexOf(symbolText) + 1}`;
      }

      descriptionRectangle.innerHTML = `<p style="color: black;">${symbolText} - ${level} sembolüne tıkladınız.</p>`;
    });
  });
});

// Grid oluşturma fonksiyonu
function generateGrid() {
    const gridContainer = document.querySelector('.grid');
    gridContainer.innerHTML = ''; // Önceki hücreleri temizle
    const rows = 9;
    const cols = 8;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const gridItem = document.createElement('div');
            gridItem.classList.add('grid-item');

            // Çapraz desen için renk seçimi
            if ((row + col) % 2 === 0) {
                gridItem.style.backgroundColor = 'rgb(222, 176, 97)'; // Açık kahve
            } else {
                gridItem.style.backgroundColor = 'rgb(235, 206, 154)'; // Koyu 
            }

            gridItem.style.width = '50px'; // Küçültülen hücre boyutu
            gridItem.style.height = '50px'; // Küçültülen hücre boyutu
            gridContainer.appendChild(gridItem);
        }
    }

    setupDragAndDrop(); // Sürükle-bırak işlemlerini yeniden kur
}

// Başlangıç sembollerini yerleştirme
function placeInitialSymbols() {
    const gridItems = document.querySelectorAll('.grid-item');
    const tarla = createSymbol('tarla', '<img src="images/tarla.jpg" alt="Tarla">'); // Tarla sembolü
    const bahce = createSymbol('bahce', '🌳'); // Bahçe sembolü

    gridItems[0].appendChild(tarla);
    gridItems[1].appendChild(bahce);

    // Tarla tıklama olayı
    document.getElementById('tarla').addEventListener('click', handleTarlaClick);

    // Bahçe tıklama olayı
    document.getElementById('bahce').addEventListener('click', handleBahceClick);
}

// Sembol oluşturma fonksiyonu
function createSymbol(id, content) {
    const symbol = document.createElement('div');
    symbol.id = id;
    symbol.classList.add('symbol');
    symbol.draggable = true; // Sembollerin sürüklenebilir olduğunu belirt
    symbol.innerHTML = content;

    // Sürükleme olaylarını ekle
    symbol.addEventListener('dragstart', handleDragStart);
    symbol.addEventListener('dragend', handleDragEnd);
    symbol.addEventListener('touchstart', handleTouchStart);
    symbol.addEventListener('touchend', handleTouchEnd);
    symbol.style.width = '100%'; // Sembol boyutunu ayarla
    symbol.style.height = '100%'; // Sembol boyutunu ayarla

    return symbol;
}

// Sürükle-bırak işlemleri
function handleDragStart(event) {
  draggedElement = event.target;
  if (draggedElement) {
    draggedElement.style.opacity = '0.5';
    draggedElement.style.width = '100%'; // Sembol boyutunu ayarla
    draggedElement.style.height = '100%'; // Sembol boyutunu ayarla
  }
}

function handleDragEnd(event) {
  if (draggedElement) {
    draggedElement.style.opacity = '1';
    draggedElement.style.width = '100%'; // Sembol boyutunu ayarla
    draggedElement.style.height = '100%'; // Sembol boyutunu ayarla
    draggedElement = null;
  }
}

function allowDrop(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    const target = event.target;

    // Eğer hedef bir grid hücresi ise
    if (target.classList.contains('grid-item')) {
        // Eğer hedef hücrede zaten bir sembol varsa, işlemi durdur
        if (target.hasChildNodes()) {
            return; // Hücrede zaten sembol var, çık
        }
        target.appendChild(draggedElement);
    } else if (target.classList.contains('symbol') && draggedElement !== target) {
        const parentGrid = target.parentElement;
        const draggedParentGrid = draggedElement.parentElement;

        const draggedSymbol = draggedElement.textContent.trim();
        const targetSymbol = target.textContent.trim();

        // Tarla sembolü birleşimi
        if (draggedSymbol === targetSymbol && symbolHierarchy.includes(draggedSymbol)) {
            const nextSymbolIndex = symbolHierarchy.indexOf(draggedSymbol) + 1;
            if (nextSymbolIndex < symbolHierarchy.length) {
                const newSymbol = createSymbol('symbol', symbolHierarchy[nextSymbolIndex]);
                parentGrid.removeChild(target); // Hedef sembolü kaldır
                draggedElement.remove(); // Sürüklenen sembolü kaldır
                parentGrid.appendChild(newSymbol); // Yeni sembolü ekle
            }
        }
        // Bahçe sembolü birleşimi
        else if (draggedSymbol === targetSymbol && gardenSymbols.includes(draggedSymbol)) {
            const nextSymbolIndex = gardenSymbols.indexOf(draggedSymbol) + 1;
            if (nextSymbolIndex < gardenSymbols.length) {
                const newSymbol = createSymbol('symbol', gardenSymbols[nextSymbolIndex]);
                parentGrid.removeChild(target); // Hedef sembolü kaldır
                draggedElement.remove(); // Sürüklenen sembolü kaldır
                parentGrid.appendChild(newSymbol); // Yeni sembolü ekle
            }
        } else {
            // Eğer semboller eşleşmiyorsa, sembolleri yer değiştir
            parentGrid.removeChild(target); // Hedef sembolü kaldır
            draggedParentGrid.appendChild(target); // Hedef sembolü sürüklenen sembolün bulunduğu yere ekle
            parentGrid.appendChild(draggedElement); // Sürüklenen sembolü hedef hücreye ekle
        }
    }

    // Griddeki sembollerle dikdörtgen konteynerdaki sembolleri karşılaştır
    compareSymbols();
}

function handleTouchStart(event) {
  draggedElement = event.target.closest('.symbol');
  if (draggedElement) {
    dragStartTime = Date.now();
    isDragging = false;
    draggedElement.style.opacity = '0.5';
    
    // Sürükleme başladığında matched arka planını gizle
    draggedElement.classList.add('dragging');
    
    // Başlangıç pozisyonunu kaydet
    const touch = event.touches[0];
    draggedElement.style.position = 'fixed';
    draggedElement.style.zIndex = '1000';
    draggedElement.style.left = touch.clientX - draggedElement.offsetWidth / 2 + 'px';
    draggedElement.style.top = touch.clientY - draggedElement.offsetHeight / 2 + 'px';
  }
}

function handleTouchMove(event) {
  event.preventDefault();
  if (!draggedElement) return;
  
  isDragging = true;
  const touch = event.touches[0];
  
  // Sürüklenen elementi parmağın konumuna taşı
  draggedElement.style.position = 'fixed';
  draggedElement.style.left = touch.clientX - draggedElement.offsetWidth / 2 + 'px';
  draggedElement.style.top = touch.clientY - draggedElement.offsetHeight / 2 + 'px';
  draggedElement.style.zIndex = '1000';
}

function handleTouchEnd(event) {
  if (!draggedElement) return;
  
  // Sürükleme bittiğinde matched arka planını tekrar göster
  draggedElement.classList.remove('dragging');
  
  // Sürüklenen elementi normal pozisyonuna geri getir
  draggedElement.style.position = '';
  draggedElement.style.left = '';
  draggedElement.style.top = '';
  draggedElement.style.zIndex = '';
  
  const touchDuration = Date.now() - dragStartTime;
  
  if (isDragging) {
    // Parmağın son konumundaki elementi bul
    const touch = event.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (target) {
      const targetGridItem = target.closest('.grid-item');
      const targetSymbol = target.closest('.symbol');
      
      if (targetGridItem) {
        if (targetSymbol && targetSymbol !== draggedElement) {
          // İki sembol aynı mı kontrol et
          const draggedSymbol = draggedElement.textContent.trim();
          const targetSymbolContent = targetSymbol.textContent.trim();
          
          if (draggedSymbol === targetSymbolContent) {
            // Aynı sembolleri birleştir
            if (symbolHierarchy.includes(draggedSymbol)) {
              const nextIndex = symbolHierarchy.indexOf(draggedSymbol) + 1;
              if (nextIndex < symbolHierarchy.length) {
                const newSymbol = createSymbol('symbol', symbolHierarchy[nextIndex]);
                targetSymbol.remove();
                draggedElement.remove();
                targetGridItem.appendChild(newSymbol);
                setupDragAndDrop();
              }
            } else if (gardenSymbols.includes(draggedSymbol)) {
              const nextIndex = gardenSymbols.indexOf(draggedSymbol) + 1;
              if (nextIndex < gardenSymbols.length) {
                const newSymbol = createSymbol('symbol', gardenSymbols[nextIndex]);
                targetSymbol.remove();
                draggedElement.remove();
                targetGridItem.appendChild(newSymbol);
                setupDragAndDrop();
              }
            }
          } else {
            // Farklı sembollerin yerlerini değiştir
            const draggedParent = draggedElement.parentElement;
            const targetParent = targetSymbol.parentElement;
            
            draggedParent.appendChild(targetSymbol);
            targetParent.appendChild(draggedElement);
          }
        } else if (!targetGridItem.hasChildNodes()) {
          // Boş grid item'a taşı
          targetGridItem.appendChild(draggedElement);
        }
      }
    }
  } else if (touchDuration < dragThreshold) {
    // Kısa dokunma işlemi - seçim için
    document.querySelectorAll('.symbol').forEach(s => s.classList.remove('selected'));
    draggedElement.classList.add('selected');
    
    const descriptionRectangle = document.querySelector('.description-rectangle');
    const symbolText = draggedElement.innerHTML.trim();
    let level = '';
    
    if (symbolHierarchy.includes(symbolText)) {
      level = `Seviye ${symbolHierarchy.indexOf(symbolText) + 1}`;
    } else if (gardenSymbols.includes(symbolText)) {
      level = `Seviye ${gardenSymbols.indexOf(symbolText) + 1}`;
    }
    
    descriptionRectangle.innerHTML = `<p style="color: black;">${symbolText} - ${level} sembolüne tıkladınız.</p>`;
  }
  
  draggedElement.style.opacity = '1';
  draggedElement = null;
  isDragging = false;
  
  // Sembolleri karşılaştır
  compareSymbols();
}

// Drag-and-drop işlemleri için event listener'ları ekle
function setupDragAndDrop() {
  const gridItems = document.querySelectorAll('.grid-item');
  const symbols = document.querySelectorAll('.symbol');
  
  gridItems.forEach(gridItem => {
    gridItem.addEventListener('dragover', allowDrop);
    gridItem.addEventListener('drop', handleDrop);
    gridItem.addEventListener('touchmove', handleTouchMove, { passive: false });
  });
  
  symbols.forEach(symbol => {
    symbol.addEventListener('dragstart', handleDragStart);
    symbol.addEventListener('dragend', handleDragEnd);
    symbol.addEventListener('touchstart', handleTouchStart);
    symbol.addEventListener('touchend', handleTouchEnd);
    symbol.addEventListener('touchmove', handleTouchMove, { passive: false });
    symbol.style.width = '100%';
    symbol.style.height = '100%';
  });
}

// İlk boş hücreye sembol ekleme
function addNewSymbol(symbol, hierarchy) {
    const gridItems = document.querySelectorAll('.grid-item');
    for (let gridItem of gridItems) {
        if (!gridItem.hasChildNodes()) {
            const newSymbol = createSymbol('symbol', symbol);
            gridItem.appendChild(newSymbol);
            // Yeni sembolün dragstart ve dragend olaylarını ekleyin
            newSymbol.addEventListener('dragstart', handleDragStart);
            newSymbol.addEventListener('dragend', handleDragEnd);
            decreaseEnergy(); // Enerjiyi azalt
            // Griddeki sembollerle dikdörtgen konteynerdaki sembolleri karşılaştır
            compareSymbols();
            break;
        }
    }
}

function decreaseEnergy() {
  if (currentEnergy > 0) {
    currentEnergy -= cropEnergyCost;
    if (currentEnergy < 0) {
      currentEnergy = 0;
    }
    updateEnergyDisplay();
  }
}

document.getElementById('back-button').addEventListener('click', () => {
  saveGameState();  // Oyun durumunu kaydet
  setTimeout(() => {
      window.location.href = 'level.html';  // Sayfayı yönlendir
  }, 500);  // 500ms (yarım saniye) bekle, gerekirse bu süreyi artırabilirsiniz
});

// Oyun durumunu yükleme fonksiyonu
function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      const gameState = JSON.parse(savedState);
      console.log('Yüklenen oyun durumu:', gameState);
      currentEnergy = gameState.currentEnergy;
      const elapsedTime = Math.floor((Date.now() - gameState.lastSavedTime) / 1000);
      remainingTime = Math.max(gameState.remainingTime - elapsedTime, 0); // Geçen süreyi düş
      updateEnergyDisplay();
      const gridItems = document.querySelectorAll('.grid-item');
      gameState.symbols.forEach((symbol, index) => {
        if (symbol) {
          const newSymbol = createSymbol(symbol.id, symbol.content);
          if (!gridItems[index].hasChildNodes()) {
            gridItems[index].appendChild(newSymbol);
            // Yeni sembolün dragstart ve dragend olaylarını ekleyin
            newSymbol.addEventListener('dragstart', handleDragStart);
            newSymbol.addEventListener('dragend', handleDragEnd);
          }
        }
      });
      setupDragAndDrop(); // Sembollerin tıklanabilirliğini sağlamak için yeniden kur
      // Tarla ve Bahçe tıklama event'larını ekleyin
      const tarlaElement = document.getElementById('tarla');
      const bahceElement = document.getElementById('bahce');
      if (tarlaElement) {
        tarlaElement.addEventListener('dblclick', handleTarlaDoubleClick);
        tarlaElement.addEventListener('touchstart', handleTarlaTouchStart);
      }
      if (bahceElement) {
        bahceElement.addEventListener('dblclick', handleBahceDoubleClick);
        bahceElement.addEventListener('touchstart', handleBahceTouchStart);
      }
      // Profil resmini yükle
      if (gameState.profileImage) {
        document.getElementById('profile-img').src = gameState.profileImage;
        document.getElementById('selected-profile-img').src = gameState.profileImage; // Seçili profil resmini güncelle
      }
      // Dikdörtgen konteynerları yükle
      const characterContainer = document.querySelector('.character-container');
      characterContainer.innerHTML = ''; // Mevcut dikdörtgen konteynerları temizle
      gameState.rectangles.forEach(rectangleData => {
        const rectangle = document.createElement('div');
        rectangle.classList.add('character-rectangle');

        const imgElement = document.createElement('img');
        imgElement.src = rectangleData.imageSrc;
        rectangle.appendChild(imgElement);

        rectangleData.symbols.forEach(symbolContent => {
          const symbolElement = createSymbol('symbol', symbolContent);
          symbolElement.style.pointerEvents = 'none'; // Tıklanmayı engelle
          symbolElement.style.fontSize = '24px'; // Sembolleri küçült
          rectangle.appendChild(symbolElement);
        });

        characterContainer.appendChild(rectangle);
      });

      // Griddeki sembollerle dikdörtgen konteynerdaki sembolleri karşılaştır
      compareSymbols();

      // Yenilenme süresini başlat
      if (currentEnergy < maxEnergy && countdownTimer === null) {
        startCountdown();
      }
    }
  }

let symbolIndex = 0;
let gardenSymbolIndex = 0;
let goldAmount = 0;

function compareSymbols() {
  const gridSymbols = document.querySelectorAll('.grid-item .symbol');
  const rectangleSymbols = document.querySelectorAll('.character-rectangle .symbol');

  // Önce tüm matched ve selected sınıflarını temizle
  document.querySelectorAll('.symbol').forEach(symbol => {
    symbol.classList.remove('matched', 'selected');
  });

  // Tüm sat butonlarını gizle
  document.querySelectorAll('.sell-button').forEach(button => {
    button.style.display = 'none';
  });

  // Her dikdörtgen için kontrol
  document.querySelectorAll('.character-rectangle').forEach(rectangle => {
    // Dikdörtgendeki sembolleri al
    const rectangleSymbolContents = Array.from(rectangle.querySelectorAll('.symbol'))
      .map(symbol => symbol.innerHTML.trim());

    // Grid üzerindeki tüm eşleşen sembolleri bul
    const allMatchingGridSymbols = Array.from(gridSymbols).filter(gridSymbol => {
      const content = gridSymbol.innerHTML.trim();
      return rectangleSymbolContents.includes(content);
    });

    // Sat butonu kontrolü ve oluşturma
    let sellButton = rectangle.querySelector('.sell-button');
    if (!sellButton) {
      sellButton = document.createElement('button');
      sellButton.classList.add('sell-button');
      sellButton.textContent = 'Sat';
      rectangle.appendChild(sellButton);
    }

    // Eşleşen sembolleri vurgula ve sat butonunu göster
    if (allMatchingGridSymbols.length >= rectangleSymbolContents.length) {
      sellButton.style.display = 'block';
      
      // Tüm eşleşen sembolleri vurgula
      allMatchingGridSymbols.forEach(gridSymbol => {
        gridSymbol.classList.add('matched');
      });

      // Sat butonu tıklama olayı
      sellButton.onclick = () => {
        // İhtiyaç duyulan sayıda sembolü kaldır
        const symbolsToRemove = new Map();
        rectangleSymbolContents.forEach(content => {
          const matchingSymbols = allMatchingGridSymbols.filter(symbol => 
            symbol.innerHTML.trim() === content && 
            !symbolsToRemove.has(symbol)
          );
          if (matchingSymbols.length > 0) {
            symbolsToRemove.set(matchingSymbols[0], true);
          }
        });

        // Seçilen sembolleri kaldır
        symbolsToRemove.forEach((value, symbol) => {
          if (symbol.parentNode) {
            symbol.remove();
          }
        });
        
        // Dikdörtgeni kaldır
        rectangle.remove();
        
        // Altın miktarını güncelle
        updateGoldAmount(rectangleSymbolContents);
        
        // Yeni dikdörtgen ekle
        addNewRectangle();
        
        // Kalan sembolleri yeniden kontrol et
        compareSymbols();
      };
    } else {
      sellButton.style.display = 'none';
      // Kısmi eşleşmeleri de vurgula
      if (allMatchingGridSymbols.length > 0) {
        allMatchingGridSymbols.forEach(gridSymbol => {
          gridSymbol.classList.add('matched');
        });
      }
    }
  });
}

function updateGoldAmount(symbolContents) {
  let reward = 0; // Başlangıç ödülü
  const rewardLevels = [50, 115, 250, 600]; // Ödül seviyeleri

  symbolContents.forEach(content => {
    if (symbolHierarchy.includes(content)) {
      const level = symbolHierarchy.indexOf(content);
      reward += rewardLevels[Math.min(level, rewardLevels.length - 1)]; // Hiyerarşiye göre ödül artırımı
    } else if (gardenSymbols.includes(content)) {
      const level = gardenSymbols.indexOf(content);
      reward += rewardLevels[Math.min(level, rewardLevels.length - 1)]; // Bahçe sembolleri için ödül artırımı
    }
  });

  goldAmount += reward;
  document.getElementById('gold-amount').textContent = goldAmount; // Altın miktarını güncelle
  return reward; // Dikdörtgen konteyner için ödülü döndür
}

function addNewRectangle() {
  const characterImages = [];
  for (let i = 0; i < 10; i++) {
    characterImages.push(`images/character/character_0_${i}.png`);
  }
  characterImages.sort(() => 0.5 - Math.random());
  const selectedImage = characterImages[0];

  const characterContainer = document.querySelector('.character-container');
  const rectangle = document.createElement('div');
  rectangle.classList.add('character-rectangle');

  const imgElement = document.createElement('img');
  imgElement.src = selectedImage;
  rectangle.appendChild(imgElement);

  // Sat butonu ekle
  const sellButton = document.createElement('button');
  sellButton.classList.add('sell-button');
  sellButton.textContent = 'Sat';
  sellButton.style.display = 'none'; // Başlangıçta gizli
  rectangle.appendChild(sellButton);

  // Hiyerarşiye göre 1 veya 2 sembol ekleme
  const numSymbols = Math.random() > 0.5 ? 1 : 2;
  const symbolContents = [];
  for (let i = 0; i < numSymbols; i++) {
    let randomSymbol;
    if (Math.random() > 0.5 && symbolIndex < symbolHierarchy.length) {
      randomSymbol = symbolHierarchy[symbolIndex++];
    } else if (gardenSymbolIndex < gardenSymbols.length) {
      randomSymbol = gardenSymbols[gardenSymbolIndex++];
    } else {
      randomSymbol = symbolHierarchy[symbolIndex++];
    }
    symbolContents.push(randomSymbol);
    const symbolElement = createSymbol('symbol', randomSymbol);
    symbolElement.style.pointerEvents = 'none'; // Tıklanmayı engelle
    symbolElement.style.fontSize = '24px'; // Sembolleri küçült
    rectangle.appendChild(symbolElement);
  }

  // Altın miktarını gösteren eleman ekle
  const goldDisplay = document.createElement('div');
  goldDisplay.classList.add('gold-display');
  goldDisplay.textContent = calculateRectangleGold(symbolContents);
  rectangle.appendChild(goldDisplay);

  characterContainer.appendChild(rectangle);
  compareSymbols(); // Yeni dikdörtgeni kontrol et
}

function calculateRectangleGold(symbolContents) {
  let reward = 0; // Başlangıç ödülü
  const rewardLevels = [50, 115, 250, 600,]; // Ödül seviyeleri

  symbolContents.forEach(content => {
    if (symbolHierarchy.includes(content)) {
      const level = symbolHierarchy.indexOf(content);
      reward += rewardLevels[Math.min(level, rewardLevels.length - 1)]; // Hiyerarşiye göre ödül artırımı
    } else if (gardenSymbols.includes(content)) {
      const level = gardenSymbols.indexOf(content);
      reward += rewardLevels[Math.min(level, rewardLevels.length - 1)]; // Bahçe sembolleri için ödül artırımı
    }
  });

  return reward; // Dikdörtgen konteyner için ödülü döndür
}

// Oyun durumunu sıfırlama fonksiyonu
function resetGameState() {
  localStorage.removeItem('gameState');
  console.log('Oyun durumu sıfırlandı!');
}

// Enerji Ekranını Güncelle
function updateEnergyDisplay() {
  energyText.textContent = `${currentEnergy}`;

  // Enerji 100'ün altına düştüyse sayaç görünür olsun
  if (currentEnergy < maxEnergy && countdownTimer === null) {
      startCountdown(); // Eğer enerji azsa, geri sayımı başlat
  }
  // Enerji 100 olduysa, geri sayımı durdur ve gizle
  if (currentEnergy === maxEnergy && countdownTimer !== null) {
      stopCountdown();
  }
}

function placeRandomCharactersWithRectangles() {
  const characterImages = [];

  for (let i = 0; i < 10; i++) {
      characterImages.push(`images/character/character_0_${i}.png`);
  }

  characterImages.sort(() => 0.5 - Math.random());
  const selectedImages = characterImages.slice(0, 3);

  const characterContainer = document.createElement('div');
  characterContainer.classList.add('character-container'); 

  selectedImages.forEach(imageSrc => {
      const rectangle = document.createElement('div');
      rectangle.classList.add('character-rectangle');

      const imgElement = document.createElement('img');
      imgElement.src = imageSrc;
      rectangle.appendChild(imgElement);

      // Sat butonu ekle
      const sellButton = document.createElement('button');
      sellButton.classList.add('sell-button');
      sellButton.textContent = 'Sat';
      sellButton.style.display = 'none'; // Başlangıçta gizli
      rectangle.appendChild(sellButton);

      // Hiyerarşiye göre 1 veya 2 sembol ekleme
      const numSymbols = Math.random() > 0.5 ? 1 : 2;
      const symbolContents = [];
      for (let i = 0; i < numSymbols; i++) {
        let randomSymbol;
        if (Math.random() > 0.5 && symbolIndex < symbolHierarchy.length) {
          randomSymbol = symbolHierarchy[symbolIndex++];
        } else if (gardenSymbolIndex < gardenSymbols.length) {
          randomSymbol = gardenSymbols[gardenSymbolIndex++];
        } else {
          randomSymbol = symbolHierarchy[symbolIndex++];
        }
        symbolContents.push(randomSymbol);
        const symbolElement = createSymbol('symbol', randomSymbol);
        symbolElement.style.pointerEvents = 'none'; // Tıklanmayı engelle
        symbolElement.style.fontSize = '24px'; // Sembolleri küçült
        rectangle.appendChild(symbolElement);
      }

      // Altın miktarını gösteren eleman ekle
      const goldDisplay = document.createElement('div');
      goldDisplay.classList.add('gold-display');
      goldDisplay.textContent = calculateRectangleGold(symbolContents);
      rectangle.appendChild(goldDisplay);

      characterContainer.appendChild(rectangle);
  });

  gridContainer.style.position = 'relative';
  gridContainer.parentNode.insertBefore(characterContainer, gridContainer);

  // Grid'in üst kenarına daha yakın yerleştirme
  const gridRect = gridContainer.getBoundingClientRect();
  characterContainer.style.top = `${gridRect.top - 60}px`; // 20px boşluk bırak
}

// Profil seçme ve popup açma
const profileImg = document.getElementById('profile-img');
const profilePopup = document.getElementById('profile-popup');
const closePopup = document.getElementById('close-popup');

// Profil resmine tıklandığında pop-up açılacak
profileImg.addEventListener('click', () => {
  profilePopup.style.display = 'flex';
});

// Pop-up'ı kapatma
closePopup.addEventListener('click', () => {
  profilePopup.style.display = 'none';
});

let currentEnergy = 100; // Başlangıç Enerjisi
const maxEnergy = 100;   // Maksimum Enerji
const cropEnergyCost = 1; // Ürün toplama maliyeti
const energyRefreshTime = 60; // Enerji yenilenme süresi (saniye)
let countdownTimer = null; // Geri sayım için zamanlayıcı
let remainingTime = energyRefreshTime; // Geri kalan süre (saniye)

const energyText = document.getElementById("current-energy");
const energyRefreshTimeText = document.getElementById("energy-refresh-time");

// Başlangıçta sayaç gizli
energyRefreshTimeText.style.display = "none";

// Enerji Artırma Fonksiyonu
function increaseEnergy() {
    if (currentEnergy < maxEnergy) {
        currentEnergy++;
        updateEnergyDisplay();
    }

    // Enerji maksimumsa geri sayımı durdur ve sayaç gizle
    if (currentEnergy === maxEnergy) {
        stopCountdown();
    }
}

// Enerji Ekranını Güncelle
function updateEnergyDisplay() {
    energyText.textContent = `${currentEnergy}`;

    // Enerji 100'ün altına düştüyse sayaç görünür olsun
    if (currentEnergy < maxEnergy && countdownTimer === null) {
        startCountdown();
    }
}

// Geri Sayımı Başlat
function startCountdown() {
  energyRefreshTimeText.textContent = formatTime(remainingTime);
  energyRefreshTimeText.style.display = "inline-block"; // Sayaç görünür

  if (countdownTimer !== null) {
    clearInterval(countdownTimer); // Mevcut zamanlayıcıyı temizle
  }

  countdownTimer = setInterval(() => {
    remainingTime--;
    energyRefreshTimeText.textContent = formatTime(remainingTime);

    if (remainingTime <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null; // Zamanlayıcı sıfırla
      increaseEnergy(); // Enerji artır
      remainingTime = energyRefreshTime; // Yeniden başlat
      if (currentEnergy < maxEnergy) {
        startCountdown(); // Yeniden başlat
      }
    }
  }, 1000); // 1 saniyede bir güncelle
}

// Geri Sayımı Durdur ve Gizle
function stopCountdown() {
    if (countdownTimer !== null) {
        clearInterval(countdownTimer);
        countdownTimer = null; // Zamanlayıcı sıfırla
    }
    energyRefreshTimeText.style.display = "none"; // Sayaç gizlenir
}

// Zaman Formatlama Fonksiyonu (MM:SS)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

let tarlaClickTimeout;
let bahceClickTimeout;
let tarlaDoubleClickActive = false;
let bahceDoubleClickActive = false;

function handleTarlaClick() {
  if (tarlaDoubleClickActive) {
    clearTimeout(tarlaClickTimeout);
    addNewSymbol('🌱', symbolHierarchy);
    tarlaClickTimeout = setTimeout(() => {
      tarlaDoubleClickActive = false;
    }, 500);
  }
}

function handleBahceClick() {
  if (bahceDoubleClickActive) {
    clearTimeout(bahceClickTimeout);
    addNewSymbol('🍎', gardenSymbols);
    bahceClickTimeout = setTimeout(() => {
      bahceDoubleClickActive = false;
    }, 500);
  }
}

function handleTarlaDoubleClick() {
  const tarlaElement = document.getElementById('tarla');
  addNewSymbol('🌱', symbolHierarchy);
  tarlaDoubleClickActive = true;
  tarlaElement.addEventListener('click', handleTarlaClick);
  clearTimeout(tarlaClickTimeout);
  tarlaClickTimeout = setTimeout(() => {
    tarlaDoubleClickActive = false;
  }, 500);
}

function handleBahceDoubleClick() {
  const bahceElement = document.getElementById('bahce');
  addNewSymbol('🍎', gardenSymbols);
  bahceDoubleClickActive = true;
  bahceElement.addEventListener('click', handleBahceClick);
  clearTimeout(bahceClickTimeout);
  bahceClickTimeout = setTimeout(() => {
    bahceDoubleClickActive = false;
  }, 500);
}

// Mobil için tek dokunma işleyicisi
function handleTarlaTouchStart(event) {
  dragStartTime = new Date().getTime();
  isDragging = false;
}

function handleTarlaTouchMove(event) {
  isDragging = true;
}

function handleTarlaTouchEnd(event) {
  const touchDuration = new Date().getTime() - dragStartTime;
  
  if (!isDragging && touchDuration < dragThreshold) {
    // Sadece kısa dokunma ise ürün ekle
    event.preventDefault();
    addNewSymbol('🌱', symbolHierarchy);
  }
  // Sürükleme işlemi ise hiçbir şey yapma
}

function handleBahceTouchStart(event) {
  dragStartTime = new Date().getTime();
  isDragging = false;
}

function handleBahceTouchMove(event) {
  isDragging = true;
}

function handleBahceTouchEnd(event) {
  const touchDuration = new Date().getTime() - dragStartTime;
  
  if (!isDragging && touchDuration < dragThreshold) {
    // Sadece kısa dokunma ise ürün ekle
    event.preventDefault();
    addNewSymbol('🍎', gardenSymbols);
  }
  // Sürükleme işlemi ise hiçbir şey yapma
}

