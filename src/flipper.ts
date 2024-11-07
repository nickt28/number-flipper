import { getMaxNumberLength, convertToReversePaddedArray } from "./utils";

interface FlipToOptions {
  to: number;
  duration?: number;
  easeFn?: (position: number) => number;
  directAnimation?: boolean;
  adaptiveLength?: boolean;
}

interface FlipOptions {
  /** Root element for the flip animation */
  readonly node: HTMLElement;
  /** Starting number */
  readonly from?: number;
  /** Target number */
  readonly to?: number;
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
  private initialDigits: number[] = [];
  private targetDigits: number[] = [];
  private readonly digitContainers: HTMLElement[] = [];
  private readonly animationDuration: number;
  private readonly digitSystem: Array<string | number>;
  private readonly node: HTMLElement;
  private readonly containerClassName: string;
  private readonly digitClassName: string;
  private readonly separatorClassName: string;

  private easingFunction: (position: number) => number;
  private from: number;
  private to: number;
  private directAnimation: boolean;
  private separator?: string | string[];
  private separateOnly: number;
  private separateEvery: number;
  private height?: number;

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
      const container = document.createElement("div");
      container.className = `${this.containerClassName} ${this.containerClassName}${i}`;
      container.style.position = "relative";
      container.style.display = "inline-block";
      container.style.verticalAlign = "top";
      [...this.digitSystem, this.digitSystem[0]].forEach((i) => {
        const child = document.createElement("div");
        child.className = this.digitClassName;
        child.innerHTML = `${i}`;
        container.appendChild(child);
      });
      this.digitContainers.unshift(container);
      this.node.appendChild(container);
      this.initialDigits.push(0);
      if (
        !this.separator ||
        (!this.separateEvery && !this.separateOnly) ||
        i === digits - 1 ||
        ((digits - i) % this.separateEvery != 1 &&
          digits - i - this.separateOnly != 1)
      )
        continue;
      const separatorContent = typeof this.separator === 'string'
        ? this.separator
        : (this.separator as string[]).shift();
      const separator = document.createElement("div");
      separator.className = this.separatorClassName;
      separator.style.display = "inline-block";
      separator.innerHTML = separatorContent ?? '';
      this.node.appendChild(separator);
    }
    this.updateDimensions();
  }

  private draw({ 
    percentage, 
    alteration, 
    digitIndex 
  }: { 
    percentage: number; 
    alteration: number; 
    digitIndex: number 
  }): void {
    const newHeight = this.digitContainers[0].clientHeight / (this.digitSystem.length + 1);
    if (newHeight && this.height !== newHeight) {
      this.height = newHeight;
    }
    
    const from = this.initialDigits[digitIndex];
    const modNum = (((percentage * alteration + from) % 10) + 10) % 10;
    const translateY = `translateY(${-modNum * (this.height ?? 0)}px)`;
    
    const container = this.digitContainers[digitIndex];
    container.style.transform = translateY;
  }

  updateDimensions() {
    this.height = this.digitContainers[0].clientHeight / (this.digitSystem.length + 1);
    this.node.style.height = this.height + "px";
    if (this.targetDigits.length) this.frame(1);
    else
      for (let d = 0, len = this.digitContainers.length; d < len; d += 1)
        this.draw({
          digitIndex: d,
          percentage: 1,
          alteration: ~~(this.from / Math.pow(10, d)),
        });
  }

  frame(per: number) {
    let temp = 0;
    for (let d = this.digitContainers.length - 1; d >= 0; d -= 1) {
      const alter = this.targetDigits[d] - this.initialDigits[d];
      temp += alter;
      this.draw({
        digitIndex: d,
        percentage: this.easingFunction(per),
        alteration: this.directAnimation ? alter : temp,
      });
      temp *= 10;
    }
  }

  flipTo({
    to,
    duration = 0,
    easeFn,
    directAnimation,
    adaptiveLength = false,
  }: FlipToOptions): void {
    if (easeFn) this.easingFunction = easeFn;
    if (directAnimation !== undefined) this.directAnimation = directAnimation;

    const currentLength = this.digitContainers.length;
    const targetLength = to.toString().length;

    // Recreate flipper if:
    // 1. adaptiveLength is true and length changes, OR
    // 2. target number is longer than current length (prevent overflow)
    if ((adaptiveLength && currentLength !== targetLength) || (!adaptiveLength && targetLength > currentLength)) {
      this.node.innerHTML = '';
      this.digitContainers.length = 0;
      this.initialDigits.length = 0;

      this.initializeHTML(targetLength);
      this.from = 0;
    }

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