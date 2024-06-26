const socket = new WebSocket('ws://localhost:8080');
var mode = 0; // default mode 0

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
});


var barChart = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "width": 400,
    "height": 200,
    "padding": 5,
    "signals": [
        { "name": "yrange", "update": "[height * zoom, 0]"},
        { "name": "xrange", "update": "[0, width * zoom]"},
        {
            "name": "selectIndex",
            "update":  "round((length(data('table')) - 1) * selectIndex + 1)",
        },
        {
            "name": "tooltip",
            "value": false, 
            "update": "tooltip"
        },
        {
            "name": "zoom",
            "value": 0.5,
            "update": "pow(2, (zoom - 0.5) * 2)"
        },
        
    ],
    "data": [
        {
            "name": "table",
            "values": [
                {"category": "A", "value": 28}, {"category": "B", "value": 55}, {"category": "C", "value": 43},
                {"category": "D", "value": 91}, {"category": "E", "value": 81}, {"category": "F", "value": 53},
                {"category": "G", "value": 19}, {"category": "H", "value": 87}, {"category": "I", "value": 52}
            ],
            "transform": [
                {"type": "window", "ops": ["row_number"], "as": ["index"]}
            ]
        }
    ],
    "scales": [
        {
            "name": "xscale",
            "type": "band",
            "domain": {"data": "table", "field": "category"},
            "range": {"signal": "xrange"},
            "padding": 0.1
        },
        {
            "name": "yscale",
            "domain": {"data": "table", "field": "value"},
            "nice": true,
            "range": {"signal": "yrange"}
        }
    ],
    "axes": [
        {"orient": "bottom", "scale": "xscale"},
        {"orient": "left", "scale": "yscale"}
    ],
    "marks": [
        {
            "type": "rect",
            "from": {"data": "table"},
            "encode": {
                "enter": {
                    "x": {"scale": "xscale", "field": "category"},
                    "width": {"scale": "xscale", "band": 1},
                    "y": {"scale": "yscale", "field": "value"},
                    "y2": {"scale": "yscale", "value": 0}
                },
                "update": {
                    "fill": [
                        {
                            "test": "datum.index === selectIndex",
                            "value": "red"
                        },
                        {"value": "#4C78A8"}
                    ]
                }
            }
        },
        {
            "type": "text",
            "from": {"data": "table"},
            "encode": {
                "enter": {
                    "x": {"scale": "xscale", "field": "category", "band": 0.5},
                    "y": {"scale": "yscale", "field": "value", "offset": -5},
                    "align": {"value": "center"},
                    "baseline": {"value": "bottom"},
                    "fill": {"value": "black"},
                    "fontSize": {"value": 12}, 
                    "fontWeight": {"value": "bold"}
                }, 
                "update": {
                    "text": {
                        "signal": "(tooltip && datum.index === selectIndex) ? datum.category + ': ' + datum.value : ''"
                    }
                }
            }
        }
    ]
};

var scatterPlot = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "description": "An interactive scatter plot example supporting pan and zoom.",
    "width": 500,
    "height": 300,
    "padding": {
      "top":    10,
      "left":   40,
      "bottom": 20,
      "right":  10
    },
    "autosize": "none",
  
    "config": {
      "axis": {
        "domain": false,
        "tickSize": 3,
        "tickColor": "#888",
        "labelFont": "Monaco, Courier New"
      }
    },
  
    "signals": [
      {
        "name": "margin",
        "value": 20
      },
      {
        "name": "hover",
        "on": [
          {"events": "*:pointerover", "encode": "hover"},
          {"events": "*:pointerout",  "encode": "leave"},
          {"events": "*:pointerdown", "encode": "select"},
          {"events": "*:pointerup",   "encode": "release"}
        ]
      },
      {
        "name": "xoffset",
        "update": "-(height + padding.bottom)"
      },
      {
        "name": "yoffset",
        "update": "-(width + padding.left)"
      },
      { "name": "xrange", "update": "[0, width]" },
      { "name": "yrange", "update": "[height, 0]" },
  
      {
        "name": "down", "value": null,
        "on": [
          {"events": "touchend", "update": "null"},
          {"events": "pointerdown, touchstart", "update": "xy()"}
        ]
      },
      {
        "name": "xcur", "value": null,
        "on": [
          {
            "events": "pointerdown, touchstart, touchend",
            "update": "slice(xdom)"
          }
        ]
      },
      {
        "name": "ycur", "value": null,
        "on": [
          {
            "events": "pointerdown, touchstart, touchend",
            "update": "slice(ydom)"
          }
        ]
      },
      {
        "name": "delta", "value": [0, 0],
        "on": [
          {
            "events": [
              {
                "source": "window", "type": "pointermove", "consume": true,
                "between": [{"type": "pointerdown"}, {"source": "window", "type": "pointerup"}]
              },
              {
                "type": "touchmove", "consume": true,
                "filter": "event.touches.length === 1"
              }
            ],
            "update": "down ? [down[0]-x(), y()-down[1]] : [0,0]"
          }
        ]
      },
  
      {
        "name": "anchor", "value": [0, 0],
        "on": [
          {
            "events": "wheel",
            "update": "[invert('xscale', x()), invert('yscale', y())]"
          },
          {
            "events": {"type": "touchstart", "filter": "event.touches.length===2"},
            "update": "[(xdom[0] + xdom[1]) / 2, (ydom[0] + ydom[1]) / 2]"
          }
        ]
      },
      {
        "name": "zoom", "value": 1,
        "on": [
          {
            "events": "wheel!",
            "force": true,
            "update": "pow(1.001, event.deltaY * pow(16, event.deltaMode))"
          },
          {
            "events": {"signal": "dist2"},
            "force": true,
            "update": "dist1 / dist2"
          }
        ]
      },
      {
        "name": "dist1", "value": 0,
        "on": [
          {
            "events": {"type": "touchstart", "filter": "event.touches.length===2"},
            "update": "pinchDistance(event)"
          },
          {
            "events": {"signal": "dist2"},
            "update": "dist2"
          }
        ]
      },
      {
        "name": "dist2", "value": 0,
        "on": [{
          "events": {"type": "touchmove", "consume": true, "filter": "event.touches.length===2"},
          "update": "pinchDistance(event)"
        }]
      },
  
      {
        "name": "xdom", "update": "slice(xext)",
        "on": [
          {
            "events": {"signal": "delta"},
            "update": "[xcur[0] + span(xcur) * delta[0] / width, xcur[1] + span(xcur) * delta[0] / width]"
          },
          {
            "events": {"signal": "zoom"},
            "update": "[anchor[0] + (xdom[0] - anchor[0]) * zoom, anchor[0] + (xdom[1] - anchor[0]) * zoom]"
          }
        ]
      },
      {
        "name": "ydom", "update": "slice(yext)",
        "on": [
          {
            "events": {"signal": "delta"},
            "update": "[ycur[0] + span(ycur) * delta[1] / height, ycur[1] + span(ycur) * delta[1] / height]"
          },
          {
            "events": {"signal": "zoom"},
            "update": "[anchor[1] + (ydom[0] - anchor[1]) * zoom, anchor[1] + (ydom[1] - anchor[1]) * zoom]"
          }
        ]
      },
      {
        "name": "size",
        "update": "clamp(20 / span(xdom), 1, 1000)"
      }
    ],
  
    "data": [
      {
        "name": "points",
        "url": "data/normal-2d.json",
        "transform": [
          { "type": "extent", "field": "u", "signal": "xext" },
          { "type": "extent", "field": "v", "signal": "yext" }
        ]
      }
    ],
  
    "scales": [
      {
        "name": "xscale", "zero": false,
        "domain": {"signal": "xdom"},
        "range": {"signal": "xrange"}
      },
      {
        "name": "yscale", "zero": false,
        "domain": {"signal": "ydom"},
        "range": {"signal": "yrange"}
      }
    ],
  
    "axes": [
      {
        "scale": "xscale",
        "orient": "top",
        "offset": {"signal": "xoffset"}
      },
      {
        "scale": "yscale",
        "orient": "right",
        "offset": {"signal": "yoffset"}
      }
    ],
  
    "marks": [
      {
        "type": "symbol",
        "from": {"data": "points"},
        "clip": true,
        "encode": {
          "enter": {
            "fillOpacity": {"value": 0.6},
            "fill": {"value": "steelblue"}
          },
          "update": {
            "x": {"scale": "xscale", "field": "u"},
            "y": {"scale": "yscale", "field": "v"},
            "size": {"signal": "size"}
          },
          "hover":   { "fill": {"value": "firebrick"} },
          "leave":   { "fill": {"value": "steelblue"} },
          "select":  { "size": {"signal": "size", "mult": 5} },
          "release": { "size": {"signal": "size"} }
        }
      }
    ]
};
  

vegaEmbed('#barChart', barChart).then(({ spec, view }) => {
    var isHovering = false; 

    view.addEventListener('mouseover', () => {isHovering = true;});
    view.addEventListener('mouseout', () => {isHovering = false;});

    function select(newIndex) {
        view.signal("selectIndex", newIndex).run()
    }

    function tooltip(show) {
        view.signal("tooltip", show == 1).run();
    }

    function zoom(newZoom) {
        view.signal("zoom", newZoom).run();
    }

    function OSCtoCommand(oscMsg) {
        if (!isHovering) {
            return;
        }

        var data = JSON.parse(oscMsg);
        console.log(data);
    
        if (data.address == "/fader1") {
            console.log(mode);
            if (mode == 0) {
                select(data.args);
            }
            else if (mode == 1){
                zoom(data.args);
            }
        }
    
        if (data.address == "/button1") {
            if (mode == 0) {
                tooltip(data.args);
            }
            else if (mode == 1) {
                zoom(0.5);
            }
            else {
                console.log("Command not found")
            }
        }
    }

    // Listen for messages from the server
    socket.addEventListener('message', function (event) {
        OSCtoCommand(event.data);
    });

}).catch(console.error); 

vegaEmbed('#scatterPlot', scatterPlot)


