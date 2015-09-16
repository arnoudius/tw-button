exports.track = function(category, action) {
  console.log(category, action);
  
  chrome.runtime.sendMessage({
    type: 'track_event',
    category: category,
    action: action,
    fields: {
      dimension1: location.hostname,
      dimension2: location.href
    }
  });
};
