import KeyvStorage from '@kangfenmao/keyv-storage'

function init() {
  initSpinner()
  initKeyv()
}

function initSpinner() {
  const spinner = document.getElementById('spinner')
  if (spinner && window.location.hash !== '#/mini') {
    spinner.style.display = 'flex'
  }
}

function initKeyv() {
  window.keyv = new KeyvStorage()
  window.keyv.init()
}

init()
