function shadeColor(color, percent) {   
    var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
}
function rgb2hex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function getURLParameters(paramName) 
{
        var sURL = window.document.URL.toString();  
    if (sURL.indexOf("?") > 0)
    {
       var arrParams = sURL.split("?");         
       var arrURLParams = arrParams[1].split("&");      
       var arrParamNames = new Array(arrURLParams.length);
       var arrParamValues = new Array(arrURLParams.length);     
       var i = 0;
       for (i=0;i<arrURLParams.length;i++)
       {
        var sParam =  arrURLParams[i].split("=");
        arrParamNames[i] = sParam[0];
        if (sParam[1] != "")
            arrParamValues[i] = unescape(sParam[1]);
        else
            arrParamValues[i] = "No Value";
       }

       for (i=0;i<arrURLParams.length;i++)
       {
                if(arrParamNames[i] == paramName){
            //alert("Param:"+arrParamValues[i]);
                return arrParamValues[i];
             }
       }
       return "";
    }

}
    
$.extend(KhanUtil, {
  /***
    Return array of sentence:category pairs
    The Ajax call will save the response text in var words, which is then split at
    newlines to separate the sentences.
    Type: Array of strings
  ***/
  readFile: function(file){
    var words = $.ajax({type: "GET", url: file, async: false}).responseText;
    var wordArray = words.split(/\n/);
    return wordArray;
  },
  
  readJSONFile: function(file){
    var rslt;
    $.ajax({
      type: "GET", 
      url: file,
      async: false,
      dataType: 'json',
      success: function(data) {                      
        rslt = data;                      
      }        
    });
    return rslt;
  },

  getRandomSentence: function(sentences) {
    //Interfiere if debug is on, and find the specific sentence
    var sentenceStr = getURLParameters("sentence", "")
    var sentenceObj = null;
    if (sentenceStr) {
      for (var i=0;i<sentences['sentences'].length;i++) {
        if (sentences['sentences'][i][0] == sentenceStr) {
          sentenceObj = sentences['sentences'][i]
          break;
        } 
      }
      if (sentenceObj == null)
        console.error("Could not find sentence: " + sentenceStr);
    } else {
      sentenceObj = KhanUtil.randFromArray(sentences['sentences']);
    }
    var obj = {};
    $.each(sentences['header'], function(idx, head) {
        obj[head] = sentenceObj[idx];
    });
    return obj;
  },

  _black_list: ["sentence", "category", "Roel checked"],

  getZinsdelenSentence: function(cat) {
    cat = getURLParameters("cat") || cat;
    var zinsdelen = this.readJSONFile("../cats/"+cat+"_zinsdelen.json");
    return this.getRandomSentence(zinsdelen);
  },
  getZinnenSentence: function(cat) {
    cat = getURLParameters("cat") || cat;
    var zinnen = this.readJSONFile("../cats/"+cat+"_zinnen.json");
    return this.getRandomSentence(zinnen);
  },

  convert2Grammar: function(sentenceObj){
    var self = this;
    var grammar = []
    var trimmed = sentenceObj['sentence'].replace(",","").replace(".", "").trim()
    var parts = [];
    //Find grammar parts in order
    $.each(sentenceObj, function(type, part) {
      if (self._black_list.indexOf(type) == -1 && part.length) {
        if (trimmed.indexOf(part) > -1) {
          parts[trimmed.indexOf(part)] = [part, type];
        }
      }
    });
    //Rearrange order
    for (var i=0;i<parts.length;i++) {
      if (parts[i]) {
        grammar.push(parts[i]);
      }
    }
    return grammar;
  },
  
  convert2Tuple: function(sentenceObj){
    var self = this;
    var tuples = []
    var trimmed = sentenceObj['sentence'].replace(",","").replace(".", "").trim()
    $.each(trimmed.split(" "), function(k,word) {
      word = word.trim()
      $.each(sentenceObj, function(type, type_words) {
        if (self._black_list.indexOf(type) == -1) {
          if (word.length && type_words.split(",").indexOf(word) > -1) {
            tuples.push([word, type]);
          }
        }
      });
    });
    return tuples
  },
  getWordID: function(sentence, allWords){
    sentence = sentence.replace(".","");
    var arr = sentence.split(" ");
    var len = arr.length;
    var tmp = "";
    var words = [];
    var len2 = allWords.length;
    for(var i=0; i<len;i++){
      words.push(arr[i]);
    }
    var wArr = [];
    var wordAll = [];
    var type = allWords[0].split(",");
    for(var j=0; j<len2;j++){
      wArr = allWords[j].split(",");
      for(var z=0; z<words.length;z++){
        for(var y=0; y<wArr.length; y++){
          if(words[z].toLowerCase() == wArr[y].toLowerCase() && wordAll.indexOf(words[z]) === -1){
            wordAll[z] = [words[z],type[y]];
          }
        }
      }
    }
    var temp="";
    var prev="";
    for(var j=1;j<wordAll.length;j++){
      temp = wordAll[j][1];
      var k = j-1;      
      prev = wordAll[k][1];

      
      //1: exception for "zijn"
      if((temp == "hww" || temp == "zww" || temp == "hww") && (prev == "bez")){
        console.log("ex 4");
        wordAll[k][1] = "hww";
      }
      
      //2: exception for 2 znws
      if(temp == "znw" && prev == "znw"){
        console.log("ex 2");
        wordAll[j][1] = "zww";     
      }
      
      //3: exception for znws without lidwoord
      if(temp == "znw" && ((prev=="hww") || (prev=="zww") || (prev=="kww"))){    
        console.log("ex 3");
        wordAll[k][1] = "bvn";   
      }
      
    }
    return wordAll;
  },
  
  showSentence: function(tuple,desired){
    var desTemp = desired;
    var begin = tuple[0][1].trim();
    var beginWord = tuple[0][0].trim();
    var len = tuple.length;
    var wws = ["ww","hww","zww"];
    var qs = ["Waarom","Waar","Hoe","Wie","Hoeveel","Wanneer","Wat"];
    for(var i=0;i<len;i++){
      $('<span class="' + tuple[i][1] + '"> ' + tuple[i][0] + '</span>').appendTo('.answers');
      if(i == len-1){
        if(wws.indexOf(begin) > -1 || qs.indexOf(beginWord) > -1){
          $('<span>?</span><br>').appendTo('.answers');
        }
        else{
          $('<span>.</span><br>').appendTo('.answers');
        }
      }
    }
    var x = desired.length;
    for(var j=0;j<x;j++){
      $('<span class="dragWord " id = "' + desired[j] + '"> ' + desired[j].toUpperCase() +'</span>').appendTo('.question');
    }
    for(var z=0; z<tuple.length; z++){
      var index = desTemp.indexOf(tuple[z][1]);
      if(index>-1){
        desTemp.splice(index,1);
        $('<span class = "dropWord" id ="' + tuple[z][1] + '">"' + tuple[z][0] + '" = </span>').appendTo('.answers');
      }
    }
    $('<span class = "dropWord" id="geen"> Niet in deze zin = </span>').appendTo('.answers');
    
    $(".dragWord").draggable({containment:'#problemarea', cursor:'move', addClasses: false});
    var correct = [];    
    $(".dropWord").droppable({
      drop: function(event,ui){
        var drag = ui.draggable.attr('id');
        var drop = $(this).attr('id');
        var index = desTemp.indexOf(drag)
        
        if(drag == drop || (index>-1 && drop == "geen")){ //if correctly dropped
          if(ui.draggable.hasClass('incorrt')){
            ui.draggable.removeClass('incorrt');
          }
          ui.draggable.addClass('corrt');
          
        }
        else{ //if incorrectly dropped
          if(ui.draggable.hasClass('corrt')){
            ui.draggable.removeClass('corrt');
          }
          ui.draggable.addClass('incorrt');
        }
      }
    });
    $("#check-answer-button").mousedown(function(){
      var userPick = $('.corrt').length;
      $('.corrt').each(function(){
        $(this).removeClass('incorrect2');
        $(this).addClass('correct2');
      });
      $('.incorrt').each(function(){
        $(this).removeClass('correct2');
        $(this).addClass('incorrect2');
      });
      $('#bool').remove();      
      if(userPick === x){
        $('<span id="bool" style="display:none">true</span>').appendTo('.answers');
      }
      else{
        $('#bool').remove();
      }
    });
  },
  
  showSent: function(tuple, desired){
    var desTemp = desired;
    var begin = tuple[0][1].trim();
    var beginWord = tuple[0][0].trim();
    var len = tuple.length;
    var wws = ["ww","hww","zww"];
    var qs = ["Waarom","Waar","Hoe","Wie","Hoeveel","Wanneer","Wat"];
    for(var i=0;i<len;i++){
      if(desired.indexOf(tuple[i][1]) > -1){
        $('<span class=" click desired ' + tuple[i][1] + '"> ' + tuple[i][0] + '</span>').appendTo('.question');   
      } 
      else{
        $('<span class=" click ' + tuple[i][1] + '"> ' + tuple[i][0] + '</span>').appendTo('.question');
      }
      if(i == len-1){
        if(wws.indexOf(begin) > -1 || qs.indexOf(beginWord) > -1){
          $('<span>?</span>').appendTo('.question');
        }
        else{
          $('<span>.</span>').appendTo('.question');
        }
      }
    }
  },
  
  clickAns: function(tuple,desired){
    var len = desired.length;
    var answer = [];
    for(var i=0;i<len;i++){
      if($("."+desired[i]).text() !== " "){
        $("."+desired[i]).each(function(j){
          answer.push($("."+desired[i])[j]);
        })
      }
    }
    $('.click').click(function(){
      $(this).toggleClass('chosen');
    });
    $('#check-answer-button').mousedown(function(){
      var userAns = $('.chosen');
      var corrAns = 0;
      userAns.each(function(j){
        if($($(userAns)[j]).hasClass('desired')){
          corrAns ++;
        }
      });
      
      if(corrAns === answer.length){
        $('#bool').remove();
        $('<span id="bool" style="display:none">true</span>').appendTo('.answers');
      }
      else{
        $('#bool').remove();
      }
    });
  },
  
  /***
    Return an array that contains two elements: a sentence and a category.
    The sentence:category strings are split at the occurrence of a dot followed by a comma
     (to prevent accidental splitting at grammatical commas), stripped of trailing 
     whitespace and then given a period.
    Type: Array of strings
  ***/
  fixSentence2: function(sentence){
    var pair = sentence.split(/.,/);
    pair[0] = pair[0].replace(/(^\s*)|(\s*$)/gi,"");
    //pair[0] = pair[0].concat(".");
    console.log("2: " + pair[0]);
    return pair[0];
  },
    
  fixSentence: function(sentence){
    var pair = sentence.split(/.,/);
    pair[0] = pair[0].replace(/(^\s*)|(\s*$)/gi,"");
    //pair[0] = pair[0].concat(".");
    return pair;
  },
  
  /***
    Return an array of tuples containing the grammatical name of every sentence part.
    The sentence is split at the comma, dividing all parts and names into different 
    elements. Each sentence:name pair is turned into an array and added 
    to the main array. 
    Type: Array of arrays
  ***/
  
  fixParts: function(sentence){
    var parts = sentence.split(",");
    var everything = [];
    var length = parts.length;
    var tmp = [];
    for(var i=0; i<length;i=i+2){
      tmp = [];    
      tmp.push(parts[i]);
      tmp.push(parts[i+1]);
      everything.push(tmp);
    }
    return everything;
  },
  
  /***
    Return a number that corresponds to a sentence in one of the categories in cats
    The array tmp contains one random number for each category. After tmp is filled, 
    one number is randomly picked from the array and returned.
    Type: number
  ***/
  makeNumber: function(cats, sentences){
    var len = cats.length;
    var tmp = []; //[KhanUtil.randRange(0,this.lastCatSentence(cats[0], sentences))];
    var begin = 0;
    var end = 0;
    for(var i=0; i<len; i++){
      begin = this.lastCatSentence(cats[i]-1, sentences);
      end = this.lastCatSentence(cats[i],sentences);
      tmp.push(KhanUtil.randRange(begin,end));
    }
    var ret = KhanUtil.randFromArray(tmp);
    //shortcut
    Khan.taaltransfer_category = cats[tmp.indexOf(ret)];
    return ret;
  },
  
  /***
    Return the line containing the last sentence in a certain category.
    Hardcoded for speed.
    Type: number
  ***/
  
  lastCatSentence: function(category, wordArr){
    var catArray = [0,118,228,327,497,596,700,801,901,1001,1101,1201,1312,1414,1544,1644,1744,1844,1974,2082,2182,2345,2444,2543,2644,2744,2844,3009,3109,3209,3309,3409,3509,3609,3709,3809,3909,4009,4109,4209,4309,4409,4509,4609,4729,4829,4929,5029,5129,5230,5330,5430,5630,5730,5890,5990,6050,6150,6250,6350,6450,6550,6650,6750,6850,6950,7050,7150,7215,7315,7415,7515,7615,7715,7815,7920,8020,8120,8220,8320,8420,8520,8620,8680,8780,8880,8980,9080,9180,9280,9341,9441,9540,9640,9700,9800,9900,10002];
    return catArray[category];
  },
    /*var length = wordArr.length;
    var tmp = [];
    for(var i=0; i<length; i++){
      tmp = this.fixSentence(wordArr[i]);
      console.log("CAT " + tmp[1] + "FOR: " + tmp[0] );
      if(tmp[1] == (category+1)){
        console.log("TMP2: " + tmp[1] + " has i of " + i);      
        return (i);
      }
    }
    return i;*/
  /***
    Return the value that belongs to the requested grammatical name, for example "pv".
    This function takes the 2d array returned by fixParts and checks every 2nd element
    of every 1d array to see if it is equal to that name. If so, it returns the 1st 
    element of the 1d array. If nothing with the name is found, an empty string is 
    returned.
    Type: string
  ***/
  
  findNameValue: function(sentence, name){
    var length = sentence.length;
    var index = 0;
    for(var i=0; i<length; i++){
      if(sentence[i][1] == name){
        return sentence[i][0];
      }
    }
    return "";
  },
  
  /***
    Return the index that belongs to the tuple that contains the requested name. Returns
    -1 if the name is not found in a populated element.
    This function has almost the same functionality as findNameValue.
    Type: number
  ***/
  
  findNameIndex: function(sentence, name){
    var length = sentence.length;
    var index = 0;
    for(var i=0; i<length; i++){
      if(sentence[i][1] == name && sentence[i][0] !==""){
        return i;
      }
    }
    return -1;
  },
  
  /***
    Return the sentence formatted as a question.
    This function stores the 'pv' in a temporary variable, removes the 'pv'-tuple from
    the array and adds the temporary variable as element 0 of the array. Capitalization
    of other elements is removed, and the first letter in temp is capitalized. A question
    mark is concatenated at the end. 
    Type: string
  ***/
  
  makeQuestion: function(sentence){
    var pv = this.findNameIndex(sentence, "pv");
    var tmp = sentence[pv];
    sentence.splice(pv,1);
    sentence.unshift(tmp);
    var question ="";
    var len = sentence.length;
    for(var i=0; i<len; i++){
      if(sentence[i][0] !== ""){
        question = question.concat(sentence[i][0].toLowerCase() + " ");
      }
    }
    question = question.concat("?");
    question = question.replace(question[0], question[0].toUpperCase());
    return question;
  },
  
  /***
    Concatenates all the words in the sentence by collecting all elements with class 
    'els' in one string, split by a space. If the main verb is at the beginning of the
    sentence, or the sentence starts with an interrogative word, add a question mark at
    the end. Otherwise, at a period. Then, every word is added to the DOM as a separate
    span-element.
    Type: void
  ***/
  makeAns: function(){
    var els = $('.els');
    var sent = "";
    var len = els.length;
    for(var i=0;i<len;i++){
      sent = sent.concat($(els[i]).text().trim());
      if(i<len-1){
        sent = sent.concat(" ");
      }
    }
    if($(els[0]).attr('id') == 'pv' || $(els[0]).text().trim() == "Waarom" || $(els[0]).text().trim() == "Hoeveel"){
      sent = sent.concat(" ?");
    }
    else{
      sent = sent.concat(" .");
    }
    sent = sent.split(" ");
    var pv = $('#pv');
    var sLen = sent.length;
    var qWords = ['Waarom','Hoeveel','Waar','Hoe','Wanneer','Welke'];
    for(var j=0; j<sLen; j++){
      if(sent[j] === pv.text().trim()){
        $('<span id="pv" class = "els">' + sent[j] + '</span>').appendTo('.answers');
      }
      else{
        $('<span class = "els">' + sent[j] + '</span>').appendTo('.answers');
      }
    }
  },
  
  getCat: function(sentences,number){
    console.log(sentences[number]);
  },
  
  /***
    Toggles the class 'fakeDrag' on and off, indicating whether or not the user has
    selected an element in class 'els'. Also removes the 'incorrect' class to reset
    the element's style.
    Type: void
  ***/
  
  elClicked: function(){
    $('.els').click(function(){
      $(this).toggleClass("fakeDrag");
      $('.els').removeClass("incorrect2");
    });
  },
  
  
  /***
    Once the user clicks the 'submit answer' button, all selected elements are collected
    in the variable answers. Because the main verb is only one word, answer's length 
    should be equal to 1. If the id in answers is equal to the id of the main verb,
    append an invisible element that contains 'true'. Otherwise, append an invisible 
    element that contains 'false'. This function adds the class 'correct' and removes the 
    class 'incorrect' if the answer is correct and adds 'incorrect' if it is not.
    Type: void
  ***/
  
  checkClick: function(){
    $('#check-answer-button').mousedown(function(){
      var answers = $('.fakeDrag');
      var len = answers.length;
      if(len === 1){
        if($(answers[0]).attr('id') == 'pv'){
          $("#bool").remove();
          $('<span style="display:none" id="bool">true</span>').appendTo('.answers');
          $('.fakeDrag').addClass("correct2");          
        }
        else{
          $("#bool").remove();
          $('<span style="display:none" id="bool">false</span>').appendTo('.answers');
          $('.fakeDrag').addClass("incorrect2");
          $('#check-answer-button').removeClass("green");
          $('#check-answer-button').addClass("orange");
          $('#negative-reinforcement').css('display','inline-block');
        }
      }
      else{
        $("#bool").remove();
        $('<span style="display:none" id="bool">false</span>').appendTo('.answers');
        $('.fakeDrag').addClass("incorrect2");
        $('#check-answer-button').removeClass("green");
        $('#check-answer-button').addClass("orange");
      
      }
      
    });
  },
  
  
  seeSelected: function(array){
    var answers = [];
    var tmp = "";
    for(var i=0; i<array.length;i++){
      $("."+array[i]).each(function() {
        if($(this).text()!==""){
          answers.push($(this).text().trim().toLowerCase());
        }
      });
    }
    
   /** $('#check-answer-button').on('click', function(event){
      var selected = [];
      selected = $('.userChoice');
      if(selected.length === 0){
        event.stopImmediatePropagation();
        console.log(event + " stopped" );        
      }
    });**/
    
    $('#check-answer-button').on("mousedown",function(){
      var selected = [];
      selected = $('.userChoice');
      var check = [];      
      for(var j=0;j<selected.length;j++){
        tmp =  $(selected[j]).text();
        check.push(tmp.trim().toLowerCase());
      }
      var count = 0;
      var cLen = check.length;
      var aLen = answers.length;
    
      if(cLen === aLen){
        for(var k=0; k<aLen;k++){
          if(check[k] === answers[k]){
            count++;
          }
        }
      }
      $("#bool").remove();
      if(count === aLen){
        console.log("CORRECTO");
        $("<span id='bool' style='display:none'>" + true + "</span>").appendTo(".question");
      } else {
        console.log("INCORRECTO");
      }
    });
  },
  
  clickSent: function(sentence){
    $('.words').on('click',function(){
      $(this).toggleClass('userChoice');
    });
  },
  
  makeSent: function(sentence){
    console.log(sentence);
    var words = ['waarom','hoe','wanneer','welke','wie'];
    var verbs = ['hww','kww','hww'];
    for(var i=0; i<sentence.length;i++){
      $('<span class = "words ' + sentence[i][1] + '">' + sentence[i][0] +'</span>').appendTo('.answers');
    }
    if(words.indexOf(sentence[0][0].trim().toLowerCase()) > -1 || verbs.indexOf(sentence[0][1].trim().toLowerCase()) > -1){
      $('<span>?</span>').appendTo('.answers');      
    } 
    else{
      $('<span>.</span>').appendTo('.answers');          
    }
    
  },
  
  /***
    Makes sentence parts draggable.
    For each element in the sentence, append an element with class 'drag'.
    This function keeps track of all non-empty sentence-parts and returns the length
    of the sentence.
    Type: number
  ***/
  
  dragParts: function(sentence){
    var length = sentence.length;
    var els = 0;
    for(var i=0; i<length;i++){
      if(sentence[i][0] !== ""){
        $("<span class='drag' id ='" + sentence[i][1] + "' >" + sentence[i][0] + "</span> ").appendTo('.answers');
        els++;
      }
    }
    return els;
  },

  getWordType: function(sentenceObj, word) {
    var word =  word.replace("?", "").replace(".","").trim()
    var types = ["lw", "zww","znw", "bez", "per1", "per2", 
      "bvn", "vz","kww","vra","hww","wed","brt","bht","aan",
      "oht","voe","wederkerig","ort","restpv","bijw","bwg","nnb", 
      "exception"];
    for (i in types) {
      var type = types[i];
      var wordsInType = sentenceObj[type].split(",");
      for (var j=0; j<wordsInType.length; j++) {
        if (wordsInType[j] == word) 
          return type;
      }
    }
    return false;
  },

  checkCorrectSelection: function(sentenceObj, types) {
    var self = this;
    var correct = true;
    var missing = false;
    $(".sentence").children().each(function() {
      var word = $(this).html()
      var type = self.getWordType(sentenceObj, word);
      var found = $.inArray(type, types) >= 0;
      //console.log(word, type, found);
      if ($(this).hasClass("selected")) {
        if (found) {
          $(this).addClass("correct");
        } else {
          $(this).addClass("incorrect");
          correct = false;
        }
      } else {
        if (found) {
          missing = true;
        }
      }
    });
    if (missing && correct) {
      $(".message_warning").show();
      $(".message_warning").one("click", function() {
        $(this).fadeOut()
      });
      function handler() {
        $(".message_warning").fadeOut();
        $(".sentence").children().unbind("click", handler);
      }
      $(".sentence").children().one("click", handler);
      correct = false;
    }
    return correct;
  },
  
  /***
    Creates an invisible element for each word in the sentence by appending an element with
    class 'els' for each word in the sentence. This way, the functions following it know
    which word has which id.
    This function keeps track of all non-empty words and returns the length of the 
    sentence.
    Type: number
  ***/
  
  checkCorrect: function(sentence, type) {
    var correct = true;
    $(".sentence").children().each(function() {
        var word = $(this).html()
        if ($(this).hasClass("selected")) {
            if (sentence[type] != word)
                correct = false;
        } else {
            if (sentence[type] == word)
                correct = false
        }
    });
    return correct;
  },

  createSentence: function(sentenceObj, result) {
    var self = this;
    var sentenceStr = sentenceObj.sentence
                    .replace(/\s+/g, ' ') //removes multiple whitespaces
                    .replace("?", "").replace(".","").trim()
    $.each(sentenceStr.split(" "), function(idx, word) {
        $word = $("<span>" + word + "</span>");
        $word.click(function() {
            $(this).toggleClass("selected");
        });
        $(".sentence").append($word);
    }); 
  },

  regParts: function(sentence){
    var length = sentence.length;
    var els = 0;
    for(var i=0; i<length;i++){
      if(sentence[i][0] !== ""){
        $("<span class='els' style='display:none' id ='" + sentence[i][1] + "' > " + sentence[i][0] + " </span> ").appendTo('.question');
        els++;
      }
    }
    return els;
  },
  
  answerBoxes2: function(level){
    var selected = [];
    var levelOne = ['pv'];
    var levelTwo = ['pv','ond','overige zinsdelen'];
    var levelThree = ['pv','ond','wwg','overige zinsdelen'];
    var levelFour = ['pv','ond','lv','wwg','overige zinsdelen'];
    var levelSix = ['pv','ond','lv','overige zinsdelen'];
    var levelTen = ['pv','ond','lv','mwv','overige zinsdelen'];
    var levelTwelve = ['pv','ond','lv', 'wwg','mwv','overige zinsdelen'];
    var levelFourteen = ['pv','ond','lv', 'wwg','mwv', 'bb','overige zinsdelen'];
    var levelSixteen = ['pv','ond','lv', 'wwg','mwv', 'bb','nwg','overige zinsdelen'];    
    switch(level){
      case 1: 
        selected = levelOne;
        break;      
      case 2:
        selected = levelTwo;
        break;
      case 3:
        selected = levelThree;
        break;
      case 4:
        selected = levelFour;
        break;
      case 6:
        selected = levelSix;
        break;
      case 10:
        selected = levelTen;
        break;
      case 12:
        selected = levelTwelve;
        break;
      case 14:
        selected = levelFourteen;
        break;
      case 16:
        selected = levelSixteen;
        break;
    }
    var length = selected.length;
    for (var i=0;i<selected.length - 1;i++) {
      $box = $("<div class='parts'><span class='part-name'>" + selected[i] + "</span><span class='part-target'></span></div>");
      $box.appendTo(".boxes");
    }
  },
  /***
    Generate answerBoxes for each category
    Type: void
  ***/
  
  answerBoxes: function(level){
    var selected = [];
    var levelOne = ['pv'];
    var levelTwo = ['pv','ond','overige zinsdelen'];
    var levelThree = ['pv','ond','wwg','overige zinsdelen'];
    var levelFour = ['pv','ond','lv','wwg','overige zinsdelen'];
    var levelSix = ['pv','ond','lv','overige zinsdelen'];
    var levelTen = ['pv','ond','lv','mwv','overige zinsdelen'];
    var levelTwelve = ['pv','ond','lv', 'wwg','mwv','overige zinsdelen'];
    var levelFourteen = ['pv','ond','lv', 'wwg','mwv', 'bb','overige zinsdelen'];
    var levelSixteen = ['pv','ond','lv', 'wwg','mwv', 'bb','nwg','overige zinsdelen'];    
    switch(level){
      case 1: 
        selected = levelOne;
        break;      
      case 2:
        selected = levelTwo;
        break;
      case 3:
        selected = levelThree;
        break;
      case 4:
        selected = levelFour;
        break;
      case 6:
        selected = levelSix;
        break;
      case 10:
        selected = levelTen;
        break;
      case 12:
        selected = levelTwelve;
        break;
      case 14:
        selected = levelFourteen;
        break;
      case 16:
        selected = levelSixteen;
        break;
    }
    var length = selected.length;
    for(var i=0; i<length; i++){
      $("<p class='drop' id ='" + selected[i] + "' >" + selected[i].toUpperCase() + "<br></span> ").appendTo('.boxes');
    }
    return level;
  },
  
  /***
    This function turns sentence-parts into a sentence, then splits it into an array 
    separated by a space. For each word that is non-empty, a pipe-element and userPick 
    element are appended. The pipe-element is a clickable element that wraps each word so
    the user can select words, and the userPick element is an element that contains
    the word. If the sentence starts with the main verb or an interrogative word, a 
    question mark is added. If not, a period is added.
    Type: void.
  ***/
  
  makePick: function(sentence){
    console.log(sentence);
    var sentString = "";
    var len = sentence.length;
    for (var i=0; i<len; i++){
      if(sentence[i][0] !=" "){
        sentString = sentString.concat(sentence[i][0] + " ");
      }
    }
    sentString = sentString.split(" ");
    var k = 20;
    var els = $('.els');
    var sLen = sentString.length;
    for(var j=0; j<sLen; j++){
      if(sentString[j] != ""){
        $('<span class = "pipe" id = ' + k +'></span>').appendTo('.answers');
        $('<span class = "userPick els" id = ' + j +'> ' + sentString[j] + '</span>').appendTo('.answers');
        k++;
      }
      qWords = ['Waarom','Hoeveel','Waar','Hoe','Waarom','Wanneer','Welke'];
      if(j == sLen-1){
        if(sentence[0][1] == 'pv' || qWords.indexOf(sentence[0][0]) >-1){
          $('<span class ="pipe" id =' + k + '></span>?').appendTo('.answers');
        }
        else{
          $('<span class ="pipe" id =' + k + '></span>.').appendTo('.answers');
        }
      }
    }
  },
  
  /***
    Function that returns the length of the sentence from the parts, not counting empty 
    parts.
    Type: number
  ***/
  
  getZin: function(zin){
    var count = 0;
    var len = zin.length;
    for(var i=0; i<len; i++){
      if(zin[i][0] != ""){
        count++;
      }
    }
    return count;
  },
  selectWords: function(startIdx, endIdx, color) {
    $(".answers").children().eq(startIdx).addClass("box-start");
    for (var i=startIdx; i<=endIdx; i++) {
      if (!$(".answers").children().eq(i).hasClass("word")) continue;
      $(".answers").children().eq(i)
        .addClass("box-border")
        .animate({ backgroundColor: color }, 100)
        .data("color", color);
    }
    $(".answers").children().eq(endIdx-1).addClass("box-end");
  },
  calcBoxes: function() {
    $(".answers").children().each(function() {
      $(this).removeClass("box-border box-start box-end")
    });
  
    //nothing to do
    if ($(".answers .selected").length == 0) { 
      pColor = $(".answers").parent().css("background-color");
      $(".answers").find(".word").animate({backgroundColor: pColor}, 100);
      return;
    }

    //select until every split
    var _colors = $.extend([], colors);
    var startIdx = 0;
    var $selected = $(".answers .selected");
    for (var i=0;i<=$selected.length;i++) {
      var endIdx = i<$selected.length ? 
        $selected.eq(i).index() : $(".answers").children().last().index()
      var color = _colors[Object.keys(_colors)[0]];
      console.log("color",Object.keys(_colors)[0]);
      delete _colors[Object.keys(_colors)[0]];
      this.selectWords(startIdx, endIdx, shadeColor(color,30));
      startIdx = endIdx;
    }
  },

  getPartType: function(sentenceObj, part) {
    part = part.replace("?","").replace(".","");
    var types  = ["aa", "bb", "dng", "lv", "mv", "mwv",
      "nwg", "ond", "ons", "pv", "restpv", "vzv", "wi", "wwg"];
    for (i in types) {
      var type = types[i];
      if (part == sentenceObj[type]) {
        return part;
      }
    }
    return false;
  },

  hasSplit: function() {
    return $(".answers .split.selected").length;
  },

  checkCorrectSplit: function(sentenceObj) {
    var self = this;
    var startIdx = 0;
    var correct = true;
    var $words = $(".answers").children();
    var $selected = $(".answers .pipe.selected");
    if ($selected.length == 0) return false;
    $selected.each(function() {
      var endIdx = $(this).index()
      var part = "";
      for (var i=startIdx;i<endIdx;i++) {
        if ($words.eq(i).hasClass("word")) { 
          if (part.length) part += " ";
          part += $words.eq(i).html();
        }
      }
      var partType = self.getPartType(sentenceObj, part)
      if (!partType) {
        correct = false;
        return;
      }
      startIdx = endIdx;
    });
    return correct;
  },
  wordGroup: function(word) {
    var bgColor = $(word).data("color");
    var words = [];
    $(".answers").find(".word").each(function() {
      //console.log(bgColor, $(this).data("color"));
      if ($(this).data("color") == bgColor) {
        words.push(this);
      }
    });
    return words;
  },
  onClickBox: function(ele) {
    var self = this;
    $(".word").removeClass("selected");
    var words = self.wordGroup(ele);
    $(words).addClass("selected");
    $(".boxes").find(".parts, .part-name").addClass("highlight");
    $(".boxes").children().click(function() {
      $(this).addClass("filled");
      if ($(this).find(".part-target").is(":empty") == false) return;
      pColor = $(".answers").parent().css("background-color");
      $(".word.selected").animate({"background-color": pColor}, 100);
      var color = $(".word.selected").data("color");
      var $clone = $(".word.selected").clone();
      $clone.css({"position":"absolute", "background-color":""});
      $clone.removeClass("selectable");
      var first = null;
      $clone.each(function(i, ele) {
        var color = $(".word.selected").eq(i).data("color")
        var pos = $(".word.selected").eq(i).offset()
        if (first == null) first = pos.left;
        $(this).css({
          "left": pos.left + "px",
          "top": pos.top + "px"
        }).data("color", color);
      });
      var $target = $(this).find(".part-target");
      $(this).animate({"background-color": color}, 100);
      $clone.appendTo($target);
      $(this).animate({"background-color": color}, 100);
      var newPos = $target.offset();
      var incLeft = newPos.left - first + 20;
      var newTop = newPos.top;
      var lastTop = $clone.offset().top
      $clone.animate({left:"+="+incLeft+"px", top:newTop+"px"});
      $clone.data({
        incLeft: incLeft,
        newTop: newTop,
        lastTop: lastTop
      });
      $(this).unbind("click");
      //disable click events
      $(".boxes").children().each(function(i, ele) {
        if ($(ele).find(".part-target").is(":empty")) {
          console.log('unbind click', ele);
          $(ele).unbind("click");
        }
      });
      $(this).click(function() {
        //recover words to their positions
        var pColor = $(".answers").parent().css("background-color");
        $(this).animate({"background-color": pColor}, 100);
        var $firstWord = $(this).find(".word").first();
        var words = self.wordGroup($firstWord);
        console.log("words", words);
        $(words).animate({"background-color": $firstWord.data("color")}, 100);
        $clone.animate({left:"-="+incLeft+"px", top:lastTop+"px"}, function() {
          $(this).remove();
        });
        self.attachHover(words);
        self.checkFinish();
        
      });
      self.checkFinish();
      $(words).unbind('click mouseenter mouseleave').removeClass("selectable");
    });
  },
  checkFinish: function() {
    var oneEmpty = false;
    $(".boxes").children().each(function() {
      console.log("boxes");
      console.log(this);
      if ($(this).find(".part-target").is(":empty")) {
        oneEmpty = true;
      };
    });
    if (oneEmpty) {
      $("#answercontent").fadeOut();
    } else {
      $("#answercontent").fadeIn();
    }
  },
  attachHover: function(words) {
    var self = this;
    $(words).addClass("selectable").hover(function() {
      var words = self.wordGroup(this);
      console.log(words);
      $(words).animate({backgroundColor: shadeColor($(this).data("color"), 10)}, 100);
    }, function() {
      var words = self.wordGroup(this);
      $(words).animate({backgroundColor: $(this).data("color")}, 100);
    })
    .click(function() {
      self.onClickBox(this);
    })
  },
  startCheckSplitButton: function(sentenceObj, answerBoxes2Index) {
    var self = this;
    //$("#check-answer-button").hide();
    
    $("#answercontent").hide();
    $("#check-split").click(function() {
      if (self.checkCorrectSplit(sentenceObj)) {
      } else {
        $(".check-split-wrapper").effect("shake", {times: 3, distance: 5}, 480)
        $("#check-split").val("Try again!");
        return;
      }
      $(this).fadeOut(function() {
        $(".answers .pipe").fadeOut();
        $(".answers .split").hide();
        $(".boxes").hide();
        self.answerBoxes2(answerBoxes2Index);
        //$(".boxes").prepend("Select a part");
        self.attachHover($(".answers .word"));
        $(".boxes").fadeIn();
      });
    });
  },

  test2b: function() {
    setTimeout(function() {
    $(".split").eq(1).click();
    $("#check-split").click();
    }, 100);
  },

  updatePipePos: function() {
    var $words = $(".answers .word");
    $words.each(function(i, wordEle) {
      if (i == $words.length - 1) return;
      try {
        var $word = $(wordEle);
        var $nextWord = $(".answers .word").eq(i+1)
        var right = $nextWord.position().left - 3;
        $(".answers .pipe").eq(i)
          .css("left", right + "px")

        var left = $word.position().left + $word.width() / 2 + 6;
        var width = $word.width() / 2 + $nextWord.width() / 2 + 19;
        $(".answers .split").eq(i)
          .css("left", left + "px")
          .css("width", width + "px")
      } catch(err) {
        console.log(err);
      }
    });

  },
  
  sentenceSplitter: function(sentence_obj) {
    if (sentence_obj.sentence.indexOf(".")) {
      sentence_obj.hasDot = true;
      sentence_obj.hasQuestion = false;
    } else if (sentence_obj.sentence.indexOf("?")) {
      sentence_obj.hasDot = false;
      sentence_obj.hasQuestion = true;
    } else {
      sentence_obj.hasDot = false;
      sentence_obj.hasQuestion = false;
    }
    var sentence = sentence_obj.sentence
                    .replace(/\s+/g, ' ') //removes multiple whitespaces
                    .replace("?", "").replace(".","").trim()
    var words = sentence.split(" ");
    //add punctuation
    words[words.length-1] += sentence_obj.hasDot ? ".":"?";
    var self = this;
    //place words
    $.each(words, function(i, word) {
      $("<span class='word'>"+word+"</span>").appendTo(".answers");
    });
    //$("<span class='punctuation'>"+(sentence_obj.hasDot ? ".":"?")+"</span>").appendTo(".answers");
    //add pipes and splitters
    $(".answers .word").each(function(i, wordEle) {
      $word = $(wordEle);
      if (i < words.length-1) {
        //place them in order
        var $pipe = $("<span class='pipe'></span>")
          .insertAfter(this);

        var $split = $("<span class='split'></span>")
          .insertAfter($pipe)
          .click(function() {
              $pipe.toggleClass("selected");
              self.calcBoxes();
            })
          .hover(function() {
              $pipe.addClass("hover");
            }, function() {
              $pipe.removeClass("hover");
            });
      }
    });
    //update the splitter and pipes positions programatically
    self.updatePipePos();
    $(window).resize(self.updatePipePos);
  },

  userPick2: function(zin){
    var click = 0;
    var start = -1;
    var end = -1;
    var corr = [];    
    var incorr = [];
    var ids = [];
    var drops = $('.drop');
    var len = drops.length;
    for(var k=0; k<len;k++){
      ids.push($(drops[k]).attr('id'));
    }
    var zinlen = this.getZin(zin);

    $('.pipe').click(function(){
      $(this).toggleClass('clicked');
      click++;
      var len = $('.clicked').length;
      if(len === 2){
        var c = $('.clicked');
        var start = $(c[0]).attr('id');
        var end = $(c[1]).attr('id');
        var selected = "";
        for(var z = start-20; z<=end-21; z++){
          selected = selected.concat($('#'+z).text());
        }
        var eq = "";
        var same = false;
        var zLen = zin.length;
        for(var y = 0; y<zLen; y++){
          if(selected.trim() == zin[y][0].trim()){
            same = true;
            if(ids.indexOf(zin[y][1]) > -1){ //if there is a droppable with this id
              eq = zin[y][1];
            }
            else{
              eq = 'rest' + click;
            }
          }
        }
        if(same){
          $('<span class = "drag selected c" id=' + eq + '>' + selected + '<span class="delete" id="' + eq +'">x</span></span><br>').appendTo('.boxes');
        }
        else{
          $('<span class = "drag selected" id=' + click + '>' + selected + '<span class="delete" id="' + eq + '">x</span></span><br>').appendTo('.boxes');
        }
		if (typeof Khan.onItyEfResize == 'function'){
			Khan.onItyEfResize();
		}
        $('.clicked').removeClass('clicked');
      }
    });
    
    $(document).on("click",".delete",function(){
      $(this).siblings().remove();
      $(this).parent().next().remove();
      $(this).parent().remove();     
      $(this).remove();    
    });
    
    $('#check-answer-button').mousedown(function(){
      var len = $(".c").length;
      if(len === zinlen){
        $("<span id='bool' style='display:none'>" + true + "</span>").appendTo(".question");
      }
    });
    
  },
  
  /***
    This function stores all ids in an array and gets the sentence length. 
    Type: void
  ***/
  userPick: function(zin){
    var click = 0;
    var start = -1;
    var end = -1;
    var corr = [];    
    var incorr = [];
    var ids = [];
    var drops = $('.drop');
    var len = drops.length;
    for(var k=0; k<len;k++){
      ids.push($(drops[k]).attr('id'));
    }
    var zinlen = this.getZin(zin);
    
    /***
    When an element with class 'pipe' is clicked the class 'clicked' is toggled on or off. 
    When exactly two 'pipe'-elements are selected, it retrieves the ids of the two 
    elements and stores them in the variables 'start' and 'end'. By subtracting 20 from 
    start and 21 from end this function is able to retrieve ids of the elements between 
    the two pipes. Using these ids, it creates a string of the selected words. Then, the 
    function compares the selection to the actual parts, and if they're the same it saves 
    the corresponding id in 'eq' and sets 'same' to true. However, if the array of ids 
    does not contain the selection while it IS an actual part, 'eq' is set to 'restpv'.
    If 'same' is set to true, a span-element with 'eq' as id is appended, otherwise a
    span-element with the amount of clicks received so far as id is appended.
    Then, it removes the class 'clicked' from all elements with class 'clicked'.
    ***/
       
    $('.pipe').click(function(){
      $(this).toggleClass('clicked');
      click++;
      var len = $('.clicked').length;
      if(len === 2){
        var c = $('.clicked');
        var start = $(c[0]).attr('id');
        var end = $(c[1]).attr('id');
        var selected = "";
        for(var z = start-20; z<=end-21; z++){
          selected = selected.concat($('#'+z).text());
        }
        var eq = "";
        var same = false;
        var zLen = zin.length;
        for(var y = 0; y<zLen; y++){
          if(selected.trim() == zin[y][0].trim()){
            same = true;
            if(ids.indexOf(zin[y][1]) > -1){ //if there is a droppable with this id
              eq = zin[y][1];
            }
            else{
              eq = 'rest' + click;
            }
          }
        }
        if(same){
          $('<span class = "drag selected" id=' + eq + '>' + selected + '<span class="delete">x</span></span><br>').appendTo('.boxes');
        }
        else{
          $('<span class = "drag selected" id=' + click + '>' + selected + '<span class="delete">x</span></span><br>').appendTo('.boxes');
        }
		if (typeof Khan.onItyEfResize == 'function'){
			Khan.onItyEfResize();
		}
        $('.clicked').removeClass('clicked');
        
        /***
          If an element with class 'delete' is clicked, the element itself, its siblings
          and its parent will be removed. This function is used to provide an option to 
          the user to remove selected elements.
        ***/
        
        $('.delete').click(function(){
           $(this).siblings().remove();
           $(this).parent().next().remove();           
           $(this).parent().remove();
           $(this).remove();
         });
      }
      
      /***
        All elements with class 'drag' are initialized as draggable items.
      ***/
      
      $(".drag").draggable({containment:'#workarea', cursor:'move', addClasses: false});
      
      /***
        If a draggable element is dropped on a droppable element, the ids of both elements
        are retrieved. The function checks if the draggable element was already added to
        either the array with correct or the array with incorrect answers.
        If both ids are equal, the class 'incorrect' is removed and the class 'correct' is
        added. If both ids are not equal, the class 'correct' is removed and the class 
        'incorrect' is added. This function adds a copy of the text in the main verb's
        element to the element with id 'wwg', because the main verb is part of 'wwg'.
      ***/
      
      $(".drop").droppable({
        drop: function(event, ui){
          var dragID = ui.draggable.attr("id");
          var rest = dragID.slice(0,4);
          var dropID = $(this).attr('id');
          var indexR = corr.indexOf(dragID);
          var indexW = incorr.indexOf(dragID);
          if(dragID === dropID || dropID == rest){
            if(dropID === "pv"){
              $('#pv2').remove();
              $("<span class='fakeDrag corr2' id='pv2'>" + $('#'+dragID + ".drag").clone().children().remove().end().text() + "</span>").appendTo('#wwg.drop');
            }
            $("#" + dragID + ".drag").removeClass("inc");
            $("#" + dragID + ".drag").addClass("corr");
          }
          else{
            if(dropID === "pv"){
              $('#pv2').remove();
              $("<span class='fakeDrag inc2' id='pv2'>" + $('#'+dragID + ".drag").clone().children().remove().end().text() + "</span>").appendTo('#wwg.drop');
            }
            $("#" + dragID + ".drag").removeClass("corr");
            $("#" + dragID + ".drag").addClass("inc");
          }
          }    
        });
      });
      
      
      /***
        When the 'submit answer' button is clicked, toggle classes so that correct answers
        become green and incorrect answers become orange.
        If the amount of correct answers is equal to the amount of sentence-parts, append
        an invisible element that contains 'true'.
      ***/
      
    $("#check-answer-button").mousedown(function(){
      $('.corr').removeClass('incorrect2');
      $('.corr').addClass('correct2');
      $('.inc').removeClass('correct2');
      $('.inc').addClass('incorrect2');
      $('.inc2').addClass('incorrect2');
      $('.inc2').removeClass('correct2');
      $('.corr2').addClass('correct2');
      $('.corr2').removeClass('incorrect2');
      var cLen = $('.corr').length;
      if(cLen == zinlen){
        $("<span id='bool' style='display:none'>" + true + "</span>").appendTo(".question");
      }
    });
  },
   
});
