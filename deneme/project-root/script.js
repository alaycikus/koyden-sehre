// Ekranları seç
const levelScreen = document.querySelector('.level-screen');
const motherScreen = document.querySelector('.Mother-screen');
const mesutluScreen = document.querySelector('#mesutlu-screen');

// Ana ekran tıklaması
motherScreen.addEventListener('click', () => {
  motherScreen.style.display = 'none'; // Ana ekranı gizle
  window.location.href = 'level.html'; // Seviye seçim ekranına yönlendir
});
