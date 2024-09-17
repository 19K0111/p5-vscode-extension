text = """
x = 200
y = x + 300
import typetest
"""

exec(text, globals(), globals())