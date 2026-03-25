import * as Tests from '../test/Pokemon.test.js';

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
  table: console.table ? console.table.bind(console) : null,
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

  const formatTable = (data) => {
    try {
      if (Array.isArray(data)) {
        if (data.length === 0) return '(empty array)';
        const keys = Array.from(data.reduce((s, r) => {
          if (r && typeof r === 'object') Object.keys(r).forEach(k => s.add(k));
          return s;
        }, new Set()));
        const rows = data.map(row => keys.map(k => {
          const v = row && Object.prototype.hasOwnProperty.call(row, k) ? row[k] : '';
          return (typeof v === 'object') ? JSON.stringify(v) : String(v);
        }));
        const header = keys.join('\t|\t');
        const lines = rows.map(r => r.join('\t|\t'));
        return header + '\n' + lines.join('\n');
      }
      if (data && typeof data === 'object') {
        return Object.entries(data).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n');
      }
      return String(data);
    } catch (e) {
      return String(data);
    }
  };

  console.table = (...args) => {
    if (originalConsole.table) originalConsole.table(...args);
    const data = args[0];
    const text = formatTable(data);
    appendLine('\n' + text, 'log');
  };
};

const clearConsole = () => {
  outputEl.value = '';
};

createConsoleProxy();

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
