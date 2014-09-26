var isEditing = {};
var currentSize = {};
var localContent = {};

/*
 * Shared
 */

function savedContentShared() {
  var r = EditableBlocks.findOne(this.id);
  return r && r.content;
}

function savedContentExistsShared() {
  var r = EditableBlocks.findOne(this.id);
  return !!(r && r.content && r.content.length);
}

function localContentShared() {
  localContent[this.id] = localContent[this.id] || new ReactiveVar(null);
  return localContent[this.id].get();
}

function localContentExistsShared() {
  localContent[this.id] = localContent[this.id] || new ReactiveVar(null);
  var c = localContent[this.id].get();
  return !!(c && c.length);
}

/*
 * Block
 */

var blockIDs = {};
Template.editableBlock.created = function () {
  if (blockIDs[this.data.id]) {
    throw new Error("It looks like you used the same id on more than one editableBlock");
  } else {
    blockIDs[this.data.id] = true;
  }
};

Template.editableBlock.destroyed = function () {
  delete blockIDs[this.data.id];
};

Template.editableBlock.helpers({
  isEditing: function () {
    var a = isEditing[this.id] = isEditing[this.id] || ReactiveVar(false);
    return a.get();
  },
  savedContent: savedContentShared,
  savedContentExists: savedContentExistsShared,
  localContent: localContentShared,
  localContentExists: localContentExistsShared
});

Template.editableBlock.events({
  'click .content-area.editable': function (event, template) {
    currentSize[this.id] = {
      w: template.$('.content-area').width(),
      h: template.$('.content-area').height()
    };
    isEditing[this.id].set(true);
  },
  'blur .content-area-editor': function (event, template) {
    isEditing[this.id].set(false);
    var editedContent = template.$('.content-area-editor').val() || "";
    localContent[this.id].set($.trim(editedContent));
  }
});

/*
 * Block Editor
 */

Template.editableBlockEditor.helpers({
  savedContent: savedContentShared,
  savedContentExists: savedContentExistsShared,
  localContent: localContentShared,
  localContentExists: localContentExistsShared
});

Template.editableBlockEditor.rendered = function () {
  var s = currentSize[this.data.id];
  this.$('textarea').width(s.w).height(s.h).focus();
};

/*
 * Change Tracking
 */

commitBlockChanges = function commitBlockChanges() {
  _.each(localContent, function (reactiveVar, id) {
    var content = reactiveVar.get();
    if (content) {
      Meteor.call('EditableBlocks/SaveContent', id, content);
    }
  });
};

beginTrackingBlockChanges = function beginTrackingBlockChanges() {
  _.each(blockIDs, function (val, id) {
    localContent[id] = localContent[id] || new ReactiveVar(null);
    localContent[id].set(null);
  });
}

// forget local changes, without saving them to DB
stopTrackingBlockChanges = function stopTrackingBlockChanges() {
  beginTrackingBlockChanges();
}