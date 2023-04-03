import { Tools } from "./tools.js";

const action = process.argv[2];

if (!action) {
  throw new Error('Missing action');
}

(async function name() {
  const tools = new Tools();
  switch (action) {
    case 'init': 
      await tools.generateLetters();
      console.log('Letters sent');
      break;
    case 'reset': 
      await tools.emptyBuckets();
      await tools.emptyTables();
      console.log('Letters deleted');
      break;
  }
})();
