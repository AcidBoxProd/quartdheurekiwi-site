// Wait for the DOM to be ready
$(function () {

    // Toggle class menu (CORRECT ORDER MAPPING)
    $('.menu').on('click', function () {
        $(this).toggleClass('active');
        if ($(this).hasClass('active')) {
            // Appliquer les classes de visibilité dans le BON ordre de page
            $('.ss-menu1').addClass('visible1');          // Home (Position 1)
            $('.ss-menu4').addClass('visible2');          // Music (Position 2)
            $('.ss-menu-gallery').addClass('visible3');   // Gallery (Position 3)
            $('.ss-menu2').addClass('visible4');          // Band (Position 4)
            $('.ss-menu3').addClass('visible5');          // Concerts (Position 5)
            $('.ss-menu5').addClass('visible6');          // Contact (Position 6)
        } else {
            // Enlever toutes les classes (l'ordre ici importe peu)
            $('.ss-menu1').removeClass('visible1');
            $('.ss-menu2').removeClass('visible4'); // <- Match removal with addition
            $('.ss-menu3').removeClass('visible5'); // <- Match removal with addition
            $('.ss-menu4').removeClass('visible2'); // <- Match removal with addition
            $('.ss-menu-gallery').removeClass('visible3'); // <- Match removal with addition
            $('.ss-menu5').removeClass('visible6');
        }
    });

    // Close menu on item click (CORRECT ORDER MAPPING)
    $('.ss-menu1, .ss-menu2, .ss-menu3, .ss-menu4, .ss-menu-gallery, .ss-menu5').on('click', function () {
      $('.menu').removeClass('active');
      // Enlever toutes les classes (l'ordre ici importe peu)
      $('.ss-menu1').removeClass('visible1');
      $('.ss-menu2').removeClass('visible4');
      $('.ss-menu3').removeClass('visible5');
      $('.ss-menu4').removeClass('visible2');
      $('.ss-menu-gallery').removeClass('visible3');
      $('.ss-menu5').removeClass('visible6');
    });

    // Close menu on scroll (CORRECT ORDER MAPPING)
    $(window).on('scroll', function () {
        if ($('.menu').hasClass('active')) {
          $('.menu').removeClass('active');
           // Enlever toutes les classes (l'ordre ici importe peu)
          $('.ss-menu1').removeClass('visible1');
          $('.ss-menu2').removeClass('visible4');
          $('.ss-menu3').removeClass('visible5');
          $('.ss-menu4').removeClass('visible2');
          $('.ss-menu-gallery').removeClass('visible3');
          $('.ss-menu5').removeClass('visible6');
        }
    });

    // Parallax effect (Rellax) Initialization
    // Ensure Rellax library is loaded before this runs
    // The check for 'mentions' path might be unnecessary if not applicable anymore
    if (typeof Rellax !== 'undefined' && !window.location.pathname.match("mentions")) {
        var rellax = new Rellax('.rellax');
    }

    // --- CODE REMOVED ---
    // - Script adresse Email removed
    // - Contact form validation removed
    // - Contact form AJAX submission removed
    // - Newsletter form validation removed
    // - Newsletter form AJAX submission removed
    // --- END OF CODE REMOVED ---


    // Animations on scroll (ScrollMagic/GSAP or IntersectionObserver based)
    // This part remains as it animates general sections
    $(window).on('scroll', function () {
        let sizePage = $(window).height();
        let trigger = 100; // Offset for triggering animation
        let elementY = document.getElementsByClassName('animatableY');
        for (var unit of elementY) {
          if (unit.getBoundingClientRect().top + trigger <= sizePage) {
            unit.classList.add('showed');
          }
        }
        let elementX = document.getElementsByClassName('animatableX');
        for (var unit of elementX) {
          if (unit.getBoundingClientRect().top + trigger <= sizePage) {
            unit.classList.add('showed');
          }
        }
        let elementOpacity = document.getElementsByClassName('animatableOpacity');
        for (var unit of elementOpacity) {
          if (unit.getBoundingClientRect().top + trigger <= sizePage) {
            unit.classList.add('showed');
          }
        }
    });


    // Lazyload Initialization
    // Ensure LazyLoad library is loaded before this runs
    // The check for 'mentions' path might be unnecessary if not applicable anymore
    if (typeof LazyLoad !== 'undefined' && !window.location.pathname.match("mentions")) {
        // Assuming global lazyload() function call based on original code comment
        // Or initialize using the instance method if that's how the library works:
        // var lazyLoadInstance = new LazyLoad({});
        // Check your LazyLoad library's documentation if unsure.
        // Using the function call as implied by original comments:
        lazyload();
    }


    // Reload on resize (Original code was commented out, kept as is)
    /*
    let initialWidth = $(window).innerWidth();
    $(window).on('resize', function () { ... });
    */

    // Manage scroll up button
    let scrollUpHandler = function() {
        let scrollNow = $(window).scrollTop();
        if (scrollNow > 600) {
            // Use fadeIn() for smoother appearance if desired
            if ($('#upArrow').is(":hidden")) {
                 $('#upArrow').fadeIn(); // Changed to fadeIn
            }
        } else {
            // Use fadeOut() for smoother disappearance if desired
            $('#upArrow').fadeOut(); // Changed to fadeOut
        }
    };
    // Attach the handler to the scroll event
    $(window).on('scroll', scrollUpHandler);
    // Run the handler once on page load to set initial state
    scrollUpHandler();
    // Handle click event for the arrow
    $('#upArrow').on('click', function () {
        $('html, body').animate({scrollTop: 0}, 500); // Smooth scroll animation
    });

    // Card click listener was REMOVED in the original, so nothing to add/remove here.

    // Location socials (COMMENTED OUT in original, kept as is)
    /* ... */

// End of Document Ready
});