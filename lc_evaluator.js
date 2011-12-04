var evaluator = (function() { return {
  reduce: function(expr) {
    var tag = expr[0];
    if (tag == "VarExpr")
      return expr;
    else if (tag == "LambdaExpr")
      return expr;
    else if (tag == "ApplyExpr") {
      var e0 = expr[1];
      var e1 = expr[2];
      if (e0[0] == "LambdaExpr") {
        var variable = e0[1];
        var body = e0[2];
        return this.reduce(this.subst(body, variable, e1));
      } else
        return this.reduce(["ApplyExpr", this.reduce(e0), e1]);
    }
  },

  subst: function(expr, variable, value) {
    var tag = expr[0];
    if (tag == "VarExpr") {
      if (expr[1] == variable)
        return value;
      else
        return expr;
    } else if (tag == "LambdaExpr") {
      var lambda_variable = expr[1];
      var lambda_body = expr[2];
      if (variable == lambda_variable) {
        return expr;
      } else if (this.is_free_in(value, lambda_variable) && this.is_free_in(lambda_body, variable)) {
        var new_var = lambda_variable + "1";
        return ["LambdaExpr", new_var,
               this.subst(this.subst(lambda_body, lambda_variable, ["VarExpr", new_var]),
                     variable, value)];
      } else {
        return ["LambdaExpr", lambda_variable, this.subst(lambda_body, variable, value)];
      }
    } else if (tag == "ApplyExpr")
      return ["ApplyExpr",
        this.subst(expr[1], variable, value),
        this.subst(expr[2], variable, value)];
  },

  is_free_in: function(expr, variable) {
    var tag = expr[0];
    if (tag == "VarExpr")
      return expr[1] == variable;
    else if (tag == "LambdaExpr") {
      var lambda_variable = expr[1];
      var lambda_body = expr[2];
      return (lambda_variable != variable &&
          this.is_free_in(lambda_body, variable));
    } else if (tag == "ApplyExpr")
      return this.is_free_in(expr[1], variable) || this.is_free_in(expr[2], variable);
  },

  stringify: function(expr) {
    var tag = expr[0];
    if (tag == "VarExpr")
      return expr[1];
    else if (tag == "LambdaExpr") {
      var variable = expr[1];
      var body = expr[2];
      return '\\' + variable + '.' + this.stringify(body);
    } else if (tag == "ApplyExpr") {
      var f1 = expr[1];
      var f2 = expr[2];
      return this.stringify(f1) + ' ' + this.stringify(f2);
    } else if (tag == "Error")
      return "Error: " + expr[1];
  }
}})();
