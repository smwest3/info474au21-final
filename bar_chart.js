barSVG = d3.select('#bar-chart')

const padding = {t: 60, b: 60, l:40, r: 30}

var svgWidth = +barSVG.attr('width');
var svgHeight = +barSVG.attr('height');

var chartWidth = svgWidth - padding.l - padding.r
var chartHeight = svgHeight - padding.t - padding.b

var chartG = barSVG.append('g')
            .attr('transform', `translate(${padding.l}, ${padding.t})`)
            .style('border-style', 'solid')

var scalePeople = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0])

d3.select('#tooltip-bars')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('max-width', '150px')
        .style('width', 'auto')
        .style('height', 'auto')
        .style('padding', '5px')
        .style('background-color', 'white')
        .style('border', 'lightslategrey')
        .style('border-radius', '10px')
        .style('opacity', 0)

barSVG.append('text')
    .attr('class', 'title')
    .attr('transform', `translate(${chartWidth / 2 + padding.l}, ${padding.t})`)
    .text('Academy Award Winners (1927-2020)')
    .style('font-size', 'large')
    .style('font-weight', 'bold')
    .style('text-anchor', 'middle')

d3.csv('dataset/demographic-data.csv').then(function(dataset) {
    var nested = d3.nest()
            .key(function(d) {
                return d['Category']
            })
            .entries(dataset)
    nested.forEach(category => {
        category.values.sort(function(a, b) {
            return a['Race_Ethnicity'] == 'White' && b['Race_Ethnicity'] == 'White' ? 0 : a['Race_Ethnicity'] != 'White' ? 1 : -1
        })
    })
    var scaleCategory = d3.scaleBand()
                    .domain(nested.map(category => { return category.key }))
                    .range([0, chartWidth])
    chartG.append('g')
        .attr('class', 'x axis')
        .call(d3.axisBottom(scaleCategory)).attr('transform', `translate(0, ${chartHeight})`)
    chartG.append('text')
        .attr('class', 'axis-label')
        .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + 50})`)
        .attr('text-anchor', 'middle')
        .attr('font-size', 'medium')
        .text('Award Category')
    var bars = chartG.selectAll('.bar')
            .data(nested)
    var barsEnter = bars.enter().append('g').attr('class', 'bar')
    barsEnter.merge(bars).attr('transform', function(_, i) {
        return `translate(${scaleCategory.bandwidth() / 10}, 0)`
    })
    barsEnter.selectAll('.symbol')
        .data(function(d) { return d.values })
        .enter()
        .append('image')
        .attr('class', 'symbol')
        .attr('transform', function(d, i) {
            var category = d['Category']
            var x = scaleCategory(category) + (35.1 * (i % 5))
            var y = scalePeople(fiveRounder(i + 1)) 
            return `translate(${x}, ${y})`
        })
        .attr('xlink:href', function(d) {
            return d['Race_Ethnicity'] == 'White' ? 'img/person_symbol_white.png' : 'img/person_symbol_poc.png'
        })
        .attr('height', chartHeight - scalePeople(5))
        .attr('width', scaleCategory.bandwidth() / 5)
        .on("mouseover", function(d) {
            var x = parseFloat(d3.select(this).node().getBoundingClientRect().x
                     + d3.select(this).node().getBoundingClientRect().width)
            var y = parseFloat(d3.select(this).node().getBoundingClientRect().y + 5)
            d3.select('#tooltip-bars')
                .style('left', x + 'px')
                .style('top', y + 'px')
                .append('p')
                .attr('id', 'nameYear')
                .attr('dy', '0em')
                .text(`${d['Name']} (${d['Year_Ceremony']})`)
            d3.select('#tooltip-bars')
                .append('p')
                .attr('dy', '0.5em')
                .text(`\"${d['Film']}\"`)
            d3.select('#tooltip-bars')
                .append('p')
                .attr('dy', '1em')
                .text(`Race: ${d['Race_Ethnicity']}`)
            d3.select('#tooltip-bars')
                .transition()
                .duration(150)
                .style('opacity', 0.9)
        })
        .on("mouseout", function() {
            d3.select('#tooltip-bars').selectAll('p').remove()
            d3.select('#tooltip-bars').style('opacity', 0)
        })
})

function fiveRounder(num) {
    return Math.ceil(num / 5) * 5
}