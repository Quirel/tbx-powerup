const baseUrl = 'https://storage.yandexcloud.net/tbx-powerup/';

// noinspection JSUnresolvedVariable
TrelloPowerUp.initialize({
  'show-settings': (t, options) => {
    // noinspection JSUnresolvedFunction
    return t.popup({
      title: 'Custom Fields Settings',
      url: `${baseUrl}settings.html`,
    });
  }
});
