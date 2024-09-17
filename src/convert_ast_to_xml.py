import ast
from bs4 import BeautifulSoup

# matchを使うバージョン　（関数言語っぽい方法。これが一番エレガントかも）
def expr(exp):
  match exp:
      case ast.BinOp(left, op, right):
         l = expr(left)
         r = expr(right)
         return f"<block> {l} {operator(op)} {r} </block>"
      case ast.Constant(value):
          return f"<num> {value} </num>"
      case _:
          raise ValueError(f"Unknown expression type: {exp.__class__}")

def operator(op):
  return f"<operator> {op.__class__.__name__} </operator>"

# matchを使わないバージョン（一番素朴な方法）
def expr_simple(exp):
  kind = exp.__class__
  if kind is ast.BinOp:
    l = expr_simple(exp.left)
    r = expr_simple(exp.right)
    return f"<block> {l} {operator(exp.op)} {r} </block>"
  elif kind is ast.Constant:
    return f"<num> {exp.value} </num>"
  else:
    raise ValueError(f"Unknown expression type: {kind}")


# walker (if文やmatch文を使わずに、メソッド単位で記述できる)
class ConvertToXML:
  def _expr(self, exp):
    kind = exp.__class__.__name__
    meth = getattr(self, "expr_" + kind)
    try:
      return meth(exp)
    except: 
      raise ValueError(f"Unknown expression type: {kind}")

  def expr_BinOp(self, exp):
    l = self._expr(exp.left)
    r = self._expr(exp.right)
    return f"<block> {l} {operator(exp.op)} {r} </block>"

  def expr_Constant(self, exp):
    return f"<num> {exp.value} </num>"

tree = ast.parse('1 + 2 + 3', mode="eval")
exp = tree.body
# 3つの方法のどれか。（すべて同じ）
result = expr(exp)
#result = expr_simple(exp)
#result = ConvertToXML()._expr(exp)
print(result)

# BeautifulSoupをインストールしない場合は、以下２行削除
soup = BeautifulSoup(result, 'xml') 
print(soup.prettify())