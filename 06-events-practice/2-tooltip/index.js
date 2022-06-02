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
    document.addEventListener('mouseover', (event) => {
      if (event.target) {
        let div = event.target.closest('div');
        if (!div) { return; }
        this.render(event.target.dataset.tooltip);
        this.element.style.left = event.x + 'px';
        this.element.style.top = event.y + 'px';
      }
    });

    document.addEventListener('mousemove', (event) => {
      if (event.target) {
        console.log(event.x, event.y);
        this.element.style.left = event.x + 'px';
        this.element.style.top = event.y + 'px';
      }
    });

    document.addEventListener('mouseout', (event) => {
      if (event.target) {
        this.remove();
      }
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

export default Tooltip;
