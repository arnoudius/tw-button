const Promise = require('bluebird');
const config = require('../api/config');
const sync = require('../api/api_sync');
const storage = require('./storage');

const fetch = () => new Promise((resolve, reject) => {
  const opts = {
    url: `${config.api.host}/timeline/v1/me`,
    error: reject,
    success: resolve
  };

  sync('read', {}, opts);
});

module.exports = () => new Promise((resolve, reject) =>
  storage
    .get('me')
    .then(({me}) => {
      fetch()
        .then(data => {
          let selectedAccountId = data.preferences.selected_account_id;
          if (me && me.preferences && me.preferences.selected_account_id) {
            selectedAccountId = me.preferences.selected_account_id;
          }
          me = data;
          me.preferences.selected_account_id = selectedAccountId;
          return storage.set({me});
        }, reject)
        .then(() => resolve(me), reject);
    }, reject)
);

module.exports.set = data => new Promise((resolve, reject) =>
  storage
    .get('me')
    .then(({me}) => {
      me = Object.assign({}, me, data);
      return storage.set({me});
    }, reject)
);

module.exports.saveSelectedAccount = id => new Promise((resolve, reject) =>
  storage
    .get('me')
    .then(({me}) => {
      me.preferences.selected_account_id = id;
      return storage.set({me});
    }, reject)
);

module.exports.clear = () => storage.remove('me');
