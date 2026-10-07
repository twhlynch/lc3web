import $ from 'jquery';
window.$ = $;
window.jQuery = $;

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import './css/styles.css';

import('bootstrap/dist/js/bootstrap.js').then(() => import('./lc3_ui.js'));
