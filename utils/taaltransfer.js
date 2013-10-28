// Example usage:
// <var>person(1)</var> traveled 5 mi by <var>vehicle(1)</var>. Let
// <var>his(1)</var> average speed be <var>personVar(1)</var>.
// Let <var>person(2)</var>'s speed be <var>personVar(2)</var>.
//
// Note that initials (-Var) are guaranteed to be unique in each category,
// but not across them.

$.extend(KhanUtil, {
    
    
    readFile: function(file){
      console.log(file);
      //var words = $.ajax( "words.csv" );
      jQuery.get(file, function(data){
        var words = data;
        console.log(words);
      });
    }
});

