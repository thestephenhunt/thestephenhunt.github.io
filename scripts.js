
// Set defaults
let $activeElem = false
let timeout = 0

// Get favorites element
const $fav = document.querySelector('.projects')

// Get the transition timeout from CSS
const getTimeouts = () => {
  const durationOn = parseFloat(getComputedStyle(document.documentElement)
    .getPropertyValue('--duration-expand'));

  timeout = parseFloat(durationOn) * 1000
}

// Get the top offset
const getTop = ($elem) => {
  const elemRect = $elem.getBoundingClientRect()

  return elemRect.top
}

// Set data attributes for calculations
const setDataAttrs = ($elems, $parent) => {
  // Get the top offset of the first element
  let top = getTop($elems[0])

  // Set grid gap from CSS
  const gridColumnGap = parseFloat(getComputedStyle(document.documentElement)
    .getPropertyValue('--gap'))

  $parent.setAttribute('data-gap', gridColumnGap)

  // Set grid item width from CSS
  const eStyle = getComputedStyle($elems[0])
  $parent.setAttribute('data-width', eStyle.width)

  // Iterate through grid items
  for (let i = 0; i < $elems.length; i++) {
    const t = getTop($elems[i])

    // Check when top offset changes
    if (t != top) {
      // Set the number of columns and break stop the loop
      $parent.setAttribute('data-cols', i)
      break;
    }
  }
}

// Deactivate grid items
const deactiveElems = ($elems, $parent, $currentElem, $button) => {
  // Unset parent class
  $parent.classList.remove('is-zoomed')

  for (let i = 0; i < $elems.length; i++) {
    // Unset item class
    $elems[i].classList.remove('is-zoomed')
    // Unset item CSS transform
    $elems[i].style.transform = 'none'

    // Skip the rest if the item is the current item
    if ($elems[i] === $currentElem) {
      continue
    }

    // Unset item aria expanded if element exists
    if($button) {
      $button.setAttribute('aria-expanded', false)
    }

    // After a half of the timeout, reset CSS z-index to avoid overlay issues
    setTimeout(() => {
      $elems[i].style.zIndex = 0
    }, timeout)
  }
}

// Set active item
const activateElem = ($elems, $parent, $elem, $button, lengthOfElems, i) => {
  // Get data attributes from parent
  const cols = parseInt($parent.getAttribute('data-cols'))
  const width = parseFloat($parent.getAttribute('data-width'))
  const gap = parseFloat($parent.getAttribute('data-gap'))

  // If there is only a single column, prevent from executing
  if (cols === 1) {
    return
  }

  // Calculate the number of rows
  const rows = Math.ceil(lengthOfElems / cols) - 1

  // If there is only a single row, prevent from executing
  if (rows === 0) {
    return
  }

  // Reset all elements
  deactiveElems($elems, $parent, $elem, $button)

  // If there is active element, set focus to it, unset global active element, and prevent from further executing
  if ($activeElem) {
    $activeElem.focus()
    $activeElem = false
    return
  }

  // Calculate if the item is in the last row
  const isLastRow = i + 1 > rows * cols
  // Set default transform direction to top (expand down)
  let transformOrigin = 'top'

  if (isLastRow) {
    // If the item is in the last row, set transform direction to bottom (expand up)
    transformOrigin = 'bottom'
  }

  // Calculate if the item is the most right
  const isRight = (i + 1) % cols !== 0

  if (isRight) {
    // If the item is the most right, set transform direction to left (expand right)
    transformOrigin += ' left'
  } else {
    // If the item is the most right, set transform direction to right (expand left)
    transformOrigin += ' right'
  }

  $elem.style.transformOrigin = transformOrigin

  // Calculate the scale coefficient
  const scale = (width * 2 + gap) / width

  // After a whole timeout, set CSS high z-index to avoid overlay issues
  setTimeout(() => {
    // Set high CSS z-index to avoid overlay issues
    $elem.style.zIndex = 10
    // Set parent class
    $parent.classList.add('is-zoomed')
    // Set item class
    $elem.classList.add('is-zoomed')
    // Set item CSS transform
    $elem.style.transform = `scale(${scale})`
    // Set item aria expanded
    $button.setAttribute('aria-expanded', true)
    // Set global active item
    $activeElem = $button
  }, timeout)
}

// Set sibling as an active item
const activateSibling = ($sibling) => {
  // Find anchor
  const $siblingButton = $sibling.querySelector('button')

  // Unset global active element
  $activeElem = false

  // Focus and click on current
  $siblingButton.focus()
  $siblingButton.click()
}

// Set click events on anchors
const setClicks = ($elems, $parent) => {
  $elems.forEach(($elem, i) => {
    // Find anchor
    const $button = $elem.querySelector('button')

    $button.addEventListener('click', (e) => {
      // Set active item on click
      activateElem($elems, $parent, $elem,  $button, $elems.length, i)
    })
  })
}

// Set keyboard events
const setKeyboardEvents = () => {
  document.addEventListener('keydown', (e) => {
    // Take action only if global active element exists
    if ($activeElem) {
      // If key is “escape”, emulate the click on the global active element
      if (e.code === 'Escape') {
        $activeElem.click()
      }

      // If key is “left arrow”, activate the previous sibling
      if (e.code === 'ArrowLeft') {
        const $previousSibling = $activeElem.parentNode.previousElementSibling

        if($previousSibling) {
          activateSibling($previousSibling)
        }
      }

      // If key is “right arrow”, activate the next sibling
      if (e.code === 'ArrowRight') {
        const $nextSibling = $activeElem.parentNode.nextElementSibling

        if($nextSibling) {
          activateSibling($nextSibling)
        }
      }
    }
  })
}

// Set resize events
const setResizeEvents = ($elems, $parent) => {
  window.addEventListener('resize', () => {
    // Set data attributes for calculations
    setDataAttrs($elems, $parent)
    // Deactivate grid items
    deactiveElems($elems, $parent)
  })
}

// If the favorites element exists, start the functionality
if ($fav) {
  // Find all list items
  const $favs = $fav.querySelectorAll('li')

  // Check if there are list items
  if ($favs.length) {
    // Get the transition timeout from CSS
    getTimeouts($favs)
    // Set data attributes for calculations
    setDataAttrs($favs, $fav)
    // Set click events on anchors
    setClicks($favs, $fav)
    // Set keyboard events
    setKeyboardEvents()
    // Set resize events
    setResizeEvents($favs, $fav)
  }
}

let navBar = document.getElementById("nav");
let navPos = navBar.getBoundingClientRect().top;

window.addEventListener("scroll", e => {
    let scrollPos = window.scrollY;

    if (scrollPos > navPos) {
        navBar.classList.add('sticky');
      }
      else {
        navBar.classList.remove('sticky');
      }
  });

  function toggleNav() {
    console.log("TOGGLED")
    document.getElementsByClassName("drawer")[0].classList.toggle("opened")
    document.getElementsByClassName("hamburger")[0].classList.toggle("hidden")
  }