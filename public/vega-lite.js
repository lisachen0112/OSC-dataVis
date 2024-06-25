const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', function (event) {
  console.log('Client connects to WS server');
});

// Errors
socket.addEventListener('error', function (event) {
  console.error('WebSocket error observed:', event);
});


var vegaSpec = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "width": 400,
    "height": 200,
    "padding": 5,
    "signals": [
        {
            "name": "selectIndex",
            "update":  "round((length(data('table')) - 1) * selectIndex + 1)",
        },
        {
            "name": "tooltip",
            "value": false,
            "on": [
                {"events": "window:mouseup", "update": "tooltip"}
            ]
        }
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
            "range": "width",
            "padding": 0.1
        },
        {
            "name": "yscale",
            "domain": {"data": "table", "field": "value"},
            "nice": true,
            "range": "height"
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
        }
    ]
};

vegaEmbed('#vis', vegaSpec).then(({ spec, view }) => {
    function updateHighlight(newIndex) {
        view.signal("selectIndex", newIndex).run()
    }

    function showTooltip() {
        view.signal("tooltip", true).run();
    }

    // Listen for messages from the server
    socket.addEventListener('message', function (event) {
        var data = JSON.parse(event.data);
        console.log(data);
        if (data.address == "/fader1") {
            updateHighlight(data.args);
        }
    });

}).catch(console.error); 
