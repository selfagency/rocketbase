/// <reference path="../pb_data/types.d.ts" />

// Generate types after any collection changes
onCollectionAfterCreateSuccess(function (e) {
  var cmd = $os.cmd('which', 'pnpm');
  if (!cmd || cmd.status !== 0) {
    console.log('pnpm not found, skipping type generation');
    e.next();
    return;
  }

  console.debug('Regenerating types');
  var typeCmd = $os.cmd('pnpm', '--filter', 'rocketbase-app', 'run', 'build:types');
  var result = toString(typeCmd.output());
  console.debug(result);

  e.next();
});

onCollectionAfterUpdateSuccess(function (e) {
  var cmd = $os.cmd('which', 'pnpm');
  if (!cmd || cmd.status !== 0) {
    console.log('pnpm not found, skipping type generation');
    e.next();
    return;
  }

  console.debug('Regenerating types');
  var typeCmd = $os.cmd('pnpm', '--filter', 'rocketbase-app', 'run', 'build:types');
  var result = toString(typeCmd.output());
  console.debug(result);

  e.next();
});

onCollectionAfterDeleteSuccess(function (e) {
  var cmd = $os.cmd('which', 'pnpm');
  if (!cmd || cmd.status !== 0) {
    console.log('pnpm not found, skipping type generation');
    e.next();
    return;
  }

  console.debug('Regenerating types');
  var typeCmd = $os.cmd('pnpm', '--filter', 'rocketbase-app', 'run', 'build:types');
  var result = toString(typeCmd.output());
  console.debug(result);

  e.next();
});

console.log('[Hooks] Type generation hooks initialized');
