$.extend(KhanUtil, {
    // To add two 2-dimensional matrices, use
    //     deepZipWith(2, function(a, b) { return a + b; }, matrixA, matrixB);
    deepZipWith: function deepZipWith(depth, fn) {
        var arrays = [].slice.call(arguments, 2);

        if (depth === 0) {
            return fn.apply(null, arrays);
        } else {
            return _.map(_.zip.apply(_, arrays), function(els) {
                return deepZipWith.apply(this, [depth - 1, fn].concat(els));
            });
        }
    },

    /**
     * Apply the given function to each element of the given matrix and return
     * the resulting matrix.
     */
    matrixMap: function(fn, mat) {
        return _.map(mat, function(row, i) {
            return _.map(row, function(elem, j) {
                return fn(elem, i, j);
            });
        });
    },

    /**
     * Given a matrix and list of row-col indices to exclude from masking,
     * return a new matrix with all but the elements in excludeList overwritten
     * by the value "?".
     *
     * @param mat {result of makeMatrix}
     * @param excludeList {array of arrays} List of row-col indices to keep
     *          from being overwritten. Note that these indices start at 1, not
     *          0, to match with common math notation.
     */
    maskMatrix: function(mat, excludeList) {
        var result = [];

        _.times(mat.r, function(i) {
            var row = [];
            _.times(mat.c, function(j) {
                if (KhanUtil.contains(excludeList, [i+1, j+1])) {
                    row.push(mat[i][j]);
                } else {
                    row.push("?");
                }
            });
            result.push(row);
        });
        return result;
    },

    /**
     * Given one or more same-dimension 2d matrices and a function for
     * how to combine and format their elements in the output matrix,
     * return the LaTeX code for rendering the matrix. Inherits syntax from
     * deepZipWith().
     *
     * Example usage:
     *
     * printMatrix(function(a, b) {
     *  return colorMarkup(a, "#FF0000") + "-" + colorMarkup(b, "#00FF00");
     * }, matA, matB);
     *
     */
    printMatrix: function(fn) {
        var args = Array.prototype.slice.call(arguments);
        mat = KhanUtil.deepZipWith.apply(this, [2].concat(args));

        var table = _.map(mat, function(row, i) {
                        return row.join(" & ");
                    }).join(" \\\\ ");

        var prefix = "\\left[\\begin{array}";
        var suffix = "\\end{array}\\right]";

        // to generate the alignment info needed for LaTeX table markup
        var alignment = "{";
        var cols = mat[0].length;
        _(cols).times(function (){
            alignment += "r";
        });
        alignment += "}";

        return prefix + alignment + table + suffix;
    },

    /**
     * Given a matrix and a color, format all elements with the given color
     * (if supplied) and return the LaTeX code for rendering the matrix.
     *
     * @param mat {array of arrays} the matrix to format
     * @param color {string}
     */
    printSimpleMatrix: function(mat, color) {
        return KhanUtil.printMatrix(function(item) {
            if (color) {
                return KhanUtil.colorMarkup(item, color);
            }
            return item;
        }, mat);
    },

     printVec: function(vector){
       return "<code>\begin{array}" + vector[0] + "&" + vector[1] + "\end{array}</code>";
     },
    /**
     * Format the rows or columns of the given matrix with the colors in the
     * given colors array, and return the LaTeX code for rendering the matrix.
     *
     * @param mat {array of arrays} the matrix to format
     * @param colors {array of strings} list of colors
     * @param isRow {bool} whether to apply the colors by row or by column
     */
    printColoredDimMatrix: function(mat, colors, isRow) {
        var matrix = KhanUtil.matrixMap(function(item, i, j) {
            var color = colors[isRow ? i : j];
            return KhanUtil.colorMarkup(item, color);
        }, mat);
        return KhanUtil.printSimpleMatrix(matrix);
    },

    /**
     * Generate markup for a color-coded matrix illustrating the calculations
     * behind each element in matrix multiplication.
     *
     * @param a {result of makeMatrix} the first matrix
     * @param b {result of makeMatrix} the second matrix
     * @param rowColors {array of strings} list of colors to apply to the
     *                                     rows of the first matrix
     * @param colColors {array of strings} list of colors to apply to the
     *                                     columns of the second matrix
     */
    makeMultHintMatrix: function(a, b, rowColors, colColors) {
        var c = [];
        // create the new matrix
        _.times(a.r, function() {
            c.push([]);
        });

        // perform the multiply
        _.times(a.r, function(i) {
            var c1 = rowColors[i];
            _.times(b.c, function(j) {
                var c2 = colColors[j];
                var temp = "";
                _.times(a.c, function(k) {
                    if (k > 0) {
                        temp += "+";
                    }
                    var elem1 = KhanUtil.colorMarkup(a[i][k], c1);
                    var elem2 = KhanUtil.colorMarkup(b[k][j], c2);
                    temp += elem1 + "\\cdot" + elem2;
                });
                c[i][j] = temp;
            });
        });

        return KhanUtil.makeMatrix(c);
    },

    // add matrix properties to a 2d matrix
    //   currently only rows and columns
    makeMatrix: function(m) {
        m.r = m.length;
        m.c = m[0].length;

        return m;
    },

    // multiply two matrices
    matrixMult: function(a, b) {
        var c = [];
        // create the new matrix
        _.times(a.r, function() {
            c.push([]);
        });

        // perform the multiply
        _.times(a.r, function(i) {
            _.times(b.c, function(j) {
                var temp = 0;
                _.times(a.c, function(k) {
                    temp += a[i][k] * b[k][j];
                });
                c[i][j] = temp;
            });
        });

        // add matrix properties to the result
        return KhanUtil.makeMatrix(c);
    },

    // convert an array to a column matrix
    arrayToColumn: function(arr) {
        var col = [];

        _.each(arr, function(e) {
            col.push([e]);
        });

        return KhanUtil.makeMatrix(col);
    },

    // convert a column matrix to an array
    columnToArray: function(col) {
        var arr = [];

        _.each(col, function(e) {
            arr.push(e[0]);
        });

        return arr;
    },

    // find the length of a 3d vector
    vectorLength: function(v) {
        return Math.sqrt(v[0] * v[0] +
                         v[1] * v[1] +
                         v[2] * v[2]);
    },

    // find the dot-product of two 3d vectors
    vectorDot: function(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    },
    
    lengthVec: function(v){
      var thisLong = 0;
      for(var i=0; i<v.length; i++){
        thisLong = thisLong + (v[i]*v[i]);
      }
      return Math.sqrt(thisLong);      
    },
    
    
    
    rref: function(matri){

      var rows = [];
      var newMat = matri; //make new matrix to store rows in
      var arrays = [];
      var length = matri.length;
      var elements = matri[0].length;
      for(var i=0; i<length; i++){ //loop over rows
        var row = this.getRow(i, matri, rows);
        rows.push(row);
        console.log("row: " + row + " i: " + i + " elements: " + elements + " length: " + length);
        if(this.rowZero(matri[row])){
          console.log("all zeros: " + matri[row]);
        }

        if(row > -1 && !this.rowZero(matri[row])){
          matri = this.moveToi(matri, row, i);
 
          if(i < length){
            this.divideC(matri, row, i);
            this.subtractR(matri, row, i);
            console.log("10: " + matri + ":" + matri[i]);
          }
          else{
            return matri;
          }
        }
        else{
          console.log("nope");
        }
        console.log(matri);
        console.log("-------------");
      }
      return matri; //IF ROW = ONLY ZEROS IT GETS REMOVED. WHY
    },
    
    padDigitsToNum: function(digits, num) {
        digits = digits.slice(0);
        while (digits.length < num) {
            digits.push(0);
        }
        return digits;
    },
    
    rowZero: function(row){
      var zeros = 0;
      for(var i=0; i<row.length;i++){
        if(row[i]==0){
          zeros ++
        }
      }
      if(zeros == row.length){
        return true;
      }
      else{
        return false;
      }
    },
    
    divideC: function(matri, row, i){
      var line = matri[row];
      console.log("line: " + line);
      var c = line[i];
      console.log("c: " + c);
      var length = line.length;
      console.log("length: " + length);
      for(var j=0; j<length; j++){
        line[j] = Math.round((line[j]/c)*100)/100;
      }
      matri[row] = line;
      return matri;
    },
    
    subtractR: function(matri, row, i){
      var pivotRow = matri[row];
      var pivot = pivotRow[i];
      var length = matri.length;
      var elements = matri[0].length;
      ///if((i+1) != elements){
        for(var z=0; z<length; z++){ //loop over rows
          if(z!=row){
            var checkRow = matri[z];
            var checkPivot = checkRow[i];
            for(var y=0; y<elements; y++){
              console.log("1: " + checkRow + "\n");
              matri[z][y] = (matri[z][y] - (checkPivot*matri[row][y]));
            }
          }
        //}
      }
      return matri;
    },
    
    getRow: function(lead, matri, rows){
      for(var j=0; j<matri.length; j++){ //loop over rows
        if(matri[j][lead] != 0 && rows.indexOf(j)==-1){
          return j;
        }
      }
      return -1;
    },
    
    moveToi: function(matri, row, i){
      var tmp = matri[i];
      matri[i] = matri[row];
      matri[row] = tmp;
      return matri;
    },
    
  divideByC: function(matrix,row,col){
    c = matrix[row][col];
    matri[row] = this.divideRow(matri[row], c);
    return matri;
    },
    
    divideRow: function(row, c){ //divide all elements in a row by the coefficient
      var length = row.length;
      for(var i=0; i<length; i++){
        row[i] = row[i]/c;
      }
      return row;
    },
    
  fixRows: function(matri,col, foundVars){
      var length = matri.length;
      for(var i=foundVars; i<=length; i++){
        if(matri[i][col] !=0){
          return i;
        }
        else { //find row that has a leading var for col
          for(var j=i; j<length;){
            if(matri[j][col] == 0){
              j++
              
            }
            else{
              matri = this.replaceRow(i,j, matri);
              return i;
            }
          } 
        }
      } return -1;
    },
    
    replaceRow: function(wrong, right, matri){
      var i = matri[wrong];
      var j = matri[right];
      matri[right] = i;
      matri[wrong] = j;
      return matri;
    },    

    
    eliminate: function(matrix){
      var length = matrix.length;
      var elements = matrix[0].length;
      for(var i=length-1; i>=0; i--){
        var rowLead = 0;
        var whichEl = 0;
        for(var j=i; j<elements;){
          if(matrix[i][j]!=0){
            rowLead = matrix[i][j];
            whichEl = j;
            j++
            break;
          }
          else{
            j++;
          }
        }
        console.log("rowLead: " + rowLead); //now we have the rowLead for this row
        for(var z=0; z<length; z++){
          if(z==i){
            console.log("stahp");
          }
          else{
            var leadEl = matrix[z][whichEl];
            console.log("leadEl: " + leadEl);
            if(leadEl != 0){
              for(var y=0; y<elements; y++){
                console.log("element is first: " + matrix[z][y]);
                var derp = rowLead * matrix[z][whichEl];
                console.log(rowLead + " * " + matrix[z][whichEl] + " = " + rowLead*matrix[z][whichEl]);
                matrix[z][y] = matrix[z][y] - derp;
                matrix[z][y] = Math.round(matrix[z][y] * 100)/100
                console.log("element is now: " + matrix[z][y]);
                console.log("--------------------------------");
              }
            }
          }
        }
      }
    },
    

    

    //Written by Elise, contains control logic
    rowEchelon: function(matrix){
      var pivot = 0;
      var mat = [];
      var pivots = [];
      var setOne = [];
      while(setOne.push([]) < matrix.length);
      while(mat.push([]) < matrix.length);
      for(var i = 0; i <matrix[0].length; i++){ //loop through columns
        pivot = this.getPivotRow(matrix, i);
        if(pivots.indexOf(pivot) == -1){
          mat.push(/*this.setPivotOne(matrix,pivot)*/matrix[pivot]);
          pivots.push(pivot);
          setOne.push(this.setPivotOne(matrix, pivot));
        }
        else{
          console.log("no pivots found");
        }
      }
      for(var x=0; x<matrix[0].length; x++){
        pivot = this.getPivotRow(matrix, x);
        console.log(this.subtractRows(matrix, pivot, x));
      }
      if(matrix.length > matrix[0].length){
        for(var j=i; j<matrix.length; j++){
          mat.push(matrix[j]);
        }
      }
      else {
        console.log("meer of gelijk aantal kolommen als rijen");
      }  
      return mat;
    },
    
    
    subtractRows: function(matrix, pivot, col){
      console.log("dump: matrix: " + matrix + " pivot: " + pivot + " col: " + col); 
      var pivotRow = matrix[pivot];
      var tmp = 0;
      for(var i=0; i<matrix.length; i++){ //loop through rows
        if(matrix[i][col] != 0 && i != pivot){ //if there is a value !=0 in the pivot column and we're not in the pivotRow
          var pivEl = matrix[i][col]; //pivotelement in the current row
          for(var j = 0; j<matrix.length; j++){ //loop through rowelements
            var matEl = matrix[i][j]; //current element

            var subEl = matrix[pivot][j]; //current element in the pivotRow
            console.log(" pivEl: " + pivEl + " subEl: " + subEl);
            matrix[i][j] = matEl - (pivEl*subEl);
            console.log("matel went from " + matEl + " to " + matrix[i][j]  + " where i = " + i + " ; j = " + j);
          }
        }
        else{
          console.log("is dus wel nul/is de pivotrij " + matrix[i][col]);
          //dont do that stuff
        }
      } console.log("hier: " + matrix);
    },
    
    //Written by Elise, returns the pivot row in a matrix
    getPivotRow: function(matrix, column){
      var pivot = [];
      for(var i=0; i<matrix.length; i++){
        if(matrix[i][column]!=0){
          pivot = matrix[i];
          return i;
        }
      } 
      return -1;
    },
    
    //Written by Elise, moves the pivot row up
   /* setPivotFirst: function(matrix, row, col){
      var pivot = this.getPivotRow(matrix);
      var pivotRow = matrix[row];
      matrix.splice(row, 1);
      matrix.splice(col, 0, pivotRow);
      console.log("mat is now: " + matrix + " and column was: " + col);
      return matrix;
    },*/
    
    setPivotOne: function(matrix,row){
      for(var j=0; j<matrix[row].length; j++){
        if(matrix[row][j] != 0){
          var pivot = matrix[row][j];
          break;
        }
      }
      for(var i=0; i<matrix[row].length; i++){
        matrix[row][i] = matrix[row][i]/pivot;
      }
      console.log(matrix[row]);
      return matrix[row];
    },
    
    //Written by Elise, will generate a matrix with r rows and c columns
    genMatrix: function(r,c){
      var matrix = [];
      var tmp = [];
      for(var i=0; i<r; i++){ //generate r vectors with c elements 
        tmp = this.genVector(c);
        matrix.push(tmp);
      }
      return matrix;
    },
    
    //Written by Elise, will transpose a matrix
    transMatrix: function(matrix){
      var newMat = []; 
      while(newMat.push([]) < matrix[1].length);
      var tmp = 0;
      for(var i=0; i<matrix.length; i++){ //loop through rows
        for(var j=0; j<matrix[i].length; j++){ //loop through rowelements
          tmp = matrix[i][j];
          newMat[j][i] = tmp;
        }
      }
      return newMat;
    },
        
     //Written by Elise, formats a single vector as a row
    writeRow: function(vector){

      var beginString = "<code>\\left[ \\begin{array}{rr}";

      var endString = "\\end{array} \\right]</code>";

      var middleString = "";

      for(var i=0; i < vector.length; i++){
        var el = vector[i].toString();
        middleString = middleString.concat(el);
        if(i<vector.length-1){
          middleString = middleString.concat("&");
        }
      }
      return beginString + middleString + endString;
    },
    //Written by Elise, will transpose a vector
   /* transVec: function(vector){
      var newMat = [];
      while(newMat.push([]) < vector.length);
      for(var i=0; i<vector.length; i++){
        newMat[i] = vector[i];
      }
      for(var j=0; j<newMat.length; j++){
       }
       return newMat;
    },*/    
    
    //Written by Elise, will break matrix down into rows and rewrite them as vectors
    writeMatRows: function(matrix){
      var begin = "<ul>";
      var end = "</ul>";
      var middle = "";
      for(var i=0; i<matrix.length; i++){ //loop through rows
        middle = middle.concat("<li> Row <var>writeRow([" + matrix[i] + "])</var> becomes column <var>writeVector([" + matrix[i] + "])</var></li>");
        if(i==(matrix.length-2)){
          middle = middle.concat(" and " );
        }
      }
      return middle;
    },    
        
    //Written by Elise, will generate a vector of length len
    genVector: function(len){
      var vector = [];
      for(var i = 0; i < len; i++){
        var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
        var worth = Math.floor((Math.random()*9)+1);
        vector.push(worth*plusOrMinus);
      }  
      return vector;
    },
    
    //Written by Elise, will round every element in a vector to 2 decimals
    roundVec: function(vector){
        var temp = 0;
        var roundVec = [];
        for(var i=0; i < vector.length; i++){
            temp = Math.round(vector[i]*100)/100;
            roundVec.push(temp);
        }
        return roundVec;
    },
    
    //Written by Elise, turns an array into a string for solution-checking purposes
    vecToText: function(vector){
      var str = "[";
      for(var i=0; i < vector.length; i++){
        str = str + vector[i];
        if(i < vector.length-1){
          str = str + ",";
        }
      }
      str = str + "]";
      return str;
    },
    
    //Written by Elise, returns sum of two matrices
    
    sumMatrix: function(ma, mb){
      var mn = [];
      var tmp = 0;
      while(mn.push([]) < ma.length);
      for(var i=0; i<ma.length; i++){
        for(var j=0; j<ma[i].length; j++){
          tmp = ma[i][j]+mb[i][j];
          mn[i][j] = tmp;
        }
      }
      return mn;
    },    
    
    //Shows the matrix filled with sums
    showSumMatrix: function(ma,mb){
      var formula = [];
      while (formula.push([]) < ma.length);
      for(var i=0; i < ma.length; i++){
        for(var j=0; j<ma[i].length; j++){
          formula[i][j]="<code>\\color{#6495ED}{" + ma[i][j] + "} + \\color{#28AE7B}{" + mb[i][j] + "}</code>";
        }
      }   
      return formula;
    },
    
    //Written by Elise, turns an array into a string for solution-checking purposes
    matrixToText: function(matrix){
      var str = "[";
      for(var i=0; i < matrix.length; i++){
        str = str + "[";
        for(var j=0; j<matrix[i].length; j++){
          str = str + matrix[i][j];
          if(j < matrix[i].length-1){
            str = str + ",";
          }
        }
        str = str + "]";
        if(i<matrix.length-1){
          str = str + ",";
        }
      }
      str = str + "]";
      return str;
    },
    
    //Written by Elise, will return an array consisting of each element of vec divided by str, formatted as a latex fraction
    divVec: function(vec, str){
        var begStr = '\\frac{';
        var endStr = '}{'+ str +'}' 
        var strAr = [];
        for(var i=0; i < vec.length; i++){
            newStr = begStr + vec[i] + endStr;
            strAr.push(newStr);
        }
        return strAr;
    },
    
    //Written by Elise, this will multiply a vector with a scalar
    scaleVec: function(vec, sca){
        var strAr = [];
        var newEl = 0;
        for(var i=0; i < vec.length; i++){
            newEl = vec[i]*sca;
            strAr.push(newEl);
        }
        return strAr;
    },
    
    //Written by Elise, this will return a vector with the formula filled in
    showScale: function(vec,sca){
      var formula = [];
      for(var i=0; i < vec.length; i++){
        formula.push("<code>\\color{#6495ED}{" + vec[i] + "} \\times \\color{#28AE7B}{" + sca + "}</code>");
      }    
      return formula;
    },
    
    //Written by Elise, this will turn a vector into its unit vector
    makeUnitVector: function(a){
      var len = this.lengthVec(a);
      var vec = [];
      for(var i=0; i < a.length; i++){
        var div = a[i]/len;
        vec.push(div);
      }
      return vec;
    },
    
    //Written by Elise, will format a vector to look like the linear algebra book
    writeVector: function(vector){

      var beginString = "<code>\\left[ \\begin{array}{rr}";

      var endString = "\\end{array} \\right]</code>";

      var middleString = "";

      for(var i=0; i < vector.length; i++){
        var el = vector[i].toString();
        middleString = middleString.concat(el + " \\\\ ");
      }
      return beginString + middleString + endString;
    },
    
    //Written by Elise, will format a matrix to look like the linear algebra book
    writeMatrix: function(matrix){
      var bestr = "<code>\\begin{bmatrix}";
      var endstr = " \\end{bmatrix}</code>";
      var middleString = "";
      var tmp;
      for(var i=0; i<matrix.length; i++){ //loop over rows
        for(var j=0; j<matrix[i].length; j++){ //loop over each element in row
          middleString = middleString.concat(matrix[i][j]);
          if(j < matrix[i].length-1){
            middleString = middleString.concat("&");
          }
        }
        if(i<matrix.length-1){
          middleString = middleString.concat("\\\\");
        }
      } 
      return bestr+middleString+endstr;
    },
    
    //Written by Elise, computes cross product between two vectors
    crossProduct: function(a,b){
      var first = a[1]*b[2]-a[2]*b[1];
      var second = a[2]*b[0]-a[0]*b[2];
      var third = a[0]*b[1]-a[1]*b[0];
      var vector = [first, second, third];
      return vector;
    },
    
    //Written by Elise, formats crossproduct for hint
    drawCross: function(a,b){
      var first = "<code>(\\color{#6495ED}{"+a[1]+"} \\times \\color{#28AE7B}{"+b[2]+"}) - (\\color{#6495ED}{"+a[2]+"} \\times \\color{#28AE7B}{"+b[1]+"})</code>";
      var second = "<code>(\\color{#6495ED}{"+a[2]+"} \\times \\color{#28AE7B}{"+b[0]+"}) - (\\color{#6495ED}{"+a[0]+"} \\times \\color{#28AE7B}{"+b[2]+"})</code>";
      var third = "<code>(\\color{#6495ED}{"+a[0]+"} \\times \\color{#28AE7B}{"+b[1]+"}) - (\\color{#6495ED}{"+a[1]+"} \\times \\color{#28AE7B}{"+b[0]+"})</code>";
      return [first, second, third];
    },
    
    //Written by Elise, formats crossproduct for halfway hint
    drawHalfCross: function(a,b){
      var first = "<code>" + a[1]*b[2] + " - " + a[2]*b[1] + "</code>";
      var second = "<code>" + a[2]*b[0] + " - " + a[0]*b[2] + "</code>";
      var third = "<code>" + a[0]*b[1] + " - " + a[1]*b[0] + "</code>";
      return [first, second, third];
    },
    
    //Written by Elise, will show complete calculation of dotproduct
    showDot: function(a,b){
      var formula = "";
      for(var i=0; i < a.length; i++){
        formula = formula.concat("<code>(\\color{#6495ED}{" + a[i] + "} \\times \\color{#28AE7B}{" + b[i] + "})</code>");
        if(i < a.length-1){
          formula = formula.concat(" + " );
        }
      }    
      return formula;
    },
    //Written by Else, will show halfway calculation of dotproduct
    showHalfdot: function(a, b){
      var formula = "";
      for(var i=0; i < a.length; i++){
        formula = formula.concat("<code>" + a[i]*b[i] + "</code>");
        if(i < a.length-1){
          formula = formula.concat( " + ");
        }  
      }  
      return formula;
    },
    
    //Written by Elise, can calculate dot product for arbitrary length of vectors
    dotProduct: function(a,b){
      var scalar = 0;
      if(a.length === b.length){

        for(var i = 0; i < a.length; i++){
          var ax = a[i];
          var bx = b[i];
          scalar = scalar + ( ax*bx);
        }
        return scalar;
      } else {
        console.log("Vectors are not the same length. \n First vector is: " + a.length + "\n Second vector is: " + b.length);
        return 0;
      }
    }
});
