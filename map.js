// set the dimensions and margins of the graph
var margin = {top: 20, right: 10, bottom: 40, left: 100},
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
    var tooltip = d3.select("#tooltip")
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
  .scale(100)
  .center([0,20])
  .translate([width / 2 - margin.left, height / 2]);

// Data and color scale
var data = d3.map();
var domain = [1, 5, 10, 15, 20, 25, 30, 35, 40, 300]
var labels = ["0", "1-5", "6-10", "11-15", "16-20", "21-25", "26-30", "31-35", "36-40", "> 40"]
var range = ["#FFFFFF" ,"#EBDEF0","#D7BDE2","#C39BD3","#AF7AC5","#9B59B6","#884EA0","#76448A","#633974", "#512E5F"]
var colorScale = d3.scaleThreshold()
  .domain(domain)
  .range(range);

var promises = [];
const num_movies = {};
d3.csv('dataset/mapdata.csv').then(function(d) {
  for (i in d) {
    if (d[i]['Production_Country'] != null) {
      num_movies[d[i]['Production_Country']] = num_movies[d[i]['Production_Country']] + 1 || 1;
    }
  }
  for (i in num_movies) {
    data.set(i, +num_movies[i]);
  }

  promises.push(d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"))

  myDataPromises = Promise.all(promises).then(function(worldmap) {
    let mouseOver = function(d) {
      d3.selectAll(".worldmap")
        .transition()
        .duration(200)
        .style("opacity", .5)

      d3.select(this)
        .transition()
        .duration(200)
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
        .duration(200)
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
      .title("Number of Nominated Films")
      .scale(colorScale)
    
    svg.select(".legendMap")
      .call(legend);
  })
})