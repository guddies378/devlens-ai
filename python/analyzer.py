import ast
import json
import sys

from radon.complexity import cc_visit
from radon.metrics import mi_visit


def count_lines(code: str):
    lines = code.splitlines()

    total_lines = len(lines)
    blank_lines = 0
    comment_lines = 0
    code_lines = 0

    for line in lines:
        stripped = line.strip()

        if not stripped:
            blank_lines += 1
        elif stripped.startswith("#"):
            comment_lines += 1
        else:
            code_lines += 1

    return {
        "totalLines": total_lines,
        "codeLines": code_lines,
        "blankLines": blank_lines,
        "commentLines": comment_lines,
    }


def count_python_structures(code: str):
    try:
        tree = ast.parse(code)

    except SyntaxError:
        return {
            "functions": 0,
            "classes": 0,
            "imports": 0,
            "syntaxValid": False,
        }

    functions = 0
    classes = 0
    imports = 0

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions += 1

        elif isinstance(node, ast.ClassDef):
            classes += 1

        elif isinstance(node, (ast.Import, ast.ImportFrom)):
            imports += 1

    return {
        "functions": functions,
        "classes": classes,
        "imports": imports,
        "syntaxValid": True,
    }


def calculate_complexity(code: str):
    try:
        blocks = cc_visit(code)

        total_complexity = sum(
            block.complexity for block in blocks
        )

        block_results = []

        for block in blocks:
            block_results.append(
                {
                    "name": block.name,
                    "complexity": block.complexity,
                    "line": block.lineno,
                }
            )

        return {
            "complexity": total_complexity,
            "complexityBlocks": block_results,
        }

    except Exception:
        return {
            "complexity": 0,
            "complexityBlocks": [],
        }


def calculate_maintainability(code: str):
    try:
        score = mi_visit(code, multi=True)

        return round(score, 2)

    except Exception:
        return 0


def analyze_python_code(code: str):
    line_metrics = count_lines(code)
    structure_metrics = count_python_structures(code)
    complexity_metrics = calculate_complexity(code)
    maintainability = calculate_maintainability(code)

    return {
        "language": "Python",
        **line_metrics,
        **structure_metrics,
        **complexity_metrics,
        "maintainability": maintainability,
    }


def main():
    try:
        # Receive source code directly from stdin
        code = sys.stdin.read()

        if not code.strip():
            print(
                json.dumps(
                    {
                        "error": "No code provided.",
                    }
                )
            )
            return

        result = analyze_python_code(code)

        print(json.dumps(result))

    except Exception as error:
        print(
            json.dumps(
                {
                    "error": str(error),
                }
            )
        )


if __name__ == "__main__":
    main()