/// <reference path="../../pb_data/types.d.ts" />

// Generate types after any collection changes

onCollectionAfterCreateSuccess(function (e) {
  var hasPnpm = false;
  try {
    var cmd = $os.cmd('which', 'pnpm');
    hasPnpm = toString(cmd.output()).trim() !== '';
  } catch (_) {
    hasPnpm = false;
  }

  if (!hasPnpm) {
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
  var hasPnpm = false;
  try {
    var cmd = $os.cmd('which', 'pnpm');
    hasPnpm = toString(cmd.output()).trim() !== '';
  } catch (_) {
    hasPnpm = false;
  }

  if (!hasPnpm) {
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
  var hasPnpm = false;
  try {
    var cmd = $os.cmd('which', 'pnpm');
    hasPnpm = toString(cmd.output()).trim() !== '';
  } catch (_) {
    hasPnpm = false;
  }

  if (!hasPnpm) {
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
