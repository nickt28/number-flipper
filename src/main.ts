import "./main.css";
import { Flip } from "./flipper";
const $ = (s: any) => document.querySelector(s);

// .flip
let count = 9999;
const flip = new Flip({
  node: $(".flip"),
  from: count,
  duration: 0.4
});
setInterval(() => {
  flip.flipTo({
    to: --count,
    direct: false
  });
}, 1000);

// .separate
const sepa = new Flip({
  node: $(".separate"),
  from: 888888,
  separator: ","
});
$(".btn1").onclick = () =>
  sepa.flipTo({
    to: ~~(Math.random() * 888888)
  });

// .slot
const slot = new Flip({
  node: $(".slot"),
  from: 777,
  systemArr: ["🍒", "🍏", "🍍", "🌴", "bar", "🔔", "🍇", "7", "💰", "🍈", "bar"]
});
$(".btn2").onclick = () =>
  slot.flipTo({
    to: ~~(Math.random() * 999)
  });
