export default class SortableList {
  element;

  constructor({items = []} = {}) {
    this.items = items;

    this.render();
  }

  render() {
    this.element = document.createElement('ul');
    this.element.className = 'sortable-list';

    this.addItems();
    this.initEventListeners();
  }

  addItems() {
    for (const item of this.items) {
      item.classList.add('sortable-list__item');
    }

    this.element.append(...this.items);
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', (event) => {
      if (event.target) {
        let item = event.target.closest('.sortable-list__item');

        if (item) {
          if (event.target.closest('[data-grab-handle]')) {
            event.preventDefault();
            this.dragStart(item, event);
          }

          if (event.target.closest('[data-delete-handle]')) {
            event.preventDefault();

            item.remove();
          }
        }
      }
    });
  }

  dragStart(element, {clientX, clientY}) {
    this.draggingElement = element;
    this.elementInitialIndex = [...this.element.children].indexOf(element);

    const {x, y} = element.getBoundingClientRect();
    const { offsetWidth, offsetHeight} = element;

    this.pointerShift = {
      x: clientX - x,
      y: clientY - y
    };

    this.draggingElement.style.width = `${offsetWidth}px`;
    this.draggingElement.style.height = `${offsetHeight}px`;
    this.draggingElement.classList.add('sortable-list__item_dragging');

    this.placeholderElement = this.createPlaceholderElement(offsetWidth, offsetHeight);

    this.draggingElement.after(this.placeholderElement);

    this.element.append(this.draggingElement);
    this.moveDraggingAt(clientX, clientY);
    this.addDocumentEventListeners();
  }

  createPlaceholderElement(width, height) {
    const element = document.createElement('li');

    element.className = 'sortable-list__placeholder';
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;

    return element;
  }

  addDocumentEventListeners () {
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  removeDocumentEventListeners () {
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

  moveDraggingAt(clientX, clientY) {
    this.draggingElement.style.left = `${clientX - this.pointerShift.x}px`;
    this.draggingElement.style.top = `${clientY - this.pointerShift.y}px`;
  }

  onPointerMove = ({clientX, clientY}) => {
    this.moveDraggingAt(clientX, clientY);

    const prevElem = this.placeholderElement.previousElementSibling;
    const nextElem = this.placeholderElement.nextElementSibling;

    const { firstElementChild, lastElementChild } = this.element;
    const { top: firstElementTop } = firstElementChild.getBoundingClientRect();
    const { bottom } = this.element.getBoundingClientRect();

    if (clientY < firstElementTop) {
      return firstElementChild.before(this.placeholderElement);
    }

    if (clientY > bottom) {
      return lastElementChild.after(this.placeholderElement);
    }

    if (prevElem) {
      const { top, height } = prevElem.getBoundingClientRect();
      const middlePrevElem = top + height / 2;

      if (clientY < middlePrevElem) {
        return prevElem.before(this.placeholderElement);
      }
    }

    if (nextElem) {
      const { top, height } = nextElem.getBoundingClientRect();
      const middleNextElem = top + height / 2;

      if (clientY > middleNextElem) {
        return nextElem.after(this.placeholderElement);
      }
    }

    this.scrollIfCloseToWindowEdge(clientY);
  }

  scrollIfCloseToWindowEdge(clientY) {
    const scrollingValue = 10;
    const threshold = 20;

    if (clientY < threshold) {
      window.scrollBy(0, -scrollingValue);
    } else if (clientY > document.documentElement.clientHeight - threshold) {
      window.scrollBy(0, scrollingValue);
    }
  }

  onPointerUp = () => {
    this.dragStop();
  }

  dragStop() {
    const placeholderIndex = [...this.element.children].indexOf(this.placeholderElement);

    this.draggingElement.style.cssText = '';
    this.draggingElement.classList.remove('sortable-list__item_dragging');
    this.placeholderElement.replaceWith(this.draggingElement);
    this.draggingElement = null;

    this.removeDocumentEventListeners();

    if (placeholderIndex !== this.elementInitialIndex) {
      this.dispatchEvent('sortable-list-reorder', {
        from: this.elementInitialIndex,
        to: placeholderIndex
      });
    }
  }

  dispatchEvent(type, details) {
    this.element.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      details
    }));
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.removeDocumentEventListeners();
    this.element = null;
  }
}
