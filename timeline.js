
//document.querySelector('#timeline').setAttribute('width', intFrameWidth);

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
    .domain([yearScaleMin, yearScaleMax]).range([0,1200])

  console.log(filteredData);

  var tooltip = d3.select('#timeline-tooltip').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('background-color', 'white')
    .style('width', '100px')
    .style('height', 'auto')
    .style('border-radius', '10px')
    .style('padding', '5px 5px')
    .style('display', 'flex')
    .style('justify-content', 'center')
    .style('position', 'absolute');

  var g = d3.select('#timeline').selectAll('g')
    .data(filteredData)
    .enter()
    .append('g')
    .attr('transform', function(d){ return 'translate(' + scaleYear(d.Year_Ceremony) + ',' + 80 + ')'})

    g.append('circle')
    .attr('r', 6)
    .attr('class', 'circle-timeline')
    .style('fill', 'white')
    .on('click', function(d) {

      d3.selectAll('.circle-timeline').style('fill', 'white');
      d3.select(this).style('fill', '#AF7AC5')

      var div = document.getElementById('information')
      div.innerHTML = '';

      createElement('h3', d.Name, div);
      createElement('p', d.Gender, div);
      createElement('p', d.Race_Ethnicity, div);
      createElement('p','Won ' + d.Category + ' in ' + d.Year_Ceremony + ' for the film ' + d.Film , div);
      createElement('a', d.Biourl, div);
      d3.selectAll('circle')
        .style('fill', 'white')
      d3.select(this)
        .style('fill', 'gray')
    })
    .on('mouseover', function(d){
      console.log(d3.event.pageX)
      console.log(d3.event.pageY)
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      tooltip.html(d.Name + ' (' + d.Year_Ceremony + ')')
        .style('left', (d3.event.pageX - 50) + 'px')
        .style('top', (d3.event.pageY - 65)  + 'px')
      
    })
    .on("mouseout", function(d) {		
      tooltip.transition()		
          .duration(200)		
          .style("opacity", 0);	
  });


    function createElement(type, info, parent){
      var element = document.createElement(type);
      element.textContent = info;
      parent.appendChild(element);

      if(type == 'a'){
        element.href = info;
        element.target = '_blank';
      }
      
    }

    //create label
    var svg = d3.select('#timeline');
    svg.append('g')
    .attr('class', 'axis')
    .attr('fill', 'black')
    .attr('transform', 'translate(0,90)')
    .call(d3.axisBottom(yearScale, 20).tickFormat(function(d) {return d;}));
  
})



