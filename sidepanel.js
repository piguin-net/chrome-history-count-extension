document.addEventListener("DOMContentLoaded", () => {
  var today = new Date().toISOString().split("T")[0];
  document.querySelector("#startTime").value = today;
  document.querySelector("#endTime").value = today;
  document.querySelector("#form").addEventListener("submit", (event) => {
    event.preventDefault();
    var s = 1000;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var startTime =
      document.querySelector("#startTime").valueAsNumber +
      new Date().getTimezoneOffset() * m;
    var endTime =
      document.querySelector("#endTime").valueAsNumber +
      new Date().getTimezoneOffset() * m + d;
    try {
      var container = document.querySelector("#summary");
      container.innerHTML = "";
      chrome.history
        .search({
          startTime: startTime,
          endTime: endTime,
          text: document.querySelector("#text").value,
          maxResults: 2 ** 31 - 1,
        })
        .then((histories) => {
          var summary = {};
          var total = 0;
          for (var history of histories) {
            var url = new URL(history.url);
            if (!(url.host in summary)) summary[url.host] = 0;
            summary[url.host]++;
            total++;
          }
          var header = document.createElement("label");
          header.innerText = `Total: ${total.toLocaleString()}`;
          header.style.display = "flex";
          header.style.justifyContent = "end";
          container.appendChild(header);
          Object.entries(summary)
            .toSorted((a, b) =>
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
              entry.appendChild(document.createElement("hr"));
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
