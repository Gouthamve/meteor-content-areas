function ensureExists(col, id) {
  if (!col.findOne(id)) {
    col.insert({_id: id});
  }
}

Meteor.methods({
  'EditableBlocks/SaveContent': function (id, content) {
    check(id, String);
    check(content, String);
    // TODO check security to do so
    ensureExists(EditableBlocks, id);
    EditableBlocks.update(id, {$set: {content: content}});
  },
  'EditableArea/AddTemplates': function (id, templates) {
    check(id, String);
    check(templates, [String]);
    // TODO check security to do so
    ensureExists(EditableAreas, id);
    EditableAreas.update(id, {$addToSet: {templates: {$each: templates}}});
  },
  'EditableArea/SetTemplates': function (id, templates) {
    check(id, String);
    check(templates, [String]);
    // TODO check security to do so
    ensureExists(EditableAreas, id);
    EditableAreas.update(id, {$set: {templates: templates}});
  },
  'EditableArea/RemoveTemplates': function (id, templates) {
    check(id, String);
    check(templates, [String]);
    // TODO check security to do so
    ensureExists(EditableAreas, id);
    EditableAreas.update(id, {$pullAll: {templates: templates}});
  },
  'EditableArea/Remove': function (id) {
    check(id, String);
    // TODO check security to do so
    EditableAreas.remove(id);
  }
});