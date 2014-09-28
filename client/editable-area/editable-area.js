areaLookup = {};

var temporaryAreaTemplates = {};

EditableArea = function EditableArea(name, options) {
  var self = this;
  options = options || {};

  self.name = name;
  self.allowedTemplates = ReactiveVar(options.allowedTemplates || []);
  self.initialTemplates = options.initialTemplates;

  areaLookup[name] = self;
  temporaryAreaTemplates[name] = ReactiveVar(null);
};

EditableArea.prototype.getTemplates = function EditableArea_getTemplates() {
  var self = this;
  var savedArea = EditableAreas.findOne({_id: self.name});
  if (savedArea) {
    return savedArea.templates;
  } else {
    return self.initialTemplates;
  }
};

EditableArea.prototype.setTemplates = function EditableArea_setTemplates(templates) {
  var self = this;
  Meteor.call('EditableArea/SetTemplates', self.name, templates);
};

EditableArea.prototype.addTemplates = function EditableArea_addTemplates(templates) {
  var self = this;
  Meteor.call('EditableArea/AddTemplates', self.name, templates);
};

EditableArea.prototype.removeTemplates = function EditableArea_removeTemplates(templates) {
  var self = this;
  Meteor.call('EditableArea/RemoveTemplates', self.name, templates);
};

EditableArea.prototype.clear = function EditableArea_clear() {
  return this.setTemplates([]);
};

EditableArea.prototype.reset = function EditableArea_reset() {
  var self = this;
  Meteor.call('EditableArea/Remove', self.name);
};

EditableArea.prototype.getAllowedTemplates = function EditableArea_getAllowedTemplates() {
  var self = this;
  return self.allowedTemplates.get();
};

EditableArea.prototype.setAllowedTemplates = function EditableArea_setAllowedTemplates(templates) {
  var self = this;
  self.allowedTemplates.set(templates);
};

Template.editableArea.helpers({
  templateList: function () {
    var self = this;
    var area = areaLookup[self.name];

    if (!area) {
      throw new Error('No EditableArea instance has been defined with the name "' + self.name + '"');
    }

    var localTemplateList = temporaryAreaTemplates[self.name].get();
    if (localTemplateList) {
      return localTemplateList;
    } else {
      return area.getTemplates();
    }
  },
  allowedAndNotPresentTemplateList: function () {
    var self = this;
    return getMissingTemplatesForArea(self.name);
  },
  canAddTemplates: function () {
    var self = this;
    var t = getMissingTemplatesForArea(self.name) || [];
    return !!t.length;
  }
});

Template.editableArea.events({
  'change select.pe-editable-area-add-template': function (event, template) {
    var areaName = template.data.name;
    var area = areaLookup[areaName];

    if (!area) {
      throw new Error('No EditableArea instance has been defined with the name "' + areaName + '"');
    }

    var templateName = $(event.target).val();
    if (typeof templateName === "string" && templateName.length > 0) {
      var localTemplateList = temporaryAreaTemplates[areaName].get();
      if (localTemplateList) {
        localTemplateList.push(templateName);
        temporaryAreaTemplates[areaName].set(localTemplateList);
        $(event.target).val(''); //clear select
      }
    }
  },
  'click button.pe-editable-area-remove-template': function (event, template) {
    var areaName = template.data.name;
    var area = areaLookup[areaName];

    if (!area) {
      throw new Error('No EditableArea instance has been defined with the name "' + areaName + '"');
    }

    var templateName = $(event.target).attr('data-template-name');
    if (typeof templateName === "string" && templateName.length > 0) {
      var localTemplateList = temporaryAreaTemplates[areaName].get();
      if (localTemplateList) {
        localTemplateList = _.without(localTemplateList, templateName);
        temporaryAreaTemplates[areaName].set(localTemplateList);
      }
    }
  }
});

// x and y to keep the position that's been dragged to
var x = 0, y = 0;

function dragmove(event) {
  x += event.dx;
  y += event.dy;

  event.target.style.webkitTransform =
  event.target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';
}

function dragend(event) {
  x = 0;
  y = 0;
  event.target.style.webkitTransform =
  event.target.style.transform = null;
}

function drop(event) {
  var areaName = $(event.target).attr('data-area-name');
  var area = areaLookup[areaName];
  if (!area)
    return;

  var templateName = $(event.relatedTarget).attr('data-template-name');

  // If we dropped on an area that allows this template
  if (_.contains(area.allowedTemplates.get(), templateName)) {
    // Add it to the local list for this template
    $(event.relatedTarget).appendTo(event.target);
    beginTrackingAreaChanges();
  }
}

Template.editableArea.rendered = function () {
  var template = this;
  template.autorun(function () {

    if (PageEdit.isActive()) {
      x = 0;
      y = 0;
      // init drag/drop events
      template.$('.pe-editable-area').each(function () {
        var elem = this;
        interact(elem)
        .dropzone(true)
        .accept('.pe-editable-area-template')
        .on('drop', drop);
      });

      template.$('.pe-editable-area-template').each(function () {
        var elem = this;
        interact(elem)
          .draggable(true)
          // .allowFrom('.handle') // XXX we may want a specific handle?
          .on("dragmove", dragmove)
          .on("dragend", dragend);
      });

    } else {
      x = 0;
      y = 0;
      // remove drag/drop events
      template.$('.pe-editable-area').each(function () {
        var elem = this;
        interact(elem).dropzone(false).off('drop', drop);
      });

      template.$('.pe-editable-area-template').each(function () {
        var elem = this;
        interact(elem).draggable(false).off('dragmove', dragmove).off('dragend', dragend);
        elem.style.webkitTransform = elem.style.transform = null;
      });
    }
  
  });
};

commitAreaChanges = function commitAreaChanges() {
  _.each(temporaryAreaTemplates, function (reactiveVar, areaName) {
    var area = areaLookup[areaName];
    if (!area)
      return;

    var templates = reactiveVar.get();
    if (templates) {
      area.setTemplates(templates);
    }
  });
};

beginTrackingAreaChanges = function beginTrackingAreaChanges() {
  // loop through all editable areas on page, and save their list of current templates in the local cache
  $('.pe-editable-area').each(function () {
    var areaName = $(this).attr('data-area-name');
    var area = areaLookup[areaName];
    if (!area)
      return;

    var templates = getTemplateListForAreaElement(this);
    temporaryAreaTemplates[areaName].set(templates);
  });
}

// forget local changes, without saving them to DB
stopTrackingAreaChanges = function stopTrackingAreaChanges() {
  _.each(temporaryAreaTemplates, function (templates, areaName) {
    temporaryAreaTemplates[areaName].set(null);
  });
}

function getTemplateListForAreaElement(areaElement) {
  return $(areaElement).find('.pe-editable-area-template').map(function () {
    return $(this).attr('data-template-name');
  }).get();
}

function getMissingTemplatesForArea(areaName) {
  var area = areaLookup[areaName];

  if (!area) {
    throw new Error('No EditableArea instance has been defined with the name "' + areaName + '"');
  }

  // allowed templates
  var allowedTemplates = area.getAllowedTemplates();

  // present templates
  var presentTemplates = temporaryAreaTemplates[areaName].get();
  if (!presentTemplates) {
    presentTemplates = area.getTemplates();
  }

  return _.difference(allowedTemplates, presentTemplates);
}