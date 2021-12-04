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

chartG.append('g').attr('class', 'y axis').call(d3.axisLeft(scalePeople))

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
    chartG.selectAll('text')
            .data(nested)
            .enter().append('text').attr('class', 'label').text(function(d){ return d.key })
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
})

function fiveRounder(num) {
    return Math.ceil(num / 5) * 5
}