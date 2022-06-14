import fetchJson from './utils/fetch-json.js';
import FetchJson from "./utils/fetch-json.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  loading = false;
  step = 20; start = 1;
  end = this.start + this.step;

  constructor(headersConfig = [], {
    url = '',
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false,
    step = 20,
    start = 1,
    end = start + step
  } = {}) {
    this.config = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.end = end;

    this.render();
  }

  onWindowScroll = async () => {
    const {bottom} = this.element.getBoundingClientRect();
    const {id, order} = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(id, order, this.start, this.end);
      this.update(data);

      this.loading = false;
    }

  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
    window.addEventListener('scroll', this.onWindowScroll);
  }

  onSortClick = event => {
    let column = event.target.closest('[data-sortable="true"]');
    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc'
      };

      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      let newOrder = toggleOrder(order);
      if (newOrder === undefined) {
        newOrder = 'asc';
      }

      this.sorted = {
        id,
        order: newOrder
      };

      column.dataset.order = newOrder;
      column.append(this.subElements.arrow);

      if (this.isSortLocally) {
        this.sortOnClient(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder);
      }
    }
  }

  getTable() {
    return `
        <div class="sortable-table">
            ${this.getTableHeader()}
            ${this.getTableBody(this.data)}

            <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

            <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
              <div>
                <p>No products satisfies your filter criteria</p>
                <button type="button" class="button-primary-outline">Reset all filters</button>
              </div>
            </div>
        </div>
    `;
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.config.map(item => this.getHeaderRow(item)).join('')}
    </div>`;
  }

  getHeaderRow({id, title, sortable}) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
        <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
            <span>${title}</span>
            ${this.getHeaderSortingArrow(id)}
        </div>
    `;
  }

  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>
    `;
  }

  getTableRows(data = []) {
    return data.map(item => {
      return `
        <a href="/products/${item.id}" class="sortable-table__row">
          ${this.getTableRow(item)}
        </a>
      `;
    }).join('');
  }

  getTableRow(item) {
    return this.config.map(configItem => {
      if (configItem.template) {
        return configItem.template(item[configItem.id]);
      }
      return `<div class="sortable-table__cell">${item[configItem.id]}</div>`
    }).join('');
  }

  async render() {
    const {id, order} = this.sorted;
    const element = document.createElement("div");

    element.innerHTML = this.getTable();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    const data = await this.loadData(id, order, this.start, this.end);

    this.renderRows(data);
    this.initEventListeners();
  }

  getSubElements(element) {
    const result = {}
    const elements = element.querySelectorAll('[data-element]');

    for (const item of elements) {
      const name = item.dataset.element;
      result[name] = item;
    }
    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;
    window.removeEventListener('scroll', this.onWindowScroll);
  }

  sort(field, order) {
    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }
  }

  async sortOnServer (id, order) {
    const start = 1;
    const end = start + this.step;
    const result = await this.loadData(id, order, start, end);

    this.renderRows(result);
  }

  sortOnClient(field, order) {
    const sortedData = this.sortData(field, order);

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  renderRows(data) {
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${this.sorted.id}"]`);

    allColumns.forEach(column => {
      column.dataset.order = '';
    });
    currentColumn.dataset.order = this.sorted.order;


    this.subElements.body.innerHTML = this.getTableRows(data);
  }

  sortData(field, order) {
    const arr = [...this.data];
    const column = this.config.find(item => item.id === field);
    const { sortType } = column;
    const directions = { asc: 1, desc: -1};
    const direction = directions[order];

    return arr.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[field] - b[field]);
        case 'string':
          return direction * a[field].localeCompare(b[field], ['ru-RU', 'en-US'], {caseFirst: "upper"});
        default:
          return direction * (a[field] - b[field]);
      }
    });
  }

  async loadData(id, order, start, end) {
    this.url.searchParams.set('_embed', 'subcategory.category');
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    return await FetchJson(this.url);
  }

  update(data) {
    const rows = document.createElement('div');

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableRows(data);

    this.subElements.body.append(...rows.childNodes);
  }

  addRows(data) {
    this.data = data;
    this.subElements.body.innerHTML = this.getTableRows(data);
  }
}
