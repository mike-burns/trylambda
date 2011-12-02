var evaluator = (function() { return {
  eval: function(expr) {
    return this.stringify(this.evalWithEnvironment(expr, {}))
  },

  evalWithEnvironment: function(expr, env) {
    var tag = expr[0];
    if (tag == "VarExpr") {
      var value = this.lookUpInEnv(expr[1], env);
      var valueTag = value[0];
      if (valueTag == "VarExpr") {
        return value;
      } else {
        return this.evalWithEnvironment(value, env);
      }
    } else if (tag == "LambdaExpr") {
      return expr;
      var variable = expr[1];
      var body = expr[2];
      return ["LambdaExpr", variable, this.evalWithEnvironment(body, env)]
    } else if (tag == "ApplyExpr") {
      var f1 = expr[1];
      var f2 = expr[2];
      return this.betaReduce(this.evalWithEnvironment(f1, env), f2, env);
    }
  },

  betaReduce: function(lambdaExpr, arg, env) {
    var tag = lambdaExpr[0];
    if (tag == "LambdaExpr") {
      var variable = lambdaExpr[1];
      var body = lambdaExpr[2];
      var newEnv = this.extendEnv(env, variable, arg);
      return this.evalWithEnvironment(this.applyNewEnv(newEnv, body), newEnv);
    } else {
      return ["Error", "tried to apply a non-lambda expression: " + this.stringify(lambdaExpr)];
    }
  },

  applyNewEnv: function(env, expr) {
    var tag = expr[0];
    if (tag == "VarExpr") {
      return this.lookUpInEnv(expr[1], env);
    } else if (tag == "LambdaExpr") {
      return expr;
    } else if (tag == "ApplyExpr") {
      return ["ApplyExpr",
        this.applyNewEnv(env, expr[1]),
        this.applyNewEnv(env, expr[2])];
    }
  },

  lookUpInEnv: function(variable, env) {
    var value = env[variable];
    if (value == undefined) { // free var
      return ["VarExpr", variable];
    } else {
      return value;
    }
  },

  extendEnv: function(env, variable, value) {
    var newEnv = env;
    newEnv[variable] = value;
    return newEnv;
  },

  stringify: function(expr) {
    var tag = expr[0];
    if (tag == "VarExpr") {
      return expr[1];
    } else if (tag == "LambdaExpr") {
      var variable = expr[1];
      var body = expr[2];
      return '\\' + variable + '.' + this.stringify(body);
    } else if (tag == "ApplyExpr") {
      var f1 = expr[1];
      var f2 = expr[2];
      return this.stringify(f1) + ' ' + this.stringify(f2);
    } else if (tag == "Error") {
      return "Error: " + expr[1];
    }
  }
}})();
