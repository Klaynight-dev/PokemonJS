const outputEl = document.getElementById('console');

const createTimestamp = () => {
  const now = new Date();
  return now.toLocaleTimeString();
};

const appendLine = (text, level = 'log') => {
  const label = level.toUpperCase().padEnd(5);
  const line = `[${createTimestamp()}] ${label} ${text}`;
  outputEl.value += line + '\n';
  outputEl.scrollTop = outputEl.scrollHeight;
};

const originalConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

const createConsoleProxy = () => {
  console.log = (...args) => {
    originalConsole.log(...args);
    appendLine(args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : a)).join(' '), 'log');
  };

  console.info = (...args) => {
    originalConsole.info(...args);
    appendLine(args.join(' '), 'info');
  };

  console.warn = (...args) => {
    originalConsole.warn(...args);
    appendLine(args.join(' '), 'warn');
  };

  console.error = (...args) => {
    originalConsole.error(...args);
    appendLine(args.join(' '), 'error');
  };
};

const clearConsole = () => {
  outputEl.value = '';
};

createConsoleProxy();

import * as Tests from '../test/Pokemon.test.js';

const actions = {
  fastFight: () => Tests.fastFight('Bulbasaur', 'Charmander'),
  testPokemonToString: () => Tests.testPokemonToString(),
  getPokemonsByType: (arg) => Tests.getPokemonsByType(arg),
  getPokemonsByAttack: (arg) => Tests.getPokemonsByAttack(arg),
  clear: () => clearConsole()
};

const setupLinks = () => {
  const links = document.querySelectorAll('[data-test]');
  links.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const testName = link.dataset.test;
      const args = link.dataset.args ? link.dataset.args.split('|') : [];
      const action = actions[testName];
      if (!action) {
        console.warn('Test inconnu :', testName);
        return;
      }

      try {
        action(...args);
      } catch (err) {
        console.error('Erreur pendant le test', testName, err);
      }
    });
  });
};

setupLinks();

clearConsole();
console.log('Utilisez les boutons ci-dessus pour exécuter un test.');
