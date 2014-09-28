Package.describe({
  name: "ongoworks:content-areas",
  summary: "Editable content areas and other generic CMS features",
  version: "1.0.0",
  git: ""
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.3');
  api.use('jquery', 'client');
  api.use('templating', 'client');
  api.use('blaze', 'client');
  api.use('showdown@1.0.1', 'client');
  api.use('reactive-var@1.0.1', 'client');
  api.use('check');
  api.export('EditableBlocks');
  api.export('PageEdit');
  api.export('EditableArea');
  // common
  api.addFiles('common.js');
  // client
  api.addFiles([
    'lib/interact.js',
    'client/page-edit/page-edit.css',
    'client/page-edit/page-edit.html',
    'client/page-edit/page-edit.js',
    'client/editable-area/editable-area.css',
    'client/editable-area/editable-area.html',
    'client/editable-area/editable-area.js',
    'client/editable-block/editable-block.css',
    'client/editable-block/editable-block.html',
    'client/editable-block/editable-block.js'
    ], 'client');
  // server
  api.addFiles([
    'server/methods.js',
    'server/publish.js'
    ], 'server');
});

// Package.onTest(function(api) {
//   api.use('tinytest');
//   api.use('ongoworks:content-areas');
//   api.addFiles('meteor-content-areas-tests.js');
// });
