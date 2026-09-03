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

  /* --- Las que ya se escucharon -----------------------------------------
     Una cápsula queda marcada cuando se reproduce hasta el final. La marca se
     guarda en el navegador de quien escucha (nunca sale de ahí), así al volver
     a la página sigue sabiendo por dónde iba. Se guarda por el nombre de la
     cápsula, que es corto y no cambia. Si el navegador no deja guardar —modo
     privado, permisos— la marca igual funciona durante la visita. */
  var LLAVE = 'pfp:capsulas-escuchadas';

  function leerEscuchadas() {
    try {
      var crudo = window.localStorage.getItem(LLAVE);
      var lista = crudo ? JSON.parse(crudo) : [];
      return Object.prototype.toString.call(lista) === '[object Array]' ? lista : [];
    } catch (e) { return []; }
  }

  function guardarEscuchada(nombre) {
    try {
      var lista = leerEscuchadas();
      if (lista.indexOf(nombre) === -1) {
        lista.push(nombre);
        window.localStorage.setItem(LLAVE, JSON.stringify(lista));
      }
    } catch (e) { /* sin memoria: la marca dura lo que dure la visita */ }
  }

  var yaEscuchadas = leerEscuchadas();

  /* La marca no lleva ninguna palabra: la ficha sube de color y el borde de
     abajo queda subrayado de lado a lado. Lo único escrito es para quien
     navega con lector de pantalla, en la etiqueta del botón. */
  function marcar(tarjeta, texto) {
    if (tarjeta.classList.contains('escuchada')) { return; }
    tarjeta.classList.add('escuchada');
    if (texto) { guardarEscuchada(texto); }
  }

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

    function etiqueta(accion) {
      return accion + ' ' + titulo +
             (tarjeta.classList.contains('escuchada') ? ' (ya escuchada)' : '');
    }

    // si ya se escuchó en una visita anterior, entra marcada
    if (yaEscuchadas.indexOf(titulo) !== -1) {
      marcar(tarjeta, null);
      boton.setAttribute('aria-label', etiqueta('Reproducir'));
    }

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
      boton.setAttribute('aria-label', etiqueta('Pausar'));
    });

    audio.addEventListener('pause', function () {
      tarjeta.classList.remove('suena');
      boton.setAttribute('aria-label', etiqueta('Reproducir'));
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
      // llegó hasta el final: queda marcada como escuchada
      marcar(tarjeta, titulo);
      boton.setAttribute('aria-label', etiqueta('Reproducir'));
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
