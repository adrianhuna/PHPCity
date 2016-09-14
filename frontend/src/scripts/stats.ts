/// <reference path="../../typings/index.d.ts" />

export var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb

stats.dom.style.position = 'absolute';
stats.dom.style.top = 'auto';
stats.dom.style.left = 'auto';
stats.dom.style.right = '2px';
stats.dom.style.bottom = '26px';

document.body.appendChild(stats.dom);
