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
  }
});

