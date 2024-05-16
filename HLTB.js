// ==UserScript==
// @name        Move from list to category
// @namespace   Violentmonkey Scripts
// @match       https://howlongtobeat.com/user/*/lists/*
// @grant       GM.registerMenuCommand
// @version     1.0
// @author      -
// @description 5/16/2024, 6:26:29 PM
// ==/UserScript==

(function () {
  "use strict";
  //get initial user and page data
  const initData = JSON.parse(
    document.querySelector("script#__NEXT_DATA__").innerHTML
  ).props.pageProps;
  const userId = initData.user_id;
  const userName = initData.user_name;
  const listId = initData.id;

  const baseOptions = {
    credentials: "include",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/json",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      Priority: "u=4",
      Pragma: "no-cache",
      "Cache-Control": "no-cache",
    },
    method: "POST",
    mode: "cors",
  };
  let listData;

  async function getListData(page = 1, maxResults = 50) {
    try {
      const response = await fetch(
        `https://howlongtobeat.com/api/user/${userId}/collections/id/${listId}`,
        {
          ...baseOptions,
          ...{
            referrer: `https://howlongtobeat.com/user/${userName}/lists/${listId}/epic`,
            body: `{\"listId\":${listId},\"options\":{\"name\":[\"\"],\"platform\":\"\",\"sortType\":\"alpha\",\"sortView\":\"card\",\"sortOrder\":0},\"page\":${page},\"maxResults\":${maxResults},\"randomSeed\":37277}`,
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  GM.registerMenuCommand(
    "Get list",
    () => {
      listData = getListData(1, 400);
    },
    { autoClose: false }
  );
  GM.registerMenuCommand("Print list", () => console.log(listData), {
    autoClose: false,
  });

  async function actionAdd(game) {
    body = JSON.stringify({
      game: game,
      quickAdd: {
        userId: userId,
        custom: initData.set_customtab,
        custom2: initData.set_customtab2,
        custom3: initData.set_customtab3,
        platform: "PC",
        storefront: "itch.io",
        type: "backlog",
      },
    });

    const response = await fetch(
      `https://howlongtobeat.com/api/game/${game.game_id}/user/${userId}/actionAdd`,
      {
        ...baseOptions,
        ...{
          referrer: `https://howlongtobeat.com/user/${userName}/lists/${listId}/epic`,
          body: body,
        },
      }
    );

    const data = await response.json();
    if (data !== true) {
      console.log(data);
    }
  }

  GM.registerMenuCommand(
    "Send list to target (for now defined in code)",
    () => {
      for (game of listData.data.games) {
        actionAdd(game);
      }
    },
    { autoClose: false }
  );
})();
