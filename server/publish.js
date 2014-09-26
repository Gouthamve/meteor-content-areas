Meteor.publish(null, function () {
  return EditableBlocks.find();
});

Meteor.publish(null, function () {
  return EditableAreas.find();
});