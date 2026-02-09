/// <reference path="../pb_data/types.d.ts" />

// Generate types after any collection changes
onCollectionAfterCreateSuccess(function (e) {
  console.debug('Regenerating types');
  var cmd = $os.cmd('pnpm', '--filter', 'rocketbase-app', 'run', 'build:types');
  var result = toString(cmd.output());
  console.debug(result);

  e.next();
});

onCollectionAfterUpdateSuccess(function (e) {
  console.debug('Regenerating types');
  var cmd = $os.cmd('pnpm', '--filter', 'rocketbase-app', 'run', 'build:types');
  var result = toString(cmd.output());
  console.debug(result);

  e.next();
});

onCollectionAfterDeleteSuccess(function (e) {
  console.debug('Regenerating types');
  var cmd = $os.cmd('pnpm', '--filter', 'rocketbase-app', 'run', 'build:types');
  var result = toString(cmd.output());
  console.debug(result);

  e.next();
});

console.log('[Hooks] Type generation hooks initialized');
