/// <reference path="../pb_data/types.d.ts" />

const generateTypes = e => {
  console.debug('Regenerating types');
  const cmd = $os.cmd('pnpm', '--filter', 'rocketbase-app', 'run', 'build:types');
  const result = toString(cmd.output());
  console.debug(result);

  e.next();
};

onCollectionAfterCreateSuccess(generateTypes);
onCollectionAfterUpdateSuccess(generateTypes);
onCollectionAfterDeleteSuccess(generateTypes);
