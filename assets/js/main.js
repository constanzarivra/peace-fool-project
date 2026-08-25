/* ==========================================================================
   PEACE—FOOL PROJECT — comportamiento de la interfaz
   Sin dependencias. Funciona abriendo los .html directamente.
   ========================================================================== */

(function () {
  'use strict';

  /* --- Menú móvil ------------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav-principal');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var abierto = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!abierto));
      nav.classList.toggle('is-open', !abierto);
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        toggle.focus();
      }
    });
  }

  /* --- Borde del header al hacer scroll --------------------------------- */
  var header = document.querySelector('.header');
  if (header) {
    var marcarScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    marcarScroll();
    window.addEventListener('scroll', marcarScroll, { passive: true });
  }

  /* --- Aparición suave de bloques --------------------------------------- */
  var revelables = document.querySelectorAll('.revelar');
  if (revelables.length) {
    if ('IntersectionObserver' in window) {
      var observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('is-visible');
            observador.unobserve(entrada.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

      revelables.forEach(function (el) { observador.observe(el); });
    } else {
      revelables.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* --- Panel de ingreso ADMIN ------------------------------------------ */
  /* Solo interfaz. La autenticación real (cuenta peacefoolproject@gmail.com)
     se conecta más adelante con un backend; nunca guardar la clave aquí. */
  var adminToggle = document.querySelector('.admin__toggle');
  var adminPanel = document.getElementById('admin-panel');

  if (adminToggle && adminPanel) {
    adminToggle.addEventListener('click', function () {
      var abierto = adminToggle.getAttribute('aria-expanded') === 'true';
      adminToggle.setAttribute('aria-expanded', String(!abierto));
      adminPanel.classList.toggle('is-open', !abierto);
      if (!abierto) {
        var primero = adminPanel.querySelector('input');
        if (primero) { primero.focus(); }
      }
    });
  }

  var adminForm = document.getElementById('admin-form');
  if (adminForm) {
    adminForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var aviso = document.getElementById('admin-mensaje');
      if (!aviso) { return; }
      aviso.hidden = false;
      aviso.textContent =
        'Formulario listo. La verificación de credenciales todavía no está ' +
        'conectada: falta el backend. Mientras tanto puedes revisar el panel ' +
        'de administración de muestra en admin.html.';
    });
  }

  /* --- Marca el enlace de la página actual en el menú ------------------- */
  var actual = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#nav-principal a').forEach(function (a) {
    var destino = a.getAttribute('href');
    if (destino && destino.split('#')[0] === actual) {
      a.setAttribute('aria-current', 'page');
    }
  });
})();
