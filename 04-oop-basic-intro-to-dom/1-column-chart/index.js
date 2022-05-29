export default class ColumnChart {
  static chartHeight = 50;

  constructor({data = [], value = 0, label = '', link = '', formatHeading = data => data} = {}) {
    this.data = data;
    this.label = label;
    this.value = formatHeading(value);
    this.link = link;
    this.render();
  }

  getTemplate() {
    return `
     <div class="column-chart column-chart_loading" style="--chart-height: 50">
          <div class="column-chart__title">
              Total ${this.label}
              ${this.getLink()}
          </div>
          <div class="column-chart__container">
              <div data-element="header" class="column-chart__header">${this.value}</div>
              <div data-element="body" class="column-chart__chart">
                  ${this.getColumnBody()}
              </div>
          </div>
      </div>
    `;
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  getColumnBody() {
    const props = this.getColumnProps(this.data);

    return props.map(item => {
      return `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`
    }).join('');
  }

  getLink() {
    if (this.link) {
      return `<a href="${this.link}" class="column-chart__link">View all</a>`;
    }
    return '';
  }

  render() {
    const element = document.createElement("div");

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    if (this.data.length !== 0) {
      this.element.classList.remove('column-chart_loading');
    }
  }

  update(newData = []) {
    this.remove();

    this.data = newData;

    this.render();
  }

  initEventListeners() {
    // todo
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // todo remove event listeners
  }
}
