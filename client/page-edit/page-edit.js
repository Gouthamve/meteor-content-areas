var controlPanel;
PageEdit = {
  _isActive: new ReactiveVar(false),
  isActive: function () {
    return this._isActive.get();
  },
  activate: function () {
    this._isActive.set(true);
    beginTrackingAreaChanges();
    beginTrackingBlockChanges();
    Meteor.startup(function () {
      if (!controlPanel) {
        controlPanel = Blaze.render(Template.dcControlPanel, document.body);
      }
    });
  },
  deactivate: function () {
    this._isActive.set(false);
    stopTrackingAreaChanges();
    stopTrackingBlockChanges();
    if (controlPanel) {
      Blaze.remove(controlPanel);
      controlPanel = null;
    }
  }
};

Blaze.registerHelper('PageEdit', PageEdit);

Template.dcControlPanel.events({
  'click .dca-scrap': function (event, template) {
    PageEdit.deactivate();
  },
  'click .dca-commit': function (event, template) {
    commitAreaChanges();
    commitBlockChanges();
    PageEdit.deactivate();
  }
});