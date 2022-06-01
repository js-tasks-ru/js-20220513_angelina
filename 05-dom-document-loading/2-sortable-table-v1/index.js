export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.data = data;
    this.config = headerConfig;

    this.render();
  }

  getTemplate() {
    return `
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.getHeader()}
          </div>
          <div data-element="body" class="sortable-table__body">
            ${this.getTableBody(this.data)}
          </div>
        </div>
    `;
  }

  getHeader() {
    return this.config.map(item => {
      return `
        <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
            <span>${item.title}</span>
            <span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
            </span>
        </div>
      `
    }).join('');
  }

  getTableBody(data = []) {
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

  render() {
    const element = document.createElement("div");

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
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

  sort(field, order) {
    const sortedData = this.sortData(field, order);
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);

    allColumns.forEach(column => {
      column.dataset.order = '';
    });

    currentColumn.dataset.order = order;

    this.subElements.body.innerHTML = this.getTableBody(sortedData);
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


}

