import throttle from 'throttle-debounce/throttle';
import './styles.css';

function addButton(container, label, onclick) {
  // Add a button to a container.
  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.className = 'button button-outline';
  button.innerHTML = label;
  button.addEventListener('click', onclick);
  container.appendChild(button);
  return button;
}

function calculateOverlap(d, r, R) {
  // Calculate the DIFI overlap.
  // d is the center-to-center spacing between the small and big circles.
  // r is the radius of the small circle.
  // R is the radius of the large circle.
  const x = ((d * d) + (r * r) - (R * R)) / (2 * d * r);
  const y = ((d * d) + (R * R) - (r * r)) / (2 * d * R);
  const z = (-d + r + R) * (d + r - R) * (d - r + R) * (d + r + R);
  const overlapArea = (r * r * Math.acos(x)) + (R * R * Math.acos(y)) - (Math.sqrt(z) / 2);
  if (d > r + R) {
    return 0;
  } else if (d < R - r) {
    return 100;
  }
  return 100 * (overlapArea / (Math.PI * r * r));
}

function outerLeft(el) {
  // Find the left offset of an element (including border)
  // relative to the page
  const rect = el.getBoundingClientRect();
  const left = rect.left + document.body.scrollLeft;
  return left - parseFloat(getComputedStyle(el)['border-left-width'], 10);
}

function outerRight(el) {
  // Find the right offset of an element (including border)
  // relative to the page
  return outerLeft(el) + el.offsetWidth;
}

export class DIFIInput {

  constructor(el, options = {}) {
    this.drag = throttle(20, this.drag.bind(this));
    this.startDrag = this.startDrag.bind(this);
    this.endDrag = this.endDrag.bind(this);

    this.el = el;
    this.options = options;
    this.initializeDOM();
    this.update();
  }

  initializeDOM() {
    // Construct the widget.
    const name = this.el.getAttribute('name');
    this.el.setAttribute('name', `${name}_distance`);
    this.el.setAttribute('type', 'hidden');

    this.elOverlap = document.createElement('input');
    this.elOverlap.setAttribute('name', `${name}_overlap`);
    this.elOverlap.setAttribute('type', 'hidden');
    this.el.insertAdjacentElement('afterend', this.elOverlap);

    const elContent = document.createElement('div');
    elContent.className = 'DIFI';
    elContent.innerHTML = `
      <div class="DIFI-controls"></div>
      <div class="DIFI-group"><label>${this.options.groupLabel || 'Group'}</label></div>
      <div class="DIFI-range">
        <div class="DIFI-me"><label>${this.options.meLabel || 'Me'}</label></div>
      </div>
    `;
    this.me = elContent.querySelector('.DIFI-me');
    this.group = elContent.querySelector('.DIFI-group');
    this.elRange = elContent.querySelector('.DIFI-range');

    if (this.options.groupImage) {
      this.group.style.backgroundImage = `url(${this.options.groupImage})`;
    }

    const controls = elContent.querySelector('.DIFI-controls');
    addButton(controls, '&#9664;&#9664;', this.nudge.bind(this, -0.5));
    addButton(controls, '&#9664;', this.nudge.bind(this, -0.1));
    addButton(controls, '&#9654;', this.nudge.bind(this, 0.1));
    addButton(controls, '&#9654;&#9654;', this.nudge.bind(this, 0.5));

    this.el.insertAdjacentElement('beforebegin', elContent);

    this.me.addEventListener('mousedown', this.startDrag.bind(this));
  }

  startDrag(e) {
    // Start tracking mouse when clicked.
    e.preventDefault();
    e.stopPropagation();
    this.me.className = 'DIFI-me dragging';

    this.dragOrigLeft = parseFloat(getComputedStyle(this.me).left, 10);
    this.dragOrigX = e.pageX;
    document.addEventListener('mousemove', this.drag);
    document.addEventListener('mouseup', this.endDrag);
  }

  drag(e) {
    // Update position of Me while dragging.
    e.preventDefault();
    e.stopPropagation();
    if (this.dragOrigX === null) {
      return;
    }
    const deltaPixels = e.pageX - this.dragOrigX;
    this.nudgePixels(deltaPixels, this.dragOrigLeft);
  }

  endDrag() {
    // Stop tracking mouse when mouse released.
    this.me.className = 'DIFI-me';
    document.removeEventListener('mousemove', this.drag);
    document.removeEventListener('mouseup', this.endDrag);
    this.dragOrigX = null;
    this.dragOrigLeft = null;
  }

  update() {
    // Update distance and overlap values from current position.
    // Distance is based on difference in position:
    // - left circle separated from right circle: -100 to 0
    // - left circle just touching right circle: 0
    // - left circle overlapping right circle: 0 to 100
    // - left circle contained within right circle: 100 to 125
    // - left circle at the center of right circle: 125
    const R = this.group.offsetWidth / 2;
    const r = this.me.offsetWidth / 2;
    const mePos = outerLeft(this.me);
    const groupPos = outerLeft(this.group);
    const d = mePos - groupPos;
    let value = 100 + 50 * d / r;
    // Snap to center
    const elRange = this.me.parentNode;
    if (outerRight(elRange) - outerRight(this.me) < 2) {
      value = 125;
    }
    // Clip value to desired range (-100 to 125)
    value = Math.max(Math.min(Math.round(value * 1000) / 1000, 125), -100);
    this.el.setAttribute('value', value);

    // Compute overlap.
    const dCenterToCenter = (groupPos + R) - (mePos + r);
    const overlap = calculateOverlap(dCenterToCenter, r, R);
    this.elOverlap.setAttribute('value', overlap);
  }

  nudge(delta) {
    // Move by `delta` units (1 unit = radius of Me circle)
    const unit = this.me.offsetWidth / 2;
    const deltaPixels = delta * unit;
    this.nudgePixels(deltaPixels);
  }

  nudgePixels(delta, origLeft) {
    // Move by `delta` pixels
    // (relative to origLeft if specified, or to current position)
    let start = origLeft;
    if (start === undefined) {
      start = parseFloat(getComputedStyle(this.me).left, 10);
    }
    let finish = start + delta;
    if (finish < 0) {
      finish = 0;
    }
    if (finish > this.elRange.offsetWidth - this.me.offsetWidth) {
      finish = this.elRange.offsetWidth - this.me.offsetWidth;
    }
    this.me.style.left = `${finish / this.elRange.offsetWidth * 100}%`;
    this.update();
  }
}
