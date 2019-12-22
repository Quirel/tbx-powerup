'use strict';

const bxBaseUrl = 'https://storage.yandexcloud.net/tbx-powerup/';

const GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';

// Helpers functions
const getTaskIdFromUrl = (url) => {
  return url.match(/task\/view\/\d+/)[0].match(/\d+/)[0];
};

const getAttachmentSections = (t, options) => {
  // Example attachment link
  // https://bx.vladlink.ru/company/personal/user/1978/tasks/task/view/353173/

  // get list of tasks attachments
  const claimed = options.entries.filter((attachment) => {
    return attachment.url.indexOf('task/view/') !== -1;
  });

  if (claimed && claimed.length > 0) {

    t.get('board', 'private', 'bxLink')
      .then(bxLink => {
        if (!bxLink) {
          return;
        }

        console.log('Url:');
        console.log(claimed[0].url);
        console.log('Id:');
        console.log(getTaskIdFromUrl(claimed[0].url));

        t.set('card', 'shared', 'taskId', getTaskIdFromUrl(claimed[0].url))
          .then(() => {
            console.log('task id set');
            console.log(t.signUrl(`${bxBaseUrl}attachment-sections.html`));
            return [{
              // id: getTaskIdFromUrl(claimed[0].url),
              claimed: claimed,
              icon: GRAY_ICON,
              title: 'Task attached',
              content: {
                type: 'iframe',
                url: t.signUrl(`${bxBaseUrl}attachment-sections.html`, { arg: 'Just Arg!' }),
                height: 230
              }
            }];
          });
      });
  } else {
    return [];
  }
};

// noinspection JSUnresolvedVariable
TrelloPowerUp.initialize({
  'show-settings': (t, options) => {
    // noinspection JSUnresolvedFunction
    return t.popup({
      title: 'Custom Fields Settings',
      url: `${bxBaseUrl}settings.html`,
    });
  },

  'attachment-sections': getAttachmentSections
});

// if the title for your section requires a network call or other
// potentially lengthy operation you can provide a function for the title
// that returns the section title. If you do so, provide a unique id for
// your section
//   return [{
//     id: 'Yellowstone', // optional if you aren't using a function for the title
//     claimed: claimed,
//     icon: GRAY_ICON, // Must be a gray icon, colored icons not allowed.
//     title: 'Example Attachment Section: Yellowstone',
//     content: {
//       type: 'iframe',
//       url: t.signUrl('./section.html', {
//         arg: 'you can pass your section args here'
//       }),
//       height: 230
//     }
//   }];
// } else {
//   return [];

