class Tooltip {
  static instance;

  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    }
    return Tooltip.instance;
  }


  getTemplate(tooltipText = '') {
    return `
    <body>
        <div class="tooltip">${tooltipText}</div>
    </body>`;
  }

  render(tooltipText = '') {
    const element = document.createElement("div");

    element.innerHTML = this.getTemplate(tooltipText);

    this.element = element.firstElementChild;
    document.body.append(this.element);
  }

  initialize () {
    this.initEventListeners();
  }

  initEventListeners() {
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  onPointerOver = (event) => {
    if (event.target) {
      let element = event.target.closest('[data-tooltip]');

      if (element) {
        this.render(element.dataset.tooltip);
        document.addEventListener('pointermove', this.onPointerMove);
      }
    }
  }

  onPointerOut = (event) => {
    if (event.target) {
      this.remove();
      document.removeEventListener('pointermove', this.onPointerMove);
    }
  }

  onPointerMove = (event) => {
    if (event.target) {
      const offset = 10;
      this.element.style.left = event.x + offset + 'px';
      this.element.style.top = event.y + offset + 'px';
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointerover', this.onPointerMove);
    document.removeEventListener('pointerout', this.onPointerOut);
    document.removeEventListener('pointermove', this.onPointerMove);
  }
}

export default Tooltip;
