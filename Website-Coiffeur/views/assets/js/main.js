(function () {
  "use strict";

  // highlight les elements dans le menu quand hover au-dessus de la section

  let menu_items = document.querySelectorAll(".nav-link");
  console.log(menu_items)

  function setHighlight() {
    menu_items.forEach(item => {

      // prend le nom de la section de chaque menu
      let itemsec = document.querySelectorAll("#" + item.href.split("/").pop().replace("#", ""))[0];
      
      if (itemsec) {

        let positionScreen = window.scrollY + document.querySelector("#header").offsetHeight;

        if (itemsec.offsetTop <= positionScreen && positionScreen <= (itemsec.offsetTop + itemsec.offsetHeight)) {
          item.classList.add('active')

        } else {
          item.classList.remove('active')
        }
      }

    });
  }

  window.addEventListener("load", setHighlight);
  document.addEventListener("scroll", setHighlight);

  // fait en sorte que le menu devienne noir quand on scroll
  document.addEventListener('scroll', function () {
    let selectHeader = document.querySelector('#header')

    if (selectHeader) {
      if (window.scrollY > 50) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }

  });

})()
