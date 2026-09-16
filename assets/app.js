/* ===========================================================
   BASIC JNS — Landing Pack Jeans Mujer Denim
   Galería, selector de talla, carruseles y carrito Shopify.
   =========================================================== */
(function () {
  'use strict';

  var SHOP = window.SHOP || 'https://basicjns.co';
  var PRODUCT = window.PRODUCT;
  var RECOMMENDED = window.RECOMMENDED || [];

  var money = function (value) {
    return '$' + value.toLocaleString('en-US');
  };

  /* Permalinks de carrito de Shopify. Verificado contra basicjns.co:
     /cart/{variante}:{cantidad}                 -> redirige directo al checkout
     /cart/{variante}:{cantidad}?storefront=true -> agrega y muestra la página del carrito
     Así la landing funciona igual servida estática o dentro del tema. */
  var addToCartUrl = function (variantId, qty) {
    return SHOP + '/cart/' + variantId + ':' + qty + '?storefront=true';
  };
  var checkoutUrl = function (variantId, qty) {
    return SHOP + '/cart/' + variantId + ':' + qty;
  };

  var toast = (function () {
    var node, timer;
    return function (message) {
      if (!node) {
        node = document.createElement('div');
        node.className = 'toast';
        node.setAttribute('role', 'status');
        document.body.appendChild(node);
      }
      node.textContent = message;
      requestAnimationFrame(function () { node.classList.add('is-visible'); });
      clearTimeout(timer);
      timer = setTimeout(function () { node.classList.remove('is-visible'); }, 2200);
    };
  })();

  /* ── Galería ─────────────────────────────────────────── */
  function initGallery(root) {
    var track = root.querySelector('[data-track]');
    var thumbs = root.querySelector('[data-thumbs]');
    var index = 0;

    PRODUCT.images.forEach(function (src, i) {
      var img = document.createElement('img');
      img.src = src;
      img.alt = PRODUCT.title;
      img.loading = i === 0 ? 'eager' : 'lazy';
      track.appendChild(img);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Ver imagen ' + (i + 1));
      btn.innerHTML = '<img src="' + src + '" alt="" loading="lazy">';
      btn.addEventListener('click', function () { show(i); });
      thumbs.appendChild(btn);
    });

    function show(i) {
      index = (i + PRODUCT.images.length) % PRODUCT.images.length;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      Array.prototype.forEach.call(thumbs.children, function (btn, n) {
        btn.setAttribute('aria-current', n === index ? 'true' : 'false');
      });
    }

    root.querySelector('[data-prev]').addEventListener('click', function () { show(index - 1); });
    root.querySelector('[data-next]').addEventListener('click', function () { show(index + 1); });

    /* Swipe en móvil */
    var startX = null;
    track.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var delta = e.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 45) show(index + (delta < 0 ? 1 : -1));
      startX = null;
    }, { passive: true });

    show(0);
  }

  /* ── Formulario de producto ──────────────────────────── */
  function initProductForm(form) {
    var sizes = form.querySelector('[data-sizes]');
    var label = form.querySelector('[data-size-label]');
    var qtyInput = form.querySelector('[data-qty-input]');
    var totalEl = form.querySelector('[data-total-price]');
    var current = PRODUCT.variants[0];

    PRODUCT.variants.forEach(function (variant) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'size-btn';
      btn.textContent = variant.title;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      if (!variant.available) btn.disabled = true;
      btn.addEventListener('click', function () { select(variant); });
      sizes.appendChild(btn);
    });

    function select(variant) {
      current = variant;
      if (label) label.textContent = variant.title;
      Array.prototype.forEach.call(sizes.children, function (btn) {
        btn.setAttribute('aria-checked', String(btn.textContent === variant.title));
      });
    }

    function qty() {
      var n = parseInt(qtyInput.value, 10);
      return isNaN(n) || n < 1 ? 1 : n;
    }

    function refreshTotal() {
      if (totalEl) totalEl.textContent = money(PRODUCT.price * qty());
    }

    form.querySelectorAll('[data-qty]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        qtyInput.value = Math.max(1, qty() + parseInt(btn.dataset.qty, 10));
        refreshTotal();
      });
    });
    qtyInput.addEventListener('input', refreshTotal);
    qtyInput.addEventListener('blur', function () { qtyInput.value = qty(); refreshTotal(); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      toast('Talla ' + current.title + ' agregada al carrito');
      setTimeout(function () { window.location.href = addToCartUrl(current.id, qty()); }, 450);
    });

    var buy = form.querySelector('[data-buy]');
    if (buy) {
      buy.addEventListener('click', function () {
        window.location.href = checkoutUrl(current.id, qty());
      });
    }

    select(current);
    refreshTotal();
  }

  /* ── Productos recomendados ──────────────────────────── */
  function initRecommended() {
    var track = document.querySelector('[data-reco]');
    if (!track) return;

    RECOMMENDED.forEach(function (product) {
      var card = document.createElement('article');
      card.className = 'reco-card';

      var url = SHOP + '/products/' + product.handle;
      var image = product.images[0] || '';
      var sizes = product.variants.map(function (v) {
        return '<button type="button" class="size-btn" role="radio" aria-checked="false"' +
          (v.available ? '' : ' disabled') + ' data-variant="' + v.id + '">' + v.title + '</button>';
      }).join('');

      card.innerHTML =
        '<a href="' + url + '"><img src="' + image + '" alt="' + product.title + '" loading="lazy"></a>' +
        '<h3 class="reco-title"><a href="' + url + '">' + product.title + '</a></h3>' +
        '<p class="reco-price"><b>' + money(product.price) + '</b>' +
          (product.compare ? '<s>' + money(product.compare) + '</s>' : '') + '</p>' +
        '<fieldset class="variant-picker">' +
          '<legend>Seleccionar Talla: <span data-size-label>' + product.variants[0].title + '</span></legend>' +
          '<div class="size-list" role="radiogroup" aria-label="Talla">' + sizes + '</div>' +
        '</fieldset>' +
        '<button type="button" class="btn btn--atc" data-card-atc>Agregar al carrito</button>' +
        '<button type="button" class="btn btn--dark" data-card-buy>Comprar Ahora</button>';

      var selected = product.variants[0];
      var label = card.querySelector('[data-size-label]');
      var buttons = card.querySelectorAll('.size-btn');

      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          selected = product.variants.find(function (v) { return String(v.id) === btn.dataset.variant; });
          label.textContent = selected.title;
          buttons.forEach(function (b) { b.setAttribute('aria-checked', String(b === btn)); });
        });
      });
      buttons[0].setAttribute('aria-checked', 'true');

      card.querySelector('[data-card-atc]').addEventListener('click', function () {
        toast(product.title + ' — talla ' + selected.title);
        setTimeout(function () { window.location.href = addToCartUrl(selected.id, 1); }, 450);
      });
      card.querySelector('[data-card-buy]').addEventListener('click', function () {
        window.location.href = checkoutUrl(selected.id, 1);
      });

      track.appendChild(card);
    });

    bindScrollArrows(track,
      document.querySelector('[data-reco-prev]'),
      document.querySelector('[data-reco-next]'));
  }

  /* ── Reseñas ─────────────────────────────────────────── */
  var REVIEWS = [
    { text: 'Me encantaron 😍 Ajustan la cintura y realzan la figura sin apretar.', name: 'Laura R.', city: 'Medellín' },
    { text: 'El tiro alto es perfecto y la tela se siente de muy buena calidad. Llegaron rapidísimo.', name: 'Daniela M.', city: 'Bogotá' },
    { text: 'Son muy cómodos, suaves y no pierden la forma aunque los use durante todo el día.', name: 'Paola G.', city: 'Cali' },
    { text: 'Mi nuevo básico favorito. No se decoloran y moldean muy bonito. Recomendadísimos.', name: 'Angie S.', city: 'Barranquilla' },
    { text: 'La talla me quedó perfecta y los colores son iguales a los de las fotos. Volvería a comprar.', name: 'Camila P.', city: 'Bucaramanga' },
    { text: 'Me gustó mucho cómo horman. El paquete llegó completo y la guía de tallas me ayudó bastante.', name: 'Valentina C.', city: 'Cartagena' }
  ];

  function initReviews() {
    var track = document.querySelector('[data-reviews]');
    if (!track) return;

    REVIEWS.forEach(function (review) {
      var card = document.createElement('article');
      card.className = 'review-card';
      card.innerHTML =
        '<div class="review-head">' +
          '<span class="stars stars--sm" aria-hidden="true">★★★★★</span>' +
          '<span class="verified">Compra verificada</span>' +
        '</div>' +
        '<p class="review-text">“' + review.text + '”</p>' +
        '<p class="review-author"><strong>' + review.name + '</strong> · ' + review.city + '</p>';
      track.appendChild(card);
    });

    var prev = document.querySelector('[data-rev-prev]');
    var next = document.querySelector('[data-rev-next]');
    var dotsBox = document.querySelector('[data-rev-dots]');
    bindScrollArrows(track, prev, next);

    /* Un punto por página visible */
    function perPage() {
      var card = track.firstElementChild;
      if (!card) return 1;
      return Math.max(1, Math.round(track.clientWidth / card.getBoundingClientRect().width));
    }

    function renderDots() {
      var pages = Math.max(1, Math.ceil(REVIEWS.length / perPage()));
      dotsBox.innerHTML = '';
      for (var i = 0; i < pages; i++) {
        (function (page) {
          var dot = document.createElement('button');
          dot.type = 'button';
          dot.setAttribute('aria-label', 'Ir a la página ' + (page + 1));
          dot.addEventListener('click', function () {
            track.scrollTo({ left: page * track.clientWidth, behavior: 'smooth' });
          });
          dotsBox.appendChild(dot);
        })(i);
      }
      markActiveDot();
    }

    function markActiveDot() {
      if (!dotsBox.children.length) return;
      var page = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      Array.prototype.forEach.call(dotsBox.children, function (dot, i) {
        dot.setAttribute('aria-current', i === page ? 'true' : 'false');
      });
    }

    track.addEventListener('scroll', markActiveDot, { passive: true });
    window.addEventListener('resize', renderDots);
    renderDots();
  }

  /* Flechas para cualquier carrusel con scroll horizontal */
  function bindScrollArrows(track, prev, next) {
    function page(direction) {
      track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' });
    }
    function sync() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    }
    if (prev) prev.addEventListener('click', function () { page(-1); });
    if (next) next.addEventListener('click', function () { page(1); });
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  /* ── Marquee de medios de pago ───────────────────────── */
  function initMarquee() {
    var track = document.querySelector('[data-marquee]');
    if (!track) return;
    /* Se duplica el contenido para que el bucle a -50% sea continuo. */
    track.innerHTML += track.innerHTML;
  }

  /* ── Videos: reproducir sólo cuando están a la vista ─── */
  function initVideos() {
    var videos = document.querySelectorAll('.video-card video');
    if (!videos.length) return;

    /* Los <video> llevan preload="none" para no gastar datos en móvil:
       se piden apenas entran en pantalla. Si el navegador bloquea el
       autoplay, queda visible el poster y no se ve una caja negra. */
    var start = function (video) {
      if (video.preload === 'none') {
        video.preload = 'auto';
        video.load();
      }
      var played = video.play();
      if (played && played.catch) played.catch(function () {});
    };

    if (!('IntersectionObserver' in window)) {
      videos.forEach(start);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) start(entry.target);
        else entry.target.pause();
      });
    }, { threshold: 0.25 });
    videos.forEach(function (v) { observer.observe(v); });
  }

  /* ── Fecha de hoy en el bloque de urgencia ───────────── */
  function initToday() {
    var months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    var now = new Date();
    var text = now.getDate() + ' de ' + months[now.getMonth()];
    document.querySelectorAll('[data-today]').forEach(function (el) { el.textContent = text; });
  }

  /* ── Arranque ────────────────────────────────────────── */
  document.querySelectorAll('[data-gallery]').forEach(initGallery);
  document.querySelectorAll('[data-form]').forEach(initProductForm);
  initRecommended();
  initReviews();
  initMarquee();
  initVideos();
  initToday();
})();
