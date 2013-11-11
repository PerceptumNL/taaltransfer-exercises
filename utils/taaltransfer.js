$.extend(KhanUtil, {

  /***
    Return array of sentence:category pairs
    The Ajax call will save the response text in var words, which is then split at
    newlines to separate the sentences.
    Type: Array of strings
  ***/
  
  readFile: function(file){
    console.log("Reading " + file + "...");
    var words = $.ajax({type: "GET", url: file, async: false}).responseText;
    var wordArray = words.split(/\n/);
    return wordArray;
  },
  
  /***
    Return an array that contains two elements: a sentence and a category.
    The sentence:category strings are split at the occurrence of a dot followed by a comma
     (to prevent accidental splitting at grammatical commas), stripped of trailing 
     whitespace and then given a period.
    Type: Array of strings
  ***/
  
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
    for(var i=0; i<sentence.length; i++){
      if(sentence[i][0] !== ""){
        question = question.concat(sentence[i][0].toLowerCase() + " ");
      }
    }
    question = question.concat("?");
    question = question.replace(question[0], question[0].toUpperCase());
    return question;
  },
  
  /***
    Check which element is clicked
  ***/
  elClicked: function(el){
    var bla = false;
    $('.els').live('click', function(){
      if($(this).hasClass("fakeDrag")){
        $(this).removeClass("fakeDrag");
      }
      else{
        $(this).addClass("fakeDrag");
      }
    });
  },
  
  getIds: function(cl){
    var arr = [];
    var def = new $.Deferred();
    $("."+cl).each(function(){
      arr.push($(this).attr('id'));
      console.log(arr);
    });
  },
  /***
    Wrapper to make all HTML-elements with class "drag" draggable in jQuery, and to 
    generate checks for correct/incorrect answers.
    Returns nothing.
    Type: void
  ***/
  
  makeDrag: function(zin){
    var dfd = new $.Deferred();
    var correctAns = [];
    var wrongAns = [];
    $(".drag").draggable({containment:'#workarea', cursor:'move', addClasses: false});
    $(".drop").droppable({
      drop:function(event, ui){
        var dragID = ui.draggable.attr("id");
        var dropID = $(this).attr('id');
        var newDrag = "#" + dragID;
        var indexR = correctAns.indexOf(dragID);
        var indexW = wrongAns.indexOf(dragID);
        if(dragID === dropID){
          if(dragID === "pv"){
            $('#pv2').remove();
            $("<span class='fakeDrag' id='pv2'>" + $('#'+dragID).text() + "</span>").appendTo('#wwg.drop');
          }
          if(indexR>-1){
            correctAns.splice(indexR, 1);
          }
          if(indexW>-1){
            wrongAns.splice(indexW, 1);
          }
          correctAns.push(dragID);
        }
        else{
          if(dragID === "pv"){
            $('#pv2').remove();
          }
          if(indexW>-1){
            wrongAns.splice(indexW, 1);
          }
          if(indexR>-1){
            correctAns.splice(indexR,1);
          }
          wrongAns.push(dragID);
        }
      }  
    });
    $("#check-answer-button").live('mousedown',function(){
      var drags = wrongAns;
      for(var i=0; i<drags.length; i++){
        $("#"+drags[i]).removeClass("correct");
        $("#"+drags[i]).addClass("incorrect");
      }
      var corr = correctAns;
      for(var j=0; j<corr.length; j++){
        $("#"+corr[j]).removeClass("incorrect");
        $("#"+corr[j]).addClass("correct");
      }          
      $('#pv2').addClass("correct");
      if(corr.length === zin){
        bool = true;
        dfd.resolve("DONE");
      }
    });
    dfd.done(function(){
      $("<span id='bool' style='visibility:hidden'>" + bool + "</span>").appendTo(".question");
    });
  },
  
  /***
    Makes sentence parts draggable.
    Type: void
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
  
  regParts: function(sentence){
    var length = sentence.length;
    var els = 0;
    for(var i=0; i<length;i++){
      if(sentence[i][0] !== ""){
        $("<span class='els' id ='" + sentence[i][1] + "' > " + sentence[i][0] + " </span> ").appendTo('.answers');
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
    var levelThree = ['pv','ond','wwg','restpv'];
    var levelFour = ['pv','ond','lv','wwg','restpv'];
    
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
  },
  
  makePick: function(sentence){
    var sentString = "";
    for (var i=0; i<sentence.length; i++){
      if(sentence[i][0] !=""){
        sentString = sentString.concat(sentence[i][0] + " ");
      }
    }
    sentString = sentString.split(" ");
    for(var j=0; j<sentString.length; j++){
      $('<span class = "userPick" id = ' + j +'> ' + sentString[j] + ' </span>').appendTo('.answers');
    }
  },
  
  userPick: function(){
    var click = 0;
    console.log($('.userPick').text());
    $('.userPick').click(function(){
      console.log("CLICKED");
      $(this).toggleClass('clicked');
      click++;
      console.log(click);
      if($('.clicked').length === 2){
        click = 0;
        console.log($('.clicked').text());
      }
    });
  }
});