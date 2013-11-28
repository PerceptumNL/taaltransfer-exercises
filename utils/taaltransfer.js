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
      $('<span class=' + tuple[i][1] + '"> ' + tuple[i][0] + '</span>').appendTo('.question');
      if(i == len-1){
        if(wws.indexOf(begin) > -1 || qs.indexOf(beginWord) > -1){
          $('<span>?</span>').appendTo('.question');
        }
        else{
          $('<span>.</span>').appendTo('.question');
        }
      }
    }
    var x = desired.length;
    for(var j=0;j<x;j++){
      $('<br><span class="dragWord " id = "' + desired[j] + '"> ' + desired[j].toUpperCase() +'</span>').appendTo('.question');
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
      console.log(userPick);
      $('.corrt').each(function(){
        $(this).removeClass('incorrect');
        $(this).addClass('correct');
      });
      $('.incorrt').each(function(){
        $(this).removeClass('correct');
        $(this).addClass('incorrect');
      });
      if(userPick === x){
        $('<span id="bool" style="visibility:hidden">true</span>').appendTo('.answers');
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
    console.log(desired);
    console.log(tuple);
    var len = desired.length;
    var answer = [];
    for(var i=0;i<len;i++){
      if($("."+desired[i]).text() !== " "){
        console.log(desired[i] + " is not empty" );
        $("."+desired[i]).each(function(j){
          answer.push($("."+desired[i])[j]);
        })
      }
      else{console.log(desired[i] + " is empty");}
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
        $('<span id="bool" style="visibility:hidden">true</span>').appendTo('.answers');
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
    pair[0] = pair[0].concat(".");
    return pair[0];
  },
    
  fixSentence: function(sentence){
    var pair = sentence.split(/.,/);
    pair[0] = pair[0].replace(/(^\s*)|(\s*$)/gi,"");
    pair[0] = pair[0].concat(".");
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
    var tmp = [KhanUtil.randRange(0,this.lastCatSentence(cats[0], sentences))];
    for(var i=1; i<len; i++){
      tmp.push(KhanUtil.randRange(this.lastCatSentence(cats[i]-1, sentences), this.lastCatSentence(cats[i], sentences)));
    }
    return KhanUtil.randFromArray(tmp);
  },
  
  /***
    Return the line containing the last sentence in a certain category.
    Every sentence is split using fixSentence, then its category is checked against the 
    category following the one we want. If it is higher than that category, the line 
    number of the current sentence gets returned.
    Type: number
  ***/
  
  lastCatSentence: function(category, wordArr){
    var length = wordArr.length;
    var tmp = 0;
    for(var i=0; i<length; i++){
      tmp = this.fixSentence(wordArr[i]);
      if(tmp[1] == (category+1)){
        return (i);
      }
    }
    return i;
  },
  
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
      sent = sent.concat("?");
    }
    else{
      sent = sent.concat(".");
    }
    sent = sent.split(" ");
    var pv = $('#pv');
    var sLen = sent.length;
    for(var j=0; j<sLen; j++){
      if(sent[j] === pv.text().trim()){
        $('<span id="pv" class = "els">' + sent[j] + ' </span>').appendTo('.answers');
      }
      else{
        $('<span class = "els">' + sent[j] + ' </span>').appendTo('.answers');
      }
    }
  },
  
  /***
    Toggles the class 'fakeDrag' on and off, indicating whether or not the user has
    selected an element in class 'els'. Also removes the 'incorrect' class to reset
    the element's style.
    Type: void
  ***/
  
  elClicked: function(el){
    $('.els').click(function(){
      $(this).toggleClass("fakeDrag");
      $('.els').removeClass("incorrect");
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
          $('<span style="visibility:hidden" id="bool">true</span>').appendTo('.answers');
          $('.fakeDrag').addClass("correct");          
        }
        else{
          $("#bool").remove();
          $('<span style="visibility:hidden" id="bool">false</span>').appendTo('.answers');
          $('.fakeDrag').addClass("incorrect");
        }
      }
      else{
        $("#bool").remove();
        $('<span style="visibility:hidden" id="bool">false</span>').appendTo('.answers');
        $('.fakeDrag').addClass("incorrect");        
      }
      
    });
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
  
  /***
    Creates an invisible element for each word in the sentence by appending an element with
    class 'els' for each word in the sentence. This way, the functions following it know
    which word has which id.
    This function keeps track of all non-empty words and returns the length of the 
    sentence.
    Type: number
  ***/
  
  regParts: function(sentence){
    var length = sentence.length;
    var els = 0;
    for(var i=0; i<length;i++){
      if(sentence[i][0] !== ""){
        $("<span class='els' style='visibility:hidden' id ='" + sentence[i][1] + "' > " + sentence[i][0] + " </span> ").appendTo('.question');
        els++;
      }
    }
    return els;
  },
  
  /***
    Generate answerBoxes for each category
    Type: void
  ***/
  
  answerBoxes: function(level){
    var selected = [];
    var levelOne = ['pv'];
    var levelTwo = ['pv','ond','rest'];
    var levelThree = ['pv','ond','wwg','rest'];
    var levelFour = ['pv','ond','lv','wwg','rest'];
    
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
    var sentString = "";
    var len = sentence.length;
    for (var i=0; i<len; i++){
      if(sentence[i][0] !=""){
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
      qWords = ['Waarom','Hoeveel','Waar','Hoe','Waarom','Wanneer'];
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
          $('<span class = "drag selected" id=' + eq + '>' + selected + '<span class="delete">x</span></span>').appendTo('.answers');
        }
        else{
          $('<span class = "drag selected" id=' + click + '>' + selected + '<span class="delete">x</span></span>').appendTo('.answers');
        }
        $('.clicked').removeClass('clicked');
        
        /***
          If an element with class 'delete' is clicked, the element itself, its siblings
          and its parent will be removed. This function is used to provide an option to 
          the user to remove selected elements.
        ***/
        
        $('.delete').click(function(){
           $(this).siblings().remove();
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
              $("<span class='fakeDrag corr2' id='pv2'>" + $('#'+dragID).clone().children().remove().end().text() + "</span>").appendTo('#wwg.drop');
            }
            $("#" + dragID).removeClass("inc");
            $("#" + dragID).addClass("corr");
          }
          else{
            if(dropID === "pv"){
              $('#pv2').remove();
              $("<span class='fakeDrag inc2' id='pv2'>" + $('#'+dragID).clone().children().remove().end().text() + "</span>").appendTo('#wwg.drop');
            }
            $("#" + dragID).removeClass("corr");
            $("#" + dragID).addClass("inc");
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
      $('.corr').removeClass('incorrect');
      $('.corr').addClass('correct');
      $('.inc').removeClass('correct');
      $('.inc').addClass('incorrect');
      $('.inc2').addClass('incorrect');
      $('.inc2').removeClass('correct');
      $('.corr2').addClass('correct');
      $('.corr2').removeClass('incorrect');
      var cLen = $('.corr').length;
      if(cLen == zinlen){
        $("<span id='bool' style='visibility:hidden'>" + true + "</span>").appendTo(".question");
      }
    });
  },
   
});