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
    var length = parts.length/2;
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
    This function checks all uneven indexes to see if the name is there, and if so,
    returns the element before it.
    Type: string
  ***/
  findNameValue: function(sentence, name){
    console.log(sentence);
    console.log(name);
  }
});

