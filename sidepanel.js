document.addEventListener("DOMContentLoaded", () => {
  // 集計期間の初期値として当日日付をセット
  var today = new Date(new Date().setMinutes(
    new Date().getMinutes() - new Date().getTimezoneOffset()
  )).toISOString().split("T")[0];
  document.querySelector("#startTime").value = today;
  document.querySelector("#endTime").value = today;
  // 検索ボタン
  document.querySelector("#form").addEventListener("submit", (event) => {
    event.preventDefault();
    var s = 1000;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    // 集計期間(From)は入力値の"00:00:00"
    var startTime =
      document.querySelector("#startTime").valueAsNumber +
      new Date().getTimezoneOffset() * m;
    // 集計期間(To)は入力値 + 1日の"00:00:00"
    var endTime =
      document.querySelector("#endTime").valueAsNumber +
      new Date().getTimezoneOffset() * m + d;
    try {
      // 結果描画エリアを初期化
      var container = document.querySelector("#summary");
      container.innerHTML = "";
      // 履歴を検索
      chrome.history
        .search({
          startTime: startTime,
          endTime: endTime,
          text: document.querySelector("#text").value,
          maxResults: 2 ** 31 - 1,  // 取得件数の上限は4Byte(符号あり)
        })
        .then((histories) => {
          // {ドメイン: 件数}で集計
          var summary = {};
          var total = 0;
          for (var history of histories) {
            var url = new URL(history.url);
            if (!(url.host in summary)) summary[url.host] = 0;
            summary[url.host]++;
            total++;
          }
          // 先頭にトータル件数を表示
          var header = document.createElement("label");
          header.innerText = `Total: ${total.toLocaleString()}`;
          header.style.display = "flex";
          header.style.justifyContent = "end";
          container.appendChild(header);
          // ドメイン毎の件数
          Object.entries(summary)
            .toSorted((a, b) =>
              // 件数の降順でソート、件数が同じ場合はドメインの昇順でソート
              b[1] - a[1] ? b[1] - a[1] : a[0].localeCompare(b[0]),
            )
            .forEach(([host, count]) => {
              var label = document.createElement("label");
              label.innerText = `${host}(${count.toLocaleString()})`;
              var progress = document.createElement("progress");
              progress.max = total;
              progress.value = count;
              progress.style.width = "100%";
              var entry = document.createElement("div");
              entry.appendChild(document.createElement("hr"));  // TODO: 色が濃い
              entry.appendChild(label);
              entry.appendChild(progress);
              container.appendChild(entry);
            });
        });
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  });
});
