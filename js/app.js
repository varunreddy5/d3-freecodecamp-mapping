var w=1000;
var h=600;
var margin={top:30,right:30,bottom:30,left:50};
var width=w-margin.left-margin.right;
var height=h-margin.top-margin.bottom;
var svg=d3.select("body")
.append("svg")
.attr({id:"chart",
 width:w,
 height:h});
var chart=svg.append("g")
.attr({transform:"translate("+margin.left+","+margin.top+")"});
var projection=d3.geo.mercator()
.translate([width/2.1,height/1.4])
.scale(140);
var path=d3.geo.path()
.projection(projection);

var radius=d3.scale.sqrt()
.domain([0,1000000])
.range([1,10]);

var format=d3.format(".2s");

var div=d3.select("body")
.append("div")
.classed("tooltip",true)
.style("opacity",0);

queue()
.defer(d3.json,"https://unpkg.com/world-atlas@1/world/50m.json")
.defer(d3.json,"https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json")
.await(ready);
var colorScale=d3.scale.category10();
function ready(error,world,names){
  if(error){console.log(error);}
  chart.append("path")
  .datum(topojson.feature(world,world.objects.land))
  .attr("class","land")
  .attr("d",path);
  
  chart.append("path")
  .datum(topojson.mesh(world,world.objects.countries,function(a,b){return a!==b;}))
  .attr("class","countries")
  .attr("d",path);
  (names.features).forEach(function(d){
    d.properties.reclat=+d.properties.reclat;
    d.properties.reclong=+d.properties.reclong;
    d.properties.mass=+d.properties.mass;
  });
  
  (names.features).sort(function(a, b) {
    return b.properties.mass - a.properties.mass
  });
  //enter
  chart.append("g")
  .selectAll(".meteorites")
  .data(names.features)
  .enter()
  .append("circle")
  .classed("meteorites",true);
  
  //update
  chart.selectAll(".meteorites")
  .attr({
    cx:function(d){
      return projection([d.properties.reclong,d.properties.reclat])[0];
    },
    cy:function(d){
      return projection([d.properties.reclong,d.properties.reclat])[1];
    },
    r:function(d){
      return radius(d.properties.mass);
    },
    "fill":function(d,i){
      return colorScale(i);
    },
    "opacity":0.6
  })
  .on("mouseover",function(d){
    
    div.transition()
    .duration(50)
    .style("opacity",0.5);
    
    div.style("top",d3.event.pageY-5+"px")
    .style("left",d3.event.pageX+15+"px");
    
    div.html("<span>"+"Fall: "+d.properties.fall+"<br>"+
      "Name: "+d.properties.name+"<br>"+
      "NameType: "+d.properties.nametype+"<br>"+
      "reclass: "+d.properties.recclass+"<br>"+
      "reclat: "+d.properties.reclat+"<br>"+
      "Mass: "+d.properties.mass+"<br>"+
      "Year: "+d.properties.year+"</span>");
    
  })
  .on("mouseout",function(d){
    div.transition()
    .duration(50)
    .style("opacity",0);
  });
  
  //exit
  chart
  .selectAll(".meteorites")
  .data(names.features)
  .exit()
  .remove();
  
  
}

