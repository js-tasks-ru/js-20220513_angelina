import fetchJson from './utils/fetch-json.js';
import FetchJson from "./utils/fetch-json.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element;
  chartHeight = 50;
  subElements = {};

  constructor({url = '', range = {from: new Date(), to: new Date()}, label = '', link = '', formatHeading = data => data} = {}) {
    this.url = new URL(url, BACKEND_URL);

    this.range = range;
    this.label = label;
    this.formatHeading = formatHeading;
    this.link = link;

    this.render();
    this.update(this.range.from, this.range.to);
  }

  getTemplate() {
    return `
     <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
          <div class="column-chart__title">
              Total ${this.label}
              ${this.getLink()}
          </div>
          <div class="column-chart__container">
              <div data-element="header" class="column-chart__header"></div>
              <div data-element="body" class="column-chart__chart"></div>
          </div>
      </div>
    `;
  }

  getHeaderValue(data) {
    return this.formatHeading(Object.values(data).reduce((accum, item) => (accum + item), 0));
  }

  getColumnBody(data) {
    const maxValue = Math.max(...Object.values(data));

    return Object.entries(data).map(([key, value]) => {
      const scale = this.chartHeight / maxValue;
      const percent = (value / maxValue * 100).toFixed(0);
      const tooltip = `<span>
          <small>${key.toLocaleString('default', {dateStyle: 'medium'})}</small>
          <br>
          <strong>${percent}%</strong>
        </span>`;

      return `<div style="--value: ${Math.floor(value * scale)}" data-tooltip="${tooltip}"></div>`
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

    this.subElements = this.getSubElements();
  }

  getSubElements() {
    const result = [];
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      result[subElement.dataset.element] = subElement;
    }

    return result;
  }

  setNewRange(from, to) {
    this.range.from = from;
    this.range.to = to;
  }

  async loadData(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    return await FetchJson(this.url);
  }

  async update(from, to) {
    this.element.classList.add('column-chart_loading');

    const data = await this.loadData(from, to);

    this.setNewRange(from, to);

    if (data && Object.values(data).length) {
      this.subElements.header.textContent = this.getHeaderValue(data);
      this.subElements.body.innerHTML = this.getColumnBody(data);

      this.element.classList.remove('column-chart_loading');
    }

    this.data = data;
    return this.data;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // todo remove event listeners
  }

}
