const MARGIN = { LEFT: 100, RIGHT: 25, TOP: 25, BOTTOM: 75 };
const WIDTH = 640 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 360 - MARGIN.TOP - MARGIN.BOTTOM;
const WIDTH_S = 400 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT_S = 300 - MARGIN.TOP - MARGIN.BOTTOM;
const yTooltipOffset = 10;

d3.csv('data/coops.csv').then(data => {
  data.forEach(d => {
    d.pay = Number(d.pay);
    d.rating = Number(d.rating);
    d.company = String(d.company);
    d.state = String(d.state);
    d.nThCoop = String(d.nThCoop);
  });

  // overall data preparation
  data = data.filter(d => d.isCoop === 'TRUE' && d.isPayVisible === 'TRUE');
  const globalData = JSON.parse(JSON.stringify(data)); // deep copy
  let scatterPlotData = globalData;
  let tempData = scatterPlotData;

  d3.select('#current-company').text('Currently Selected: All Companies In Scatterplot');

  // removes current graphs and regenerates graphs with presumably new parameters and filters
  const updateGraphs = () => {
    d3.select('#company-scatter-plot').select('svg').remove();
    d3.select('#company-scatter-plot').select('#tooltip').remove();
    d3.select('#rating-distribution').select('svg').remove();
    d3.select('#pay-distribution').select('svg').remove();
    d3.select('#location-bars').select('svg').remove();
    d3.select('#college-bars').select('svg').remove();
    companyScatterPlot();
    payDistribution();
    ratingDistribution();
    locationDistribution();
    collegeDistribution();
  };

  // updateCompanySelected: updates all graphs but the company scatter plot
  const updateCompanySelected = () => {
    d3.select('#rating-distribution').select('svg').remove();
    d3.select('#pay-distribution').select('svg').remove();
    d3.select('#location-bars').select('svg').remove();
    d3.select('#college-bars').select('svg').remove();
    payDistribution();
    ratingDistribution();
    locationDistribution();
    collegeDistribution();
  };

  // resets graphs to original state to display all companies
  const resetBarGraphs = () => {
    scatterPlotData = globalData;
    tempData = scatterPlotData;
    updateFeature('coop-count');
    updateGraphs();
    d3.select('#current-company').text('Currently Selected: All Companies In Scatterplot');
    const selectCollege = document.getElementById('collegeFilter');
    const selectLocation = document.getElementById('locationFilter');
    const selectNth = document.getElementById('nThFilter');
    const featureSelect = document.getElementById('feature-select');
    selectCollege.selectedIndex = 0;
    selectLocation.selectedIndex = 0;
    selectNth.selectedIndex = 0;
    featureSelect.selectedIndex = 0;
    filters.college = '';
    filters.location = '';
    filters.nTh = '';
  };

  // Company Scatterplot
  const companyScatterPlot = () => {
    const svg_company_scatter_plot = d3.select('#company-scatter-plot').append('svg')
      .attr('viewBox', '0 0 640 360')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('background-color', '#fafafa');

    const g_company_scatter_plot = svg_company_scatter_plot.append('g')
      .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

    // X Label:
    g_company_scatter_plot.append('text')
      .attr('class', 'x axis-label')
      .attr('x', WIDTH / 2)
      .attr('y', HEIGHT + 50)
      .attr('font-size', '20px')
      .attr('text-anchor', 'middle')
      .text('Average Pay ($/hr)');

    // Y Label
    g_company_scatter_plot.append('text')
      .attr('class', 'y axis-label')
      .attr('x', -(HEIGHT / 2))
      .attr('y', -60)
      .attr('font-size', '20px')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text('Average Rating');

    const groupedByCompany = d3.group(scatterPlotData, d => d.company);

    // Finds Average Pay for each Company:
    groupedByCompany.forEach(group => {
      group.averagePay = d3.mean(group, d => d.pay);
      group.averageRating = d3.mean(group, d => d.rating);
    });

    const arrayOfAveragePay = [];

    groupedByCompany.forEach((company) => {
      arrayOfAveragePay.push(company.averagePay);
    });

    const arrayOfAverageRating = [];

    groupedByCompany.forEach((company) => {
      arrayOfAverageRating.push(company.averageRating);
    });

    const maxPay = d3.max(arrayOfAveragePay);
    const minPay = d3.min(arrayOfAveragePay);

    const maxRating = d3.max(arrayOfAverageRating);

    var x = d3.scaleLinear()
      .domain([minPay, maxPay+3])
      .range([0, WIDTH]);

    var y = d3.scaleLinear()
      .domain([1, maxRating+ 0.25])
      .range([HEIGHT, 0]);

    const xAxisCall = d3.axisBottom(x);
    var xAxis = g_company_scatter_plot.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${HEIGHT})`)
      .call(xAxisCall);

    const yAxisCall = d3.axisLeft(y);
    var yAxis = g_company_scatter_plot.append('g')
      .attr('class', 'y axis')
      .call(yAxisCall);

    // Tooltip:
    const tooltip = d3.select('#company-scatter-plot')
      .append('div')
      .attr('id', 'tooltip')
      .style('opacity', 0)
      .style('border', 'solid')
      .style('border-color', 'black')
      .style('text-align', 'center')
      .attr('class', 'tooltip');

    const mouseover = (event, d) => {
      tooltip.html(
        `Name: ${d[0].company}
        <br>Average Pay: $${Math.round(d.averagePay * 100) / 100}
        <br>Average Rating: ${Math.round(d.averageRating * 100) / 100}
        <br>Number of Reviews: ${d.length}`)
        .style('opacity', 1);
    };

    const mousemove = (event) => {
      // change the location data of the cursor
      tooltip.style('left', (event.pageX) + 'px')
        .style('top', (event.pageY + yTooltipOffset) + 'px');
    };

    const mouseleave = () => {
      tooltip.style('opacity', 0);
    };

    /**
     * Sets globalData to only include the data for the selected company.
     */
    const scatterPlotMouseUp = (event, company) => {
      tempData = scatterPlotData.filter(d => d.company === company[0].company);
      updateCompanySelected();
      d3.select('#current-company').text(`Currently Selected: ${company[0].company}`);
    };

    d3.select('#reset-button').on('click', resetBarGraphs);

    // Create the scatter variable: where both the circles and the brush take place
    var scatter = g_company_scatter_plot.append('g')
      .attr("clip-path", "url(#clip)")

    // Circles:
    scatter.selectAll('circle')
      .data(groupedByCompany.values())
      .enter()
      .append('circle')
      .attr('cx', d => x(d.averagePay))
      .attr('cy', d => y(d.averageRating))
      .attr('r', d => d.length + 5)
      .attr('fill', '#69b3a2')
      .attr('stroke', 'black')
      .attr('stroke-width', '1px')
      .style('cursor', 'pointer')
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave)
      .on('click', scatterPlotMouseUp);

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = g_company_scatter_plot.append("defs").append("SVG:clipPath")
      .attr("id", "clip")
      .append("SVG:rect")
      .attr("width", WIDTH)
      .attr("height", HEIGHT)
      .attr("x", 0)
      .attr("y", 0);

    // Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
    var zoom = d3.zoom()
      .scaleExtent([1, 10])  
      .extent([[0, 0], [WIDTH, HEIGHT]])
      .on("zoom", zoomChart);

    svg_company_scatter_plot.call(zoom);

    // A function that updates the chart when the user zoom and thus new boundaries are available
    function zoomChart(event, d) {

      // recover the new scale
      var newX = event.transform.rescaleX(x);
      var newY = event.transform.rescaleY(y);

      // update axes with these new boundaries
      xAxis.call(d3.axisBottom(newX))
      yAxis.call(d3.axisLeft(newY))

      // update circle position
      scatter
        .selectAll("circle")
        .attr('cx', d => newX(d.averagePay))
        .attr('cy', d => newY(d.averageRating))
    }

  };

  companyScatterPlot();

  // Rating Distribution:
  const ratingDistribution = () => {
    const svg_rating = d3.select('#rating-distribution').append('svg')
      .attr('viewBox', '0 0 400 300')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('background-color', '#fafafa');

    const g_rating = svg_rating.append('g')
      .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

    // X Label
    g_rating.append('text')
      .attr('class', 'x axis-label')
      .attr('x', WIDTH_S / 2)
      .attr('y', HEIGHT_S + 40)
      .attr('font-size', '15px')
      .attr('text-anchor', 'middle')
      .text('Stars');

    // Y label
    g_rating.append('text')
      .attr('class', 'y axis-label')
      .attr('x', -(HEIGHT_S / 2))
      .attr('y', -30)
      .attr('font-size', '15px')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text('Count');

    const ratingMap = d3.rollup(tempData, v => v.length, d => d.rating);

    const ratings = [
      { 'rating': 1, 'count': ratingMap.get(1) },
      { 'rating': 1.5, 'count': ratingMap.get(1.5) },
      { 'rating': 2, 'count': ratingMap.get(2) },
      { 'rating': 2.5, 'count': ratingMap.get(2.5) },
      { 'rating': 3, 'count': ratingMap.get(3) },
      { 'rating': 3.5, 'count': ratingMap.get(3.5) },
      { 'rating': 4, 'count': ratingMap.get(4) },
      { 'rating': 4.5, 'count': ratingMap.get(4.5) },
      { 'rating': 5, 'count': ratingMap.get(5) }];

    const xRating = d3.scaleBand()
      .domain(ratings.map(d => d.rating))
      .range([0, WIDTH_S]);

    const yRating = d3.scaleLinear()
      .domain([0, d3.max(ratings, d => d.count)])
      .range([HEIGHT_S, 0]);

    const xAxisCallRating = d3.axisBottom(xRating);
    g_rating.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${HEIGHT_S})`)
      .call(xAxisCallRating);

    const yAxisCallRating = d3.axisLeft(yRating);
    g_rating.append('g')
      .attr('class', 'y axis')
      .call(yAxisCallRating);

    const rects = g_rating.selectAll('rect')
      .data(ratings);

    rects.enter().append('rect')
      .attr('y', d => yRating(d.count))
      .attr('x', d => xRating(d.rating))
      .attr('width', xRating.bandwidth)
      .attr('height', function (d) { if(d.count == null) {return 0;} else{ return HEIGHT_S - yRating(d.count); }})
      .attr('fill', 'black');
  };

  ratingDistribution();

  // Pay Distribution:
  const payDistribution = () => {

    const svg_pay = d3.select('#pay-distribution').append('svg')
      .attr('viewBox', '0 0 400 300')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('background-color', '#fafafa');

    const g_pay = svg_pay.append('g')
      .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

    // X Label
    g_pay.append('text')
      .attr('class', 'x axis-label')
      .attr('x', WIDTH_S / 2)
      .attr('y', HEIGHT_S + 40)
      .attr('font-size', '15px')
      .attr('text-anchor', 'middle')
      .text('Pay ($/hr)');

    // Y label
    g_pay.append('text')
      .attr('class', 'y axis-label')
      .attr('x', -(HEIGHT_S / 2))
      .attr('y', -30)
      .attr('font-size', '15px')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text('Count');

    const payMap = d3.rollup(tempData, v => v.length, d => d.pay);
    const compensations = [];

    // buckets data into histogram ranges
    for (const [key, value] of payMap) {
      let nonPaid = 0;
      let to15 = 0;
      let to20 = 0;
      let to25 = 0;
      let to30 = 0;
      let to35 = 0;
      let to40 = 0;
      let to45 = 0;
      let to50 = 0;
      let over50 = 0;

      if (key === 0) {
        nonPaid += value;
      } else if (key < 15) {
        to15 += value;
      } else if (key < 20) {
        to20 += value;
      } else if (key < 25) {
        to25 += value;
      } else if (key < 30) {
        to30 += value;
      } else if (key < 35) {
        to35 += value;
      } else if (key < 40) {
        to40 += value;
      } else if (key < 45) {
        to45 += value;
      } else if (key < 50) {
        to50 += value;
      } else if (key > 50) {
        over50 += value;
      }
      compensations.push(
        { 'pay': '0', 'count': nonPaid },
        { 'pay': '<15', 'count': to15 },
        { 'pay': '15-20', 'count': to20 },
        { 'pay': '20-25', 'count': to25 },
        { 'pay': '25-30', 'count': to30 },
        { 'pay': '30-35', 'count': to35 },
        { 'pay': '35-40', 'count': to40 },
        { 'pay': '40-45', 'count': to45 },
        { 'pay': '45-50', 'count': to50 },
        { 'pay': '>50', 'count': over50 });
    }

    const xPay = d3.scaleBand()
      .domain(compensations.map(d => d.pay))
      .range([0, WIDTH_S]);

    const yPay = d3.scaleLinear()
      .domain([0, d3.max(compensations, d => d.count)])
      .range([HEIGHT_S, 0]);

    const xAxisCallPay = d3.axisBottom(xPay);
    g_pay.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${HEIGHT_S})`)
      .call(xAxisCallPay);

    const yAxisCallPay = d3.axisLeft(yPay);
    g_pay.append('g')
      .attr('class', 'y axis')
      .call(yAxisCallPay);

    const rects = g_pay.selectAll('rect')
      .data(compensations);

    rects.enter().append('rect')
      .attr('y', d => yPay(d.count))
      .attr('x', d => xPay(d.pay))
      .attr('width', xPay.bandwidth)
      .attr('height', d => HEIGHT_S - yPay(d.count))
      .attr('fill', 'black');

  };

  payDistribution();

  // feature selection functionality: 
  let curFeature = ''; // value of the type of data being currently displayed
  let featLabel = 'Co-op Count'; // label to be shown on graphs

  // finds the average value for the given key across dictionaries in dictList 
  function getAvgOfKey(dictList, key) {
    let total = 0;
    for (const entry of dictList) {
      total = total + entry[key];
    }
    return total / dictList.length;
  }

  // Location Distribution:
  const locationDistribution = () => {
    const svg_loc = d3.select('#location-bars').append('svg')
      .attr('viewBox', '0 0 640 360')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('background-color', '#fafafa');

    const g_loc = svg_loc.append('g')
      .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

    // X Label:
    g_loc.append('text')
      .attr('class', 'x axis-label')
      .attr('x', WIDTH / 2)
      .attr('y', HEIGHT + 50)
      .attr('font-size', '15px')
      .attr('text-anchor', 'middle')
      .text(featLabel);

    const y_loc = d3.scaleBand()
      .rangeRound([0, HEIGHT])
      .paddingInner(0.05)
      .align(0.1);

    const x_loc = d3.scaleLinear()
      .rangeRound([0, WIDTH]);

    const z_loc = d3.scaleOrdinal()
      .range(['#324c80', '#4e8032', '#ada547']);

    // Group data by state and nth co-op
    const groupByStateNthCoop = d3.group(tempData, d => d.state, d => d.nThCoop);
    const loc_d = [];

    // Aggregates data to contain values of the currently selected feature
    for (const [key, value] of groupByStateNthCoop.entries()) {
      const dict = {};
      dict.Location = key;
      const currentLoc = value;
      const locKeys = Array.from(currentLoc.keys());
      // get value for the nth co-op
      switch (curFeature) {
        case 'avg-pay':
          if (locKeys.includes('1')) {
            dict.First = getAvgOfKey(currentLoc.get('1'), 'pay');
          } else {
            dict.First = 0;
          }
          if (locKeys.includes('2')) {
            dict.Second = getAvgOfKey(currentLoc.get('2'), 'pay');
          } else {
            dict.Second = 0;
          }
          if (locKeys.includes('3')) {
            dict.Third = getAvgOfKey(currentLoc.get('3'), 'pay');
          } else {
            dict.Third = 0;
          }
          break;
        case 'avg-rate':
          if (locKeys.includes('1')) {
            dict.First = getAvgOfKey(currentLoc.get('1'), 'rating');
          } else {
            dict.First = 0;
          }
          if (locKeys.includes('2')) {
            dict.Second = getAvgOfKey(currentLoc.get('2'), 'rating');
          } else {
            dict.Second = 0;
          }
          if (locKeys.includes('3')) {
            dict.Third = getAvgOfKey(currentLoc.get('3'), 'rating');
          } else {
            dict.Third = 0;
          }
          break;
        default:
          if (locKeys.includes('1')) {
            dict.First = currentLoc.get('1').length;
          } else {
            dict.First = 0;
          }
          if (locKeys.includes('2')) {
            dict.Second = currentLoc.get('2').length;
          } else {
            dict.Second = 0;
          }
          if (locKeys.includes('3')) {
            dict.Third = currentLoc.get('3').length;
          } else {
            dict.Third = 0;
          }
      }
      dict.total = dict.First + dict.Second + dict.Third;
      loc_d.push(dict);
    }

    const keys_loc = ['First', 'Second', 'Third'];

    loc_d.sort(function (a, b) { return b.total - a.total; });
    y_loc.domain(loc_d.map(function (d) { return d.Location; }));
    x_loc.domain([0, d3.max(loc_d, function (d) { return d.total; })]).nice();
    z_loc.domain(keys_loc);

    g_loc.append('g')
      .selectAll('g')
      .data(d3.stack().keys(keys_loc)(loc_d))
      .enter().append('g')
      .attr('fill', function (d) { return z_loc(d.key); })
      .selectAll('rect')
      .data(function (d) { return d; })
      .enter().append('rect')
      .attr('y', function (d) { return y_loc(d.data.Location); })
      .attr('x', function (d) { return x_loc(d[0]); })
      .attr('width', function (d) { return x_loc(d[1]) - x_loc(d[0]); })
      .attr('height', y_loc.bandwidth())
      .style('cursor', 'pointer');

    g_loc.selectAll('rect').each(function (d) {
      d3.select(this).on('mousemove', () => {
        let coopnum = d[1] - d[0];
        if (coopnum === d.data.First) {
          HighlightCompany(d.data, 1);
        }
        if (coopnum === d.data.Second) {
          HighlightCompany(d.data, 2);
        }
        if (coopnum === d.data.Third) {
          HighlightCompany(d.data, 3);
        }
        d3.select(this).attr('stroke', 'black').attr('stroke-width', 1.5);
      })
        .on('mouseleave', function () {
          d3.selectAll('rect')
            .attr('stroke-width', 0);

          d3.selectAll('circle')
            .attr('stroke', 'black')
            .attr('stroke-width', '1px');
        });
    });

    function HighlightCompany(data, coop) {
      d3.selectAll('circle').each(function (d) {
        if (d[0].state.includes(data.Location) && d[0].nThCoop.includes(coop)) {
          d3.select(this).attr('stroke', 'red').attr('stroke-width', 2);

        }
      });
    }

    g_loc.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,0)')
      .call(d3.axisLeft(y_loc));

    g_loc.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + HEIGHT + ')')
      .call(d3.axisBottom(x_loc).ticks(null, 's'));

    // Location legend
    const legend_loc = g_loc.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'end')
      .selectAll('g')
      .data(keys_loc.slice().reverse())
      .enter().append('g')
      .attr('transform', function (d, i) { return 'translate(-0,' + (100 + i * 20) + ')'; });

    legend_loc.append('rect')
      .attr('x', WIDTH - 19)
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', z_loc);

    legend_loc.append('text')
      .attr('x', WIDTH - 24)
      .attr('y', 9.5)
      .attr('dy', '0.32em')
      .text(function (d) { return d; });

  };

  locationDistribution();

  // College Distribution:
  const collegeDistribution = () => {
    const svg_college = d3.select('#college-bars').append('svg')
      .attr('viewBox', '0 0 640 360')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('background-color', '#fafafa');

    const g_college = svg_college.append('g')
      .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

    // X Label:
    g_college.append('text')
      .attr('class', 'x axis-label')
      .attr('x', WIDTH / 2)
      .attr('y', HEIGHT + 50)
      .attr('font-size', '15px')
      .attr('text-anchor', 'middle')
      .text('nth Co-op');

    // Y Label:
    g_college.append('text')
      .attr('class', 'y axis-label')
      .attr('x', -(HEIGHT_S / 2) - 40)
      .attr('y', -30)
      .attr('font-size', '15px')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text(featLabel);

    const x_college = d3.scaleBand()
      .range([0, WIDTH])
      .paddingInner(0.2);

    const y_college = d3.scaleLinear()
      .range([HEIGHT, 0]);

    const z_college = d3.scaleOrdinal()
      .range(['#e41a1c', '#377eb8', '#4daf4a', '#ffff00', '#ffa500', '#6a0dad']);

    // Groups data by nth coop and college
    const groupByCollegeNthCoop = d3.group(tempData, d => d.nThCoop, d => d.college);
    const college_d = [];

    // aggregates data with values of the currently selected feature
    for (const [key, value] of groupByCollegeNthCoop.entries()) {
      const dict = {};
      dict.Coop = key;
      const currentCoop = value;
      const nthKeys = Array.from(currentCoop.keys());

      // get value for the college
      switch (curFeature) {
        case 'avg-pay':
          if (nthKeys.includes('College of Social Sciences and Humanities')) {
            dict.Humanities =
              getAvgOfKey(currentCoop.get('College of Social Sciences and Humanities'), 'pay');
          } else {
            dict.Humanities = 0;
          }
          if (nthKeys.includes('College of Engineering')) {
            dict.Engineering = getAvgOfKey(currentCoop.get('College of Engineering'), 'pay');
          } else {
            dict.Engineering = 0;
          }
          if (nthKeys.includes('College of Science')) {
            dict.Science = getAvgOfKey(currentCoop.get('College of Science'), 'pay');
          } else {
            dict.Science = 0;
          }
          if (nthKeys.includes('College of Arts, Media and Design')) {
            dict.Design = getAvgOfKey(currentCoop.get('College of Arts, Media and Design'), 'pay');
          } else {
            dict.Design = 0;
          }
          if (nthKeys.includes('D\'Amore-McKim School of Business')) {
            dict.Business =
              getAvgOfKey(currentCoop.get('D\'Amore-McKim School of Business'), 'pay');
          } else {
            dict.Business = 0;
          }
          if (nthKeys.includes('Khoury College of Computer Sciences')) {
            dict.Khoury =
              getAvgOfKey(currentCoop.get('Khoury College of Computer Sciences'), 'pay');
          } else {
            dict.Khoury = 0;
          }
          break;
        case 'avg-rate':
          if (nthKeys.includes('College of Social Sciences and Humanities')) {
            dict.Humanities =
              getAvgOfKey(currentCoop.get('College of Social Sciences and Humanities'), 'rating');
          } else {
            dict.Humanities = 0;
          }
          if (nthKeys.includes('College of Engineering')) {
            dict.Engineering = getAvgOfKey(currentCoop.get('College of Engineering'), 'rating');
          } else {
            dict.Engineering = 0;
          }
          if (nthKeys.includes('College of Science')) {
            dict.Science = getAvgOfKey(currentCoop.get('College of Science'), 'rating');
          } else {
            dict.Science = 0;
          }
          if (nthKeys.includes('College of Arts, Media and Design')) {
            dict.Design =
              getAvgOfKey(currentCoop.get('College of Arts, Media and Design'), 'rating');
          } else {
            dict.Design = 0;
          }
          if (nthKeys.includes('D\'Amore-McKim School of Business')) {
            dict.Business =
              getAvgOfKey(currentCoop.get('D\'Amore-McKim School of Business'), 'rating');
          } else {
            dict.Business = 0;
          }
          if (nthKeys.includes('Khoury College of Computer Sciences')) {
            dict.Khoury =
              getAvgOfKey(currentCoop.get('Khoury College of Computer Sciences'), 'rating');
          } else {
            dict.Khoury = 0;
          }
          break;
        default:
          if (nthKeys.includes('College of Social Sciences and Humanities')) {
            dict.Humanities =
              currentCoop.get('College of Social Sciences and Humanities').length;
          } else {
            dict.Humanities = 0;
          }
          if (nthKeys.includes('College of Engineering')) {
            dict.Engineering = currentCoop.get('College of Engineering').length;
          } else {
            dict.Engineering = 0;
          }
          if (nthKeys.includes('College of Science')) {
            dict.Science = currentCoop.get('College of Science').length;
          } else {
            dict.Science = 0;
          }
          if (nthKeys.includes('College of Arts, Media and Design')) {
            dict.Design = currentCoop.get('College of Arts, Media and Design').length;
          } else {
            dict.Design = 0;
          }
          if (nthKeys.includes('D\'Amore-McKim School of Business')) {
            dict.Business = currentCoop.get('D\'Amore-McKim School of Business').length;
          } else {
            dict.Business = 0;
          }
          if (nthKeys.includes('Khoury College of Computer Sciences')) {
            dict.Khoury = currentCoop.get('Khoury College of Computer Sciences').length;
          } else {
            dict.Khoury = 0;
          }
      }

      dict.total =
        dict.Humanities + dict.Engineering + dict.Science +
        dict.Design +
        dict.Business + dict.Khoury;
      college_d.push(dict);
    }

    const keys_college = ['Humanities', 'Engineering', 'Science',
      'Design', 'Business', 'Khoury'];

    college_d.sort(function (a, b) { return b.total - a.total; });
    x_college.domain(college_d.map(function (d) { return d.Coop; }));
    y_college.domain([0, d3.max(college_d, function (d) {
      let vals = [d.Humanities, d.Engineering, d.Science, d.Design, d.Business, d.Khoury];
      return d3.max(vals);
    })]);
    z_college.domain(keys_college);

    const xSubgroup = d3.scaleBand().domain(keys_college).range([0, x_college.bandwidth()])
      .padding([0.05]);

    g_college.append('g')
      .selectAll('g')
      .data(college_d)
      .enter().append('g')
      .attr('transform', function (d) { return 'translate(' + x_college(d.Coop) + ',0)'; })
      .selectAll('rect')
      .data(function (d) {
        return keys_college.map(function (key) { return { key: key, value: d[key] }; });
      })
      .enter().append('rect')
      .attr('x', function (d) { return xSubgroup(d.key); })
      .attr('y', function (d) { return y_college(d.value); })
      .attr('width', xSubgroup.bandwidth())
      .attr('height', function (d) { return HEIGHT - y_college(d.value); })
      .attr('fill', function (d) { return z_college(d.key); })
      .style('cursor', 'pointer');

    g_college.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,0)')
      .call(d3.axisLeft(y_college));

    g_college.append('g')
      .attr('transform', 'translate(0,' + HEIGHT + ')')
      .call(d3.axisBottom(x_college).tickSize(0));

    g_college.selectAll('rect').each(function (d, i) {
      d3.select(this).on('mousemove', () => {

        let nth = Math.floor(i / 6);
        HighlightCircle(d, college_d[nth].Coop);
        d3.select(this).attr('stroke', 'black').attr('stroke-width', 1.5);
      })
        .on('mouseleave', function () {
          d3.selectAll('rect')
            .attr('stroke-width', 0);

          d3.selectAll('circle')
            .attr('stroke', 'black')
            .attr('stroke-width', '1px');
        });
    });

    function HighlightCircle(data, nth) {
      d3.selectAll('circle').each(function (d) {
        if (d[0].college.includes(data.key) && d[0].nThCoop === nth) {
          d3.select(this).attr('stroke', 'red').attr('stroke-width', 2);

        }
      });
    }

    const legend_college = g_college.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'end')
      .selectAll('g')
      .data(keys_college.slice().reverse())
      .enter().append('g')
      .attr('transform', function (d, i) { return 'translate(-0,' + (100 + i * 20) + ')'; });

    legend_college.append('rect')
      .attr('x', WIDTH - 19)
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', z_college);

    legend_college.append('text')
      .attr('x', WIDTH - 24)
      .attr('y', 9.5)
      .attr('dy', '0.32em')
      .text(function (d) { return d; });

  };

  collegeDistribution();

  // college scatterplot data filters
  const filters = {
    college: '',
    location: '',
    nth: '',
  };

  // called when "Apply" button is pressed
  const applyFilters = () => {
    scatterPlotData = globalData;
    if (filters.college !== '') {
      scatterPlotData = scatterPlotData.filter(d => d.college === filters.college);
    }
    if (filters.location !== '') {
      scatterPlotData = scatterPlotData.filter(d => d.state === filters.location);
    }
    if (filters.nth !== '') {
      scatterPlotData = scatterPlotData.filter(d => d.nThCoop === filters.nth);
    }
    tempData = scatterPlotData;
    updateGraphs();
  };

  d3.select('#apply-button').on('click', applyFilters);

  // gets college filter values and updates filters
  function filterByCollege() {
    const select = document.getElementById('collegeFilter');
    const option = select.options[select.selectedIndex];
    filters.college = option.value;
  }

  function filterByLocation() {
    const select = document.getElementById('locationFilter');
    const option = select.options[select.selectedIndex];
    filters.location = option.value;
  }

  function filterByNthCoop() {
    const select = document.getElementById('nThFilter');
    const option = select.options[select.selectedIndex];
    filters.nth = option.value;
  }

  d3.select('#collegeFilter').on('change', filterByCollege);
  d3.select('#locationFilter').on('change', filterByLocation);
  d3.select('#nThFilter').on('change', filterByNthCoop);

  // Feature Selection --------------------
  // A function that updates the graphs with selected feature data and updates the labels
  function updateFeature(selectedFeature) {
    curFeature = selectedFeature;

    switch (selectedFeature) {
      case 'avg-pay':
        featLabel = 'Average Pay ($/hr)';
        break;
      case 'avg-rate':
        featLabel = 'Average Rating';
        break;
      default:
        featLabel = 'Co-op Count';
    }
    updateGraphs();
  }

  // upon the changing of the feature through the select
  d3.select('#feature-select').on('change', function () {
    // recover the option that has been chosen
    const selectedFeature = d3.select(this).property('value');
    // run the updateChart function with this selected option
    updateFeature(selectedFeature);
  });

});

// Brushing & Linking for College, Location, and Companies 




