const socket = new WebSocket('ws://localhost:8080');

var mode = 0; // default mode 0
var activeTicker = 0;
var tickers = ['AMZN', 'AAPL', 'NFLX', 'TSLA']
var scroll_val = 0;

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

    if (data.address == "/modeRadio") {
        mode = data.args;
        console.log("Changed mode to " + mode);
    }

    if (data.address == "/searchButton" && data.args == 1 && mode == 0) {
        search();
    }

    if (data.address == "/searchButton" && data.args == 0 && mode == 0) {
      closeSearch();
    }

    if (data.address == "/scroll" && mode == 0) {
      scroll(data.args);
    }

    if (data.address == "/searchButton" && data.args == 1 && mode == 1) {
      search();
    }

    if (data.address == "/searchButton" && data.args == 0 && mode == 1) {
      closeSearch();
    }
});

function scroll(val) {
  if (mode == 0) {
    if (document.getElementById('tickerSelect').style.display == 'flex') {
      var option = document.getElementById('options-container');

      const threshold = 0.5;  // Arbitrary midpoint value to detect wrap-around
      let delta = val- scroll_val;

      if (scroll_val > threshold && val< threshold) {
        delta = (val + 1) - scroll_val;
      } else if (scroll_val < threshold && val > threshold) {
        delta = val - (scroll_val+ 1);  
      }

      scroll_val = val;

      if (delta > 0) {
          activeTicker++;
          if (activeTicker > option.children.length - 1) {
            activeTicker = 0;
          }
          console.log(activeTicker);
          option.children[activeTicker].focus();
        }
      else if (delta < 0) {
        activeTicker--;
        if (activeTicker < 0) {
          activeTicker = option.children.length - 1;
        }
        console.log(activeTicker);
        option.children[activeTicker].focus();
      }
    }
  }
  else if (mode == 1) {
    if (document.getElementById('tickerSelect').style.display == 'flex') {}
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
    const item = document.querySelectorAll('.item')[0];
    console.log(item);
    item.focus();
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



fetch('charts/stock-vega-lite.json')
.then(response => response.json())
.then(spec => {
    vegaEmbed('#barChart', spec).then(({spec, view}) => {

        // function minBound(val) {
        //     var currRange = spec.vconcat[1].params[0].value.x;
        //     currRange = [currRange[0] - val, currRange[1]];

        //     console.log(spec);

        //     // Render the updated spec
        //     vegaEmbed('#barChart', spec).then(({spec, view}) => {
        //         chartView = view;
        //     }).catch(console.error);
        // }

        // function minBound(val) {
        //     // Define the new bounds for the brush
        //     var newBounds = [1719596800000, view.signal('brush').date[1]];
        //     console.log(newBounds);
        //     // Update the brush signal with new bounds
        //     view.signal('brush', {"date": newBounds}).run();
            
        //     // Notify Vega-Lite to update the visualization
        //     // view.runAsync().catch(console.error);
        // }

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

        // Listen for changes to the 'brush' signal
        view.addSignalListener('brush', (name, value) => {
          console.log('Brush signal changed:', value);
        });
      

        // Listen for messages from the server
        socket.addEventListener('message', function (event) {
            OSCtoCommand(event.data);
        });

        // Event listener to change ticker
        document.getElementById('tickerSelect').addEventListener('click', function() {
          spec.transform[0].filter = "datum.ticker === '" + tickers[activeTicker] + "'";

          console.log(spec.transform[0].filter);

          // Render the updated spec
          vegaEmbed('#barChart', spec).then(({spec, view}) => {
            chartView = view;
          }).catch(console.error);
        });
        

        // Event listener to add reference lines
        const items = document.querySelectorAll('.item');
        items.forEach(item => {
          item.addEventListener('click', event => {
            item.classList.toggle('checked');
            // change spec and rerender
          });
        });
        
    }).catch(console.error); 
});


