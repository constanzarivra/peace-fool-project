/* ==========================================================================
   PEACE—FOOL PROJECT — reproductor de las cápsulas de audio
   Cada cápsula es un cuadrado con su nombre y su botón. El <audio> del HTML
   viene con los controles del navegador puestos: si el JS no corre —o alguien
   lo bloquea—, la barra de siempre sigue ahí y el audio se escucha igual.
   Cuando el JS sí corre, esos controles se esconden y manda este reproductor.
   ========================================================================== */

(function () {
  'use strict';

  var tarjetas = document.querySelectorAll('.capsula');
  if (!tarjetas.length) { return; }

  var sonando = null;   // sólo una cápsula suena a la vez

  function reloj(segundos) {
    if (!isFinite(segundos)) { return '0:00'; }
    var s = Math.max(0, Math.round(segundos));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ':' + (r < 10 ? '0' + r : r);
  }

  Array.prototype.forEach.call(tarjetas, function (tarjeta) {
    var audio  = tarjeta.querySelector('audio');
    var boton  = tarjeta.querySelector('.capsula__play');
    var barra  = tarjeta.querySelector('.capsula__barra');
    var avance = tarjeta.querySelector('.capsula__avance');
    var actual = tarjeta.querySelector('.capsula__actual');
    var nombre = tarjeta.querySelector('.capsula__nombre');
    if (!audio || !boton) { return; }

    var titulo = nombre ? nombre.textContent.trim() : 'el audio';

    // a partir de aquí manda el reproductor propio
    audio.removeAttribute('controls');
    boton.hidden = false;
    if (barra) { barra.hidden = false; }

    boton.addEventListener('click', function () {
      if (audio.paused) {
        if (sonando && sonando !== audio) { sonando.pause(); }
        audio.play();
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', function () {
      sonando = audio;
      tarjeta.classList.add('suena');
      boton.setAttribute('aria-label', 'Pausar ' + titulo);
    });

    audio.addEventListener('pause', function () {
      tarjeta.classList.remove('suena');
      boton.setAttribute('aria-label', 'Reproducir ' + titulo);
    });

    audio.addEventListener('timeupdate', function () {
      if (actual) { actual.textContent = reloj(audio.currentTime); }
      if (avance && audio.duration) {
        var porcentaje = audio.currentTime / audio.duration * 100;
        avance.style.width = porcentaje + '%';
        if (barra) { barra.setAttribute('aria-valuenow', Math.round(porcentaje)); }
      }
    });

    audio.addEventListener('ended', function () {
      if (avance) { avance.style.width = '0'; }
      if (actual) { actual.textContent = '0:00'; }
      if (barra) { barra.setAttribute('aria-valuenow', '0'); }
    });

    // pinchar la barra salta a ese punto del audio
    if (barra) {
      barra.addEventListener('click', function (e) {
        if (!audio.duration) { return; }
        var caja = barra.getBoundingClientRect();
        var proporcion = (e.clientX - caja.left) / caja.width;
        audio.currentTime = Math.min(Math.max(proporcion, 0), 1) * audio.duration;
      });
    }
  });
})();
