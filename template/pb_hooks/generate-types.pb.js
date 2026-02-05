/// <reference path="../pb_data/types.d.ts" />

const generateTypes = e => {
  console.log('Regenerating types');
  const cmd = $os.cmd('pnpm', 'run', 'build:types');
  const result = toString(cmd.output());
  console.log(result);

  e.next();
};

onCollectionAfterCreateSuccess(generateTypes);
onCollectionAfterUpdateSuccess(generateTypes);
onCollectionAfterDeleteSuccess(generateTypes);
