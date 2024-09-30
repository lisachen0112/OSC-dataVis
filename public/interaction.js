const socket = new WebSocket('ws://localhost:8080');

var mode = 0; // default mode 0
var activeTicker = 0;
var tickers = ['AMZN', 'AAPL', 'NFLX', 'TSLA']
var prevStepValue  = 0;
var prevStepValueAddOn = 0;
var prevStepValuePie = 0;
var addOnActive = 0;
var page = 0;
var pieChartFrequency = '1day';
var indexPie = 0;


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
      // // close search 
      // socket.send(JSON.stringify({
      //   address: "/pager/page2/searchButton",
      //   args: [0]
      // }));

      // socket.send(JSON.stringify({
      //   address: "/pager/page1/searchButton",
      //   args: [0]
      // }));

      const addon = document.getElementById('addOns');
      addon.classList.remove('show');
      document.getElementById('tickerSelect').style.display = 'none';
      if (page != 0) {
        mode = 0;
      }
    }

    if (page == 0) {
      if (data.address == "/modeRadio") {
          mode = data.args;
          console.log("Changed mode to " + mode);
      }

      if (data.address == "/searchButton" && data.args == 1 && mode == 1) {
        search();
      }

      if (data.address == "/searchButton" && data.args == 0 && mode == 1) {
        closeSearch();
      }
    }

    if (page == 0 || page == 1) {
      if (data.address == "/searchButton" && data.args == 1 && mode == 0) {
        search();
      }

      if (data.address == "/searchButton" && data.args == 0 && mode == 0) {
        closeSearch();
      }

      if (data.address == "/scroll") {
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


function renderPage() {
  if (page == 0) {
    document.getElementById('pieChartInfo').innerHTML = '';
    fetch('charts/stock-vega-lite.json')
    .then(response => response.json())
    .then(spec => {
        spec.transform[0].filter = "datum.ticker === '" + tickers[activeTicker] + "'";
        vegaEmbed('#barChart', spec).then(({spec, view}) => {

            function OSCtoCommand(oscMsg) {
        
                var data = JSON.parse(oscMsg);
                // console.log(data);
            
                if (data.address == "/minRadial") {
                    minBound(data.args);
                }
                else if (data.address == "/radio1") {
                  spec.vconcat[0].layer[0].layer = selectChart(data.args);
                  // Render the updated spec
                  vegaEmbed('#barChart', spec).then(({spec, view}) => {
                    chartView = view;
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
                  chartView = view;
              }).catch(console.error);
            }
            });
            
            // Event listener to add reference lines
            const items = document.querySelectorAll('.item');
            items.forEach(item => {
              item.addEventListener('keypress', event => {
                if (event.key === 'Enter') {
                  item.classList.toggle('checked');
                  // change spec and rerender
                  if (item.classList.contains('checked')) {
                    if (item.id == '7days') {
                      spec.vconcat[0].layer.push({
                        "mark": "line",
                        "encoding": {
                          "y": {"field": "MVGA7", "type": "quantitative"},
                          "color": {"value": "red"},
                          "opacity": {"value": 0.5}
                        }
                      })
                    }

                    if (item.id == '30days') {
                      spec.vconcat[0].layer.push({
                        "mark": "line",
                        "encoding": {
                          "y": {"field": "MVGA30", "type": "quantitative"},
                          "color": {"value": "orange"},
                          "opacity": {"value": 0.5}
                        }
                      })
                    }

                    // Render the updated spec
                    vegaEmbed('#barChart', spec).then(({spec, view}) => {
                      chartView = view;
                    }).catch(console.error);
                  }
                  else {
                    if (item.id == '7days') {
                      var i = 1;
                      while (i < spec.vconcat[0].layer.length) {
                        if (spec.vconcat[0].layer[i].encoding.y.field == 'MVGA7') {
                          spec.vconcat[0].layer.splice(i, 1);
                        }
                        i++;
                      }
                    }

                    if (item.id == '30days') {
                      var i = 1;
                      while (i < spec.vconcat[0].layer.length) {
                        if (spec.vconcat[0].layer[i].encoding.y.field == 'MVGA30') {
                          spec.vconcat[0].layer.splice(i, 1);
                        }
                        i++;
                      }
                      
                    }

                    // Render the updated spec
                    vegaEmbed('#barChart', spec).then(({spec, view}) => {
                      chartView = view;
                    }).catch(console.error);

                  }
    
                  
                }
              });
            });
            
        }).catch(console.error); 
    });
  }
  else if (page == 1) {
    document.getElementById('pieChartInfo').innerHTML = '';
  fetch('charts/stock_prices.json')
  .then(response => response.json())
  .then(spec => {
    spec.data[0].transform[0] = {"type": "filter", "expr": "datum.ticker === '" + tickers[activeTicker] + "'"};
    vegaEmbed('#barChart', spec).then(({ spec, view }) => {
      // Event listener to change ticker
      document.getElementById('tickerSelect').addEventListener('click', function() {
        if (page == 1) {
          spec.data[0].transform[0] = {"type": "filter", "expr": "datum.ticker === '" + tickers[activeTicker] + "'"};

          // Render the updated spec
          vegaEmbed('#barChart', spec).then(({spec, view}) => {
            chartView = view;
          }).catch(console.error);
      }
      });
    }).catch(console.error);
  });
  }
  else {
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