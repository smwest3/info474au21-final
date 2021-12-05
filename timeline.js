
timelineSVG = d3.select('#timeline')

var svgWidth = +timelineSVG.attr('width');
var svgHeight = +timelineSVG.attr('height');

var chartWidth = svgWidth - padding.l - padding.r
var chartHeight = svgHeight - padding.t - padding.b



d3.csv('dataset/demographic-data.csv').then(function (dataset) {
  //filters data to include only people of color
  var filteredData = dataset.filter(function(d){
    return d.Race_Ethnicity != "White"
  })

  //finds the minimum year the whole data has
  var yearScaleMin = Math.min.apply(Math, dataset.map(function(o) { return o.Year_Ceremony; }))

  //finds the minimum year the whole data has
  var yearScaleMax = Math.max.apply(Math, dataset.map(function(o) { return o.Year_Ceremony; }))

  
  function scaleYear(year){
    return yearScale(year);
  }

  var yearScale = d3.scaleLinear()
    .domain([yearScaleMin, yearScaleMax]).range([0,1000])



  

  var g = d3.select('#timeline').selectAll('g')
    .data(filteredData)
    .enter()
    .append('g')
    .attr('transform', function(d){ return 'translate(' + scaleYear(d.Year_Ceremony) + ',' + chartHeight + ')'})

    g.append('circle')
    .attr('r', 4)
    .style('fill', 'black')
    

    
});

