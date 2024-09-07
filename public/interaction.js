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
    console.log(data);
    // if (data.type === 'stockData') { 
    //     console.log(data);
    // }

    if (data.address == "/modeRadio") {
        mode = data.args;
        console.log("Changed mode to " + mode);
    }


});

fetch('charts/stock_prices.json')
.then(response => response.json())
.then(spec => {
    vegaEmbed('#barChart', spec).then(({ spec, view }) => {
    }).catch(console.error); 
});


// fetch('charts/bar.json')
// .then(response => response.json())
// .then(spec => {
//     vegaEmbed('#barChart', spec).then(({ spec, view }) => {
//       var isHovering = false; 
  
//       view.addEventListener('mouseover', () => {isHovering = true;});
//       view.addEventListener('mouseout', () => {isHovering = false;});
  
//       function select(newIndex) {
//           view.signal("selectIndex", newIndex).run()
//       }
  
//       function tooltip(show) {
//           view.signal("tooltip", show == 1).run();
//       }
  
//       function zoom(newZoom) {
//           view.signal("zoom", newZoom).run();
//       }
  
//       function OSCtoCommand(oscMsg) {
//           if (!isHovering) {
//               return;
//           }
  
//           var data = JSON.parse(oscMsg);
//           console.log(data);
      
//           if (data.address == "/fader1") {
//               if (mode == 0) {
//                   select(data.args);
//               }
//               else if (mode == 1){
//                   zoom(data.args);
//               }
//           }
      
//           if (data.address == "/button1") {
//               if (mode == 0) {
//                   tooltip(data.args);
//               }
//               else if (mode == 1) {
//                   zoom(0.5);
//               }
//               else {
//                   console.log("Command not found")
//               }
//           }
//       }
  
//       // Listen for messages from the server
//       socket.addEventListener('message', function (event) {
//           OSCtoCommand(event.data);
//       });
  
//   }).catch(console.error); 
// });


// fetch('charts/scatter.json')
// .then(response => response.json())
// .then(spec => {
//     vegaEmbed('#scatterPlot', spec).then(({ spec, view }) => {
//       var isHovering = false; 
  
//       view.addEventListener('mouseover', () => {isHovering = true;});
//       view.addEventListener('mouseout', () => {isHovering = false;});

//       function zoom(newZoom) {
//         view.signal("zoom", parseFloat(newZoom) + 0.5).run();
//         console.log("zooming with " + parseFloat(newZoom) + 0.5);
//       }

//       function OSCtoCommand(oscMsg) {
//         if (!isHovering) {
//             return;
//         }

//         var data = JSON.parse(oscMsg);
//         console.log(data);
    
//         if (data.address == "/fader1") {
//             if (mode == 0) {
//                 select(data.args);
//             }
//             else if (mode == 1){
//                 zoom(data.args);
//             }
//         }
    
//         if (data.address == "/button1") {
//             if (mode == 0) {
//                 tooltip(data.args);
//             }
//             else if (mode == 1) {
//                 zoom(0.5);
//             }
//             else {
//                 console.log("Command not found")
//             }
//         }
//       }

//       // Listen for messages from the server
//       socket.addEventListener('message', function (event) {
//           OSCtoCommand(event.data);
//       });

//     }).catch(console.error);
// });

// fetch('charts/cross-original.json')
// .then(response => response.json())
// .then(spec => {
//     vegaEmbed('#crossBarChart', spec)
//         .catch(console.error);
// });



  

