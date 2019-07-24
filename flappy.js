const criarDiv = (tagName, className) => {
  const elem = document.createElement(tagName)
  elem.className = className;
  return elem
}

function Barreira(reversa=false)  {
  this.elemento = criarDiv('div', 'barreira')

  const borda = criarDiv('div', 'borda')
  const corpo = criarDiv('div', 'corpo')
  this.elemento.appendChild(reversa ? corpo : borda)
  this.elemento.appendChild(reversa ? borda : corpo)

  this.setAltura = altura => corpo.style.height = `${altura}px`
}

// const b = new Barreira(true)
// b.setAltura(300)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function Obstaculos(altura, abertura, x) {
  this.elemento = criarDiv('div', 'obstaculos')

  this.superior = new Barreira(true)
  this.inferior = new Barreira(false)

  this.elemento.appendChild(this.superior.elemento)
  this.elemento.appendChild(this.inferior.elemento)

  this.randomOpen = () => {
    const alturaSuperior = Math.random() * (altura - abertura)
    const alturaInferior = altura - abertura - alturaSuperior
    this.superior.setAltura(alturaSuperior)
    this.inferior.setAltura(alturaInferior)
  }

  this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
  this.setX = x => this.elemento.style.left = `${x}px`
  this.getLargura = () => this.elemento.clientWidth

  this.randomOpen()
  this.setX(x)
}

// const b = new Obstaculos(700, 200, 100)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
  this.pares = [
    new Obstaculos(altura, abertura, largura),
    new Obstaculos(altura, abertura, largura + espaco),
    new Obstaculos(altura, abertura, largura + espaco * 2),
    new Obstaculos(altura, abertura, largura + espaco * 3)
  ]
  
  const deslocamento = 10
  this.animar = () => {
    this.pares.forEach(par => {
      par.setX(par.getX() - deslocamento)

      if(par.getX() < -par.getLargura()) {
        par.setX(par.getX() + espaco * this.pares.length)
        par.randomOpen()
      }

      const meio = largura / 2
      const cruzouMeio = par.getX() + deslocamento >= meio && par.getX() < meio
      if(cruzouMeio) notificarPonto()

    })
  }
}

// const barreiras = new Barreiras (400, 1100, 10, 400)
// const gameArea = document.querySelector('[wm-flappy]')
// barreiras.pares.forEach(par => gameArea.appendChild(par.elemento))
// setInterval(() => {
//   barreiras.animar()
// }, 2)

function Passaro(alturaJogo) {
  let voando = false
  
  this.elemento = criarDiv('img', 'passaro')
  this.elemento.src = 'img/lauriamosquitao1.png'

  this.getY = () => parseInt(this.elemento.style.top.split('px')[0])
  this.setY = y => this.elemento.style.top = `${y}px`

  window.onkeyup = e => voando = true;
  window.onkeydown = e => voando = false;

  this.animar = () => {
    const newY = this.getY() + (voando ? 5 : -5)
    const alturaMaxima = alturaJogo - this.elemento.clientHeight

    if(newY <= 0) {
      this.setY(0)
    } else if (newY >= alturaMaxima){
      this.setY(alturaMaxima)
    }else{
      this.setY(newY)
    }
  }
  this.setY(alturaJogo/2)
}

function Progress() {
  this.elemento = criarDiv('span', 'progress')
  this.atualizarPontos = pontos => {
    this.elemento.innerHTML = pontos
  }
  this.atualizarPontos(0)
}
//  const barreiras = new Barreiras(700, 1200, 300, 500)
//  const passaro = new Passaro(580)
//  const gameArea = document.querySelector('[wm-flappy]')
//  gameArea.appendChild(passaro.elemento)
//  gameArea.appendChild(new Progress().elemento)
//  barreiras.pares.forEach(par => gameArea.appendChild(par.elemento))
//  setInterval(() => {
//      barreiras.animar()
//      passaro.animar()
//  }, 20)

function estaoSobrepostos(elementoA, elementoB) {
  const a = elementoA.getBoundingClientRect()
  const b = elementoB.getBoundingClientRect()

  const horizontal = a.left + a.width >= b.left
      && b.left + b.width >= a.left
  const vertical = a.top + a.height >= b.top
      && b.top + b.height >= a.top
  return horizontal && vertical
}

function colidiu(passaro, barreiras) {
  let colidiu = false
  barreiras.pares.forEach(Obstaculos => {
    if(!colidiu) {
      const superior = Obstaculos.superior.elemento
      const inferior = Obstaculos.inferior.elemento
      colidiu = estaoSobrepostos(passaro.elemento, superior) || estaoSobrepostos(passaro.elemento, inferior)
    }
  })
  return colidiu
}

function Avoid () {
  let pontos = 0

  const gameArea = document.querySelector('[wm-flappy]')
  const altura = gameArea.clientHeight
  const largura = gameArea.clientWidth

  const progresso = new Progress()
  const barreiras = new Barreiras(altura, largura, 200, 400, () => progresso.atualizarPontos(++pontos))
  const passaro = new Passaro(altura)

  gameArea.appendChild(progresso.elemento)
  gameArea.appendChild(passaro.elemento)
  barreiras.pares.forEach(par => gameArea.appendChild(par.elemento))

  this.start = () => {
    alert('NÃO DEIXA O MOSQUITAO ENTRAR NAS CAIXA DAGUA MENOR')
    const timer = setInterval(() => {
      barreiras.animar()
      passaro.animar()

      if(colidiu(passaro,barreiras)) {
        alert("VC DEIXOU O LAURIA ENTRAR NA CAIXA D'AGUA")
        clearInterval(timer)
      }
    }, 30)
  }
}
new Avoid().start()