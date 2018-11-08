"use strict";

// коэффициенты
var A2=[1.880,	1.880,	1.023,	0.729,	0.577,	0.483,	0.419,	0.373,	0.337,	0.308];
var B3=[0.000,	0.000,	0.000,	0.000,	0.000,	0.030,	0.118,	0.185,	0.239,	0.283];
var B4=[3.267,	3.267,	2.568,	2.266,	2.089,	1.970,	1.882,	1.815,	1.761,	1.716];
var D3=[0.000,	0.000,	0.000,	0.000,	0.000,	0.000,	0.076,	0.136,	0.184,	0.223];
var D4=[3.268,	3.268,	2.575,	2.282,	2.116,	2.004,	1.924,	1.864,	1.816,	1.777];
var D2=[1.128,	1.128,	1.693,	2.059,	2.326,	2.534,	2.704,	2.847,	2.970,	3.078];
var reD2=[	0.8862,	0.8862,	0.5908,	0.4857,	0.4299,	0.3946,	0.3698,	0.3512,	0.3367,	0.3249];
var E2=2.66;
// структура для сохранения данных таблицы
var dataTable = {data:[], q: 0, n: 0, p: 0, req: [], note: ""};
// вспомагательные переменные
var e_count = 0, 
	s_count = 0, 
	q_count = 0;
// генерация случайного числа
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
//	округление чисел
function roundNumber(num, scale)
{
	if(!("" + num).includes("e"))
	{
		return +(Math.round(num + "e+" + scale)  + "e-" + scale);
	}
	else
	{
		var arr = ("" + num).split("e");
		var sig = ""
		if(+arr[1] + scale > 0)
		{
			sig = "+";
		}
		return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
	}
}
// рисуем график
function get_graph(source, width, height, max_x, max_y, map, mapLine, show_limit, min_y)
{
	var margin=20,
		data=[];

	// создание объекта svg
	var svg = d3.select(source)
			.attr("class", "axis")
			.attr("width", width - 15)
			.attr("height", height );
			
	svg.selectAll("*").remove();
	
	// длина оси X= ширина контейнера svg - отступ слева и справа
	var xAxisLength = width - margin * 2;     
	  
	// длина оси Y = высота контейнера svg - отступ сверху и снизу
	var yAxisLength = height - margin * 2;
	
	// функция интерполяции значений на ось Х  
	var scaleX = d3.scaleLinear()
				.domain([1, max_x])
				.range([margin+10 , xAxisLength]);
				 
	// функция интерполяции значений на ось Y
	var scaleY = d3.scaleLinear()
				.domain([max_y, min_y])
				.range([margin, yAxisLength]);
				
	// создаем ось X   
	var xAxis = d3.axisBottom()
				 .scale(scaleX)
				 .ticks(max_x);
		
	let tickCount;
	if (Math.ceil((max_y+1) / 20) > 2)
	{
		tickCount = 20; 
	} else {
		tickCount = max_y+1; 
	}

	// создаем ось Y             
	var yAxis = d3.axisLeft()
				 .scale(scaleY)
				 .ticks(tickCount)
				 .tickFormat(function(d, i) { 
					 
					 if ((i % 5) == 0)
						return d;
					else 
						return "";
					});
	
	 // отрисовка оси Х             
	svg.append("g")       
		 .attr("class", "x-axis")
		 .attr("transform",  // сдвиг оси вниз и вправо
			 "translate(0,"+yAxisLength+")")
		.call(xAxis);
		
	 // отрисовка оси Y 
	svg.append("g")       
		.attr("class", "y-axis")
		.attr("transform", // сдвиг оси вниз и вправо на margin
				"translate("+(margin+10)+",0)")
		.call(yAxis);

	// создаем набор вертикальных линий для сетки   
	d3.selectAll("g.x-axis g.tick").each(function(i) {
		d3.select(this)
		.append("line")
		.classed("grid-line", true)
		.classed("vline"+i, true)
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", 0)
		.attr("y2", -yAxisLength+10);
	});
	// рисуем горизонтальные линии координатной сетки
	d3.selectAll("g.y-axis g.tick")
		.append("line")
		.classed("grid-line", true)
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", xAxisLength-(margin+10))
		.attr("y2", 0);
	
	// функция, создающая по массиву точек линии
	var line = d3.line()
				.x(function(d) {return scaleX(d[0]); })
				.y(function(d) {return scaleY(d[1]); })
				.defined(function(d) {if (d != null) return true; else return false;});
	//легенда
	let legend_data=[["Data", "black"]];
	// 			, ["CL", "green"], ["UCL, LCL", "red"], ["1sigma, 2sigma", "gray"], ["Requirement", "blue"]
	// карта
	// контрольные пределы карты
	for (let mline in mapLine)
	{
		if (mapLine[mline].points.length != 0)
		{
			svg.append("g").append("path")
			.attr("d", line(mapLine[mline].points))
			.classed("gLine", true)
			.classed(mapLine[mline].color+"Line", true)
			.style("stroke", mapLine[mline].color)
			.style("stroke-dasharray", mapLine[mline].dash)
			.style("fill", "none")
			.style("display", (show_limit?"":"none"))
			.on("mouseover", function() {
				let cx = d3.event.pageX + 5,// + d3.mouse(this)[0],
					cy = d3.event.pageY - 30;// + d3.mouse(this)[1];
				let text = mapLine[mline].points.length==2?roundNumber(mapLine[mline].points[0][1], 1):"";
				if (text != "")
				{
					d3.select(".board")
						.text(text)
						.style("top", cy + "px")
						.style("left", cx + "px")
						.style("display", "block");
				}
			})
			.on("mouseout", function() {
				d3.select(".board")
					.style("display", "none");
			});
			//.append("title")
			//.text(mapLine[mline].points.length==2?roundNumber(mapLine[mline].points[0][1], 1):"");

			let find=false;
			for(let j=0;j<legend_data.length;j++)
			{
				if (legend_data[j][1]==mapLine[mline].color)
				{
					legend_data[j][0]=legend_data[j][0]+", "+mapLine[mline].name;
					find=true;
					break;
				}
			}
			if (!find)
				legend_data.push([mapLine[mline].name, mapLine[mline].color]);
		}
	}
	// создание легенды
	var legend = svg.append("g")
		.attr("class", "legend")
		.selectAll("g")
		.data(legend_data)
		.enter()
		.append("g")
		.attr("data-class", function(d) {
			return d[1]+"Line";
		})
		.attr("data-show", function(d) {
			return (show_limit?"none":"");
		})
		.attr("transform", function(d,i){
		return "translate(" + (i*100+50) + "," + 0 + ")"; 
		})
		.on("click", function(d) {
			if (d[0]!="Data")
			{
				let className=this.dataset.class;
				let show=this.dataset.show;
				if (show=="none")
					this.dataset.show="";
				else 
					this.dataset.show="none";
				d3.selectAll("."+className).style("display", show);
			}
		});

	legend.append("rect")
		.attr("width", 8)
		.attr("height", 8)
		.style("fill", function(d, i){return d[1];});

	legend.append("text")
		.attr("x", function(d,i){ return 10;})
		.attr("dy", "0.8em")
		.text(function(d, i){return d[0]})

	// добавляем состояние
	// проверяем по правилам
	let state = check_rules(map, mapLine);	
	svg.append("text")
	.attr("x", xAxisLength - 250 )
	.attr("dy", "0.7em")
	.classed(state.line+"Line", true)
	.style("font-size", "0.9em")
	.style("fill", state.color)
	.text(state.text);
	// рисуем рамку плохих значений
	if (state.points.length > 0)
	{
		let w = scaleX(state.points[1])-scaleX(state.points[0]);
		if (w == 0) w = 1;
		svg.append("rect")
		.attr("y", 10)
		.attr("x", scaleX(state.points[0]))
		.attr("width", w)
		.attr("height", yAxisLength - 5)
		.classed(state.line+"Line", true)
		.style("fill", "none")
		.style("stroke", state.color);
	}
	// правило
	svg.append("text")
	.attr("x", xAxisLength - 320 )
	.attr("dy", "0.7em")
	.classed(state.line+"Line", true)
	.classed("rule", true)
	.style("font-size", "0.9em")
	.style("fill", state.color)
	.attr("data-title", state.title)
	.text(state.name)
	.on("mouseover", function() {
		let cx = d3.event.pageX + 5,
			cy = d3.event.pageY - 30;
		let title =this.dataset.title;
		d3.select(".board")
			.text(title)
			.style("top", cy + "px")
			.style("left", cx + "px")
			.style("display", "block");
	})
	.on("mouseout", function() {
		d3.select(".board")
			.style("display", "none");
	});
	// проверяем по требованиям
	state =	check_meet(map, mapLine);
	svg.append("text")
	.attr("x", xAxisLength - 115)
	.attr("dy", "0.7em")
	.classed(state.line+"Line", true)
	.style("font-size", "0.9em")
	.style("fill", state.color)
	.text(state.text);
	
	// добавляем путь: график
	svg.append("g").append("path")
	.attr("d", line(map))
	.classed("map", true)
	.style("fill", "none")
	.style("stroke", "black")
	.style("stroke-width", 2);

	svg.selectAll("g.map")
	   .data(map)
	   .enter()
	   .append("rect")
	   .filter(function(d) {return d!= null;})
	   .attr("x", function(d) {
			if (d!=null) return (scaleX(d[0]) - 3); 
	   })
	   .attr("y", function(d) {
			if (d!=null) return (scaleY(d[1]) - 3); 
	   })
		.classed("point", true)
		.attr("width", 7)
		.attr("height", 7)
		.attr("fill", "black")
		.attr("data-i", function(d) { if (d!=null) return d[0]})
		.attr("data-v", function(d) { if (d!=null) return d[1]})
		.on("mouseover", function() {
			let cx = d3.event.pageX + 5,
				cy = d3.event.pageY - 30;
			let i =this.dataset.i;
			let v =this.dataset.v;
			d3.selectAll(".vline"+i)
				.style("stroke-opacity", "1");
			d3.selectAll(".line"+i)
				.style("background", "#BFBFBF");
			d3.select(".board")
				.text(v)
				.style("top", cy + "px")
				.style("left", cx + "px")
				.style("display", "block");
		})
		.on("mouseout", function() {
			let i =this.dataset.i;
			d3.selectAll(".vline"+i)
				.style("stroke-opacity", "0.2");
			d3.selectAll(".line"+i)
				.style("background", "#FFFFFF");
			d3.select(".board")
				.style("display", "none");
		})
		.on("click", function() {
			let i =this.dataset.i;
			d3.selectAll(".line").classed("curLine", false);
			let destination = d3.selectAll(".line"+i).classed("curLine", true).property("offsetTop") - d3.event.y + 20;
			d3.transition().duration(1000).tween("scroll", scrollTween(destination));
		});
}
// плавная прокрутка
function scrollTween(offset) {
  return function() {
	let i = d3.interpolateNumber(window.pageYOffset || document.documentElement.scrollTop, offset);
    return function(t) { scrollTo(0, i(t)); };
  };
}
// установить действия на таблицу и кнопки
function set_action()
{
	// действие при двойном щелчке на ячейке с данными
	d3.selectAll(".line .data").on("dblclick", function() {
		let div = this,
			cur_value = div.innerText;
		if (div.getElementsByTagName("input").length === 0)
		{
			div.innerHTML = "<input type='number' class='edit'>";
			let input = d3.select(this).select(".edit");
			//input.focus();
			input.node().focus();
			input.attr("value", cur_value)
				.on("blur", function() {
					let value = this.value;
					this.remove();
					div.innerText = value;
					let max = value,
						min = value,
						sum = 0,
						range = 0,
						medium = 0;
					let line = div.parentNode.dataset.line;
					d3.selectAll(".line"+line+" .data").each(function() {
						if (this.innerText != '')
						{
							let data = parseFloat(this.innerText);
							sum+=data
							if (data>max)
								max=data;
							if (data<min)
								min=data;
						}
					});
					medium=roundNumber(sum/q_count, 1);
					range = max - min;
					d3.selectAll(".line"+line+" .sum").text(sum);
					d3.selectAll(".line"+line+" .medium").text(medium);
					d3.selectAll(".line"+line+" .range").text(range);
					sum=0;
					range=0;
					d3.selectAll(".medium").each(function() {
						if (this.innerText != '') {
							sum+=parseFloat(this.innerText);
						}
					});
					d3.selectAll(".range").each(function() {
						if (this.innerText != '') {
							range+=parseFloat(this.innerText);
						}
					});
					sum=roundNumber(sum, 1);
					medium=roundNumber(sum/e_count, 1);
					d3.select("#medium").text(medium);
					medium=roundNumber(range/e_count, 1);
					d3.select("#range").text(medium);
				})
				.on("keydown", function() {
					if (d3.event.key == "Enter") {
						this.blur();
					}
				});
			input.node().select();
		}
	});
	// действие при двойном щелчке на ячейке с объемом выборки
	d3.selectAll(".line .count").on("dblclick", function() {
		let div = this,
			cur_value = div.innerText;
		if (div.getElementsByTagName("input").length === 0)
		{
			div.innerHTML = "<input type='number' class='edit'>";
			let input = d3.select(this).select(".edit");
			input.node().focus();
			input.attr("value", cur_value)
				.on("blur", function() {
					let value = this.value;
					this.remove();
					div.text(value);
				})
				.on("keydown", function() {
					if (d3.event.key == "Enter")
					{
						this.blur();
					}
				});
			input.node().select();
		}
	});
	// действие при двойном щелчке на ячейке с требованием потребителя
	d3.selectAll(".line .req1, .line .req2").on("dblclick", function() {
		let div = this,
			cur_value = div.innerText;
			div.innerHTML = "<input type='number' class='edit'>";
			let input =  d3.select(this).select(".edit");
			input.node().focus();
			input.attr("value", cur_value)
				.on("blur", function() {
					let value = this.value;
					this.remove();
					div.text(value);
				})
				.on("keydown", function() {
					if (d3.event.key == "Enter")
					{
						this.blur();
					}
				});
	});
	// действие при нажатии на кнопку установления требований потребителя
	d3.select("#set_requirement").on("click", function() {
		let req=parseFloat(d3.select("#requirement1").node().value);
		d3.selectAll(".req1").text(req);
		req=parseFloat(d3.select("#requirement2").node().value);
		d3.selectAll(".req2").text(req);
	});
	d3.select("#set_max_min").on("click", function() {
		let max=0,
			min=0;
		for (let i=1; i<=e_count; i++)
		{
			if (!d3.select(".line"+i+" .ignore").property("checked"))
			{
				let val=parseInt(d3.select(".line"+i+" .medium").text().trim());
				if (i==1)
				{
					max=val;
					min=val;
				}
				if (max<val)
					max=val;
				if (min>val)
					min=val;
			}
		}
		d3.selectAll(".req1").text(min);
		d3.selectAll(".req2").text(max);
		d3.select("#requirement1").attr("value", min);
		d3.select("#requirement2").attr("value", max);
	});
	// действие при нажатии на кнопку показа графиков
	d3.select("#show_maps").on("click", function() {
		d3.selectAll("div.graph").style("display", "none");
		let width=d3.select("div.block").node().clientWidth;
		let show_limit=!d3.select("#hide_limit").property("checked");
		let limit_points = d3.select("#limit_points").node().value;
		let sigma;
		if (d3.select("#x_map").property("checked") || d3.select("#mr_map").property("checked"))
		{
			let map=[],
				map2=[null], 
				mapLine={
					cLine:{points:[], color:"green", dash:"", name:"CL"}, 
					tLine:{points:[], color:"red", dash:"", name:"UCL"}, 
					bLine:{points:[], color:"red", dash:"", name:"LCL"},
					sig1Line:{points:[], color:"gray", dash:"10 5", name:"1sigma"},
					sig2Line:{points:[], color:"gray", dash:"10 5", name:"2sigma"},
					reqLine:{points:[], color:"blue", dash:"", name:"Requirement"}
				},
				mapLine2={
					cLine:{points:[], color:"green", dash:"", name:"CL"}, 
					tLine:{points:[], color:"red", dash:"", name:"UCL"}, 
					bLine:{points:[], color:"red", dash:"", name:"LCL"},
					sig1Line:{points:[], color:"gray", dash:"10 5", name:"1sigma"},
					sig2Line:{points:[], color:"gray", dash:"10 5", name:"2sigma"},
					reqLine:{points:[], color:"blue", dash:"", name:"Requirement"}
				}, 
				prev_value=null,
				sum=0,
				sum2=0,
				value=0,
				value2=0,
				count=0,
				count2=0,
				max=0,
				max2=0,
				min=null,
				min2=null,
				req1=0,
				req2=0,
				reqArray=[],
				point=0;
			for (let i=1;i<=e_count;i++)
			{
				if (d3.select(".line"+i+" .ignore").property("checked")) 
				{
					map.push(null);
					map2.push(null);
				} else {
					value=parseFloat(d3.select(".line"+i+" .medium").text().trim());
					if (min==null)
						min=value;
					if (value>max)
						max=value;
					if (value<min)
						min=value;
					if (prev_value!=null)
					{
						value2=Math.abs(prev_value-value);
						if (min2==null)
							min2=value2;
						if (value2>max2)
							max2=value2;
						if (value2<min2)
							min2=value2;
						if (i<=limit_points)
						{	
							sum2+=value2;
							count2++;
						}
						map2.push([i, value2]);
					}
					prev_value=value;
					if (i<=limit_points)
					{	
						sum+=value;
						count++;
					}
					map.push([i,value]);
				}
				req1=parseFloat(d3.select(".line"+i+" .req1").text().trim());
				req2=parseFloat(d3.select(".line"+i+" .req2").text().trim());
				if(req1<min)
					min=req1;
				if (req2>max)
					max=req2;
				mapLine.reqLine.points.push([i,req1]);
				reqArray.push([i,req2]);
			}
			mapLine.reqLine.points=mapLine.reqLine.points.concat(null, reqArray);
			point=roundNumber(sum/count, 1);
			mapLine.cLine.points=[[1, point], [e_count, point]];
			point=roundNumber(sum2/count2, 1);
			mapLine2.cLine.points=[[1, point], [e_count, point]];
			point=mapLine.cLine.points[0][1]+E2*mapLine2.cLine.points[0][1];
			mapLine.tLine.points=[[1, point], [e_count, point]];
			if (point > max)
				max = point;
			point=mapLine.cLine.points[0][1]+E2*mapLine2.cLine.points[0][1]/3;
			mapLine.sig1Line.points=[[1, point], [e_count, point]];
			point=mapLine.cLine.points[0][1]+E2*mapLine2.cLine.points[0][1]/3*2;
			mapLine.sig2Line.points=[[1, point], [e_count, point]];
			point=mapLine.cLine.points[0][1]-E2*mapLine2.cLine.points[0][1];
			if (point < 0)
				point = 0;
			mapLine.bLine.points=[[1, point], [e_count, point]];
			if (point < min)
				min = point;
			point=mapLine.cLine.points[0][1]-E2*mapLine2.cLine.points[0][1]/3;
			if (point < 0)
				point = 0;
			mapLine.sig1Line.points.push(null, [1, point], [e_count, point]);
			point=mapLine.cLine.points[0][1]-E2*mapLine2.cLine.points[0][1]/3*2;
			if (point < 0)
				point = 0;
			mapLine.sig2Line.points.push(null, [1, point], [e_count, point]);
			//расчеты mr карты
			point=D4[q_count-1]*mapLine2.cLine.points[0][1];
			mapLine2.tLine.points=[[1, point], [e_count, point]];
			if (point > max2)
				max2= point;
			mapLine2.bLine.points=[[1, 0], [e_count, 0]];
			sigma = (mapLine2.tLine.points[0][1]-mapLine2.cLine.points[0][1])/3;
			point=mapLine2.cLine.points[0][1]+sigma;
			mapLine2.sig1Line.points=[[1, point], [e_count, point]];
			point=mapLine2.cLine.points[0][1]+sigma*2;
			mapLine2.sig2Line.points=[[1, point], [e_count, point]];
			point=mapLine2.cLine.points[0][1]-sigma;
			if (point < 0)
				point = 0;
			mapLine2.sig1Line.points.push(null, [1, point], [e_count, point]);
			point=mapLine2.cLine.points[0][1]-sigma*2;
			if (point < 0)
				point = 0;
			mapLine2.sig2Line.points.push(null, [1, point], [e_count, point]);
			if (min2 > 0)
				min2 = 0;
			max=Math.ceil(max);
			max2=Math.ceil(max2);
			min=Math.floor(min);
			min2=Math.floor(min2);
			get_graph("#x_map_graph", width, 210, e_count, max, map, mapLine, show_limit, min);
			get_graph("#mr_map_graph", width, 210, e_count, max2, map2, mapLine2, show_limit, min2);
			if (d3.select("#x_map").property("checked"))
			{
				d3.select("#x_map_graph").node().parentNode.style.display = "";
			}
			if (d3.select("#mr_map").property("checked"))
			{
				d3.select("#mr_map_graph").node().parentNode.style.display = "";
			}
		}
		if (d3.select("#mx_map").property("checked") || d3.select("#r_map").property("checked"))
		{
			let map=[],
				map2=[null], 
				mapLine={
					cLine:{points:[], color:"green", dash:"", name:"CL"}, 
					tLine:{points:[], color:"red", dash:"", name:"UCL"}, 
					bLine:{points:[], color:"red", dash:"", name:"LCL"},
					sig1Line:{points:[], color:"gray", dash:"10 5", name:"1sigma"},
					sig2Line:{points:[], color:"gray", dash:"10 5", name:"2sigma"},
					reqLine:{points:[], color:"blue", dash:"", name:"Requirement"}
				},
				mapLine2={
					cLine:{points:[], color:"green", dash:"", name:"CL"}, 
					tLine:{points:[], color:"red", dash:"", name:"UCL"}, 
					bLine:{points:[], color:"red", dash:"", name:"LCL"},
					sig1Line:{points:[], color:"gray", dash:"10 5", name:"1sigma"},
					sig2Line:{points:[], color:"gray", dash:"10 5", name:"2sigma"},
					reqLine:{points:[], color:"blue", dash:"", name:"Requirement"}
				}, 
				sum=0,
				sum2=0,
				value=0,
				value2=0,
				count=0,
				req1=0,
				req2=0,
				reqArray=[],
				max=0,
				max2=0,
				min=null,
				min2=null,
				point=0;
			for (let i=1;i<=e_count;i++)
			{
				if (d3.select(".line"+i+" .ignore").property("checked")) 
				{
					map.push(null);
					map2.push(null);
				} else {
					value=parseFloat(d3.select(".line"+i+" .medium").text().trim());
					value2=parseFloat(d3.select(".line"+i+" .range").text().trim());
					if (min==null)
					{
						min=value;
						min2=value2;
					}
					if (value>max)
						max=value;
					if (value2>max2)
						max2=value2;
					if (value<min)
						min==value;
					if (value2<min2)
						min2=value;
					if (i<=limit_points)
					{	
						sum+=value;
						sum2+=value2;
						count++;
					}
					map.push([i,value]);
					map2.push([i, value2]);
				}
				req1=parseFloat(d3.select(".line"+i+" .req1").text().trim());
				req2=parseFloat(d3.select(".line"+i+" .req2").text().trim());
				if (req2>max)
					max=req2;				
				if (req1<min)
					min=req1;
				mapLine.reqLine.points.push([i,req1]);
				reqArray.push([i,req2]);
			}
			mapLine.reqLine.points=mapLine.reqLine.points.concat(null, reqArray);
			point=roundNumber(sum/count, 1);
			mapLine.cLine.points=[[1, point], [e_count, point]];
			point=roundNumber(sum2/count, 1);
			mapLine2.cLine.points=[[1, point], [e_count, point]];
			point=mapLine.cLine.points[0][1]+A2[q_count-1]*mapLine2.cLine.points[0][1];
			mapLine.tLine.points=[[1, point], [e_count, point]];
			if (point>max)
				max=point;
			point=mapLine.cLine.points[0][1]+A2[q_count-1]*mapLine2.cLine.points[0][1]/3;
			mapLine.sig1Line.points=[[1, point], [e_count, point]];
			point=mapLine.cLine.points[0][1]+A2[q_count-1]*mapLine2.cLine.points[0][1]/3*2;
			mapLine.sig2Line.points=[[1, point], [e_count, point]];
			point=mapLine.cLine.points[0][1]-A2[q_count-1]*mapLine2.cLine.points[0][1];
			if (point < 0)
				point = 0;
			mapLine.bLine.points=[[1, point], [e_count, point]];
			if (point<min)
				min=point;
			point=mapLine.cLine.points[0][1]-A2[q_count-1]*mapLine2.cLine.points[0][1]/3;
			if (point < 0)
				point = 0;
			mapLine.sig1Line.points.push(null, [1, point], [e_count, point]);
			point=mapLine.cLine.points[0][1]-A2[q_count-1]*mapLine2.cLine.points[0][1]/3*2;
			if (point < 0)
				point = 0;
			mapLine.sig2Line.points.push(null, [1, point], [e_count, point]);
			point=D4[q_count-1]*mapLine2.cLine.points[0][1];
			mapLine2.tLine.points=[[1, point], [e_count, point]];
			if (point>max2)
				max2=point;
			point=mapLine2.cLine.points[0][1]+(D4[q_count-1]*mapLine2.cLine.points[0][1]-mapLine2.cLine.points[0][1])/3;
			mapLine2.sig1Line.points=[[1, point], [e_count, point]];
			point=mapLine2.cLine.points[0][1]+(D4[q_count-1]*mapLine2.cLine.points[0][1]-mapLine2.cLine.points[0][1])/3*2;
			mapLine2.sig2Line.points=[[1, point], [e_count, point]];
			point=D3[q_count-1]*mapLine2.cLine.points[0][1];
			mapLine2.bLine.points=[[1, point], [e_count, point]];
			if (point<min2)
				min2=point;
			point=mapLine2.cLine.points[0][1]+(D3[q_count-1]*mapLine2.cLine.points[0][1]-mapLine2.cLine.points[0][1])/3;
			mapLine2.sig1Line.points.push(null, [1, point], [e_count, point]);
			point=mapLine2.cLine.points[0][1]+(D3[q_count-1]*mapLine2.cLine.points[0][1]-mapLine2.cLine.points[0][1])/3*2;
			mapLine2.sig2Line.points.push(null, [1, point], [e_count, point]);
			max=Math.ceil(max);
			max2=Math.ceil(max2);
			min=Math.floor(min);
			min2=Math.floor(min2);
			get_graph("#mx_map_graph", width, 210, e_count, max, map, mapLine, show_limit, min);
			get_graph("#r_map_graph", width, 210, e_count, max2, map2, mapLine2, show_limit, min2);
			if (d3.select("#mx_map").property("checked"))
			{
				d3.select("#mx_map_graph").node().parentNode.style.display = "";
			}
			if (d3.select("#r_map").property("checked"))
			{
				d3.select("#r_map_graph").node().parentNode.style.display = "";
			}
		}
		if (d3.select("#pn_map").property("checked"))
		{
			let map=[],
				mapLine={
					cLine:{points:[], color:"green", dash:"", name:"CL"}, 
					tLine:{points:[], color:"red", dash:"", name:"UCL"}, 
					bLine:{points:[], color:"red", dash:"", name:"LCL"},
					sig1Line:{points:[], color:"gray", dash:"10 5", name:"1sigma"},
					sig2Line:{points:[], color:"gray", dash:"10 5", name:"2sigma"},
					reqLine:{points:[], color:"blue", dash:"", name:"Requirement"}
				},
				sum=0,
				value=0,
				count=0,
				max=0,
				min=null,
				mp=0, 
				req1=0,
				req2=0,
				reqArray=[],
				point=0;
			for (let i=1;i<=e_count;i++)
			{
				if (d3.select(".line"+i+" .ignore").property("checked")) 
				{
					map.push(null);
				} else {
					value=parseFloat(d3.select(".line"+i+" .medium").text().trim());
					if (min==null)
						min=value;
					if (value>max)
						max=value;
					if (value<min)
						min=value;
					if (i<=limit_points)
					{
						sum+=value;
						count++;
					}
					map.push([i,value]);
				}
				req1=parseFloat(d3.select(".line"+i+" .req1").text().trim());
				req2=parseFloat(d3.select(".line"+i+" .req2").text().trim());
				if (req2>max)
					max=req2;
				if (req1<min)
					min=req1;
				mapLine.reqLine.points.push([i,req1]);
				reqArray.push([i,req2]);
			}
			mapLine.reqLine.points=mapLine.reqLine.points.concat(null, reqArray);
			mp=sum/(count*s_count);
			if (mp>1) mp=1;
			point=roundNumber(sum/count, 1);
			mapLine.cLine.points=[[1, point], [e_count, point]];
			point=mapLine.cLine.points[0][1] + 3 * Math.sqrt(mapLine.cLine.points[0][1] * (1 - mp));
			mapLine.tLine.points=[[1, point], [e_count, point]];
			if (point>max)
				max=point;
			point=mapLine.cLine.points[0][1] + 2 * Math.sqrt(mapLine.cLine.points[0][1] * (1 - mp));
			mapLine.sig2Line.points=[[1, point], [e_count, point]];
			point=mapLine.cLine.points[0][1] - 2 * Math.sqrt(mapLine.cLine.points[0][1] * (1 - mp));
			if (point < 0)
				point = 0;
			mapLine.sig2Line.points.push(null, [1, point], [e_count, point]);
			point=mapLine.cLine.points[0][1] + Math.sqrt(mapLine.cLine.points[0][1] * (1 - mp));
			mapLine.sig1Line.points=[[1, point], [e_count, point]];
			point=mapLine.cLine.points[0][1] - Math.sqrt(mapLine.cLine.points[0][1] * (1 - mp));
			if (point < 0)
				point = 0;
			mapLine.sig1Line.points.push(null, [1, point], [e_count, point]);
			point=mapLine.cLine.points[0][1] - 3 * Math.sqrt(mapLine.cLine.points[0][1] * (1 - mp));
			if (point < 0)
				point = 0;
			mapLine.bLine.points=[[1, point], [e_count, point]];
			if (point<min)
				min=point;
			min=Math.floor(min);
			max=Math.ceil(max);
			get_graph("#pn_map_graph", width, 210, e_count, max, map, mapLine, show_limit, min);
			d3.select("#pn_map_graph").node().parentNode.style.display = "";
		}
		if (d3.select("#p_map").property("checked"))
		{
			let map=[],
				mapLine={
					cLine:{points:[], color:"green", dash:"", name:"CL"}, 
					tLine:{points:[], color:"red", dash:"", name:"UCL"}, 
					bLine:{points:[], color:"red", dash:"", name:"LCL"},
					sig1Line:{points:[], color:"gray", dash:"10 5", name:"1sigma"},
					sig2Line:{points:[], color:"gray", dash:"10 5", name:"2sigma"},
					reqLine:{points:[], color:"blue", dash:"", name:"Requirement"}
				},
				_sig1Line=[],
				_sig2Line=[],
				sum=0,
				p_sum=0,
				value=0,
				count=0,
				max=0,
				min=null,
				p_count=[],
				p_value=0,
				mp=0,
				point=0;
			for (let i=1;i<=e_count;i++)
			{
				if (d3.select(".line"+i+" .ignore").property("checked")) 
				{
					map.push(null);
				} else {
					value=parseFloat(d3.select(".line"+i+" .medium").text().trim());
					p_count[i]=parseInt(d3.select(".line"+i+" .count").text().trim());
					p_value=value/p_count[i];
					if (min==null)
						min=p_value;
					if (p_value>max)
						max=p_value;
					if (p_value<min)
						min=p_value;
					if (i<=limit_points)
					{
						sum+=value;
						count++;
						p_sum+=p_count[i];
					}
					map.push([i,p_value]);
					
				}
			}
			point=roundNumber(sum/p_sum, 2);
			mapLine.cLine.points=[[1, point], [e_count, point]];
			for (let i=1;i<=e_count;i++)
			{
				if (d3.select(".line"+i+" .ignore").property("checked")) 
				{
					mapLine.tLine.points.push(null);
					mapLine.bLine.points.push(null);
					mapLine.sig1Line.points.push(null);
					mapLine.sig2Line.points.push(null);
					_sig1Line.push(null);
					_sig2Line.push(null);
				} else {
					mp=mapLine.cLine.points[0][1]<1?mapLine.cLine.points[0][1]:1;
					point=mapLine.cLine.points[0][1] + 3 * Math.sqrt(mapLine.cLine.points[0][1] * (1 - mp)/p_count[i]);
					mapLine.tLine.points.push([i, point]);
					if (point > max)
						max= point;
					point=mapLine.cLine.points[0][1] + 2 * Math.sqrt(mapLine.cLine.points[0][1] * (1 - mp)/p_count[i]);
					mapLine.sig2Line.points.push([i, point]);
					point=mapLine.cLine.points[0][1] + Math.sqrt(mapLine.cLine.points[0][1] * (1 - mp)/p_count[i]);
					mapLine.sig1Line.points.push([i, point]);
					point=mapLine.cLine.points[0][1] - 3 * Math.sqrt(mapLine.cLine.points[0][1] * (1 - mp)/p_count[i]);
					if (point < 0)
						point = 0;
					mapLine.bLine.points.push([i, point]);
					if (point<min)
						min=point;
					point=mapLine.cLine.points[0][1] - 2 * Math.sqrt(mapLine.cLine.points[0][1] * (1 - mp)/p_count[i]);
					if (point < 0)
						point = 0;
					_sig2Line.push([i, point]);
					point=mapLine.cLine.points[0][1] - Math.sqrt(mapLine.cLine.points[0][1] * (1 - mp)/p_count[i]);
					if (point < 0)
						point = 0;
					_sig1Line.push([i, point]);
				}
			}
			mapLine.sig1Line.points=mapLine.sig1Line.points.concat(null, _sig1Line);
			mapLine.sig2Line.points=mapLine.sig2Line.points.concat(null, _sig2Line);
			min=Math.floor(min*100)/100;
			max=Math.ceil(max*100)/100;
			get_graph("#p_map_graph", width, 210, e_count, max, map, mapLine, show_limit, min);
			d3.select("#p_map_graph").node().parentNode.style.display = "";
		}
		if (d3.select("#c_map").property("checked"))
		{
			let map=[],
				mapLine={
					cLine:{points:[], color:"green", dash:"", name:"CL"}, 
					tLine:{points:[], color:"red", dash:"", name:"UCL"}, 
					bLine:{points:[], color:"red", dash:"", name:"LCL"},
					sig1Line:{points:[], color:"gray", dash:"10 5", name:"1sigma"},
					sig2Line:{points:[], color:"gray", dash:"10 5", name:"2sigma"},
					reqLine:{points:[], color:"blue", dash:"", name:"Requirement"}
				},
				sum=0,
				value=0,
				req1=0,
				req2=0,
				reqArray=[],
				count=0,
				max=0,
				min=null,
				point=0;
			for (let i=1;i<=e_count;i++)
			{
				if (d3.select(".line"+i+" .ignore").property("checked")) 
				{
					map.push(null);
				} else {
					value=parseFloat(d3.select(".line"+i+" .medium").text().trim());
					if (min==null)
						min=value;
					if (value>max)
						max=value;
					if (value<min)
						min=value;
					if (i<=limit_points)
					{
						sum+=value;
						count++;
					}
					
					map.push([i,value]);
				}
				req1=parseFloat(d3.select(".line"+i+" .req1").text().trim());
				req2=parseFloat(d3.select(".line"+i+" .req2").text().trim());
				if (req2>max)
					max=req2;
				if (req1<min)
					min=req1;
				mapLine.reqLine.points.push([i,req1]);
				reqArray.push([i,req2]);
			}
			mapLine.reqLine.points=mapLine.reqLine.points.concat(null, reqArray);
			point=roundNumber(sum/count, 1);
			mapLine.cLine.points=[[1, point], [e_count, point]];
			point=mapLine.cLine.points[0][1] + 3 * Math.sqrt(mapLine.cLine.points[0][1]);
			mapLine.tLine.points=[[1, point], [e_count, point]];
			point=mapLine.cLine.points[0][1] + 2 * Math.sqrt(mapLine.cLine.points[0][1]);
			mapLine.sig2Line.points=[[1, point], [e_count, point]];
			point=mapLine.cLine.points[0][1] + Math.sqrt(mapLine.cLine.points[0][1]);
			mapLine.sig1Line.points=[[1, point], [e_count, point]];
			point=mapLine.cLine.points[0][1] - 3 * Math.sqrt(mapLine.cLine.points[0][1]);
			if (point < 0)
				point = 0;
			mapLine.bLine.points=[[1, point], [e_count, point]];
			point=mapLine.cLine.points[0][1] - 2 * Math.sqrt(mapLine.cLine.points[0][1]);
			if (point < 0)
				point = 0;
			mapLine.sig2Line.points.push(null, [1, point], [e_count, point]);
			point=mapLine.cLine.points[0][1] - Math.sqrt(mapLine.cLine.points[0][1]);
			if (point < 0)
				point = 0;
			mapLine.sig1Line.points.push(null, [1, point], [e_count, point]);
			if (mapLine.tLine.points[0][1] > max)
				max= mapLine.tLine.points[0][1];
			min=Math.floor(min);
			max=Math.ceil(max);
			get_graph("#c_map_graph", width, 210, e_count, max, map, mapLine, show_limit, min);
			d3.select("#c_map_graph").node().parentNode.style.display = "";
		}
		if (d3.select("#u_map").property("checked"))
		{
			let map=[],
				mapLine={
					cLine:{points:[], color:"green", dash:"", name:"CL"}, 
					tLine:{points:[], color:"red", dash:"", name:"UCL"}, 
					bLine:{points:[], color:"red", dash:"", name:"LCL"},
					sig1Line:{points:[], color:"gray", dash:"10 5", name:"1sigma"},
					sig2Line:{points:[], color:"gray", dash:"10 5", name:"2sigma"},
					reqLine:{points:[], color:"blue", dash:"", name:"Requirement"}
				},
				_sig1Line=[],
				_sig2Line=[],
				sum=0,
				p_sum=0,
				value=0,
				count=0,
				max=0,
				min=null,
				p_count=[],
				p_value=0,
				point=0;
			for (let i=1;i<=e_count;i++)
			{
				if (d3.select(".line"+i+" .ignore").property("checked")) 
				{
					map.push(null);
				} else {
					value=parseFloat(d3.select(".line"+i+" .medium").text().trim());
					p_count[i]=parseInt(d3.select(".line"+i+" .count").text().trim());
					p_value=value/p_count[i];
					if (min==null)
						min=p_value;
					if (p_value>max)
						max=p_value;
					if (p_value<min)
						min=p_value;
					if (i<=limit_points)
					{
						sum+=value;
						p_sum+=p_count[i];
						count++;
					}
					map.push([i,p_value]);
				}
			}
			point=roundNumber(sum/p_sum, 2);
			mapLine.cLine.points=[[1, point], [e_count, point]];
			for (let i=1;i<=e_count;i++)
			{
				if (d3.select(".line"+i+" .ignore").property("checked")) 
				{
					mapLine.tLine.points.push(null);
					mapLine.bLine.points.push(null);
					mapLine.sig1Line.points.push(null);
					mapLine.sig2Line.points.push(null);
					_sig1Line.push(null);
					_sig2Line.push(null);
				} else {
					point=mapLine.cLine.points[0][1] + 3 * Math.sqrt(mapLine.cLine.points[0][1]/p_count[i]);
					mapLine.tLine.points.push([i, point]);
					if (point > max)
						max= point;
					point=mapLine.cLine.points[0][1] + 2 * Math.sqrt(mapLine.cLine.points[0][1]/p_count[i]);
					mapLine.sig2Line.points.push([i, point]);
					point=mapLine.cLine.points[0][1] + Math.sqrt(mapLine.cLine.points[0][1]/p_count[i]);
					mapLine.sig1Line.points.push([i, point]);
					point=mapLine.cLine.points[0][1] - 3 * Math.sqrt(mapLine.cLine.points[0][1]/p_count[i]);
					if (point < 0)
						point = 0;
					mapLine.bLine.points.push([i, point]);
					if (point < min)
						min = point;
					point=mapLine.cLine.points[0][1] - 2 * Math.sqrt(mapLine.cLine.points[0][1]/p_count[i]);
					if (point < 0)
						point = 0;
					_sig2Line.push([i, point]);
					point=mapLine.cLine.points[0][1] - Math.sqrt(mapLine.cLine.points[0][1]/p_count[i]);
					if (point < 0)
						point = 0;
					_sig1Line.push([i, point]);
				}
			}
			mapLine.sig1Line.points=mapLine.sig1Line.points.concat(null, _sig1Line);
			mapLine.sig2Line.points=mapLine.sig2Line.points.concat(null, _sig2Line);
			min=Math.floor(min*100)/100;
			max=Math.ceil(max*100)/100;
			get_graph("#u_map_graph", width, 210, e_count, max, map, mapLine, show_limit, min);
			d3.select("#u_map_graph").node().parentNode.style.display = "";
		}
		d3.selectAll(".line")
			.on("mouseover", function() {
				d3.selectAll(".vline"+this.dataset.line)
					.style("stroke-opacity", "1");
			})
			.on("mouseout", function() {
				d3.selectAll(".vline"+this.dataset.line)
					.style("stroke-opacity", "0.2");
			});
		let graph = d3.selectAll("div.graph").filter(function() {
			if (this.style.display === "")
				return true;
			else 
				return false;
		});
		let destination = 0;
		if (graph.nodes().length > 0) 
			destination = graph.node().offsetTop - 40;
		d3.transition().duration(1000).tween("scrollDown", scrollTween(destination));
	});
	d3.selectAll(".line:not(.head)").on("click", function() {
		d3.selectAll(".line").classed("curLine", false);
		this.classList.add("curLine");
	});
}
// получить список проектов
function get_projects()
{
	let projectList = function(data) {
		let to_append="";
		if (data.name)
		{
			for(let i in data.name)
			{
				to_append+="<option data-id='"+data.id[i]+"' value='"+data.name[i]+"' />";
			}
		}
		d3.select("#projects_names").html(to_append);
	}
	
	let projects = JSON.parse(localStorage.getItem("projectName"));
	if (projects != null)
	{
		projectList({id: [], name: projects});
	} 
}
//
function add_msg(msg)
{
	d3.select("#msg")
		.text(msg)
		.style("display", "inline")
		.style("opacity", "1")
		.transition()
		.delay(2000)
		.duration(2000)
		.style("opacity", "0");
}

// проверка правил
function check_rules(map, mapLine)
{
	let pass = true,
		rule = "",
		tmp=0,
		points=[],
		rule2={up: [], down: []},
		rule3={up: [], down: []},
		rule4=[],
		rule5=[], 
		rule5_prev=null,
		//rule6={up: [], upPrev: null, down: [], downPrev: null},
		rule6=[],
		rule7_prev=null;
		
	let sig1offset,
		sig2offset;
	//функция проверки правила 6
	function check_rule6()
	{
		let up=[],
			down=[],
			prevUp=null,
			prevDown=null,
			prev=null,
			res=false;
		
		for (let a1=rule6.length-1; a1>=0; a1--)
		{
			for (let a2=rule6.length-1; a2>=0; a2--)
			{
				if (a2==a1) continue;
				up=[],
				down=[],
				prevUp=null,
				prevDown=null,
				prev=null,
				res=false;
				for (let i=0;i<rule6.length;i++)
				{
					if (i==a1 && rule6.length>9) continue;
					if (i==a2 && rule6.length>8) continue;
					if (prev == null)
						prev = rule6[i];
					if (prevUp == null && prev < rule6[i])
					{
						up.push(1);
						prevUp=rule6[i];
					} else {
						if (prevUp < rule6[i])
						{
							up.push(1);
							prevUp=rule6[i];
						}
					}
					if (prevDown == null && prev > rule6[i])
					{
						down.push(1);
						prevDown=rule6[i];
					} else {
						if (prevDown > rule6[i])
						{
							down.push(1);
							prevDown=rule6[i];
						}
					}
				}
				res = up.reduce(sum_array, 0)==8;
				if (res) return !res;
				res = down.reduce(sum_array, 0)==8;
				if (res) return !res;
				if (rule6.length==8) break;
			}
			if (rule6.length==9) break;
		}
		return !res;
	}
	// сумма элементов массива
	function sum_array(sum, current) 
	{
		return sum + current;
	}
	// получение крайних точек
	function get_points(i, count)
	{
		let cnt = 0,
			p;
		points=[i+1];
		for (p=i; p>=0 && cnt<count; p--)
		{
			if (map[p]!=null)
				cnt++;
		}
		points.unshift(p+2);
	};
		
	if (mapLine.sig2Line.points.length > 5)
		sig2offset = (mapLine.sig2Line.points.length - 1) / 2 + 1;
	else
		sig2offset = 3;
	if (mapLine.sig1Line.points.length > 5)
		sig1offset = (mapLine.sig2Line.points.length - 1) / 2 + 1;
	else
		sig1offset = 3;
		
	for (let i=0; i<map.length; i++)
	{
		if (map[i]==null) 
			continue;
		if (d3.select("#rule1").property("checked"))
		{
			let limit;
			if (mapLine.tLine.points.length > 2)
				limit = mapLine.tLine.points[i][1];
			else 
				limit = mapLine.tLine.points[0][1];
			if (map[i][1]>=limit)
			{
				pass=false;
				rule="rule1";
				points=[i+1, i+1];
			}
			if (!pass) break;
			if (mapLine.bLine.points.length > 2)
				limit = mapLine.bLine.points[i][1];
			else 
				limit = mapLine.bLine.points[0][1];
			if (map[i][1]<=limit)
			{
				pass=false;
				rule="rule1";
				points=[i+1, i+1];
			}
			if (!pass) break;
		}
		if (d3.select("#rule2").property("checked"))
		{
			let limit;
			if (mapLine.sig2Line.points.length > 5)
				limit = mapLine.sig2Line.points[i][1];
			else
				limit = mapLine.sig2Line.points[0][1];
			if (map[i][1]>=limit)
			{
				rule2.up.push(1);
				pass = !(rule2.up.reduce(sum_array, 0)==2 && rule2.up.length <= 3 )
			} else {
				rule2.up.push(0);
			}
			if (!pass) {
				rule="rule2";
				get_points(i, 3);
				break;
			}
			if (mapLine.sig2Line.points.length > 5)
				limit = mapLine.sig2Line.points[i+sig2offset][1];
			else 
				limit = mapLine.sig2Line.points[0+sig2offset][1];
			if (map[i][1]<=limit)
			{
				rule2.down.push(1);
				pass = !(rule2.down.reduce(sum_array, 0)==2 && rule2.down.length <= 3 )
			} else {
				rule2.down.push(0);
			}
			if (!pass) {
				rule="rule2";
				get_points(i, 3);
				break;
			}
			if (rule2.up.length == 3)
				rule2.up.shift();
			if (rule2.down.length == 3)
				rule2.down.shift();
		}
		if (d3.select("#rule3").property("checked"))
		{
			let limit;
			if (mapLine.sig1Line.points.length > 5)
				limit = mapLine.sig1Line.points[i][1];
			else
				limit = mapLine.sig1Line.points[0][1];
			if (map[i][1]>=limit)
			{
				rule3.up.push(1);
				pass = !(rule3.up.reduce(sum_array, 0)==4 && rule3.up.length <= 5 )
			} else {
				rule3.up.push(0);
			}
			if (!pass) {
				rule="rule3";
				get_points(i, 5);
				break;
			}
			if (mapLine.sig1Line.points.length > 5)
				limit = mapLine.sig1Line.points[i+sig1offset][1];
			else 
				limit = mapLine.sig1Line.points[0+sig1offset][1];
			if (map[i][1]<=limit)
			{
				rule3.down.push(1);
				pass = !(rule3.down.reduce(sum_array, 0)==4 && rule3.down.length <= 5 )
			} else {
				rule3.down.push(0);
			}
			if (!pass) {
				rule="rule3";
				get_points(i, 5);
				break;
			}
			if (rule3.up.length == 5)
				rule3.up.shift();
			if (rule3.down.length == 5)
				rule3.down.shift();
		}
		if (d3.select("#rule4").property("checked"))
		{
			let limit = mapLine.cLine.points[0][1];
			if (map[i][1]>=limit)
			{
				rule4.push(1);
				pass = !(rule4.reduce(sum_array, 0)==7 && rule4.length == 7 )
			} 
			if (!pass) {
				rule="rule4";
				get_points(i, 7);
				break;
			}
			if (map[i][1]<=limit)
			{
				rule4.push(-1);
				pass = !(rule4.reduce(sum_array, 0)==-7 && rule4.length == 7 )
			} 
			if (!pass) {
				rule="rule4";
				get_points(i, 7);
				break;
			}
			if (map[i][1]==limit)
			{
				rule4.push(0);
			}
			if (rule4.length == 7)
				rule4.shift();
		}
		if (d3.select("#rule5").property("checked"))
		{
			if (rule5_prev != null)
			{
				if (map[i][1]>rule5_prev)
				{
					rule5.push(1);
					pass = !(rule5.reduce(sum_array, 0)==5 && rule5.length == 5 )
				} 
				if (!pass) {
					rule="rule5";
					get_points(i, 6);
					break;
				}
				if (map[i][1]<rule5_prev)
				{
					rule5.push(-1);
					pass = !(rule5.reduce(sum_array, 0)==-5 && rule5.length == 5 )
				} 
				if (!pass) {
					rule="rule5";
					get_points(i, 6);
					break;
				}
				if (map[i][1]==rule5_prev)
				{
					rule5.push(0);
				}
				if (rule5.length == 5)
					rule5.shift();
			}
			rule5_prev=map[i][1];
		}
		if (d3.select("#rule6").property("checked"))
		{
			rule6.push(map[i][1]);
			if (rule6.length >= 8)
			{
				pass=check_rule6();
			}
			if (!pass) {
				rule="rule6";
				get_points(i, 10);
				break;
			}
			if (rule6.length == 10)
				rule6.shift();
		}
		if (d3.select("#rule7").property("checked"))
		{
			if (rule7_prev!=null)
			{
				let diff;
				if (mapLine.sig1Line.points.length > 5)
					diff = mapLine.sig1Line.points[i][1] - mapLine.cLine.points[0][1];
				else
					diff = mapLine.sig1Line.points[0][1] - mapLine.cLine.points[0][1];
				if ((Math.abs(map[i][1] - rule7_prev) / diff) >= 4)
				{
					pass=false;
					rule="rule7";
					points=[i, i+1];
					break;
				}
			}
			rule7_prev=map[i][1];
		}
	}
	if (pass)
		return {text: "Предсказуемый", color: "green", line: mapLine.tLine.color, name: "", title: "", points: []}; 
	else {
		let rule_name = d3.select("label[for='"+rule+"']").text(),
			rule_title = d3.select("label[for='"+rule+"'] span").attr("title");
		return {text: "Непредсказуемый!", color: "red", line: mapLine.tLine.color, name: rule_name+":", title: rule_title, points: points};
	}

}
//проверка требований потребителя
function check_meet(map, mapLine)
{
	let pass = true;
	// проверяем, есть ли требования потребителя
	if (mapLine.reqLine.points.length > 0)
	{
		//вычисляем смещение между верхней и нижней границей
		let count = (mapLine.reqLine.points.length - 1) / 2 + 1;
		//перебираем точки карты
		for (let i=0; i<map.length; i++)
		{
			//если достигли null, точки закончились??? Такого не должно быть
			if (mapLine.reqLine.points[i]==null)
				break;
			//если точка карты пустая, значит ее пропустили. Пропускаем цикл
			if (map[i]==null)
				continue;
			//проверяем нижний пердел
			if (map[i][1]<mapLine.reqLine.points[i][1])
			{
				pass=false;
				break;
			}
			//проверяем верхний пердел
			if (map[i][1]>mapLine.reqLine.points[i+count][1])
			{
				pass=false;
				break;
			}
			//если какая-то точка неудовлетворяет, выходим из цикла
			if (!pass) break;
		}
		if (pass)
			return {text: "Удовлетворяет", color: "green", line: mapLine.reqLine.color}; 
		else
			return {text: "Не удовлетворяет!", color: "red", line: mapLine.reqLine.color};
	} else {
		return {text: "", color: "green", line: "blue"};
	}
}

document.addEventListener("DOMContentLoaded", function() {
	get_projects();
	// создание новой таблицы с данными
	d3.select("#cc_new_table").on("click", function() {
		d3.select(".graph").style("display", "none");
		d3.select("#show_maps").property("disabled", false).classed("btn_inactive", false);
		d3.select("#set_requirement").property("disabled", false).classed("btn_inactive", false);
		d3.select("#set_max_min").property("disabled", false).classed("btn_inactive", false);
		d3.select("#cc_print").property("disabled", false).classed("btn_inactive", false);
		d3.select("#cc_import_data").property("disabled", false).classed("btn_inactive", false);
		d3.select("#collapse_table img").each(function(i) {
			if (i==0) d3.select(this).style("display", "");
			if (i==1) d3.select(this).style("display", "none");
		});
		let table = d3.select("#cc_data_table");
		table.style("display", "none").html("");
		let random = d3.select("#random_data").property("checked", true);
		e_count = parseInt(d3.select("#cc_experiment_count").property("value"));
		s_count = parseInt(d3.select("#cc_sample_count").property("value"));
		q_count = parseInt(d3.select("#cc_group_count").property("value"));
		if (q_count > 10)
		{
			q_count = 10;
			d3.select("#cc_group_count").attr("value", 10);
		}
		let req1 = parseInt(d3.select("#requirement1").property("value"));
		let req2 = parseInt(d3.select("#requirement2").property("value"));
		let to_append = "<div class='line head'><div>№ п/п</div>";
		let tfoot = "<div class='line'><div></div>";
		for (let j=1;j<=q_count;j++)
		{
			to_append+="<div>x"+j+"</div>";
			tfoot+="<div></div>";
		}
		to_append+="<div>&sum;x</div><div style='text-decoration:overline;'>x</div><div>R</div><div>q</div><div>n</div><div>Req1</div><div>Req2</div><div>Игнор.</div></div>";
		tfoot+="<div></div><div id='medium'></div><div id='range'></div><div></div><div></div><div></div><div></div><div></div></div>";		
		for (let i=1;i<=e_count;i++)
		{
			to_append+="<div class='line line"+i+"' data-line='"+i+"'><div>"+i+"</div>";
			for (let j=1;j<=q_count;j++)
			{
				to_append+="<div class='data'>"+(random?getRandomInt(10, 20):"")+"</div>";
			}
			to_append+="<div class='sum'></div><div class='medium'></div><div class='range'></div><div class='q_count'>"+q_count+"</div><div class='count'>"+s_count+"</div><div class='req1'>"+req1+"</div><div class='req2'>"+req2+"</div><div><input type='checkbox' class='ignore'></div></div>";
		}
		to_append+=tfoot;
		table.html(to_append).style("display", "");
		//заполнение таблицы случайными значениями
		if (random)
		{
			let value,
				max,
				min,
				sum = 0,
				range = 0,
				medium = 0;
			for (let i=1;i<=e_count;i++)
			{
				value=d3.select(".line"+i+" .data").text();
				max = value;
				min = value;
				sum = 0;
				range = 0;
				medium = 0;
				d3.selectAll(".line"+i+" .data").each(function() {
					if (this.innerText != '')
					{
						let data = parseInt(this.innerText);
						sum+=data
						if (data>max)
							max=data;
						if (data<min)
							min=data;
					}
				});
				sum=roundNumber(sum, 1);
				medium=roundNumber(sum/q_count, 1);
				range = roundNumber(max - min, 1);
				d3.select(".line"+i+" .sum").text(sum);
				d3.select(".line"+i+" .medium").text(medium);
				d3.select(".line"+i+" .range").text(range);
				sum=0;
				range=0;
				d3.selectAll(".medium").each(function() {
					if (this.innerText != '')
					{
						sum+=parseInt(this.innerText);
					}
				});
				d3.selectAll(".range").each(function() {
					if (this.innerText != '')
					{
						range+=parseInt(this.innerText);
					}
				});
				medium=roundNumber(sum/e_count, 1);
				d3.select("#medium").text(medium);
				medium=roundNumber(range/e_count, 1);
				d3.select("#range").text(medium);
			}
		}
		set_action();
	});
	d3.select("#cc_sample_count").on("change", function() {
		if (this.value == "")
		{
			this.value = 1;
		}
		s_count = parseInt(this.value);
		d3.select(".count").text(s_count);
	});
	d3.select("#cc_load_table").on("click", function() {
		let val = d3.select("#project_name").property("value").trim();
		let id = d3.select("#projects_names option[value='"+val+"']").datum("id");
		
		let load_data = function(data) 
		{
			if (data.name)
			{
				d3.selectAll(".graph").style("display", "none");
				let table = d3.select("#cc_data_table");
				table.style("display", "none").html("");
				
				dataTable = data.cc_data;
				e_count = parseInt(dataTable.data.length);
				s_count = parseInt(dataTable.n);
				q_count = parseInt(dataTable.q);
				
				d3.select("#cc_experiment_count").property("value", e_count);
				d3.select("#cc_sample_count").property("value",s_count);
				d3.select("#cc_group_count").property("value",q_count);
				d3.select("#limit_points").attr("max", e_count);
				d3.select(".notes textarea").property("value", dataTable.note);
				
				let value,
					max,
					min,
					sum = 0,
					range = 0,
					medium = 0;

				let to_append = "<div class='line head'><div>№ п/п</div>";
				let tfoot = "<div class='line'><div></div>";
				for (let j=1;j<=q_count;j++)
				{
					to_append+="<div>x"+j+"</div>";
					tfoot+="<div></div>";
				}
				to_append+="<div>&sum;x</div><div style='text-decoration:overline;'>x</div><div>R</div><div>q</div><div>n</div><div>Req1</div><div>Req2</div><div>Игнор.</div></div>";
				tfoot+="<div></div><div id='medium'></div><div id='range'></div><div></div><div></div><div></div><div></div><div></div></div>";		
				for (let i=1;i<=e_count;i++)
				{
					to_append+="<div class='line line"+i+"' data-line='"+i+"'><div>"+i+"</div>";
					for (let j=0;j<q_count;j++)
					{
						value=dataTable.data[i-1][j];
						if (value != undefined && value != null && value != "")
							value=parseFloat(value);
						else 
							value = "";
						if (j==0)
						{
							max = value;
							min = value;
							sum = 0;
							range = 0;
							medium = 0;
						}
						to_append+="<div class='data'>"+value+"</div>";
						sum+=value
						if (value>max)
							max=value;
						if (value<min)
							min=value;
					}
					medium=roundNumber(sum/q_count, 1);
					range = max - min;
					to_append+="<div class='sum'>"+sum+"</div><div class='medium'>"+medium+"</div><div class='range'>"+range+"</div><div class='q_count'>"+q_count+"</div><div class='count'>"+s_count+"</div><div class='req1'>"+dataTable.req[i-1][0]+"</div><div class='req2'>"+dataTable.req[i-1][1]+"</div><div><input type='checkbox' class='ignore'></div></div>";
				}
				to_append+=tfoot;
				table.html(to_append);
				sum=0;
				range=0;
				d3.selectAll(".medium").each(function() {
					if (this.innerText != '')
					{
						sum+=parseFloat(this.innerText);
					}
				});
				d3.selectAll(".range").each(function() {
					if (this.innerText != '')
					{
						range+=parseFloat(this.innerText);
					}
				});
				medium=roundNumber(sum/e_count, 1);
				d3.select("#medium").text(medium);
				medium=roundNumber(range/e_count, 1);
				d3.select("#range").text(medium);
				set_action();
				table.style("display", "");
				add_msg("Данные загружены..");
				d3.select("#show_maps").property("disabled", false).classed("btn_inactive", false);
				d3.select("#set_requirement").property("disabled", false).classed("btn_inactive", false);
				d3.select("#set_max_min").property("disabled", false).classed("btn_inactive", false);
				d3.select("#cc_print").property("disabled", false).classed("btn_inactive", false);
				d3.select("#cc_import_data").property("disabled", false).classed("btn_inactive", false);
			}
		}
		dataTable = JSON.parse(localStorage.getItem(val));
		load_data({id: null, name: val, cc_data: dataTable});
	});
	d3.select("#cc_save_table").on("click", function() {
		e_count=parseInt(d3.select("#cc_experiment_count").property("value"));
		let name=d3.select("#project_name").property("value").trim();
		let id=d3.select("#projects_names option[value='"+name+"']").datum("id");
		dataTable.n = parseInt(d3.select("#cc_sample_count").property("value"));
		dataTable.q = parseInt(d3.select("#cc_group_count").property("value"));
		dataTable.p = parseInt(d3.select("#limit_points").property("value"));
		dataTable.note = d3.select(".notes textarea").property("value").trim();
		for(let i=0;i<e_count;i++)
		{
			dataTable.data[i]=[];
			d3.selectAll(".line"+(i+1)+" .data").each(function() {
				dataTable.data[i].push(this.innerText);
			});
			dataTable.req[i]=[d3.select(".line"+(i+1)+" .req1").text(), d3.select(".line"+(i+1)+" .req2").text()]; 
		}
		let projects = JSON.parse(localStorage.getItem("projectName"));
		if (projects != null)
		{
			if (projects.indexOf(name) == -1)
			{
				projects.push(name);
				localStorage.setItem("projectName", JSON.stringify(projects));
			}
		} else {
			projects=[name];
			localStorage.setItem("projectName", JSON.stringify(projects));
		}
		localStorage.setItem(name, JSON.stringify(dataTable));
		add_msg("Данные сохранены..");
		get_projects();
	});
	d3.select("#cc_delete_table").on("click", function() {
		let val = d3.select("#project_name").property("value").trim();
		let id = d3.select("#projects_names option[value='"+val+"']").datum("id");

		let projects = JSON.parse(localStorage.getItem("projectName"));
		if (projects != null)
		{
			if (projects.indexOf(val) >= 0)
			{
				projects.splice(projects.indexOf(val), 1);
				localStorage.setItem("projectName", JSON.stringify(projects));
				localStorage.removeItem(val);
				add_msg("Данные удалены..");
			}
		} 
		get_projects();
		d3.select("#project_name").property("value", "");

	});
	d3.select("#cc_experiment_count").on("change", function() {
		let val = parseInt(this.value);
		let limit_points = d3.select("#limit_points");
		if (parseInt(limit_points.property("value")) > val)
			limit_points.attr("value", val);
		limit_points.attr("max", val);
	});
	d3.select("#limit_points").on("change", function() {
		if (parseInt(this.value) > parseInt(this.getAttribute("max")))
			this.value = this.getAttribute("max");
	});
	d3.select("#cc_group_count").on("change", function() {
		if (parseInt(this.value) > parseInt(this.getAttribute("max")))
			this.value = this.getAttribute("max");
	});
	d3.select("#collapse_panel").on("click", function() {
		d3.select(".block").style("display", d3.select(".block").style("display")!="none"?"none":"");
		d3.selectAll("#collapse_panel img").each(function() {
			d3.select(this).style("display", d3.select(this).style("display")!="none"?"none":"");
		});		
	});
	d3.select("#collapse_table").on("click", function() {
		d3.select("#cc_data_table").style("display", d3.selectAll("#cc_data_table").style("display")!="none"?"none":"");
		d3.selectAll("#collapse_table img").each(function() {
			d3.select(this).style("display", d3.select(this).style("display")!="none"?"none":"");
		});		
	});
	d3.select("#cc_print").on("click", function() {
		 window.print();
	});
	d3.select("#cc_import_data").on("click", function() {
		d3.select("#import_panel").style("display", "");
		d3.select("#cc_import_table").on("click", function() {
			let import_data = d3.select("#import_panel textarea").property("value");
			import_data = import_data.split("\n");
			for (let i=0; i<import_data.length; i++)
			{
				if (import_data[i] != "")
					import_data[i] = import_data[i].split("\t");
			}
			let value = 0,
				max = 0,
				min = 0,
				sum = 0,
				range = 0,
				medium = 0;
				
			for(let i=0;i<e_count;i++)
			{
				if (i < import_data.length && import_data[i] != "")
				{
					d3.selectAll(".line"+(i+1)+" .data").each(function(p, j) {
						if (j < import_data[i].length && import_data[i][j] != "")
						{
							value = roundNumber(parseFloat(import_data[i][j].replace(",", ".")), 1);
							if (j==0)
							{
								max = value;
								min = value;
								sum = 0;
								range = 0;
								medium = 0;
							}
							this.innerText = value;	
						} else {
							value = this.innerText;
						}
						sum+=value;
						if (value>max)
							max=value;
						if (value<min)
							min=value;
					});
					sum=roundNumber(sum, 1);
					medium=roundNumber(sum/q_count, 1);
					range = roundNumber(max - min, 1);
					d3.select(".line"+(i+1)+" .sum").text(sum);
					d3.select(".line"+(i+1)+" .medium").text(medium);
					d3.select(".line"+(i+1)+" .range").text(range);
				}
			}
			if (d3.select("#clear_import_data").property("checked", true))
			{
				d3.select("#import_panel textarea").attr("value", "");
			}
			sum=0;
			range=0;
			d3.select(".medium").each(function() {
				if (this.innerText != '')
				{
					sum+=parseFloat(this.innerText);
				}
			});
			d3.select(".range").each(function() {
				if (this.innerText != '')
				{
					range+=parseFloat(this.innerText);
				}
			});
			medium=roundNumber(sum/e_count, 1);
			d3.select("#medium").text(medium);
			medium=roundNumber(range/e_count, 1);
			d3.select("#range").text(medium);
			d3.select("#import_panel").style("display", "none");
		});
	});
	d3.select("#cc_how_to_work").on("click", function() {
		d3.select("#how_to_work_form").style("display", "");
		let div;
		d3.selectAll(".how_to_work").each(function() {
			this.classList.add("info");
			div = document.createElement('div');
			div.innerHTML = this.dataset.num;
			div.style.top = (this.offsetTop - 10) + "px";
			div.style.left = (this.offsetLeft + 10) + "px";
			div.className = "bubble";
			container.appendChild(div);
		});
		d3.select("#close_btn").on("click", function() {
			d3.selectAll(".how_to_work").classed("info", false);
			d3.selectAll(".bubble").remove();
			d3.select("#how_to_work_form").style("display", "none");
		});
	});
	window.onscroll = function() {
		let pageY = window.pageYOffset || document.documentElement.scrollTop;
		if (pageY > 0) {
			d3.select(".back-top").style("display", "");
		} else {
			d3.select(".back-top").style("display", "none");
		}
	}
	d3.select(".back-top").on("click", function() {
		d3.transition().duration(1000).tween("scroll", scrollTween(0));
		return false;
	});
});
