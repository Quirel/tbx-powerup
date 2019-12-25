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

    return t.get('board', 'private', 'bxLink')
      .then(bxLink => {
        if (!bxLink) {
          return;
        }

        let attachments = [];

        for (const key in claimed) {
          const taskId = getTaskIdFromUrl(claimed[key].url);

          attachments.push({
            id: taskId,
            claimed: claimed,
            icon: GRAY_ICON,
            title: `Задача № ${taskId}`,
            content: {
              type: 'iframe',
              url: t.signUrl(`${bxBaseUrl}attachment-sections.html`,
                {taskId: taskId, taskUrl: claimed[key].url, bxLink: bxLink}),
              height: 220
            }
          });
        }

        return attachments;
      });
  } else {
    return [];
  }
};

const getBadges = (t, options) => {
  return t.get('card', 'shared', 'task')
    .then((task) => {
      if (task) {
        let color = 'light-gray';
        switch (task.status.id) {
          case '5':
            color = 'green';
            break;
          case '-1':
            color = 'red';
            break;
        }

        const d = new Date(task.deadline);
        const date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

        return [
          {
            text: task.status.title,
            color: color
          },
          {
            text: date,
            color: 'blue'
          },
          {
            text: `Отв.: ${task.responsible}`,
          },
          {
            text: `Пост.: ${task.creator}`,
          }
        ];
      }
    });
};

const getBackBadges = (t, options) => {
  return t.get('card', 'shared', 'task')
    .then((task) => {
      if (task) {
        let color = 'light-gray';
        switch (task.status.id) {
          case '5':
            color = 'green';
            break;
          case '-1':
            color = 'red';
            break;
        }

        const d = new Date(task.deadline);
        const date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

        return [
          {
            text: task.status.title,
            color: color
          },
          {
            text: date,
            color: 'blue'
          }
        ];
      }
    });
};

// noinspection JSUnresolvedVariable
TrelloPowerUp.initialize({
  'show-settings': (t, options) => {
    // noinspection JSUnresolvedFunction
    return t.popup({
      title: 'Settings',
      url: `${bxBaseUrl}settings.html`,
    });
  },
  'attachment-sections': getAttachmentSections,
  'card-badges': getBadges,
  'card-detail-badges': getBackBadges,
});

