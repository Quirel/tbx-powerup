const bxBaseUrl = 'https://storage.yandexcloud.net/tbx-powerup-dev/';
const GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';

// Helpers functions
const getTaskIdFromUrl = (url) => {
  return url.match(/task\/view\/\d+/)[0].match(/\d+/)[0];
};

/**
 * Get task from bitrix
 * @param bxLink
 * @param id
 * @returns {Promise<boolean|{creator: null, responsible: null, creatorLink: null, title: null, deadline: null, responsibleLink: null, status: {id: null, title: null}}|{creator: null, responsible: null, creatorLink: null, title: null, deadline: null, responsibleLink: null, status: {id: null, title: null}}>}
 */
export const getTaskData = async (bxLink, id) => {
  const url = `${bxLink}tasks.task.get?taskId=${id}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.result.task;
  }
  catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Create task object from bitrix data
 * @param data {Object}
 * @param bxLink {String}
 * @returns {{}}
 */
export const createTaskFromData = (data, bxLink) => {
  const baseUrl = new URL(bxLink).origin;

  const task = {};

  const statuses = {
    '-3': 'Почти просрочена',
    '-2': 'Новая',
    '-1': 'Просрочена',
    '1': 'Новая',
    '2': 'Ожидание',
    '3': 'Выполняется',
    '4': 'Ждет контроля',
    '5': 'Завершена',
    '6': 'Отложена',
    '7': 'Отклонена'
  };

  task.title = data.title;
  task.creator = data.creator.name;
  task.responsible = data.responsible.name;
  task.creatorLink = baseUrl + data.creator.link;
  task.responsibleLink = baseUrl + data.responsible.link;
  task.deadline = data.deadline;
  task.status = { id: data.status, title: statuses[data.status] };

  if (task.status.id !== '5' && Date.parse(task.deadline) < Date.now()) {
    task.status.id = '-1';
    task.status.title = statuses[task.status.id];
  }

  return task;
};

const sortByDeadlineAsc = async (t, opts) => {

  const tasks = {};
  for (const card of opts.cards) {
    tasks[card.id] = await t.get(card.id, 'shared', 'task', { deadline: '0' });
  }

  const sortedCards = opts.cards.sort(
    (a, b) => {

      const aTask = tasks[a.id];
      const bTask = tasks[b.id];

      if (aTask.deadline > bTask.deadline) {
        return 1;
      } else if (bTask.deadline > aTask.deadline) {
        return -1;
      }
      return 0;
    }
  );

  return {
    sortedIds: sortedCards.map((c) => {
      return c.id;
    })
  };

};

const sortByDeadlineDesc = async (t, opts) => {

  const tasks = {};
  for (const card of opts.cards) {
    tasks[card.id] = await t.get(card.id, 'shared', 'task', { deadline: '0' });
  }

  const sortedCards = opts.cards.sort(
    (a, b) => {

      const aTask = tasks[a.id];
      const bTask = tasks[b.id];

      if (aTask.deadline < bTask.deadline) {
        return 1;
      } else if (bTask.deadline < aTask.deadline) {
        return -1;
      }
      return 0;
    }
  );

  return {
    sortedIds: sortedCards.map((c) => {
      return c.id;
    })
  };

};


const getAttachmentSections = async (t, options) => {
  // Example attachment link
  // https://bx.vladlink.ru/company/personal/user/1978/tasks/task/view/353173/

  // get list of tasks attachments
  const claimed = options.entries.filter((attachment) => {
    return attachment.url.indexOf('task/view/') !== -1;
  });

  if (claimed && claimed.length > 0) {

    const bxLink = await t.get('board', 'private', 'bxLink');
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
            { taskId: taskId, taskUrl: claimed[key].url, bxLink: bxLink }),
          height: 220
        }
      });
    }
    return attachments;
  } else {
    return [];
  }
};

const getBadges = async (t, options) => {
  const task = await t.get('card', 'shared', 'task');
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
};

const getBackBadges = async (t, options) => {
  const task = await t.get('card', 'shared', 'task');
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
};

const createCardFromUrl = async (t, options) => {
  const bxLink = await t.get('board', 'private', 'bxLink');
  const taskId = getTaskIdFromUrl(options.url);

  try {
    const data = await getTaskData(bxLink, taskId);
    const task = createTaskFromData(data, bxLink);

    return { name: task.title };
  }
  catch (error) {
    console.error(error);
  }
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
  'card-from-url': createCardFromUrl,
  'list-sorters': (t) => {
    return [
      { text: 'bx: Крайний срок ↑', callback: sortByDeadlineAsc },
      { text: 'bx: Крайний срок ↓', callback: sortByDeadlineDesc },
    ];
  }
});
