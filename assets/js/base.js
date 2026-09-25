/*!
 * base.js
 * -----------------------------------------------------------------------
 * Original, self-authored replacement for the third-party "Sesame
 * Communications" global site script previously loaded from
 * srwd.sesamehub.com. Contains no Sesame code.
 *
 * Loads after assets/js/aggregate.js (vendored jQuery 3.6.3) and before
 * assets/js/local.js, which calls into a couple of the small jQuery
 * plugins defined here:
 *
 *   - $('#main-nav').responsiveNav({ trigger: '[id]' })
 *       Accessible mobile menu toggle for the button#trigger hamburger.
 *   - $(selector).emailProt()
 *       De-obfuscates a.email links built as
 *       <a class="email" rel="user|domain.com?subject=..."></a>
 *
 * It also auto-initializes on DOMContentLoaded, with no explicit call
 * site required elsewhere:
 *   - .lazyload[data-bg] background images
 *   - .cycle-slideshow carousels (homepage hero, spotlight testimonial
 *     slider, office tour gallery, testimonials quote slider)
 *
 * Finally it provides a minimal, safe shim for the inline
 * `new Waypoint({...})` calls used on index.html so no console error is
 * thrown if that (optional, purely cosmetic) reveal animation runs.
 * -----------------------------------------------------------------------
 */
(function (root, $) {
  'use strict';

  /* ====================================================================
     Mobile / accessible nav toggle — $.fn.responsiveNav
     ==================================================================== */
  if ($ && $.fn && !$.fn.responsiveNav) {
    $.fn.responsiveNav = function (options) {
      var settings = $.extend({ trigger: '#trigger' }, options);
      var DESKTOP_MIN_WIDTH = 1300;

      return this.each(function () {
        var $nav = $(this);
        var $collapsible = $nav.find('.collapsible').first();
        if (!$collapsible.length) {
          $collapsible = $nav;
        }
        var $trigger = $collapsible.find('#trigger').first();
        if (!$trigger.length) {
          $trigger = $(settings.trigger).first();
        }

        function isDesktop() {
          return root.innerWidth >= DESKTOP_MIN_WIDTH;
        }

        function closeAll() {
          $collapsible.removeClass('open');
          $collapsible.find('li.open').removeClass('open');
          $trigger.attr('aria-expanded', 'false');
        }

        function toggleMenu() {
          var willOpen = !$collapsible.hasClass('open');
          $collapsible.toggleClass('open', willOpen);
          $trigger.attr('aria-expanded', willOpen ? 'true' : 'false');
          if (!willOpen) {
            $collapsible.find('li.open').removeClass('open');
          }
        }

        $trigger.attr({
          'aria-expanded': 'false',
          'aria-controls': $collapsible.find('ul').first().attr('id') || undefined
        });

        $trigger.on('click', function (e) {
          e.preventDefault();
          toggleMenu();
        });

        /* Tap-to-expand submenus on touch/mobile widths, since :hover
           flyouts (used at desktop widths via CSS) aren't reachable by
           touch. The top-level link still navigates normally once its
           submenu is already open, or on desktop. */
        $collapsible.find('ul > li').each(function () {
          var $li = $(this);
          var $childUl = $li.children('ul');
          if (!$childUl.length) {
            return;
          }
          var $link = $li.children('a').first();
          $link.on('click', function (e) {
            if (isDesktop()) {
              return;
            }
            if (!$li.hasClass('open')) {
              e.preventDefault();
              $li.siblings().removeClass('open');
              $li.addClass('open');
            }
          });
        });

        /* close the menu when a leaf link is followed on mobile */
        $collapsible.find('ul').on('click', 'a', function () {
          var $a = $(this);
          if (!isDesktop() && !$a.siblings('ul').length) {
            closeAll();
          }
        });

        /* close on outside click / touch */
        $(document).on('click touchstart', function (e) {
          if (isDesktop() || !$collapsible.hasClass('open')) {
            return;
          }
          if ($.contains($collapsible.get(0), e.target) || $collapsible.is(e.target)) {
            return;
          }
          closeAll();
        });

        /* close on escape */
        $(document).on('keydown', function (e) {
          if (e.key === 'Escape' || e.keyCode === 27) {
            closeAll();
          }
        });

        /* reset state on resize up to desktop */
        $(root).on('resize', function () {
          if (isDesktop()) {
            closeAll();
          }
        });
      });
    };
  }

  /* ====================================================================
     Email de-obfuscation — $.fn.emailProt
     Rebuilds a mailto link from rel="user|domain.com?query" so plain
     email addresses never sit in the static HTML as crawlable text.
     ==================================================================== */
  if ($ && $.fn && !$.fn.emailProt) {
    $.fn.emailProt = function () {
      return this.each(function () {
        var $el = $(this);
        var rel = $el.attr('rel') || '';
        if (!rel) {
          return;
        }
        var queryIndex = rel.indexOf('?');
        var addressPart = queryIndex > -1 ? rel.slice(0, queryIndex) : rel;
        var queryPart = queryIndex > -1 ? rel.slice(queryIndex) : '';
        var address = addressPart.replace('|', '@');
        if (!address || address.indexOf('@') === -1) {
          return;
        }
        $el.attr('href', 'mailto:' + address + queryPart);
        if (!$el.text().replace(/\s|&nbsp;/g, '').length) {
          $el.text(address);
        }
      });
    };
  }

  /* ====================================================================
     Lazy-loaded background images: <el class="lazyload" data-bg="...">
     Applied immediately on ready rather than deferred to scroll — these
     backgrounds (the footer photo, a couple of spotlight tiles) are a
     small, fixed set of already-local images, so there's no real payload
     cost to loading them right away, and it keeps the page correct for
     any renderer that doesn't simulate scrolling (e.g. a screenshot or
     a crawler) as well as for sighted users.
     ==================================================================== */
  function initLazyBackgrounds() {
    var els = document.querySelectorAll('.lazyload[data-bg]');
    els.forEach(function (el) {
      var url = el.getAttribute('data-bg');
      if (url) {
        el.style.backgroundImage = 'url("' + url + '")';
      }
      el.removeAttribute('data-bg');
      el.classList.add('lazyloaded');
    });
  }

  /* ====================================================================
     Generic carousel: .cycle-slideshow
     ==================================================================== */
  function initCycleSlideshows() {
    var containers = document.querySelectorAll('.cycle-slideshow');

    containers.forEach(function (container) {
      var slideSelector = container.getAttribute('data-cycle-slides');
      var slides;

      if (slideSelector) {
        slides = Array.prototype.slice.call(container.querySelectorAll(':scope ' + slideSelector));
      } else {
        slides = Array.prototype.slice.call(container.children).filter(function (child) {
          return child.tagName === 'IMG';
        });
      }

      if (!slides.length) {
        return;
      }

      slides.forEach(function (slide) {
        slide.classList.add('cycle-slide');
      });

      var timeoutAttr = container.getAttribute('data-cycle-timeout');
      var timeout = timeoutAttr ? parseInt(timeoutAttr, 10) : 0;
      var current = 0;

      function show(index) {
        slides.forEach(function (slide, i) {
          slide.classList.toggle('cycle-slide-active', i === index);
        });
        current = index;
      }

      show(0);

      if (!timeout || slides.length < 2 || isNaN(timeout)) {
        /* static — first slide only, no animation */
        return;
      }

      container.classList.add('cycle-fade');

      var timer = null;

      function next() {
        show((current + 1) % slides.length);
      }

      function prev() {
        show((current - 1 + slides.length) % slides.length);
      }

      function start() {
        stop();
        timer = root.setInterval(next, timeout);
      }

      function stop() {
        if (timer) {
          root.clearInterval(timer);
          timer = null;
        }
      }

      var prevBtn = container.querySelector('.cycle-prev');
      var nextBtn = container.querySelector('.cycle-next');

      if (prevBtn) {
        prevBtn.addEventListener('click', function (e) {
          e.preventDefault();
          prev();
          start();
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function (e) {
          e.preventDefault();
          next();
          start();
        });
      }

      container.addEventListener('mouseenter', stop);
      container.addEventListener('mouseleave', start);
      container.addEventListener('focusin', stop);
      container.addEventListener('focusout', start);

      start();
    });
  }

  /* ====================================================================
     Minimal Waypoint() shim
     ----------------------------------------------------------------------
     A couple of pages (index.html) call `new Waypoint({element, handler,
     offset})` inline to remove a [data-ready] attribute once a section
     scrolls into view (a purely cosmetic reveal; the transform/opacity
     rules that would animate it are already inert in local.css). This
     shim keeps that call from throwing a console error and reproduces
     the intended "fire once when scrolled into view" behavior using
     IntersectionObserver.
     ==================================================================== */
  if (typeof root.Waypoint === 'undefined') {
    root.Waypoint = function (options) {
      options = options || {};
      var el = options.element;
      var handler = options.handler;
      if (!el || typeof handler !== 'function') {
        return;
      }
      if ('IntersectionObserver' in root) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              handler.call(this, 'down');
              observer.disconnect();
            }
          });
        }, { threshold: 0, rootMargin: '0px 0px -20% 0px' });
        observer.observe(el);
      } else {
        handler.call(this, 'down');
      }
    };
  }

  /* ====================================================================
     Graceful handling of missing images
     ----------------------------------------------------------------------
     A handful of content images referenced by this static mirror aren't
     present in the repository. Rather than show the browser's broken
     image glyph, quietly collapse those <img> elements. `error` doesn't
     bubble, so this is bound on the capture phase at the document level.
     ==================================================================== */
  function initBrokenImageFallback() {
    function hide(img) {
      img.style.display = 'none';
    }

    /* future / still-loading images */
    document.addEventListener('error', function (e) {
      var el = e.target;
      if (el && el.tagName === 'IMG') {
        hide(el);
      }
    }, true);

    /* images whose request may have already failed before this script
       ran (it loads near the end of <body>, after the <img> tags) */
    var imgs = document.querySelectorAll('img');
    imgs.forEach(function (img) {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
        hide(img);
      }
    });
  }

  /* ====================================================================
     Boot
     ==================================================================== */
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  initBrokenImageFallback();

  ready(function () {
    initLazyBackgrounds();
    initCycleSlideshows();
  });
}(window, window.jQuery));
