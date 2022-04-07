const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 130 };
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM;
const WIDTH_S = 400 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT_S = 300 - MARGIN.TOP - MARGIN.BOTTOM;
const yTooltipOffset = 10;

// Company Scatter Plot:

const svg_company_scatter_plot = d3.select('#company-scatter-plot').append('svg')
    .attr('width', WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
    .attr('height', HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
    .style('display', 'block')
    .style('margin', 'auto');

const g_company_scatter_plot = svg_company_scatter_plot.append('g')
    .attr('transform', `translate(${ MARGIN.LEFT }, ${ MARGIN.TOP })`);

// X Label:

g_company_scatter_plot.append('text')
    .attr('class', 'x axis-label')
    .attr('x', WIDTH / 2)
    .attr('y', HEIGHT + 50)
    .attr('font-size', '20px')
    .attr('text-anchor', 'middle')
    .text('Average Pay');

// Y Label

g_company_scatter_plot.append('text')
    .attr('class', 'y axis-label')
    .attr('x', -(HEIGHT / 2))
    .attr('y', -60)
    .attr('font-size', '20px')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text('Average Rating');

d3.csv('data/coops.csv').then(data => {
  data.forEach(d => {
    d.pay = Number(d.pay);
    d.rating = Number(d.rating);
    d.company = String(d.company);
  });

  data = data.filter(d => d.isCoop === 'TRUE');
  const globalData = JSON.parse(JSON.stringify(data)); // deep copy
  let tempData = globalData;
  data = data.filter(d => d.isPayVisible === 'TRUE' && d.pay > 15);

  d3.select('#current-company').text('Currently Selected: All Companies');

  const groupedByCompany = d3.group(data, d => d.company);

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

  const x = d3.scaleLinear()
      .domain([ minPay, maxPay ])
      .range([ 0, WIDTH ]);

  const y = d3.scaleLinear()
      .domain([ 1, maxRating ])
      .range([ HEIGHT, 0 ]);

  const xAxisCall = d3.axisBottom(x);
  g_company_scatter_plot.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${ HEIGHT })`)
      .call(xAxisCall);

  const yAxisCall = d3.axisLeft(y);
  g_company_scatter_plot.append('g')
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
        `Name: ${ d[0].company }
<br>Average Pay: $${ d.averagePay }
<br>Average Rating: ${ d.averageRating }
<br>Number of Reviews: ${ d.length }`)
        .style('opacity', 1);
  };

  const mousemove = (event) => {
    // change the location data of the cursor
    tooltip.style('left', (event.pageX) + 'px').style('top', (event.pageY + yTooltipOffset) + 'px');
  };

  const mouseleave = () => {
    tooltip.style('opacity', 0);
  };

  const updateBarGraphs = () => {
    d3.select('#rating-distribution').select('svg').remove();
    d3.select('#pay-distribution').select('svg').remove();
    payDistribution();
    ratingDistribution();
  };

  /**
   * Sets globalData to only include the data for the selected company.
   */
  const mouseup = (event, company) => {
    tempData = globalData.filter(d => d.company === company[0].company);
    updateBarGraphs();
    d3.select('#current-company').text(`Currently Selected: ${ company[0].company }`);
  };

  const resetBarGraphs = () => {
    tempData = globalData;
    updateBarGraphs();
    d3.select('#current-company').text('Currently Selected: All Companies');
  };

  d3.select('#reset-button').on('click', resetBarGraphs);

  // Circles:
  g_company_scatter_plot.selectAll('circle')
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
      .on('mouseup', mouseup);

  // Rating Distribution:

  const ratingDistribution = () => {
    const svg_rating = d3.select('#rating-distribution').append('svg')
        .attr('width', WIDTH_S + MARGIN.LEFT + MARGIN.RIGHT)
        .attr('height', HEIGHT_S + MARGIN.TOP + MARGIN.BOTTOM)
        .style('display', 'block')
        .style('margin', 'auto');

    const g_rating = svg_rating.append('g')
        .attr('transform', `translate(${ MARGIN.LEFT }, ${ MARGIN.TOP })`);

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
      { 'rating': 5, 'count': ratingMap.get(5) } ];

    const xRating = d3.scaleBand()
        .domain(ratings.map(d => d.rating))
        .range([ 0, WIDTH_S ]);

    const yRating = d3.scaleLinear()
        .domain([ 0, d3.max(ratings, d => d.count) ])
        .range([ HEIGHT_S, 0 ]);

    const xAxisCallRating = d3.axisBottom(xRating);
    g_rating.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${ HEIGHT_S })`)
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
        .attr('height', d => HEIGHT_S - yRating(d.count))
        .attr('fill', 'black');
  };

  ratingDistribution();

  // Pay Distribution:

  const payDistribution = () => {

    const svg_pay = d3.select('#pay-distribution').append('svg')
        .attr('width', WIDTH_S + MARGIN.LEFT + MARGIN.RIGHT)
        .attr('height', HEIGHT_S + MARGIN.TOP + MARGIN.BOTTOM)
        .style('display', 'block')
        .style('margin', 'auto');

    const g_pay = svg_pay.append('g')
        .attr('transform', `translate(${ MARGIN.LEFT }, ${ MARGIN.TOP })`);

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

    for (const [ key, value ] of payMap) {
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
        .range([ 0, WIDTH_S ]);

    const yPay = d3.scaleLinear()
        .domain([ 0, d3.max(compensations, d => d.count) ])
        .range([ HEIGHT_S, 0 ]);

    const xAxisCallPay = d3.axisBottom(xPay);
    g_pay.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${ HEIGHT_S })`)
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

});



// Location Distribution:
const svg_loc = d3.select('#location-bars').append('svg')
    .attr('width', WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
    .attr('height', HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
    
    .style('display', 'block')
    .style('margin', 'auto');

const g_loc = svg_loc.append('g')
  .attr('transform', `translate(${ MARGIN.LEFT }, ${ MARGIN.TOP })`);

// X Label:
g_loc.append('text')
    .attr('class', 'x axis-label')
    .attr('x', WIDTH / 2)
    .attr('y', HEIGHT + 50)
    .attr('font-size', '15px')
    .attr('text-anchor', 'middle')
    .text('Co-op Count');

var y_loc = d3.scaleBand()		
    .rangeRound([0, HEIGHT])	
    .paddingInner(0.05)
    .align(0.1);

var x_loc = d3.scaleLinear()		
    .rangeRound([0, WIDTH]);	

var z_loc = d3.scaleOrdinal()
    .range(["#324c80", "#4e8032", "#ada547"]);

d3.csv('data/coops.csv').then(data => {
  data.forEach(d => {
    d.state = String(d.state);
    d.nThCoop = String(d.nThCoop);
  });

  const groupByStateNthCoop = d3.group(data, d => d.state, d => d.nThCoop);
  const loc_d = [];
  for (const [key, value] of groupByStateNthCoop.entries()) {
    var dict = {};
    dict.Location = key;
    var currentLoc = value;
    var locKeys = Array.from(currentLoc.keys()); 

    // get value for the nth co-op
    if (locKeys.includes('1')){
      dict.First = currentLoc.get('1').length;
    } else {
      dict.First = 0;
    }
    if (locKeys.includes('2')){
      dict.Second = currentLoc.get('2').length;
    } else {
      dict.Second = 0;
    }
    if (locKeys.includes('3')){
      dict.Third = currentLoc.get('3').length;
    } else {
      dict.Third = 0;
    }
    dict.total = dict.First + dict.Second + dict.Third;
    loc_d.push(dict);
  }
 

  var keys_loc = ["First", "Second", "Third"];

  loc_d.sort(function(a, b) { return b.total - a.total; });
  y_loc.domain(loc_d.map(function(d) { return d.Location; }));					
  x_loc.domain([0, d3.max(loc_d, function(d) { return d.total; })]).nice();	
  z_loc.domain(keys_loc);

  g_loc.append("g")
    .selectAll("g")
    .data(d3.stack().keys(keys_loc)(loc_d))
    .enter().append("g")
      .attr("fill", function(d) { return z_loc(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("y", function(d) { return y_loc(d.data.Location); })	  
      .attr("x", function(d) { return x_loc(d[0]); })			   
      .attr("width", function(d) { return x_loc(d[1]) - x_loc(d[0]); })	
      .attr("height", y_loc.bandwidth());						   

  g_loc.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0,0)") 					
      .call(d3.axisLeft(y_loc));									

  g_loc.append("g")
      .attr("class", "axis")
	  .attr("transform", "translate(0,"+HEIGHT+")")				
      .call(d3.axisBottom(x_loc).ticks(null, "s"));   	

  var legend_loc = g_loc.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys_loc.slice().reverse())
    .enter().append("g")
	 .attr("transform", function(d, i) { return "translate(-0," + (100 + i * 20) + ")"; });

  legend_loc.append("rect")
      .attr("x", WIDTH - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z_loc);

  legend_loc.append("text")
      .attr("x", WIDTH - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });
  
});


// College Distribution:
const svg_college = d3.select('#college-bars').append('svg')
    .attr('width', WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
    .attr('height', HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
    
    .style('display', 'block')
    .style('margin', 'auto');

const g_college = svg_college.append('g')
  .attr('transform', `translate(${ MARGIN.LEFT }, ${ MARGIN.TOP })`);

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
        .attr('x', -(HEIGHT_S / 2))
        .attr('y', -30)
        .attr('font-size', '15px')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .text('Co-op Count');

var x_college = d3.scaleBand()    
    .range([0, WIDTH])  
    .paddingInner(0.2);

var y_college = d3.scaleLinear()    
    .range([HEIGHT, 0]);  

var z_college = d3.scaleOrdinal()
    .range(['#e41a1c','#377eb8','#4daf4a', '#ffff00', '#ffa500', '#6a0dad']);

d3.csv('data/coops.csv').then(data => {
  data.forEach(d => {
    d.nThCoop = String(d.nThCoop);
  });

  const groupByCollegeNthCoop = d3.group(data, d => d.nThCoop, d => d.college);
  const college_d = [];
  for (const [key, value] of groupByCollegeNthCoop.entries()) {
    var dict = {};
    dict.Coop = key;
    var currentCoop= value;
    var nthKeys = Array.from(currentCoop.keys()); 

    // get value for the college
    if (nthKeys.includes('College of Social Sciences and Humanities')){
      dict.SocialScienceAndHumanities = currentCoop.get('College of Social Sciences and Humanities').length;
    } else {
      dict.SocialScienceAndHumanities = 0;
    }
    if (nthKeys.includes('College of Engineering')){
      dict.Engineering = currentCoop.get('College of Engineering').length;
    } else {
      dict.Engineering = 0;
    }
    if (nthKeys.includes('College of Science')){
      dict.Science = currentCoop.get('College of Science').length;
    } else {
      dict.Science = 0;
    }
    if (nthKeys.includes('College of Arts, Media and Design')){
      dict.ArtMediaAndDesign = currentCoop.get('College of Arts, Media and Design').length;
    } else {
      dict.ArtMediaAndDesign = 0;
    }
    if (nthKeys.includes("D'Amore-McKim School of Business")){
      dict.Business = currentCoop.get("D'Amore-McKim School of Business").length;
    } else {
      dict.Business= 0;
    }
    if (nthKeys.includes('Khoury College of Computer Sciences')){
      dict.Khoury = currentCoop.get('Khoury College of Computer Sciences').length;
    } else {
      dict.Khoury = 0;
    }


    dict.total = dict.SocialScienceAndHumanities + dict.Engineering + dict.Science + dict.ArtMediaAndDesign + dict.Business + dict.Khoury;
    college_d.push(dict);
  }
 

  var keys_college = ["SocialScienceAndHumanities", "Engineering", "Science", "ArtMediaAndDesign", "Business", "Khoury"];

  college_d.sort(function(a, b) { return b.total - a.total; });
  x_college.domain(college_d.map(function(d) { return d.Coop; }));          
  y_college.domain([0, d3.max(college_d, function(d) { return d.total; })]); 
  z_college.domain(keys_college);

  var xSubgroup = d3.scaleBand().domain(keys_college).range([0, x_college.bandwidth()]).padding([0.05]);

  g_college.append("g")
    .selectAll("g")
    .data(college_d)
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + x_college(d.Coop) + ",0)"; })
    .selectAll("rect")
    .data(function(d) { return keys_college.map(function(key) {return {key: key, value: d[key]}; }); })
    .enter().append("rect")
      .attr("x", function(d) { return xSubgroup(d.key); })    
      .attr("y", function(d) { return y_college(d.value); })        
      .attr("width", xSubgroup.bandwidth())
      .attr("height", function(d) {return HEIGHT - y_college(d.value); })
      .attr("fill", function(d) { return z_college(d.key); });             

  g_college.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0,0)")          
      .call(d3.axisLeft(y_college));                  

  g_college.append("g")
    .attr("transform", "translate(0,"+HEIGHT+")")       
      .call(d3.axisBottom(x_college).tickSize(0));     

  var legend_college = g_college.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys_college.slice().reverse())
    .enter().append("g")
   .attr("transform", function(d, i) { return "translate(-0," + (100 + i * 20) + ")"; });;

  legend_college.append("rect")
      .attr("x", WIDTH - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z_college);

  legend_college.append("text")
      .attr("x", WIDTH - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });
  
});