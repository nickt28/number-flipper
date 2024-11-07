import "./main.css";
import { NumberFlipper } from "./flipper";

class CountdownFlipper {
    private flip: NumberFlipper;
    private count: number;

    constructor(selector: string, startCount: number = 9999) {
        this.count = startCount;
        this.flip = new NumberFlipper({
            node: document.querySelector(selector) as HTMLElement,
            from: this.count,
            duration: 0.4
        });
        this.startCountdown();
    }

    private startCountdown() {
        setInterval(() => {
            this.flip.flipTo({
                to: --this.count,
                directAnimation: false
            });
        }, 1000);
    }
}

class ShuffleFlipper {
    private flip: NumberFlipper;

    constructor(flipperSelector: string, buttonSelector: string) {
        this.flip = new NumberFlipper({
            node: document.querySelector(flipperSelector) as HTMLElement,
            from: 42,
            to: 9999,
            separator: ","
        });

        document.querySelector(buttonSelector)?.addEventListener('click', () => {
          this.shuffle();
        });
    }

    private shuffle() {
        this.flip.flipTo({
            to: Math.floor(Math.random() * 8888)
        });
    }
}

class SlotMachineFlipper {
    private flip: NumberFlipper;
    private readonly symbols = ["🍒", "🍏", "🍍", "🌴", "bar", "🔔", "🍇", "7", "💰", "🍈", "bar"];

    constructor(flipperSelector: string, buttonSelector: string) {
        this.flip = new NumberFlipper({
            node: document.querySelector(flipperSelector) as HTMLElement,
            from: 777,
            digitSystem: this.symbols
        });

        document.querySelector(buttonSelector)?.addEventListener('click', () => {
            this.roll();
        });
    }

    private roll() {
        this.flip.flipTo({
            to: Math.floor(Math.random() * 999)
        });
    }
}

class CountChangeFlipper {
  private flip: NumberFlipper;
  private count: number;

  constructor(flipperSelector: string, buttonSelector: string, startCount: number) {
    this.count = startCount;
    this.flip = new NumberFlipper({
      node: document.querySelector(flipperSelector) as HTMLElement,
      from: 0,
      to: 9999,
      separator: ","
    });

    document.querySelector(buttonSelector)?.addEventListener('click', () => {
      this.changeLength();
    });
  }

  private changeLength() {
    if (this.count === 1) {
      this.count = 9999;
    } else {
      this.count = 1;
    }
    this.flip.flipTo({
      to: this.count
    });
  }
}

// Initialize components
new CountdownFlipper('.flip');
new ShuffleFlipper('.separate', '.btn1');
new SlotMachineFlipper('.slot', '.btn2');
new CountChangeFlipper('.slot2', '.btn23', 0);
