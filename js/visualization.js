const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 130 }
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM

const svg_rating = d3.select("#rating-distribution").append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

const g_rating = svg_rating.append("g")
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

// X Label
g_rating.append("text")
  .attr("class", "x axis-label")
  .attr("x", WIDTH / 2)
  .attr("y", HEIGHT + 50)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Stars");

// Y label
g_rating.append("text")
  .attr("class", "y axis-label")
  .attr("x", - (HEIGHT / 2))
  .attr("y", -60)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Count");

  d3.csv("data/coops.csv").then(data => {
    data.forEach(d => {
      d.rating = Number(d.rating)
    })

    const ratingMap = d3.rollup(data, v => v.length, d => d.rating);

    const ratings = [
      {"rating":1, "count":ratingMap.get(1)},
      {"rating":2, "count":ratingMap.get(2)},
      {"rating":3, "count":ratingMap.get(3)},
      {"rating":4, "count":ratingMap.get(4)},
      {"rating":5, "count":ratingMap.get(5)}];
  
    const x = d3.scaleBand()
      .domain(ratings.map(d => d.rating))
      .range([0, WIDTH]);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(ratings, d => d.count)])
      .range([HEIGHT, 0]);
  
    const xAxisCall = d3.axisBottom(x)
    g_rating.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${HEIGHT})`)
        .call(xAxisCall);
  
    const yAxisCall = d3.axisLeft(y);
    g_rating.append("g")
        .attr("class", "y axis")
        .call(yAxisCall);
  
  
    const rects =g_rating.selectAll("rect")
      .data(ratings);
    
    rects.enter().append("rect")
      .attr("y", d => y(d.count))
      .attr("x", d => x(d.rating))
      .attr("width", x.bandwidth)
      .attr("height", d => HEIGHT - y(d.count))
      .attr("fill", "black");
  });

// Pay Distribution

const svg_pay = d3.select("#pay-distribution").append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

const g_pay = svg_pay.append("g")
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

// X Label
g_pay.append("text")
  .attr("class", "x axis-label")
  .attr("x", WIDTH / 2)
  .attr("y", HEIGHT + 50)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Pay ($/hr)");

// Y label
g_pay.append("text")
  .attr("class", "y axis-label")
  .attr("x", - (HEIGHT / 2))
  .attr("y", -60)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Count");

  d3.csv("data/coops.csv").then(data => {
    data.forEach(d => {
      d.pay = Number(d.pay)
    })

    const payMap = d3.rollup(data, v => v.length, d => d.pay);
    const compensations = [];

    // console.log(payMap)

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

     if (key == 0) {
       nonPaid += value;
     } else if (key < 15) {
       to15 += value
     }
     else if (key < 20) {
      to20 += value
    }
    else if (key < 25) {
      to25 += value
    }
    else if (key < 30) {
      to30 += value
    }
    else if (key < 35) {
      to35 += value
    }
    else if (key < 40) {
      to40 += value
    }
    else if (key < 45) {
      to45 += value
    }
    else if (key < 50) {
      to50 += value
    }
    else if (key > 50) {
      over50 += value
    }
      compensations.push(
        {"pay":"0",     "count":nonPaid},
        {"pay":"<15",   "count":to15},
        {"pay":"15-20", "count":to20},
        {"pay":"20-25", "count":to25},
        {"pay":"25-30", "count":to30},
        {"pay":"30-35", "count":to35},
        {"pay":"35-40", "count":to40},
        {"pay":"40-45", "count":to45},
        {"pay":"45-50", "count":to50},
        {"pay":">50",   "count":over50});
   }

   console.log(compensations)

    const x = d3.scaleBand()
      .domain(compensations.map(d => d.pay))
      .range([0, WIDTH]);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(compensations, d => d.count)])
      .range([HEIGHT, 0]);
  
    const xAxisCall = d3.axisBottom(x)
    g_pay.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${HEIGHT})`)
        .call(xAxisCall);
  
    const yAxisCall = d3.axisLeft(y);
    g_pay.append("g")
        .attr("class", "y axis")
        .call(yAxisCall);
  
  
    const rects =g_pay.selectAll("rect")
      .data(compensations);
    
    rects.enter().append("rect")
      .attr("y", d => y(d.count))
      .attr("x", d => x(d.pay))
      .attr("width", x.bandwidth)
      .attr("height", d => HEIGHT - y(d.count))
      .attr("fill", "black");
  });

