// Wait for the DOM to be ready
$(function () {

    // Toggle class menu
    $('.menu').on('click', function () {
        $(this).toggleClass('active');
        if ($(this).hasClass('active')) {
            // Apply visibility classes based on the desired on-screen order
            // This order should match your screenshot/desired layout: Home, Music, Gallery, Band, Concerts, Game, Contact
            $('.ss-menu1').addClass('visible1');          // Home (Appears 1st on screen)
            $('.ss-menu4').addClass('visible2');          // Music (Appears 2nd on screen)
            $('.ss-menu-gallery').addClass('visible3');   // Gallery (Appears 3rd on screen)
            $('.ss-menu2').addClass('visible4');          // Band (Appears 4th on screen)
            $('.ss-menu3').addClass('visible5');          // Concerts (Appears 5th on screen)
            $('.ss-menu-game').addClass('visible6');      // Game (Appears 6th on screen)
            $('.ss-menu-contact').addClass('visible7');   // Contact (Appears 7th on screen)
        } else {
            // Remove all visibility classes
            $('.ss-menu1').removeClass('visible1');
            $('.ss-menu4').removeClass('visible2');
            $('.ss-menu-gallery').removeClass('visible3');
            $('.ss-menu2').removeClass('visible4');
            $('.ss-menu3').removeClass('visible5');
            $('.ss-menu-game').removeClass('visible6');
            $('.ss-menu-contact').removeClass('visible7');
        }
    });

    // Close menu on item click - Target all menu item classes used above
    // Ensure all these classes exist on your menu items in index.html
    $('.ss-menu1, .ss-menu2, .ss-menu3, .ss-menu4, .ss-menu-gallery, .ss-menu-game, .ss-menu-contact').on('click', function () {
      if ($('.menu').hasClass('active')) { // Only act if menu is active
        $('.menu').removeClass('active');
        // Remove all visibility classes
        $('.ss-menu1').removeClass('visible1');
        $('.ss-menu4').removeClass('visible2');
        $('.ss-menu-gallery').removeClass('visible3');
        $('.ss-menu2').removeClass('visible4');
        $('.ss-menu3').removeClass('visible5');
        $('.ss-menu-game').removeClass('visible6');
        $('.ss-menu-contact').removeClass('visible7');
      }
    });

    // Close menu on scroll - Remove all visibility classes
    $(window).on('scroll', function () {
        if ($('.menu').hasClass('active')) {
          $('.menu').removeClass('active');
          // Remove all visibility classes
          $('.ss-menu1').removeClass('visible1');
          $('.ss-menu4').removeClass('visible2');
          $('.ss-menu-gallery').removeClass('visible3');
          $('.ss-menu2').removeClass('visible4');
          $('.ss-menu3').removeClass('visible5');
          $('.ss-menu-game').removeClass('visible6');
          $('.ss-menu-contact').removeClass('visible7');
        }
    });

    // Parallax effect (Rellax) Initialization
    if (typeof Rellax !== 'undefined') {
        // Check if the element exists and not on 'mentions' page (if that logic is still needed)
        if (document.querySelector('.rellax') && !window.location.pathname.match("mentions")) {
            var rellax = new Rellax('.rellax');
        }
    }

    // Animations on scroll
    var scrollAnimationHandler = function() {
        let sizePage = $(window).height();
        let trigger = 100; // Offset for triggering animation

        function showElements(elements) {
            for (var i = 0; i < elements.length; i++) {
                var unit = elements[i];
                // Check if element is not already shown to avoid redundant class addition
                if (!unit.classList.contains('showed')) {
                    if (unit.getBoundingClientRect().top + trigger <= sizePage) {
                        unit.classList.add('showed');
                    }
                }
            }
        }
        showElements(document.getElementsByClassName('animatableY'));
        showElements(document.getElementsByClassName('animatableX'));
        showElements(document.getElementsByClassName('animatableOpacity'));
    };
    // Attach the handler to the scroll event
    $(window).on('scroll', scrollAnimationHandler);
    // Run the handler once on page load to check elements already in view
    scrollAnimationHandler();


    // Lazyload Initialization - USING THE WORKING lazyload() global function call
    if (typeof lazyload === 'function' && !window.location.pathname.match("mentions")) { // Check if lazyload is a function
        lazyload(); // Global function call as per your working version
    } else if (typeof LazyLoad !== 'undefined' && !window.location.pathname.match("mentions")) {
        // Fallback or alternative if lazyload() isn't defined but LazyLoad constructor is
        // This indicates a different version of the library might be loaded than expected
        console.warn("lazyload() function not found, trying new LazyLoad({}). Check library version.");
        var lazyLoadInstance = new LazyLoad({}); // This was not working for you with 2.0.0-rc.2
    }


    // Manage scroll up button
    let scrollUpHandler = function() {
        let scrollNow = $(window).scrollTop();
        if (scrollNow > 600) {
            if ($('#upArrow').is(":hidden")) { // Check if hidden before fading in
                 $('#upArrow').fadeIn();
            }
        } else {
            // Check if visible before fading out to prevent queue buildup if already hidden
            if ($('#upArrow').is(":visible")) {
                 $('#upArrow').fadeOut();
            }
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

// End of Document Ready
});