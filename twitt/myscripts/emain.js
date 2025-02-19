//Constants for the SVG
var margin = {top: 0, right: 0, bottom: 5, left: 5};
var width = document.body.clientWidth - margin.left - margin.right;
var height = 200 - margin.top - margin.bottom;

var personTerms;
var locTerms;
var misTerms;
var orgTerms;

//---End Insert------

//Append a SVG to the body of the html page. Assign this SVG as an object to svg
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", 1400);
// var svg2 = d3.select("body").append("svg")
//     .attr("width", width)
//     .attr("height", height-100);

//******************* Forced-directed layout

//Set up the force layout
var force = d3.layout.force()
    .charge(-12)
    //.linkStrength(5)
    .linkDistance(0)
    .gravity(0.01)
    //.friction(0.95)
    .alpha(0.05)
    .size([width, height]);

// var force2 = d3.layout.force()
//    .charge(-180)
//    .linkDistance(80)
//    .gravity(0.15)
//    .alpha(0.1)
//    .size([width, height]);

//---Insert-------
var node_drag = d3.behavior.drag()
    .on("dragstart", dragstart)
    .on("drag", dragmove)
    .on("dragend", dragend);

function dragstart(d, i) {
    force.stop() // stops the force auto positioning before you start dragging
}

function dragmove(d, i) {
    d.px += d3.event.dx;
    d.py += d3.event.dy;
    d.x += d3.event.dx;
    d.y += d3.event.dy;
}

function dragend(d, i) {
    d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
    force.resume();
}

function releasenode(d) {
    d.fixed = false; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
    //force.resume();
}


var data, data2;
var minYear = 2017;
var maxYear = 2018;
var numMonth = 12 *30 *(maxYear - minYear);

var sourceList = {};
var numSource = {};
var maxCount = {}; // contain the max frequency for 4 categories

var nodes;
var numNode, numNode2;

var link;
var links;
var linkArcs;
var termArray, termArray2, termArray3;
var relationship;
var termMaxMax, termMaxMax2;
var terms;
var xStep = 179;
var yScale;
var linkScale;
var searchTerm = "";

var nodeY_byName = {};

var isLensing = false;
var lensingMul = 7;
var lMonth = -lensingMul * 2;
var oldLmonth = -1000; // use this variable to compare if we are lensing over a different month

var coordinate = [0, 0];
var XGAP_ = 17.6; // gap between months on xAxis
var numLens = 3;

function xScale(m) {
    if (isLensing) {
        var maxM = Math.max(0, lMonth - numLens - 1);
        var numMonthInLense = (lMonth + numLens - maxM + 1);

        //compute the new xGap
        var total = numMonth + numMonthInLense * (lensingMul - 1);
        var xGap = (XGAP_ * numMonth) / total;

        if (m < lMonth - numLens)
            return m * xGap;
        else if (m > lMonth + numLens) {
            return maxM * xGap + numMonthInLense * xGap * lensingMul + (m - (lMonth + numLens + 1)) * xGap;
        }
        else {
            return maxM * xGap + (m - maxM) * xGap * lensingMul;
        }
    }
    else {
        return m * XGAP_;
    }
}



var area = d3.svg.area()
    .interpolate("basic")
    .x(function (d) {
        return xStep + xScale(d.monthId);
    })
    .y0(function (d) {
        return d.yNode - yScale(d.value);
    })
    .y1(function (d) {
        return d.yNode + yScale(d.value);
    });

var optArray = [];   // FOR search box

var numberInputTerms = 0;
var listMonth;


var nodes2 = [];
var links2 = [];
var nodes2List = {};
var links2List = {};

var stopWordList = ["republicans","republican","democrats","democratic","democrat","americans","american","america","hey","ok","wanna","lmao","lot","ur","im","thank","you?","&amp;","dm","just","dont","lol","lil","gonna","rt","...","..","--","about","above","according","accordingly","across","actually","adj","adv","after","afterwards","again","against","ago","ah","aint","al","albeit","all","almost","alone","along","already","also","alt","although","always","am","among","amongst","an","and","another","any","anybody","anyhow","anyone","anything","anyway","anyways","anywhere","apparently","appear","apply","are","area","areas","arent","around","as","aside","ask","asked","asking","asks","at","available","ave","away","aye","ba","back","backed","backing","backs","basic","basis","be","became","because","become","becomes","becoming","been","before","beforehand","began","begin","behind","being","beings","below","beside","besides","best","better","between","beyond","bi","big","both","brief","but","by","call","called","came","can","cannot","cant","certain","certainly","cf","clear","clearly","cm","co","come","comes","concerning","consequently","considering","contain","containing","contains","contrariwise","corresponding","could","couldnt","course","currently","date","dc","de","definitely","describe","described","describes","despite","determine","determined","di","did","didnt","differ","different","differently","do","does","doesnt","doing","done","dont","double","down","downed","downing","downs","downwards","dr","dual","during","each","early","ed","eg","eight","either","eleven","else","elsewhere","empty","end","ended","ending","ends","enough","entirely","especially","est","et","etc","even","evenly","ever","every","everybody","everyone","everything","everywhere","everywhere","exactly","example","except","excepted","excepting","exception","exclude","excluding","exclusive","face","faces","fact","facts","far","felt","few","fifteen","fifth","find","finds","first","five","for","forth","forty","forward","found","four","fr","free","from","front","ft","full","fully","further","furthered","furthering","furthermore","furthers","furthest","gave","general","generally","get","gets","getting","give","given","gives","go","goes","going","gone","good","goods","got","gotten","great","greater","greatest","group","grouped","grouping","groups","had","hadnt","half","halves","happens","hardly","has","hasnt","hast","hath","have","having","he","hear","heard","hed","hello","help","hence","henceforth","her","here","hereabouts","hereafter","hereby","herein","hereto","hereupon","hers","herself","hes","high","higher","highest","him","himself","hindmost","his","hither","hitherto","hopefully","how","howbeit","however","howsoever","hr","hundred","hyper","id","ie","if","ii","iii","im","immediate","important","in","inasmuch","inc","including","indeed","indicate","indicated","indicates","insofar","insomuch","instead","int","interest","interested","interesting","interests","into","intra","intro","inward","inwards","is","isnt","it","itd","item","itll","its","itself","iv","ive","ix","just","keep","keeps","kept","kg","km","knew","know","known","knows","large","largely","last","lat","lately","later","latest","latter","latterly","least","left","less","lest","let","lets","like","likely","little","ll","lon","long","longer","longest","look","looks","ltd","lt","made","made","mainly","make","making","man","many","may","maybe","md","me","mean","means","meant","meantime","meanwhile","merely","micro","might","mine","mm","more","moreover","morning","most","mostly","move","mph","mr","mrs","ms","mt","much","multi","must","mustnt","my","myself","name","namely","near","nearly","necessary","need","needed","needing","neednt","needs","neither","never","nevertheless","new","newer","newest","news","next","nine","no","nobody","non","none","nonetheless","noone","nope","nor","normally","not","nothing","notwithstanding","novel","now","nowadays","nowhere","nt","number","obs","obviously","of","off","often","oh","okay","old","older","oldest","on","once","one","ones","only","onto","op","open","opened","opening","opens","or","other","others","otherwise","ought","our","ours","ourselves","out","outside","over","overall","own","oz","page","part","parted","particular","particularly","parting","parts","per","perhaps","phr","pl","please","plus","pm","possible","pre","presumably","pro","probably","provided","pt","put","puts","quite","rather","re","really","reasonably","regarding","regardless","regards","related","relatively","required","respectively","results","right","said","saith","same","saw","say","saying","says","sec","second","secondly","seconds","see","seeing","seem","seemed","seeming","seems","seen","sees","seldom","self","selves","semi","seven","several","shall","shalt","she","shes","should","shouldnt","show","showed","showing","shown","shows","side","sides","since","sir","sixty","so","some","somebody","somehow","someone","something","sometime","sometimes","somewhat","somewhere","st","still","such","supposing","sure","take","tell","tends","th","than","thank","thanks","thanx","that","thatd","thatll","thats","the","thee","their","theirs","them","themselves","then","thence","thenceforth","there","thereabout","thereabouts","thereafter","thereby","thered","therefore","therein","thereof","thereon","theres","thereto","thereupon","therll","these","they","theyve","thine","thing","things","think","thinks","third","this","thorough","thoroughly","those","thou","though","three","thrice","through","throughout","thru","thus","thy","thyself","till","time","tm","to","today","together","told","too","took","toward","towards","trans","tried","tries","truly","trying","turn","turned","turning","turns","twelve","twenty","twice","two","under","unless","unlike","unlikely","until","unto","up","upon","upward","upwards","us","use","used","useful","uses","using","usually","various","ve","very","vi","vii","viii","via","viz","vs","was","wasnt","way","ways","we","well","wells","went","were","werent","weve","what","whatever","whatsoever","when","whence","whenever","whensoever","where","whereabouts","whereafter","whereas","whereat","whereby","wherefore","wherefrom","wherein","whereinto","whereof","whereon","wheresoever","whereto","whereunto","whereupon","wherever","wherewith","whether","whew","which","whichever","whichsoever","while","whilst","whither","who","whoa","whoever","whole","whom","whomever","whomsoever","whose","whosoever","why","will","willing","wilt","wish","with","within","without","wonder","wont","work","worked","working","works","worse","worst","would","wouldnt","wt","xi","xii","xiii","xiv","xv","xvi","xvii","xviii","xix","xx","yd","ye","year","years","yes","yet","yippee","you","youd","youll","young","younger","youngest","your","youre","yours","yourself","yourselves","youve","yup","zero"];
  
var stopObj = {};
for (var i = 0; i < stopWordList.length; ++i)
    stopObj[stopWordList[i]] = 1;
    // d3.tsv("data/americablog.tsv", function (error, data_) {
    // d3.tsv("data/crooks_and_liars.tsv", function (error, data_) {
    // d3.tsv("data/emptywheel.tsv", function (error, data_) {
    // d3.tsv("data/esquire.tsv", function (error, data_) {
    // d3.tsv("data/factcheck.tsv", function (error, data_) {
    // d3.tsv("data/glenngreenwald.tsv", function (error, data_) {
    // d3.tsv("data/huffington.tsv", function (error, data_) {
    //d3.tsv("data/propublica.tsv", function (error, data_) {

// d3.tsv("data/wikinews.tsv", function (error, data_) {

d3.csv("data/diseaseData.csv", function (error, data_) {
    if (error) throw error;
    data = data_;

    terms = new Object();
    termMaxMax = 1;
    console.log(data);
    data.forEach(function (d) {
        d.source = d["source"];
        // Process date
        var curDate = Date.parse(d["timestamp"]);
        // console.log(curDate)
        d.date = new Date(d["timestamp"]);
        var year = d.date.getFullYear();
        var m = 12 * (year - minYear) + d.date.getMonth();
        m = 12*30*(year - minYear) +d.date.getDate();

        debugger;
        // console.log(m)
        d.m = m;

        if (year >= minYear && year <= maxYear) {
            // Add source to sourceList
            if (!sourceList[d.source])
                sourceList[d.source] = 1;
            else
                sourceList[d.source]++;
        }
        d.person = d.content;

        if (d["person"] != "") {
            var list = d["person"].split(",");
            for (var i = 0; i < list.length; i++) {
                var curWord = list[i];
                if(stopObj[curWord]!=1){
                var term = list[i];
                d[term] = 1;
                if (!terms[term]) {
                    terms[term] = new Object();
                    terms[term].max = 0;
                    terms[term].maxMonth = -100;   // initialized negative
                    terms[term].category = "person";
                }
                if (!terms[term][m])
                    terms[term][m] = 1;
                else {
                    terms[term][m]++;
                    if (terms[term][m] > terms[term].max) {
                        terms[term].max = terms[term][m];
                        terms[term].maxMonth = m;
                        if (terms[term].max > termMaxMax)
                            termMaxMax = terms[term].max;
                    }
                }
              }
            }
        }

        // if (d["location"] != "" && d["location"] != 1) {
        //     var list = d["location"].split("|");
        //     for (var i = 0; i < list.length; i++) {
        //         var term = list[i];
        //         d[term] = 1;
        //         if (!terms[term]) {
        //             terms[term] = new Object();
        //             terms[term].max = 0;
        //             terms[term].maxMonth = -100;   // initialized negative
        //             terms[term].category = "location";
        //         }
        //         if (!terms[term][m])
        //             terms[term][m] = 1;
        //         else {
        //             terms[term][m]++;
        //             if (terms[term][m] > terms[term].max) {
        //                 terms[term].max = terms[term][m];
        //                 terms[term].maxMonth = m;
        //                 if (terms[term].max > termMaxMax)
        //                     termMaxMax = terms[term].max;

        //             }
        //         }
        //     }
        // }
        // if (d["organization"] != "" && d["organization"] != 1) {
        //     var list = d["organization"].split("|");
        //     for (var i = 0; i < list.length; i++) {
        //         var term = list[i];
        //         d[term] = 1;
        //         if (!terms[term]) {
        //             terms[term] = new Object();
        //             terms[term].max = 0;
        //             terms[term].maxMonth = -100;   // initialized negative
        //             terms[term].category = "organization";
        //         }
        //         if (!terms[term][m])
        //             terms[term][m] = 1;
        //         else {
        //             terms[term][m]++;
        //             if (terms[term][m] > terms[term].max) {
        //                 terms[term].max = terms[term][m];
        //                 terms[term].maxMonth = m;
        //                 if (terms[term].max > termMaxMax)
        //                     termMaxMax = terms[term].max;

        //             }
        //         }
        //     }
        // }
        // if (d["miscellaneous"] != "" && d["miscellaneous"] != 1) {
        //     var list = d["miscellaneous"].split("|");
        //     for (var i = 0; i < list.length; i++) {
        //         var term = list[i];
        //         d[term] = 1;
        //         if (!terms[term]) {
        //             terms[term] = new Object();
        //             terms[term].max = 0;
        //             terms[term].maxMonth = -100;   // initialized negative
        //             terms[term].category = "miscellaneous";
        //         }
        //         if (!terms[term][m])
        //             terms[term][m] = 1;
        //         else {
        //             terms[term][m]++;
        //             if (terms[term][m] > terms[term].max) {
        //                 terms[term].max = terms[term][m];
        //                 terms[term].maxMonth = m;
        //                 if (terms[term].max > termMaxMax)
        //                     termMaxMax = terms[term].max;
        //             }
        //         }
        //     }
        // }
    });

    console.log("DONE reading the input file = " + data.length);

    setupSliderScale(svg);
    readTermsAndRelationships();
    console.log("DONE computing realtionships relationshipMaxMax=" + relationshipMaxMax);

    // 2017. this function is main2.js
    computeMonthlyGraphs();

    drawColorLegend();
    drawTimeLegend();

    drawTimeBox(); // This box is for brushing
    drawLensingButton();

    console.log("main 2");

    computeNodes();

    console.log("main 3");

    computeLinks();

    console.log("main 4");
    force.linkStrength(function (l) {
        if (l.value)
            return (8 + l.value * 2);
        else
            return 1;
    });

    force.linkDistance(function (l) {
        if (searchTerm != "") {
            if (l.source.name == searchTerm || l.target.name == searchTerm) {
                var order = isContainedInteger(listMonth, l.m)
                return (12 * order);
            }
            else
                return 0;
        }
        else {
            if (l.value)
                return 0;
            else
                return 12;
        }
    });

    //Creates the graph data structure out of the json data
    force.nodes(nodes)
        .links(links)
        .start();

    force.on("tick", function () {
        update();
    });
    force.on("end", function () {
        detactTimeSeries();
    });

    /// The second force directed layout ***********
    /*for (var i = 0; i < nodes.length; i++) {
        var nod = nodes[i];
        if (!nodes2List[nod.name] && nodes2List[nod.name] != 0) {
            var newNod = {};
            newNod.name = nod.name;
            newNod.id = nodes2.length;
            newNod.group = nod.group;
            newNod.max = nod.max;

            nodes2List[newNod.name] = newNod.id;
            nodes2.push(newNod);
        }
    }

    for (var i = 0; i < links.length; i++) {
        var l = links[i];
        var name1 = l.source.name;
        var name2 = l.target.name;
        var node1 = nodes2[nodes2List[name1]];
        var node2 = nodes2[nodes2List[name2]];
        if (!links2List[name1 + "_" + name2] && links2List[name1 + "_" + name2] != 0) {
            var newl = {};
            newl.source = node1;
            newl.target = node2;
            links2List[name1 + "_" + name2] = links2.length;
            links2.push(newl);
        }
    }
    for (var i = 0; i < links2.length; i++) {
        var name1 = links2[i].source.name;
        var name2 = links2[i].target.name;
        var ccc = 0;
        for (var m = 0; m < numMonth; m++) {
            if (relationship[name1 + "__" + name2][m]) {
                if (relationship[name1 + "__" + name2][m] > valueSlider) //relationship[name1+"__"+name2][m]>ccc &&
                    ccc += relationship[name1 + "__" + name2][m];
            }
        }
        links2[i].count = ccc;
    }*/

    // force2.nodes(nodes2)
    //     .links(links2)
    //     .start();
    //
    // var link2 = svg2.selectAll(".link2")
    //   .data(links2)
    // .enter().append("line")
    //   .attr("class", "link2")
    //   .style("stroke","#777")
    //   .style("stroke-width", function(d) { return 0.2+linkScale(d.count); });
    //
    // var node2 = svg2.selectAll(".nodeText2")
    //     .data(nodes2)
    //     .enter().append("text")
    //   .attr("class", ".nodeText2")
    //         .text(function(d) { return d.name })
    //         .attr("dy", ".35em")
    //         .style("fill", function(d) { return getColor(d.group, d.max) ;})
    //         .style("text-anchor","middle")
    //         .style("text-shadow", "1px 1px 0 rgba(55, 55, 55, 0.6")
    //         .style("font-weight", function(d) { return d.isSearchTerm ? "bold" : ""; })
    //         .attr("dy", ".21em")
    //         .attr("font-family", "sans-serif")
    //         .attr("font-size", "12px");
    //
    // force2.on("tick", function() {
    //     link2.attr("x1", function(d) { return d.source.x; })
    //         .attr("y1", function(d) { return d.source.y; })
    //         .attr("x2", function(d) { return d.target.x; })
    //         .attr("y2", function(d) { return d.target.y; });
    //
    //
    //     node2.attr("x", function(d) { return d.x; })
    //         .attr("y", function(d) { return d.y; });
    // });


    for (var i = 0; i < termArray.length / 10; i++) {
        optArray.push(termArray[i].term);
    }
    optArray = optArray.sort();
    $(function () {
        $("#search").autocomplete({
            source: optArray
        });
    });
});

function recompute() {
    var bar = document.getElementById('progBar'),
        fallback = document.getElementById('downloadProgress'),
        loaded = 0;

    var load = function () {
        loaded += 1;
        bar.value = loaded;

        /* The below will be visible if the progress tag is not supported */
        $(fallback).empty().append("HTML5 progress tag not supported: ");
        $('#progUpdate').empty().append(loaded + "% loaded");

        if (loaded == 100) {
            clearInterval(beginLoad);
            $('#progUpdate').empty().append("Complete");
        }
    };

    var beginLoad = setInterval(function () {
        load();
    }, 10);
    setTimeout(alertFunc, 333);

    function alertFunc() {
        readTermsAndRelationships();
        computeNodes();
        computeLinks()
        force.nodes(nodes)
            .links(links)
            .start();
    }
}

function readTermsAndRelationships() {
    data2 = data.filter(function (d, i) {
        if (!searchTerm || searchTerm == "") {
            return d;
        }
        else if (d[searchTerm])
            return d;
    });

    var selected = {}
    if (searchTerm && searchTerm != "") {
        data2.forEach(function (d) {
            for (var term1 in d) {
                if (!selected[term1])
                    selected[term1] = {};
                else {
                    if (!selected[term1].isSelected)
                        selected[term1].isSelected = 1;
                    else
                        selected[term1].isSelected++;
                }
            }
        });
    }

    var removeList = {};   // remove list **************
    //removeList["barack obama"] = 1;
    //removeList["john mccain"] = 1;
    //removeList["mitt romney"] = 1;

    removeList["source"] = 1;
    removeList["person"] = 1;
    removeList["location"] = 1;
    removeList["organization"] = 1;
    removeList["miscellaneous"] = 1;

    removeList["muckreads weekly deadly force"] = 1
    removeList["propublica"] = 1;
    removeList["white this alabama judge has figured out how"] = 1;
    removeList["dea ’s facebook impersonato"] = 1;
    removeList["dismantle roe"] = 1;
    removeList["huffington post"] = 1;


    termArray = [];
    var nodesMonth = [];

    for (var att in terms) {
        var e = {};
        e.term = att;
        if (removeList[e.term] || (searchTerm && searchTerm != "" && !selected[e.term])) // remove list **************
            continue;

        var maxNet = 0;
        var maxMonth = -1;
        for (var m = 1; m < numMonth; m++) {
            if (terms[att][m]) {
                var previous = 0;
                if (terms[att][m - 1])
                    previous = terms[att][m - 1];
                var net = (terms[att][m] + 1) / (previous + 1);
                if (net > maxNet) {
                    maxNet = net;
                    maxMonth = m;
                }
            }
        }
        e.max = maxNet;
        e.maxMonth = maxMonth;
        e.category = terms[att].category;



        if (e.term == searchTerm) {
            e.max = 10000;
            e.isSearchTerm = 1;
        }

        else if (searchTerm && searchTerm != "" && selected[e.term] && selected[e.term].isSelected) {
            e.max = 5000 + selected[e.term].isSelected;
            //   console.log("e.term = "+e.term+" e.max =" +e.max );
        }

        // if (!e.max && e.max!=0)
        //     console.log("What the e.term = "+e.term+" e.max =" +e.max );

        if (e.max > 2)    // Only get terms with some increase
            termArray.push(e);
    }
    termArray.sort(function (a, b) {
        if (a.max < b.max) {
            return 1;
        }
        if (a.max > b.max) {
            return -1;
        }
        return 0;
    });

    console.log("termArray.length=" + termArray.length);

    numberInputTerms = termArray.length;
    console.log(termArray);
    personTerms = 0;
    locTerms = 0;
    misTerms = 0;
    orgTerms = 0;
    for(i = 0;i <numberInputTerms; i++){
        if(termArray[i].category == "organization"){
            orgTerms++;
        }
        else if(termArray[i].category == "person"){
            personTerms++;
        }
        else if(termArray[i].category == "location"){
            locTerms++;
        }
        else
            misTerms++;

    }

    console.log(personTerms + " terms of " + "Person");
    console.log(locTerms + " terms of " + "location");
    console.log(orgTerms + " terms of " + "organization");
    console.log(misTerms + " terms of " + "miscellaneous");


        // Compute relationship **********************************************************
        numNode = Math.min(40, termArray.length);
        numNode2 = Math.min(numNode*3, termArray.length);
        var selectedTerms = {};
        for (var i=0; i<numNode2;i++){
           selectedTerms[termArray[i].term] = termArray[i].max;
        }
        

        relationship ={};
        relationshipMaxMax =0;
        console.log(data2)
        data2.forEach(function(d) { 
            if(d.date!=1)
            var year = d.date.getFullYear();
            if (year>=minYear && year<=maxYear){
                var m = d.m;
                for (var term1 in d) {
                    if (selectedTerms[term1]){   // if the term is in the selected 100 terms
                        for (var term2 in d) {
                            if (selectedTerms[term2]){   // if the term is in the selected 100 terms
                                if (!relationship[term1+"__"+term2]){
                                    relationship[term1+"__"+term2] = new Object();
                                    relationship[term1+"__"+term2].max = 1;
                                    relationship[term1+"__"+term2].maxMonth =m;
                                }    
                                if (!relationship[term1+"__"+term2][m])
                                    relationship[term1+"__"+term2][m] = 1;
                                else{
                                    relationship[term1+"__"+term2][m]++;
                                    if (relationship[term1+"__"+term2][m]>relationship[term1+"__"+term2].max){
                                        relationship[term1+"__"+term2].max = relationship[term1+"__"+term2][m];
                                        relationship[term1+"__"+term2].maxMonth =m; 
                                        
                                        if (relationship[term1+"__"+term2].max>relationshipMaxMax) // max over time
                                            relationshipMaxMax = relationship[term1+"__"+term2].max;
                                    }  
                                }    

                            }
                        }
                    }
                }
            }

    });
}

function computeConnectivity(a, num, cut) {
    for (var i = 0; i < num; i++) {
        a[i].isConnected = -100;
        a[i].isConnectedMaxMonth = a[i].maxMonth;
    }

    for (var i = 0; i < num; i++) {
        var term1 = a[i].term;
        for (var j = i + 1; j < num; j++) {
            var term2 = a[j].term;
            if (relationship[term1 + "__" + term2] && relationship[term1 + "__" + term2].max >= cut) {
                if (relationship[term1 + "__" + term2].max > a[i].isConnected) {
                    a[i].isConnected = relationship[term1 + "__" + term2].max;
                    a[i].isConnectedMaxMonth = relationship[term1 + "__" + term2].maxMonth;
                }
                if (relationship[term1 + "__" + term2].max > a[j].isConnected) {
                    a[j].isConnected = relationship[term1 + "__" + term2].max;
                    a[j].isConnectedMaxMonth = relationship[term1 + "__" + term2].maxMonth;
                }
            }
            else if (relationship[term2 + "__" + term1] && relationship[term2 + "__" + term1].max >= cut) {
                if (relationship[term2 + "__" + term1].max > a[i].isConnected) {
                    a[i].isConnected = relationship[term2 + "__" + term1].max;
                    a[i].isConnectedMaxMonth = relationship[term1 + "__" + term2].maxMonth;
                }
                if (relationship[term2 + "__" + term1].max > a[j].isConnected) {
                    a[j].isConnected = relationship[term2 + "__" + term1].max;
                    a[j].isConnectedMaxMonth = relationship[term1 + "__" + term2].maxMonth;
                }
            }
        }
    }
}

function computeNodes() {
    termArray2 = [];
    for (var i = 0; i < termArray.length; i++) {
        if (termList[termArray[i].term] != undefined)  // Filter the terms from force layouts in main2.js
            termArray2.push(termArray[i])
        if (termArray2.length >= 1000) break;        // Skip variables in the main screen since they are not important
    }

    var cut = valueSlider;
    computeConnectivity(termArray2, termArray2.length, cut);


    termArray3 = [];
    for (var i = 0; i < termArray2.length; i++) {
        if (termArray2[i].isSearchTerm || termArray2[i].isConnected > 0)
            termArray3.push(termArray2[i]);
    }

    termArray3.sort(function (a, b) {
        if (a.isConnected < b.isConnected) {
            return 1;
        }
        else if (a.isConnected > b.isConnected) {
            return -1;
        }
        else {
            if (a.max < b.max) {
                return 1;
            }
            if (a.max > b.max) {
                return -1;
            }
            return 0;
        }
    });

    computeConnectivity(termArray3, termArray3.length, cut);

    nodes = [];
    for (var i = 0; i < termArray3.length && i < numNode; i++) {
        var nod = new Object();
        nod.id = i;
        nod.group = termArray3[i].category;
        nod.name = termArray3[i].term;
        nod.max = termArray3[i].max;
        var maxMonthRelationship = termArray3[i].maxMonth;
        nod.isConnectedMaxMonth = termArray3[i].isConnectedMaxMonth;
        nod.maxMonth = termArray3[i].isConnectedMaxMonth;
        nod.month = termArray3[i].isConnectedMaxMonth;
        nod.x = xStep + xScale(nod.month);   // 2016 initialize x position
        nod.y = height / 2;
        if (nodeY_byName[nod.name] != undefined)
            nod.y = nodeY_byName[nod.name];

        if (termArray3[i].isSearchTerm) {
            nod.isSearchTerm = 1;
            if (!nod.month)
                nod.month = termArray3[i].maxMonth;
            if (!nod.isConnectedMaxMonth)
                nod.isConnectedMaxMonth = termArray3[i].maxMonth;
        }

        if (!maxCount[nod.group] || nod.max > maxCount[nod.group])
            maxCount[nod.group] = nod.max;

        if (termArray3[i].isConnected > 0)  // Only allow connected items
            nodes.push(nod);
    }
    numNode = nodes.length;

    console.log("numNode=" + numNode + " termArray3.length=" + termArray3.length);


    // compute the monthly data
    termMaxMax2 = 0;
    for (var i = 0; i < numNode; i++) {
        nodes[i].monthly = [];
        for (var m = 0; m < numMonth; m++) {
            var mon = new Object();
            if (terms[nodes[i].name][m]) {
                mon.value = terms[nodes[i].name][m];
                if (mon.value > termMaxMax2)
                    termMaxMax2 = mon.value;
                mon.monthId = m;
                mon.yNode = nodes[i].y;
                nodes[i].monthly.push(mon);
            }
        }
        // Add another item to first
        if (nodes[i].monthly.length > 0) {
            var firstObj = nodes[i].monthly[0];
            if (firstObj.monthId > 0) {
                var mon = new Object();
                mon.value = 0;
                mon.monthId = firstObj.monthId - 1;
                mon.yNode = firstObj.yNode;
                nodes[i].monthly.unshift(mon);
            }

            // Add another item
            var lastObj = nodes[i].monthly[nodes[i].monthly.length - 1];
            if (lastObj.monthId < numMonth - 1) {
                var mon = new Object();
                mon.value = 0;
                mon.monthId = lastObj.monthId + 1;
                mon.yNode = lastObj.yNode;
                nodes[i].monthly.push(mon);
            }
        }
    }


    // Construct an array of only parent nodes
    pNodes = new Array(numNode); //nodes;
    for (var i = 0; i < numNode; i++) {
        pNodes[i] = nodes[i];
    }

    //   drawStreamTerm(svg, pNodes, 100, 600) ;

    svg.selectAll(".layer").remove();
    svg.selectAll(".layer")
        .data(pNodes)
        .enter().append("path")
        .attr("class", "layer")
        .style("stroke", function (d) {
            return d.isSearchTerm ? "#000" : "#000";
        })
        .style("stroke-width", 0.5)
        .style("stroke-opacity", 0.5)
        .style("fill-opacity", 0.3)
        .style("fill", function (d) {
            // return getColor(d.group, d.max);
            return getColor3(d.group);
        });
}

function computeLinks() {
    links = [];
    relationshipMaxMax2 = 1;

    for (var i = 0; i < numNode; i++) {
        var term1 = nodes[i].name;
        for (var j = i + 1; j < numNode; j++) {
            var term2 = nodes[j].name;
            if (relationship[term1 + "__" + term2] && relationship[term1 + "__" + term2].max >= valueSlider) {
                for (var m = 1; m < numMonth; m++) {
                    if (relationship[term1 + "__" + term2][m] && relationship[term1 + "__" + term2][m] >= valueSlider) {
                        var sourceNodeId = i;
                        var targetNodeId = j;

                        if (!nodes[i].connect)
                            nodes[i].connect = new Array();
                        nodes[i].connect.push(j)
                        if (!nodes[j].connect)
                            nodes[j].connect = new Array();
                        nodes[j].connect.push(i)

                        if (m != nodes[i].maxMonth) {
                            if (isContainedChild(nodes[i].childNodes, m) >= 0) {  // already have the child node for that month
                                sourceNodeId = nodes[i].childNodes[isContainedChild(nodes[i].childNodes, m)];
                            }
                            else {
                                var nod = new Object();
                                nod.id = nodes.length;
                                nod.group = nodes[i].group;
                                nod.name = nodes[i].name;
                                nod.max = nodes[i].max;
                                nod.maxMonth = nodes[i].maxMonth;
                                nod.month = m;

                                nod.parentNode = i;   // this is the new property to define the parent node
                                if (!nodes[i].childNodes)
                                    nodes[i].childNodes = new Array();
                                nodes[i].childNodes.push(nod.id);

                                sourceNodeId = nod.id;
                                nodes.push(nod);
                            }
                        }
                        if (m != nodes[j].maxMonth) {
                            if (isContainedChild(nodes[j].childNodes, m) >= 0) {
                                targetNodeId = nodes[j].childNodes[isContainedChild(nodes[j].childNodes, m)];
                            }
                            else {
                                var nod = new Object();
                                nod.id = nodes.length;
                                nod.group = nodes[j].group;
                                nod.name = nodes[j].name;
                                nod.max = nodes[j].max;
                                nod.maxMonth = nodes[j].maxMonth;
                                nod.month = m;

                                nod.parentNode = j;   // this is the new property to define the parent node
                                if (!nodes[j].childNodes)
                                    nodes[j].childNodes = new Array();
                                nodes[j].childNodes.push(nod.id);

                                targetNodeId = nod.id;
                                nodes.push(nod);
                            }
                        }

                        var l = new Object();
                        l.source = sourceNodeId;
                        l.target = targetNodeId;
                        l.m = m;
                        //l.value = linkScale(relationship[term1+"__"+term2][m]);
                        links.push(l);
                        if (relationship[term1 + "__" + term2][m] > relationshipMaxMax2)
                            relationshipMaxMax2 = relationship[term1 + "__" + term2][m];
                    }
                }
            }
        }
    }

    // var linear = (150+numNode)/200;
    var hhh = Math.min(height / numNode, 20);

    yScale = d3.scale.linear()
        .range([0, 10])
        .domain([0, termMaxMax2]);
    linkScale = d3.scale.linear()
        .range([0.5, 2])
        .domain([Math.round(valueSlider) - 0.4, Math.max(relationshipMaxMax2, 10)]);

    links.forEach(function (l) {
        var term1 = nodes[l.source].name;
        var term2 = nodes[l.target].name;
        var month = l.m;
        l.value = linkScale(relationship[term1 + "__" + term2][month]);
    });

    console.log("DONE links relationshipMaxMax2=" + relationshipMaxMax2);

    //Create all the line svgs but without locations yet
    svg.selectAll(".linkArc").remove();
    linkArcs = svg.append("g").selectAll(".linkArc")
        .data(links)
        .enter().append("path")
        .attr("class", "linkArc")
        .style("stroke-width", function (d) {
            return d.value;
        });

    svg.selectAll(".nodeG").remove();
    nodeG = svg.selectAll(".nodeG")
        .data(pNodes).enter().append("g")
        .attr("class", "nodeG")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")"
        })
    /*
     nodeG.append("circle")
     .attr("class", "node")
     .attr("r", function(d) { return Math.sqrt(d.max) })
     .style("fill", function (d) {return getColor(d.group, d.max);})
     .on('dblclick', releasenode)
     .call(node_drag); //Added
     */
    // console.log("  nodes.length="+nodes.length) ;

    svg.selectAll(".nodeText").remove();
    nodeG.append("text")
        .attr("class", ".nodeText")
        .attr("dy", ".35em")
        .style("fill", "#000000")
        .style("text-anchor", "end")
        .style("text-shadow", "1px 1px 0 rgba(255, 255, 255, 0.6")
        .style("font-weight", function (d) {
            return d.isSearchTerm ? "bold" : "";
        })
        .attr("dy", ".21em")
        .attr("font-family", "sans-serif")
        .attr("font-size", function (d) {
            return d.isSearchTerm ? "12px" : "11px";
        })
        .text(function (d) {
            return d.name
        });
    nodeG.on('mouseover', mouseovered)
        .on("mouseout", mouseouted);

    // console.log("gggg**************************"+searchTerm);
    listMonth = [];
    links.forEach(function (l) {
        if (searchTerm != "") {
            if (nodes[l.source].name == searchTerm || nodes[l.target].name == searchTerm) {
                if (isContainedInteger(listMonth, l.m) < 0)
                    listMonth.push(l.m);
            }
        }
    });
    listMonth.sort(function (a, b) {
        if (a > b) {
            return 1;
        }
        else if (a < b) {
            return -1;
        }
        else
            return 0;
    });

}


$('#btnUpload').click(function () {
    var bar = document.getElementById('progBar'),
        fallback = document.getElementById('downloadProgress'),
        loaded = 0;

    var load = function () {
        loaded += 1;
        bar.value = loaded;

        /* The below will be visible if the progress tag is not supported */
        $(fallback).empty().append("HTML5 progress tag not supported: ");
        $('#progUpdate').empty().append(loaded + "% loaded");

        if (loaded == 100) {
            clearInterval(beginLoad);
            $('#progUpdate').empty().append("Upload Complete");
            console.log('Load was performed.');
        }
    };

    var beginLoad = setInterval(function () {
        load();
    }, 50);

});


function mouseovered(d) {
    if (force.alpha() == 0) {
        var list = new Object();
        list[d.name] = new Object();

        svg.selectAll(".linkArc")
            .style("stroke-opacity", function (l) {
                if (l.source.name == d.name) {
                    if (!list[l.target.name]) {
                        list[l.target.name] = new Object();
                        list[l.target.name].count = 1;
                        list[l.target.name].year = l.m;
                        list[l.target.name].linkcount = l.count;
                    }
                    else {
                        list[l.target.name].count++;
                        if (l.count > list[l.target.name].linkcount) {
                            list[l.target.name].linkcount = l.count;
                            list[l.target.name].year = l.m;
                        }
                    }
                    return 1;
                }
                else if (l.target.name == d.name) {
                    if (!list[l.source.name]) {
                        list[l.source.name] = new Object();
                        list[l.source.name].count = 1;
                        list[l.source.name].year = l.m;
                        list[l.source.name].linkcount = l.count;
                    }
                    else {
                        list[l.source.name].count++;
                        if (l.count > list[l.source.name].linkcount) {
                            list[l.source.name].linkcount = l.count;
                            list[l.source.name].year = l.m;
                        }
                    }
                    return 1;
                }
                else
                    return 0.01;
            });
        nodeG.style("fill-opacity", function (n) {
            if (list[n.name])
                return 1;
            else
                return 0.1;
        })
            .style("font-weight", function (n) {
                return d.name == n.name ? "bold" : "";
            })
        ;

        nodeG.transition().duration(500).attr("transform", function (n) {
            if (list[n.name] && n.name != d.name) {
                var newX = xStep + xScale(list[n.name].year);
                return "translate(" + newX + "," + n.y + ")"
            }
            else {
                return "translate(" + n.xConnected + "," + n.y + ")"
            }
        })
        svg.selectAll(".layer")
            .style("fill-opacity", function (n) {
                if (list[n.name])
                    return 1;
                else
                    return 0.1;
            })
            .style("stroke-opacity", function (n) {
                if (list[n.name])
                    return 1;
                else
                    return 0;
            });
    }
}
function mouseouted(d) {
    if (force.alpha() == 0) {
        nodeG.style("fill-opacity", 1);
        svg.selectAll(".layer")
            .style("fill-opacity", 1)
            .style("stroke-opacity", 0.5);
        svg.selectAll(".linkArc")
            .style("stroke-opacity", 1);
        nodeG.transition().duration(500).attr("transform", function (n) {
            return "translate(" + n.xConnected + "," + n.y + ")"
        })
    }
}


function searchNode() {
    searchTerm = document.getElementById('search').value;
    valueSlider = 2;
    handle.attr("cx", xScaleSlider(valueSlider));

    recompute();
}

// check if a node for a month m already exist.
function isContainedChild(a, m) {
    if (a) {
        for (var i = 0; i < a.length; i++) {
            var index = a[i];
            if (nodes[index].month == m)
                return i;
        }
    }
    return -1;
}

// check if a node for a month m already exist.
function isContainedInteger(a, m) {
    if (a) {
        for (var i = 0; i < a.length; i++) {
            if (a[i] == m)
                return i;
        }
    }
    return -1;
}

function linkArc(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy) / 2;
    if (d.source.y < d.target.y)
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr * 1.2 + " 0 0,1 " + d.target.x + "," + d.target.y;
    else
        return "M" + d.target.x + "," + d.target.y + "A" + dr + "," + dr * 1.2 + " 0 0,1 " + d.source.x + "," + d.source.y;
}

function update() {
    nodes.forEach(function (d) {
        // if (searchTerm!="")
        //    d.x += (xScale(d.month)-d.x)*0.1;
        //else
        //     d.x += (xScale(d.month)-d.x)*0.005;
        d.x += (width / 2 - d.x) * 0.005;

        if (d.parentNode >= 0) {
            d.y += (nodes[d.parentNode].y - d.y) * 0.5;
            // d.y = nodes[d.parentNode].y;
        }
        else if (d.childNodes) {
            var yy = 0;
            for (var i = 0; i < d.childNodes.length; i++) {
                var child = d.childNodes[i];
                yy += nodes[child].y;
            }
            if (d.childNodes.length > 0) {
                yy = yy / d.childNodes.length; // average y coordinate
                d.y += (yy - d.y) * 0.2;
            }
        }
    });

    /*if (document.getElementById("checkbox1").checked) {
        linkArcs.style("stroke-width", 0);

        nodeG.transition().duration(500).attr("transform", function (d) {
            return "translate(" + 200 + "," + d.y + ")"
        })
        svg.selectAll(".nodeText").style("text-anchor", "start")

    }
    else {*/
        nodeG.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")"
        })
        linkArcs.style("stroke-width", function (d) {
            return d.value;
        });
  //  }

    /* svg.selectAll(".layer")
     .attr("d", function(d) {
     for (var i=0; i<d.monthly.length; i++){
     d.monthly[i].yNode = d.y;     // Copy node y coordinate
     }

     //    return area(d.monthly);
     //else
     return "";
     });*/
    linkArcs.attr("d", linkArc);

    // Fast stopping the force layout, not a good result for TimeArcs
    if (force.alpha() < 0.1)
        force.stop();

    updateTimeLegend();
}

function updateTransition(durationTime) {
    nodes.forEach(function (d) {
        d.x = xStep + xScale(d.month);
        if (d.parentNode >= 0) {
            d.y = nodes[d.parentNode].y;
        }
        nodeY_byName[d.name] = d.y;
    });


    nodeG.transition().duration(durationTime).attr("transform", function (d) {
        d.xConnected = xStep + xScale(d.isConnectedMaxMonth);
        return "translate(" + d.xConnected + "," + d.y + ")"
    })


    svg.selectAll(".layer").transition().duration(durationTime)
        .attr("d", function (d) {
            for (var i = 0; i < d.monthly.length; i++) {
                d.monthly[i].yNode = d.y;     // Copy node y coordinate
            }
            return area(d.monthly);
        });
    linkArcs.transition().duration(250).attr("d", linkArc);
    updateTimeLegend();
    updateTimeBox(durationTime);
}

function detactTimeSeries() {
    // console.log("DetactTimeSeries ************************************" +data);
    var termArray = [];
    for (var i = 0; i < numNode; i++) {
        var e = {};
        e.y = nodes[i].y;
        e.nodeId = i;
        termArray.push(e);
    }

    termArray.sort(function (a, b) {
        if (a.y > b.y) {
            return 1;
        }
        if (a.y < b.y) {
            return -1;
        }
        return 0;
    });

    var step = Math.min((height - 25) / (numNode + 1), 15);
    //var totalH = termArray.length*step;
    for (var i = 0; i < termArray.length; i++) {
        nodes[termArray[i].nodeId].y = i * step;
    }
    force.stop();

    updateTransition(1000);
}


