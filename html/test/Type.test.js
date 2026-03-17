import * as truc from './import.test.js';

truc.Type.fillTypes(truc.type_effectiveness['type_effectiveness']);
console.table(Object.values(truc.Type.all_types));