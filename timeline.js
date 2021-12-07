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

  var circleEnterWayPoint1 = new Waypoint({
    element: document.getElementById('t1'),
    handler: function(direction) {
      if (direction == 'up') {
        d3.select('#timeline').selectAll('g').remove();
        d3.select('#information').selectAll('h3').remove();
        d3.select('#information').selectAll('p').remove();
      } else {
        createCircles(filteredData);
        pocWinnerInfo(filteredData[0])
        document.getElementById('circle-0').style.fill = 'gray';
      }
    }, offset: "40%"
  });

  var circleEnterWayPoint2 = new Waypoint({
    element: document.getElementById('t2'),
    handler: function(direction) {
      if (direction == 'up') {
        pocWinnerInfo(filteredData[0])
        document.getElementById('circle-0').style.fill = 'gray';
        document.getElementById('circle-4').style.fill = 'white';
      } else {
        pocWinnerInfo(filteredData[4])
        document.getElementById('circle-0').style.fill = 'white';
        document.getElementById('circle-4').style.fill = 'gray';
      }
    }, offset: "40%"
  });

  var circleEnterWayPoint3 = new Waypoint({
    element: document.getElementById('t3'),
    handler: function(direction) {
      if (direction == 'up') {
        pocWinnerInfo(filteredData[4])
        document.getElementById('circle-4').style.fill = 'gray';
      } else {
        d3.select('#information').selectAll('h3').remove()
        d3.select('#information').selectAll('p').remove();
        document.getElementById('circle-4').style.fill = 'white';
      }
    }, offset: "40%"
  });

  var circleEnterWayPoint4 = new Waypoint({
    element: document.getElementById('t3'),
    handler: function(direction) {
      if (direction == 'down') {
        d3.select('#timeline').selectAll('g').remove();
        d3.select('#information').selectAll('h3').remove();
        d3.select('#information').selectAll('p').remove();
      } else {
        createCircles(filteredData);
      }
    }, offset: "-20%"
  });

  function createCircles(fd) {
    var g = d3.select('#timeline').selectAll('g')
      .data(fd)
      .enter()
      .append('g')
      .attr('transform', function(d){return 'translate(' + scaleYear(d.Year_Ceremony) + ',' + 80 + ')'})
      g.append('circle')
      .attr('r', 6)
      .attr('id', function(d, i) { console.log(i)
        return 'circle-' + i})
      .attr('class', 'circle-timeline')
      .style('fill', 'white')
      .on('click', function(d) {
        pocWinnerInfo(d)
        d3.selectAll('circle')
          .style('fill', 'white')
        d3.select(this)
          .style('fill', 'gray')
      });
      
      g.append('text')
        .text(function(d) {return d.Name + ', ' + d.Year_Ceremony})
        .attr('class', 'text-timeline')
        .attr('y', -10)
        .attr('x', -50);

      var svg = d3.select('#timeline');
        svg.append('g')
        .attr('class', 'axis')
        .attr('fill', 'black')
        .attr('transform', 'translate(0,90)')
        .call(d3.axisBottom(yearScale).tickFormat(function(d) {return d;
        })
      );
  }
})

function createElement(element, info, parent){
  var element = document.createElement(element);
  element.textContent = info;
  parent.appendChild(element);
}

function pocWinnerInfo(d) {
  var div = document.getElementById('information')
    div.innerHTML = '';
    createElement('h3', d.Name, div);
    createElement('p', d.Gender, div);
    createElement('p', d.Race_Ethnicity, div);
    createElement('p','Won ' + d.Category + ' in ' + d.Year_Ceremony + ' for the film ' + d.Film , div);
}