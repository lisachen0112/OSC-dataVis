const socket = new WebSocket('ws://localhost:8080');

var mode = 0;
var activeTicker = 0;
var tickers = ['AMZN', 'AAPL', 'NFLX', 'TSLA']
var prevStepValue  = 0;
var prevStepValueAddOn = 0;
var prevStepValuePie = 0;
var addOnActive = 0;
var page = 0;
var pieChartFrequency = '1day';
var indexPie = 0;
var chart2button = 0;
var listener = 0;

let stockData = null;

// Function to load JSON data from a file or URL
async function loadJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        stockData = await response.json(); // Save the loaded data in the variable
        console.log("Data loaded successfully:", stockData);
    } catch (error) {
        console.error("Error loading JSON:", error);
    }
}

(async () => {
    await loadJSON('data/historical_stock_prices.json');
})();

socket.addEventListener('open', function (event) {
  console.log('Client connects to WS server');
});

// Errors
socket.addEventListener('error', function (event) {
  console.error('WebSocket error observed:', event);
});

// Listen for messages from the server
socket.addEventListener('message', function (event) {

    var data = JSON.parse(event.data);

    if (data.address == "/pager") {
      page = data.args;
      renderPage();

      const addon = document.getElementById('addOns');
      addon.classList.remove('show');
      document.getElementById('tickerSelect').style.display = 'none';
    }

    if (page == 0) {
      if (data.address == "/modeRadio") {
          mode = data.args;
          console.log("Changed mode to " + mode);
      }

      if (data.address == "/searchButton" && data.args == 1 && mode == 1) {
        search();
      }

      else if (data.address == "/searchButton" && data.args == 0 && mode == 1) {
        closeSearch();
      }

      else if (data.address == "/searchButton" && data.args == 1 && mode == 0) {
        search();
      }
  
      else if (data.address == "/searchButton" && data.args == 0 && mode == 0) {
        closeSearch();
      }
  
      else if (data.address == "/scroll") {
        scroll(data.args);
      }
    }
});


function scroll(val) {
  if (mode == 0) {
    if (document.getElementById('tickerSelect').style.display == 'flex') {
      var option = document.getElementById('options-container');
      var currentStep;

      if (val >= 0 && val < 0.25) {
        currentStep = 0;
      }
      else if (val >= 0.25 && val < 0.5) {
        currentStep = 0.25;
      }
      else if (val >= 0.5 && val < 0.75) {
        currentStep = 0.5;
      }
      else if (val >= 0.75 && val <= 1) {
        currentStep = 0.75;
      }

      if (currentStep > prevStepValue || (currentStep == 0 && prevStepValue == 0.75)) {
        activeTicker++;
        if (activeTicker > option.children.length - 1) {
          activeTicker = 0;
        }
      } else if (currentStep < prevStepValue || (currentStep == 0.75 && prevStepValue == 0)) {
        activeTicker--;
        if (activeTicker < 0) {
          activeTicker = option.children.length - 1;
        }
      }
      option.children[activeTicker].focus();
      prevStepValue = currentStep;
    }
  }
  else if (mode == 1) {
    if (document.getElementById('addOns').classList.contains('show')) {
      var currentStep;

      if (val >= 0 && val < 0.25) {
        currentStep = 0;
      }
      else if (val >= 0.25 && val < 0.5) {
        currentStep = 0.25;
      }
      else if (val >= 0.5 && val < 0.75) {
        currentStep = 0.5;
      }
      else if (val >= 0.75 && val <= 1) {
        currentStep = 0.75;
      }

      if (currentStep > prevStepValueAddOn || (currentStep == 0 && prevStepValueAddOn == 0.75)) {
        addOnActive++;
        if (addOnActive > 1) {
          addOnActive = 0;
        }
      } else if (currentStep < prevStepValueAddOn || (currentStep == 0.75 && prevStepValueAddOn == 0)) {
        addOnActive--;
        if (addOnActive < 0) {
          addOnActive = 1;
        }
      }
      document.querySelectorAll('.item')[addOnActive].focus();
      prevStepValueAddOn = currentStep;
    }
  }
}

function closeSearch() {
  if (mode == 0) {
    if (document.getElementById('tickerSelect').style.display == 'flex') {
      var option = document.getElementById('options-container');
      option.children[activeTicker].click();

      document.getElementById('tickerSelect').style.display = 'none';
    }
  }

  else if (mode == 1) {
    const addon = document.getElementById('addOns');
    addon.classList.remove('show');
    addOnActive = 0;
  }
}

function search() { 
  if (mode == 0) {
    document.getElementById('tickerSelect').style.display = 'flex';
    var option = document.getElementById('options-container');

    option.children[activeTicker].focus();
  }
  else if (mode == 1) {
    const addon = document.getElementById('addOns');
    addon.classList.add('show');
  }
}

function selectChart(val) {
  if (val == 0 ){   
    // line chart
    return [{
        "mark": "line",
        "encoding": {
          "y": {"field": "close", "type": "quantitative"}
        }           
      }]
  }

  else if (val == 1) {
    // bar chart
    return [{
        "mark": {"type":"bar", "binSpacing": 0},
        "encoding": {
          "y": {"field": "close", "type": "quantitative"}
        }           
      }]
  }

  else if (val == 2) {
    // candlestick chart
    return [{
          "mark": "rule",
          "encoding": {
            "y": {"field": "low"},
            "y2": {"field": "high"},
            "color": {
              "condition": {
                "test": "datum.open < datum.close",
                "value": "#06982d"
              },
              "value": "#ae1325"
            }
          }
        },
        {
          "mark": "bar",
          "encoding": {
            "y": {"field": "open"},
            "y2": {"field": "close"},
            "color": {
              "condition": {
                "test": "datum.open < datum.close",
                "value": "#06982d"
              },
              "value": "#ae1325"
            }
          }
        }]
  }
}

function pieScroll(val) {
  var currentStep;
  if (val >= 0 && val < 0.25) {
    currentStep = 0;
  }
  else if (val >= 0.25 && val < 0.5) {
    currentStep = 0.25;
  }
  else if (val >= 0.5 && val < 0.75) {
    currentStep = 0.5;
  }
  else if (val >= 0.75 && val <= 1) {
    currentStep = 0.75;
  }

  if (currentStep > prevStepValuePie || (currentStep == 0 && prevStepValuePie == 0.75)) {
    indexPie++;
    if (indexPie > 10) {
      indexPie = 0;
    }
  } else if (currentStep < prevStepValuePie || (currentStep == 0.75 && prevStepValuePie == 0)) {
    indexPie--;
    if (indexPie < 0) {
      indexPie = 0;
    }
  }
  prevStepValuePie = currentStep;
}

function pieChartInfo() {
  d3.csv('data/sp500sector.csv').then(function(data) {
    var data = data.filter(function(d) {
      return d.period == pieChartFrequency;
    });

    var info = document.getElementById('pieChartInfo');
    info.innerHTML = 'Pie Chart Frequency: ' + pieChartFrequency + '<br>' + 
    'Sector: ' + data[indexPie].sector + '<br>' + 
    'Percentage Change: ' + (parseFloat(data[indexPie].percentage_change) * 100).toFixed(2) + '%<br>' +
    'Weight: ' + (parseFloat(data[indexPie].weight) * 100).toFixed(2) + '%'
  });

}

function filterStockData(ticker, date) {

  date = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

  const mappedDateISO = date.toISOString();

  // Filter the data for the specific date
  const filteredData = stockData.filter(item => item.ticker === ticker && item.date === mappedDateISO);
  console.log(filteredData);
  return filteredData.length > 0 ? filteredData[0] : null; // Return the first match or null if not found
}

function tooltipInfo(date) {
  var tooltip = document.getElementById('tooltipInfo');
  var d = filterStockData(tickers[activeTicker], date);

  const formatDate = new Date(d.date).toLocaleDateString('en-US', 
    { year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
  );

  tooltip.innerHTML = 'Ticker: ' + tickers[activeTicker] + '<br>' +
  'Date: ' + formatDate + '<br>' +
  'Open: ' + d.open + '<br>' +
  'High: ' + d.high + '<br>' +
  'Low: ' + d.low + '<br>' +
  'Close: ' + d.close + '<br>' +
  'Volume: ' + d.volume;
}


function renderPage() {
  if (page == 0) {
    document.getElementById('pieChartInfo').innerHTML = '';
    document.getElementById('tooltipInfo').innerHTML = '';
    const items = document.querySelectorAll('.item');
    items.forEach(item => {
      item.classList.remove('checked');
    });
    fetch('charts/stock-vega-lite.json')
    .then(response => response.json())
    .then(spec => {
        spec.transform[0].filter = "datum.ticker === '" + tickers[activeTicker] + "'";
        vegaEmbed('#barChart', spec).then(({spec, view}) => {

            function OSCtoCommand(oscMsg) {
        
                var data = JSON.parse(oscMsg);
     
                if (data.address == "/radio1") {
                  spec.vconcat[0].layer[0].layer = selectChart(data.args);
                  // Render the updated spec
                  vegaEmbed('#barChart', spec).then(({spec, view}) => {
                  }).catch(console.error);
                }
            }

            // Listen for messages from the server
            socket.addEventListener('message', function (event) {
                OSCtoCommand(event.data);
            });

            // Event listener to change ticker
            document.getElementById('tickerSelect').addEventListener('click', function() {
              if (page == 0) {
                spec.transform[0].filter = "datum.ticker === '" + tickers[activeTicker] + "'";

                // Render the updated spec
                vegaEmbed('#barChart', spec).then(({spec, view}) => {
              }).catch(console.error);
            }
            });
            

            if (!listener) {
              listener = 1;
              // Event listener to add reference lines
              const items = document.querySelectorAll('.item');
              items.forEach(item => {
                item.addEventListener('keypress', event => {
  
                  if (event.key === 'Enter') {
                    item.classList.toggle('checked');
                    ind = (item.id == '7days') ? 1 : 2;
  
                    // change spec and rerender
                    if (item.classList.contains('checked')) {
                        spec.vconcat[0].layer[ind].encoding.opacity.value = 0.5;
                    }
                    else {
                        spec.vconcat[0].layer[ind].encoding.opacity.value = 0;
                    }
  
                    // Render the updated spec
                    vegaEmbed('#barChart', spec).then(({spec, view}) => {
                    }).catch(console.error);
                  }
                });
              });
            }

            
        }).catch(console.error); 
    });
  }
  else if (page == 1) {
  document.getElementById('pieChartInfo').innerHTML = '';
  fetch('charts/stock_prices.json')
  .then(response => response.json())
  .then(spec => {
    
    vegaEmbed('#barChart', spec).then(({ spec, view }) => {
      var fader1 = 0.5;

      // reset button
      chart2button= 0;
      var oscMessage = {
        address: "/2/button1",
        args: [{ type: 'f', value: chart2button}]
      }
      socket.send(JSON.stringify(oscMessage));

      // set domain 
      const minD = new Date(view.signal("timeExtent")[0]);
      const maxD = new Date(view.signal("timeExtent")[1]);
      view.signal("detailDomain", [minD, maxD]).run();
      view.signal("minDate", view.signal("detailDomain")[0]).run();
      view.signal("maxDate", view.signal("detailDomain")[1]).run();

      function OSCtoCommand(oscMsg) {

        var data = JSON.parse(oscMsg);
    
        if (data.address == "/2/radial1") {
          let brush = view.signal("brush");
          view.signal("brush", [Math.min(brush[1], data.args * 720), brush[1]]).run();
          fader1 = (brush[0] + ((brush[1] - brush[0]) / 2)) / 720

          if (chart2button == 0) {
            var oscMessage = {
              address: "/2/fader3",
              args: [{ type: 'f', value: fader1}]
            }
            socket.send(JSON.stringify(oscMessage)); // move fader
          }

          view.signal("minDate", view.signal("detailDomain")[0]).run();
          view.signal("maxDate", view.signal("detailDomain")[1]).run();
        }

        else if (data.address == "/2/radial2") {
          let brush = view.signal("brush");
          view.signal("brush", [brush[0], Math.max(brush[0], data.args * 720)]).run();
          fader1 = (brush[0] + ((brush[1] - brush[0]) / 2)) / 720
          if (chart2button == 0) {
            var oscMessage = {
              address: "/2/fader3",
              args: [{ type: 'f', value: fader1}]
            }
            socket.send(JSON.stringify(oscMessage)); // move fader
          }

          view.signal("minDate", view.signal("detailDomain")[0]).run();
          view.signal("maxDate", view.signal("detailDomain")[1]).run();
        }

        // TODO
        else if (data.address == '/2/fader3' && chart2button == 0) {
          var brush = view.signal("brush");
          // view.signal("brush", [data.args * 720 - (brush[1] - brush[0]) / 2, data.args * 720 + (brush[1] - brush[0]) / 2]).run();
          var left = data.args * (720 - brush[1] - brush[0]);
          view.signal("brush", [left, left + brush[1] - brush[0]]).run();
        }

        else if (data.address == '/2/fader3' && chart2button == 1) {

          let minD = view.signal("minDate").getTime();
          let maxD = view.signal("maxDate").getTime();
          const mappedTimestamp = new Date(minD + data.args[0] * (maxD - minD));
          
          view.signal("timeIndex", mappedTimestamp).run();
          tooltipInfo(mappedTimestamp);
        }

        else if (data.address == '/2/button1') {
          chart2button= data.args[0];
          if (chart2button == 1) {
            // reset fader
            var oscMessage = {
              address: "/2/fader3",
              args: [{ type: 'f', value: 0}]
            }
            socket.send(JSON.stringify(oscMessage));
          }
          else {
            var oscMessage = {
              address: "/2/fader3",
              args: [{ type: 'f', value: fader1}]
            }
            socket.send(JSON.stringify(oscMessage)); // move fader
          }
        }
      }

      socket.addEventListener('message', function (event) {
        OSCtoCommand(event.data);
      });

    }).catch(console.error);
  });
  }
  else {
    document.getElementById('tooltipInfo').innerHTML = '';
    fetch('charts/pie-chart.json')
    .then(response => response.json())
    .then(spec => {
        vegaEmbed('#barChart', spec).then(({ spec, view }) => {
          pieChartInfo();

          function OSCtoCommand(oscMsg) {

            var data = JSON.parse(oscMsg);
        
            if (data.address == "/3/pieFreq") {
                if (data.args == 0) {
                  pieChartFrequency = '1day';
                }
                else if (data.args == 1) {
                  pieChartFrequency = 'MTD';
                }
                else if (data.args == 2) {
                  pieChartFrequency = 'QTD';
                }
                else {
                  pieChartFrequency = 'YTD';
                }
                view.signal("frequency", pieChartFrequency).run();
                pieChartInfo();
                
            }
            else if (data.address == "/3/pieSelect") {
              pieScroll(data.args);
        
              view.signal("selectIndex", indexPie).run();
              pieChartInfo();
            }
          }

          socket.addEventListener('message', function (event) {
              OSCtoCommand(event.data);
          });

        }).catch(console.error);
    });
  }
}

renderPage();