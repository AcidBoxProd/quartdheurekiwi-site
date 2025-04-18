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

    // ... (Le reste de ton code JS reste identique) ...

    // Parallax effect (Rellax) Initialization
    if (typeof Rellax !== 'undefined' && !window.location.pathname.match("mentions")) {
        var rellax = new Rellax('.rellax');
    }

    // Script adresse Email
    if (document.getElementById('insertMail')) {
        let name = "contact" ; // !!! UPDATE YOUR INFO HERE !!!
        let domain = "quartdheurekiwi.com" ; // !!! UPDATE YOUR DOMAIN HERE !!! (Example)
        let divMail = document.getElementById('insertMail');
        let newAhref = document.createElement('a');
        newAhref.href = "mailto:" + name + '@' + domain;
        newAhref.innerHTML = name + '@' + domain;
        divMail.appendChild(newAhref);
    }

    // Manage form validation (Contact Form)
    $('#nom').on('blur input', function () {
      if ($('#nom').val().length >= 50) {
        $('#helpNom').text('50 caractères max').hide().show();
      } else {
        $('#helpNom').slideUp(400);
      }
    });
    $('#telephone').on('blur input', function () {
      let regexTelephone = /^(?:(?:\+|00)33[\s.-]{0,3}(?:\(0\)[\s.-]{0,3})?|0)[1-9](?:(?:[\s.-]?\d{2}){4}|\d{2}(?:[\s.-]?\d{3}){2})$/;
      let telEntry = String(document.getElementById('telephone').value).replace(/[\s.-]/g, '');
      if (telEntry.length > 0 && !telEntry.match(regexTelephone)) {
          $('#helpTel').text('Numéro de téléphone incorrect').hide().show();
      } else {
          $('#helpTel').slideUp(400);
      }
    });
    $('#mail').on('blur input', function () {
      let regexMail = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
      let mailEntry = $('input#mail').val();
      if (mailEntry.length > 0 && !mailEntry.match(regexMail)) {
        $('#helpMail').text('Adresse email incorrecte').hide().show();
      } else {
        $('#helpMail').slideUp(400);
      }
    });
    $('#checkRobot').on('blur input', function () {
      if ($('#checkRobot').val() != 7) {
        $('#helpRobot').text('Résultat incorrect').hide().show();
      } else {
        $('#helpRobot').slideUp(400);
      }
    });
    $('#message').on('blur input', function () {
      if ($('#message').val().length >= 3000) {
          // Assurez-vous que #helpMessage existe dans votre HTML si vous voulez afficher ce message
          // $('#helpMessage').text('Votre message ne doit pas dépasser 3000 caractères').hide().slideDown(400);
      } else {
        // $('#helpMessage').slideUp(400);
      }
    });

    // Contact form AJAX submission (Version Précédente)
    $('.contactForm').on('submit', function (e) {
        e.preventDefault();
        let nom = $('#nom').val();
        let telephone = $('#telephone').val();
        let mail = $('#mail').val();
        let message = $('#message').val();
        let newsletter = $('input[name="newsletter"]:checked').val();
        let checkRobot = $('#checkRobot').val();
        let regexMail = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;

        if (nom.length === 0 || !mail.match(regexMail) || checkRobot != 7) {
             $('#retourFormulaire').css({
                "padding": "15px", "margin-top": "20px", "color": "orange",
                "font-size": "1rem", "text-align": "center", "border": "1px solid orange",
                "border-radius": "5px", "background-color": "rgba(255, 165, 0, 0.1)"
             }).html('Veuillez corriger les erreurs dans le formulaire.').hide().fadeIn();
             $('#nom').trigger('blur');
             $('#mail').trigger('blur');
             $('#checkRobot').trigger('blur');
             return;
        }

        // !!! UPDATE PATH TO YOUR PHP SCRIPT !!!
        $.post('path/to/your/sendFormContact.php',
                {nom: nom, telephone: telephone, mail: mail, message: message, newsletter: newsletter, checkRobot: checkRobot },
                function(data, textStatus, xhr) {
                    $('#retourFormulaire').css({
                        "padding": "15px", "margin-top": "20px", "color": "white",
                        "font-size": "1rem", "text-align": "center", "border": "1px solid var(--primary-color)",
                        "border-radius": "5px", "background-color": "rgba(189, 230, 76, 0.1)"
                    }).html(data).hide().fadeIn();
                    // $('form.contactForm').fadeOut(400);
                    $('#nom').val(''); $('#telephone').val(''); $('#mail').val('');
                    $('#message').val(''); $('#checkRobot').val('');
                }).fail(function(xhr, textStatus, errorThrown) {
                    console.error("AJAX Error:", textStatus, errorThrown);
                    $('#retourFormulaire').css({
                       "padding": "15px", "margin-top": "20px", "color": "white",
                       "font-size": "1rem", "text-align": "center", "border": "1px solid red",
                       "border-radius": "5px", "background-color": "rgba(255, 0, 0, 0.1)"
                   }).html('Erreur ('+textStatus+'). Veuillez réessayer.').hide().fadeIn();
                });
    });


    // Form newsletter validation (Version Précédente)
    let regexMailNews = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
    $('#emailNews').on('blur input', function(event) {
        let mailEntry = $('#emailNews').val();
        if (mailEntry.length > 0 && !mailEntry.match(regexMailNews)) {
          $('#helpMailNews').text('Adresse email incorrecte').css('color','orange').hide().show();
          $('#hideNews').stop().fadeOut();
        } else {
          $('#helpMailNews').slideUp(100);
          if (mailEntry.length > 0) {
            $('#hideNews').stop().fadeIn();
          } else {
            $('#hideNews').stop().fadeOut();
          }
        }
    });
    $('#checkRobotNews').on('blur input', function(event) {
        if ($('#checkRobotNews').val() != 7) {
          $('#helpMailNews').text('Résultat incorrect').css('color','orange').hide().show();
        } else {
          $('#helpMailNews').slideUp(100);
        }
    });


    // Form newsletter AJAX submission (Version Précédente)
    $('.newsletterForm').on('submit', function (e) {
         e.preventDefault();
         let mail = $('#emailNews').val();
         let checkRobot = $('#checkRobotNews').val();

         if (!mail.match(regexMailNews) || ($('#hideNews').is(':visible') && checkRobot != 7)) {
             $('#retourNewsFormulaire').css({
                "padding": "15px", "margin-top": "20px", "color": "orange",
                "font-size": "1rem", "text-align": "center", "border": "1px solid orange",
                "border-radius": "5px", "background-color": "rgba(255, 165, 0, 0.1)"
             }).html('Veuillez vérifier l\'email et la vérification.').hide().fadeIn();
             $('#emailNews').trigger('blur');
             if ($('#hideNews').is(':visible')) { $('#checkRobotNews').trigger('blur'); }
             return;
         }

         // !!! UPDATE PATH TO YOUR PHP SCRIPT !!!
         let phpSubscriptionPath = 'path/to/your/sendFormSubscription.php';
         $.post(phpSubscriptionPath,
                 { mail: mail, checkRobot: checkRobot },
                 function(data, textStatus, xhr) {
                     $('#retourNewsFormulaire').css({
                        "padding": "15px", "margin-top": "20px", "color": "white",
                        "font-size": "1rem", "text-align": "center", "border": "1px solid var(--primary-color)",
                        "border-radius": "5px", "background-color": "rgba(189, 230, 76, 0.1)"
                     }).html(data).hide().fadeIn();
                     // $('.newsletterForm').fadeOut(400);
                     $('#emailNews').val(''); $('#checkRobotNews').val('');
                     $('#hideNews').fadeOut();
                   }).fail(function(xhr, textStatus, errorThrown) {
                       console.error("AJAX Error:", textStatus, errorThrown);
                        $('#retourNewsFormulaire').css({
                           "padding": "15px", "margin-top": "20px", "color": "white",
                           "font-size": "1rem", "text-align": "center", "border": "1px solid red",
                           "border-radius": "5px", "background-color": "rgba(255, 0, 0, 0.1)"
                       }).html('Erreur ('+textStatus+'). Veuillez réessayer.').hide().fadeIn();
                   });
    });


    // Animations on scroll (Version Précédente)
    $(window).on('scroll', function () {
        let sizePage = $(window).height();
        let trigger = 100;
        let element = document.getElementsByClassName('animatableY');
        for (var unit of element) {
          if (unit.getBoundingClientRect().top + trigger <= sizePage) {
            unit.classList.add('showed');
          }
        }
        let elementh2 = document.getElementsByClassName('animatableX');
        for (var unit of elementh2) {
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


    // Lazyload Initialization (Version Précédente)
    if (typeof LazyLoad !== 'undefined' && !window.location.pathname.match("mentions")) {
        lazyload();
    }


    // Reload on resize (Version Précédente, commentée)
    /*
    let initialWidth = $(window).innerWidth();
    $(window).on('resize', function () { ... });
    */

    // Manage scroll up button (Version Précédente, corrigée)
    let scrollUpHandler = function() {
        let scrollNow = $(window).scrollTop();
        if (scrollNow > 600) {
            if ($('#upArrow').is(":hidden")) {
                 $('#upArrow').show();
            }
        } else {
            $('#upArrow').hide();
        }
    };
    $(window).on('scroll', scrollUpHandler);
    scrollUpHandler(); // Check on load
    $('#upArrow').on('click', function () {
        $('html, body').animate({scrollTop: 0}, 500);
    });

    // Card click listener REMOVED

    // Location socials (COMMENTED OUT)
    /* ... */

// End of Document Ready
});