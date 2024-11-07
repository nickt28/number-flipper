const getMaxNumberLength = (a: string | number, b: string | number): number => {
  return (a > b ? a : b).toString().length;
}

const convertToReversePaddedArray = (num: { toString: () => string }, length: number): number[] => {
  const padStart = (str: string, targetLength: number): string => str.length < targetLength ? padStart("0" + str, targetLength) : str;
  const stringToNumberArray = (str: string): number[] => [...str].map(Number);
  return stringToNumberArray(padStart(num.toString(), length)).reverse();
};

interface FlipOptions {
  /** Root element for the flip animation */
  node: HTMLElement;
  /** Starting number */
  from: number;
  /** Target number */
  to?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Delay before animation starts in seconds */
  delay?: number;
  /** Custom easing function */
  easeFn?: (position: number) => number;
  /** Available digits to display */
  digitSystem?: Array<string | number>;
  /** Whether to animate digits directly or in sequence */
  directAnimation?: boolean;
  /** Separator character(s) between digits */
  separator?: string | string[];
  /** Number of digits to separate from the right */
  separateOnly?: number;
  /** Separate every N digits */
  separateEvery?: number;
  /** CSS class names */
  containerClassName?: string;
  digitClassName?: string;
  separatorClassName?: string;
}

export class NumberFlipper {
  private initialDigits: number[];
  private targetDigits: number[];
  private readonly digitContainers: HTMLElement[];
  private readonly animationDuration: number;
  private readonly digitSystem: Array<string | number>;
  private easingFunction: (position: number) => number;
  from: number;
  to: number;
  private node: HTMLElement;
  private directAnimation: boolean;
  private separator?: string | string[];
  private separateOnly: number;
  private separateEvery: number;
  private height?: number;
  private containerClassName: string;
  private digitClassName: string;
  private separatorClassName: string;

  constructor({
    node,
    from = 0,
    to,
    duration = 0.5,
    delay,
    easeFn = (pos: number) =>
      (pos /= 0.5) < 1
        ? 0.5 * Math.pow(pos, 3)
        : 0.5 * (Math.pow(pos - 2, 3) + 2),
    digitSystem = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    directAnimation = true,
    separator,
    separateOnly = 0,
    separateEvery = 3,
    containerClassName = 'digit-container',
    digitClassName = 'digit',
    separatorClassName = 'separator',
  }: FlipOptions) {
    this.initialDigits = [];
    this.targetDigits = [];
    this.digitContainers = [];
    this.animationDuration = duration * 1000;
    this.digitSystem = digitSystem;
    this.easingFunction = easeFn;
    this.from = from;
    this.to = to || 0;
    this.node = node;
    this.directAnimation = directAnimation;
    this.separator = separator;
    this.separateOnly = separateOnly;
    this.separateEvery = separateOnly ? 0 : separateEvery;
    this.containerClassName = containerClassName;
    this.digitClassName = digitClassName;
    this.separatorClassName = separatorClassName;
    this.initializeHTML(getMaxNumberLength(this.from, this.to));
    this.setSelect(this.from);
    if (to === undefined) return;
    if (delay) setTimeout(() => this.flipTo({ to: this.to }), delay * 1000);
    else this.flipTo({ to: this.to });
  }

  initializeHTML(digits: number) {
    this.node.classList.add("number-flip");
    this.node.style.position = "relative";
    this.node.style.overflow = "hidden";
    for (let i = 0; i < digits; i += 1) {
      const ctnr = document.createElement("div");
      ctnr.className = `${this.containerClassName} ${this.containerClassName}${i}`;
      ctnr.style.position = "relative";
      ctnr.style.display = "inline-block";
      ctnr.style.verticalAlign = "top";
      [...this.digitSystem, this.digitSystem[0]].forEach((i) => {
        const child = document.createElement("div");
        child.className = this.digitClassName;
        child.innerHTML = `${i}`;
        ctnr.appendChild(child);
      });
      this.digitContainers.unshift(ctnr);
      this.node.appendChild(ctnr);
      this.initialDigits.push(0);
      if (
        !this.separator ||
        (!this.separateEvery && !this.separateOnly) ||
        i === digits - 1 ||
        ((digits - i) % this.separateEvery != 1 &&
          digits - i - this.separateOnly != 1)
      )
        continue;
      const sprtrStr = typeof this.separator === 'string'
        ? this.separator
        : (this.separator as string[]).shift();
      const separator = document.createElement("div");
      separator.className = this.separatorClassName;
      separator.style.display = "inline-block";
      separator.innerHTML = sprtrStr;
      this.node.appendChild(separator);
    }
    this.updateDimensions();
  }

  draw({ per, alter, digit }: { per: number; alter: number; digit: number }) {
    const newHeight =
      this.digitContainers[0].clientHeight / (this.digitSystem.length + 1);
    if (newHeight && this.height !== newHeight) this.height = newHeight;
    const from = this.initialDigits[digit];
    const modNum = (((per * alter + from) % 10) + 10) % 10;
    const translateY = `translateY(${-modNum * (this.height || 0)}px)`;
    this.digitContainers[digit].style.webkitTransform = translateY;
    this.digitContainers[digit].style.transform = translateY;
  }

  updateDimensions() {
    this.height = this.digitContainers[0].clientHeight / (this.digitSystem.length + 1);
    this.node.style.height = this.height + "px";
    if (this.targetDigits.length) this.frame(1);
    else
      for (let d = 0, len = this.digitContainers.length; d < len; d += 1)
        this.draw({
          digit: d,
          per: 1,
          alter: ~~(this.from / Math.pow(10, d)),
        });
  }

  frame(per: number) {
    let temp = 0;
    for (let d = this.digitContainers.length - 1; d >= 0; d -= 1) {
      const alter = this.targetDigits[d] - this.initialDigits[d];
      temp += alter;
      this.draw({
        digit: d,
        per: this.easingFunction(per),
        alter: this.directAnimation ? alter : temp,
      });
      temp *= 10;
    }
  }

  flipTo({
    to,
    duration = 0,
    easeFn,
    directAnimation,
  }: {
    to: number;
    duration?: number;
    easeFn?: () => any;
    directAnimation?: boolean;
  }): void {
    if (easeFn) this.easingFunction = easeFn;
    if (directAnimation !== undefined) this.directAnimation = directAnimation;
    this.setSelect(to);
    const len = this.digitContainers.length;
    this.initialDigits = convertToReversePaddedArray(this.from, len);
    this.targetDigits = convertToReversePaddedArray(to, len);
    const start = Date.now();
    const dur = duration * 1000 || this.animationDuration;
    const tick = () => {
      const elapsed = Date.now() - start;
      this.frame(elapsed / dur);
      if (elapsed < dur) requestAnimationFrame(tick);
      else {
        this.from = to;
        this.frame(1);
      }
    };
    requestAnimationFrame(tick);
  }

  setSelect(num: any): void {
    const len = this.digitContainers.length;
    convertToReversePaddedArray(num, len).forEach((n: number, digit: number) => {
      for (let i = 0; i < this.digitContainers[digit].childNodes.length; i += 1) {
        const el = this.digitContainers[digit].childNodes[i] as HTMLElement;
        el.style.userSelect = i === n ? 'auto' : 'none';
      }
    });
  }

  public resize(): void {
    this.updateDimensions();
  }
}