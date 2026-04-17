import { initToasts } from './lib/ui/toast.js';
import { bootstrapApp } from '../script.js';

document.addEventListener('DOMContentLoaded', () => {
  initToasts();
  bootstrapApp();
});

