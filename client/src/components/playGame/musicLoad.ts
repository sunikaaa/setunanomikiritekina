import { Howl, Howler } from 'howler';


const wind = require('../../sounds/wind1.mp3');
const sword = require('../../sounds/sword-slash1.mp3');
const knife = require('../../sounds/knife-throw1.mp3');
const handgun = require('../../sounds/handgun-firing1.mp3');
const impact = require('../../sounds/text-impact1.mp3');
Howler.volume(0.2);
export const backWind = new Howl({
    src: [wind],
    volume: 0.2,
});
export const swordDrow = new Howl({
    src: [sword],
});

export const backImpact = new Howl({
    src: [impact],
});

export const handgunFire = new Howl({
    src: [handgun],
});
export const knifeTouch = new Howl({
    src: [knife],
});