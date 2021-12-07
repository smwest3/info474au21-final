// set the dimensions and margins of the graph
var margin = {top: 20, right: 10, bottom: 40, left: 10},
  width = 1200 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

// svg
var svg = d3.select("#map")
 .attr("width", width + margin.left + margin.right)
 .attr("height", height + margin.top + margin.bottom)
 .append("g")
 .attr("transform", 
    "translate(" + margin.left + "," + margin.top + ")");

// create a tooltip
    var tooltip = d3.select("#tooltip-map")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("position", "absolute")

// Map and projection
var projection = d3.geoMercator()
  .scale(120)
  .center([0,20])
  .translate([width / 2 - margin.left, height / 2]);

// Data and color scale
var data = d3.map();
var domain = [1, 5, 10, 15, 20, 25, 30, 35, 40, 300]
var labels = ["0", "1-5", "6-10", "11-15", "16-20", "21-25", "26-30", "31-35", "36-40", "> 40"]
var range = ["#FFFFFF" ,"#EEE4F2","#D7BDE2","#C39BD3","#AF7AC5","#9B59B6","#884EA0","#76448A","#633974", "#512E5F"]
var colorScale = d3.scaleThreshold()
  .domain(domain)
  .range(range);

// Dropdown Button

// Create data = list of groups
var allGroup = ["Nominated", "Won"]

// Initialize the button
var dropdownButton = d3.select("#map-dropdown")
  .append('select')

// add the options to the button
dropdownButton // Add a button
  .selectAll('myOptions') // Next 4 lines add 6 options = 6 colors
 	.data(allGroup)
  .enter()
	.append('option')
  .text(function (d) { return d; }) // text showed in the menu
  .attr("value", function (d) { return d; }) // corresponding value returned by the button

var promises = []
var dropdown_status = 'Nominated'
var num_movies = {}

d3.csv('dataset/mapdata.csv').then(function(d) {
  // Initialize a map
  for (i in d) {
    if (d[i]['Production_Country'] != null) {
      num_movies[d[i]['Production_Country']] = num_movies[d[i]['Production_Country']] + 1 || 1;
    }
  }
  for (i in num_movies) {
    data.set(i, +num_movies[i]);
  }
  createMap();

  dropdownButton.on("change", function() {
    num_movies = {}
    if (d3.select(this).property("value") == 'Won') {
      dropdown_status = 'Oscar-Winning'
      for (i in d) {
        if (d[i]['Winner'] == 'TRUE' && d[i]['Winner'] != null) {
          if (d[i]['Production_Country'] != null) {
            num_movies[d[i]['Production_Country']] = num_movies[d[i]['Production_Country']] + 1 || 1;
          }
        }
      }
    } else if(d3.select(this).property("value") == 'Nominated') {
      dropdown_status = 'Nominated'
      for (i in d) {
        if (d[i]['Production_Country'] != null) {
          num_movies[d[i]['Production_Country']] = num_movies[d[i]['Production_Country']] + 1 || 1;
        }
      }
    }
    for (i in num_movies) {
      data.set(i, +num_movies[i]);
    }
  createMap();
  })
})

function createMap() {
  d3.selectAll(".worldmap").remove()
  promises.push(d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"))
  myDataPromises = Promise.all(promises).then(function(worldmap) {
    let mouseOver = function(d) {
      d3.selectAll(".worldmap")
        .transition()
        .duration(150)
        .style("opacity", .5)

      d3.select(this)
        .transition()
        .duration(150)
        .style("opacity", 1)
        .style("stroke", "black")

      d.total = data.get(d.properties.name) || 0;
        
      tooltip
        .style("opacity", 0.8)
        .html(d.properties.name + ": " + d.total)
        .style("left", (d3.event.pageX) + "px")		
        .style("top", (d3.event.pageY - 28) + "px");
    }

    let mouseLeave = function(d) {
      d3.selectAll(".worldmap")
        .transition()
        .duration(150)
        .style("opacity", .8)
        .style("stroke", "transparent")
      tooltip
        .style("opacity", 0)
    }
    var worldmap = worldmap[0]
    
    // Draw the map
    svg.append("g")
      .selectAll("path")
      .data(worldmap.features)
      .enter()
      .append("path")
      .attr("class", "worldmap")
        // draw each country
        .attr("d", d3.geoPath()
          .projection(projection)
        )
        // set the color of each country
        .attr("fill", function (d) {
          d.total = data.get(d.properties.name) || 0;
          return colorScale(d.total);
        })
        .style("opacity", .8)
      .on("mouseover", mouseOver )
      .on("mouseleave", mouseLeave )

    // legend
    var legend_x = width - 200
    var legend_y = height - 200
    svg.append("g")
      .attr("class", "legendMap")
      .attr("transform", "translate(" + legend_x + "," + legend_y+")");

    var legend = d3.legendColor()
      .labels(labels)
      .title("Number of " + dropdown_status + " Films")
      .scale(colorScale)
    
    svg.select(".legendMap")
      .call(legend);
  })
}