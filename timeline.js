 // declare empty group
 g = '';
 // declare reference for styling
 selectedCircle = '';

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
        d3.select('#information').selectAll('a').remove();
        visibility('t1', 'hidden')
      } else {
        createCircles(filteredData);
        pocWinnerInfo(filteredData[0])
        document.getElementById('circle-1').style.fill = 'gray';
        visibility('t1', 'visible')
        visibility('t2', 'hidden')
        visibility('t3', 'hidden')
        visibility('t4', 'hidden')
        toggleInteraction('disabled')
      }
    }, offset: "40%"
  });

  var circleEnterWayPoint2 = new Waypoint({
    element: document.getElementById('t2'),
    handler: function(direction) {
      if (direction == 'up') {
        pocWinnerInfo(filteredData[0])
        document.getElementById('circle-1').style.fill = 'gray';
        document.getElementById('circle-2').style.fill = 'white';
        document.getElementById('circle-5').style.fill = 'white';
        visibility('t2', 'hidden')
     
      } else {
        pocWinnerInfo(filteredData[1])
        document.getElementById('circle-1').style.fill = 'white';
        document.getElementById('circle-2').style.fill = 'gray';
        visibility('t2', 'visible')
      }
    }, offset: "40%"
  });

  var circleEnterWayPoint3 = new Waypoint({
    element: document.getElementById('t3'),
    handler: function(direction) {
      if (direction == 'up') {
        pocWinnerInfo(filteredData[1])
        document.getElementById('circle-1').style.fill = 'white';
        document.getElementById('circle-2').style.fill = 'gray';
        document.getElementById('circle-5').style.fill = 'white';
        visibility('t3', 'hidden')
     
      } else {
        pocWinnerInfo(filteredData[4])
        document.getElementById('circle-1').style.fill = 'white';
        document.getElementById('circle-2').style.fill = 'white';
        document.getElementById('circle-5').style.fill = 'gray';
        visibility('t3', 'visible')
      }
    }, offset: "40%"
  });

  var circleEnterWayPoint4 = new Waypoint({
    element: document.getElementById('t4'),
    handler: function(direction) {
      if (direction == 'down') {
        document.getElementById('circle-5').style.fill = 'white';
        //d3.select('#timeline').selectAll('g').remove();
        d3.select('#information').selectAll('h3').remove();
        d3.select('#information').selectAll('p').remove();
        d3.select('#information').selectAll('a').remove();
        visibility('t4', 'visible')
        toggleInteraction('enabled')
        
        
      } else {
        d3.select('#information').selectAll('h3').remove();
        d3.select('#information').selectAll('p').remove();
        d3.select('#information').selectAll('a').remove();
        pocWinnerInfo(filteredData[4])
        document.getElementById('circle-5').style.fill = 'gray';
        if(selectedCircle != ''){
          document.getElementById(selectedCircle).style.fill = 'white';
        }
        visibility('t4', 'hidden')
        toggleInteraction('disabled')
      }
    }, offset: "40%"
  });

  new Waypoint({
    element: document.getElementById('map-section'),
    handler: function(direction) {
      if (direction == 'down'){
        if(selectedCircle != ''){
          d3.select('#information').selectAll('h3').remove();
          d3.select('#information').selectAll('p').remove();
          d3.select('#information').selectAll('a').remove();
        }
        d3.select('#timeline').selectAll('g').remove();
        d3.select('#timeline-tooltip').style('visibility', 'hidden');
      }else{
        createCircles(filteredData);
        d3.select('.tooltip').remove();
        d3.select('#timeline-tooltip').style('visibility', 'visible');
      }
    }, offset: '50%'
  })

  function toggleInteraction(state){
    if(state == 'disabled'){
      g.selectAll('circle')
        .attr('class', 'unclickable')
        console.log('unclickable now')
        //.removeattr('clickable');
    }else if(state == 'enabled'){
      console.log('it should be clickable now')
      g.selectAll('circle')
        .attr('class', 'clickable')
        //.removeattr('unclickable');
    }
  }

  function visibility(id, state){
    document.getElementById(id).style.visibility = state;
  }

  function createCircles(fd) {
    //console.log(fd)
    var byDate = d3.nest()
          .key(function(d) {
            return d['Year_Ceremony']
          })
          .entries(fd)
    //console.log(byDate)
   
    var counter = 0;
    g = d3.select('#timeline').selectAll('g')
      .data(byDate)
      .enter()
      .append('g');
    console.log(g);
    g.selectAll('circle')
      .data(function(d){ return d.values})
      .enter()
      .append('circle')
      .attr('transform', function(d, i) {
        var x = scaleYear(d['Year_Ceremony'])
        var y = (-12 * i) + 80
        return `translate(${x}, ${y})`
      })
      .attr('r', 6)
      .attr('id', function() { 
        counter++;
        return 'circle-' + counter;
      })
      .attr('class', 'circle-timeline')
      .style('fill', 'white')
      .on('click', function(d) {
        selectedCircle = this.id;
        pocWinnerInfo(d)
        d3.selectAll('circle')
          .style('fill', 'white')
        d3.select(this)
          .style('fill', 'gray')
      })
       .on('mouseover', function(d){
          tooltip.transition()
            .duration(200)
            .style('opacity', .9);
          tooltip.html(d.Name + ' (' + d.Year_Ceremony  + ')')
            .style('left', (d3.event.pageX - 50) + 'px')
            .style('top', (450)  + 'px')
          
        })
        .on("mouseout", function(d) {		
          tooltip.transition()		
              .duration(200)		
              .style("opacity", 0);	
        });

   
      
    // create tooltip //
      var tooltip = d3.select('#timeline-tooltip')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('background-color', 'white')
        .style('width', '150px')
        .style('height', 'auto')
        .style('border-radius', '10px')
        .style('padding', '5px 5px')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('position', 'absolute');  

      // create axis // 
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

function createElement(type, info, parent){
  var element = document.createElement(type);
  element.textContent = info;
  parent.appendChild(element);

  if(type == 'a'){
    element.href = info;
    element.target = '_blank';
  }
  
}

function pocWinnerInfo(d) {
  var div = document.getElementById('information')
    div.innerHTML = '';
    createElement('h3', d.Name, div);
    createElement('p', d.Gender, div);
    createElement('p', d.Race_Ethnicity, div);
    createElement('p','Won ' + d.Category + ' in ' + d.Year_Ceremony + ' for the film ' + d.Film , div);
    createElement('p', 'Read more below:', div);
    createElement('a', d.Biourl, div);
}