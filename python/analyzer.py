import ast
import json
import re
import sys

from radon.complexity import cc_visit
from radon.metrics import mi_visit


# ============================================================
# LANGUAGE COMMENT STYLES
# ============================================================

HASH_COMMENT_LANGUAGES = {
    "Python",
    "Ruby",
    "R",
    "Perl",
    "Shell / Bash",
    "PowerShell",
    "YAML",
}

SLASH_COMMENT_LANGUAGES = {
    "JavaScript",
    "TypeScript",
    "Java",
    "C",
    "C++",
    "C#",
    "PHP",
    "Go",
    "Rust",
    "Swift",
    "Kotlin",
    "Dart",
    "Scala",
    "Objective-C",
    "Solidity",
    "Groovy",
}

SQL_COMMENT_LANGUAGES = {
    "SQL",
}

PERCENT_COMMENT_LANGUAGES = {
    "MATLAB",
}

HTML_COMMENT_LANGUAGES = {
    "HTML",
    "XML",
}


# ============================================================
# LINE METRICS
# ============================================================

def count_lines(code: str, language: str):
    lines = code.splitlines()

    total_lines = len(lines)
    blank_lines = 0
    comment_lines = 0
    code_lines = 0

    in_block_comment = False

    for line in lines:
        stripped = line.strip()

        if not stripped:
            blank_lines += 1
            continue

        # HTML / XML comments
        if language in HTML_COMMENT_LANGUAGES:
            if stripped.startswith("<!--"):
                comment_lines += 1

                if "-->" not in stripped:
                    in_block_comment = True

                continue

            if in_block_comment:
                comment_lines += 1

                if "-->" in stripped:
                    in_block_comment = False

                continue

        # /* */ style comments
        if language in SLASH_COMMENT_LANGUAGES:
            if stripped.startswith("/*"):
                comment_lines += 1

                if "*/" not in stripped:
                    in_block_comment = True

                continue

            if in_block_comment:
                comment_lines += 1

                if "*/" in stripped:
                    in_block_comment = False

                continue

            if stripped.startswith("//"):
                comment_lines += 1
                continue

        # # comments
        if language in HASH_COMMENT_LANGUAGES:
            if stripped.startswith("#"):
                comment_lines += 1
                continue

        # SQL comments
        if language in SQL_COMMENT_LANGUAGES:
            if stripped.startswith("--"):
                comment_lines += 1
                continue

        # MATLAB comments
        if language in PERCENT_COMMENT_LANGUAGES:
            if stripped.startswith("%"):
                comment_lines += 1
                continue

        code_lines += 1

    return {
        "totalLines": total_lines,
        "codeLines": code_lines,
        "blankLines": blank_lines,
        "commentLines": comment_lines,
    }


# ============================================================
# PYTHON STRUCTURE ANALYSIS
# ============================================================

def analyze_python_structures(code: str):
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
        if isinstance(
            node,
            (
                ast.FunctionDef,
                ast.AsyncFunctionDef,
            ),
        ):
            functions += 1

        elif isinstance(node, ast.ClassDef):
            classes += 1

        elif isinstance(
            node,
            (
                ast.Import,
                ast.ImportFrom,
            ),
        ):
            imports += 1

    return {
        "functions": functions,
        "classes": classes,
        "imports": imports,
        "syntaxValid": True,
    }


# ============================================================
# UNIVERSAL STRUCTURE ANALYSIS
# ============================================================

def count_matches(patterns, code):
    total = 0

    for pattern in patterns:
        matches = re.findall(
            pattern,
            code,
            flags=re.MULTILINE,
        )

        total += len(matches)

    return total


def analyze_generic_structures(code: str, language: str):
    function_patterns = []
    class_patterns = []
    import_patterns = []

    # JavaScript / TypeScript
    if language in {"JavaScript", "TypeScript"}:
        function_patterns = [
            r"\bfunction\s+\w+\s*\(",
            r"\b(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>",
            r"\b(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\w+\s*=>",
        ]

        class_patterns = [
            r"\bclass\s+\w+",
        ]

        import_patterns = [
            r"^\s*import\s+",
            r"\brequire\s*\(",
        ]

    # Java / C# / Kotlin / Swift / Dart / Groovy
    elif language in {
        "Java",
        "C#",
        "Kotlin",
        "Swift",
        "Dart",
        "Groovy",
    }:
        function_patterns = [
            r"\b(?:public|private|protected|static|final|async|override|open|internal|\s)+"
            r"[\w<>\[\]?]+\s+\w+\s*\([^;{}]*\)\s*\{",
        ]

        class_patterns = [
            r"\bclass\s+\w+",
            r"\binterface\s+\w+",
        ]

        import_patterns = [
            r"^\s*import\s+",
            r"^\s*using\s+",
        ]

    # C / C++ / Objective-C
    elif language in {
        "C",
        "C++",
        "Objective-C",
    }:
        function_patterns = [
            r"^[\w:*&<>\[\]\s]+\s+\w+\s*\([^;]*\)\s*\{",
        ]

        class_patterns = [
            r"\bclass\s+\w+",
            r"\bstruct\s+\w+",
        ]

        import_patterns = [
            r"^\s*#include\s+",
            r"^\s*#import\s+",
        ]

    # Go
    elif language == "Go":
        function_patterns = [
            r"\bfunc\s+(?:\([^)]*\)\s*)?\w+\s*\(",
        ]

        class_patterns = [
            r"\btype\s+\w+\s+struct\b",
        ]

        import_patterns = [
            r"^\s*import\s+",
        ]

    # Rust
    elif language == "Rust":
        function_patterns = [
            r"\bfn\s+\w+\s*\(",
        ]

        class_patterns = [
            r"\bstruct\s+\w+",
            r"\benum\s+\w+",
            r"\btrait\s+\w+",
        ]

        import_patterns = [
            r"^\s*use\s+",
            r"^\s*extern\s+crate\s+",
        ]

    # PHP
    elif language == "PHP":
        function_patterns = [
            r"\bfunction\s+\w+\s*\(",
        ]

        class_patterns = [
            r"\bclass\s+\w+",
            r"\binterface\s+\w+",
            r"\btrait\s+\w+",
        ]

        import_patterns = [
            r"^\s*use\s+",
            r"\brequire(?:_once)?\s*\(",
            r"\binclude(?:_once)?\s*\(",
        ]

    # Ruby
    elif language == "Ruby":
        function_patterns = [
            r"^\s*def\s+\w+",
        ]

        class_patterns = [
            r"^\s*class\s+\w+",
            r"^\s*module\s+\w+",
        ]

        import_patterns = [
            r"^\s*require\s+",
            r"^\s*require_relative\s+",
        ]

    # Scala
    elif language == "Scala":
        function_patterns = [
            r"\bdef\s+\w+\s*\(",
        ]

        class_patterns = [
            r"\bclass\s+\w+",
            r"\bobject\s+\w+",
            r"\btrait\s+\w+",
        ]

        import_patterns = [
            r"^\s*import\s+",
        ]

    # Lua
    elif language == "Lua":
        function_patterns = [
            r"\bfunction\s+\w+",
            r"\bfunction\s*\(",
        ]

    # Haskell
    elif language == "Haskell":
        function_patterns = [
            r"^\s*\w+\s+.*=",
        ]

        import_patterns = [
            r"^\s*import\s+",
        ]

    # Elixir
    elif language == "Elixir":
        function_patterns = [
            r"\bdefp?\s+\w+",
        ]

        class_patterns = [
            r"\bdefmodule\s+",
        ]

        import_patterns = [
            r"\bimport\s+",
            r"\balias\s+",
            r"\brequire\s+",
        ]

    # F#
    elif language == "F#":
        function_patterns = [
            r"^\s*let\s+\w+",
        ]

        class_patterns = [
            r"^\s*type\s+\w+",
        ]

        import_patterns = [
            r"^\s*open\s+",
        ]

    # R
    elif language == "R":
        function_patterns = [
            r"\b\w+\s*<-\s*function\s*\(",
            r"\b\w+\s*=\s*function\s*\(",
        ]

        import_patterns = [
            r"\blibrary\s*\(",
            r"\brequire\s*\(",
        ]

    # Julia
    elif language == "Julia":
        function_patterns = [
            r"^\s*function\s+\w+",
        ]

        class_patterns = [
            r"^\s*(?:mutable\s+)?struct\s+\w+",
        ]

        import_patterns = [
            r"^\s*using\s+",
            r"^\s*import\s+",
        ]

    # Shell / Bash
    elif language == "Shell / Bash":
        function_patterns = [
            r"^\s*\w+\s*\(\)\s*\{",
            r"^\s*function\s+\w+",
        ]

    # PowerShell
    elif language == "PowerShell":
        function_patterns = [
            r"^\s*function\s+[\w-]+",
        ]

        class_patterns = [
            r"^\s*class\s+\w+",
        ]

        import_patterns = [
            r"^\s*Import-Module\s+",
        ]

    # Solidity
    elif language == "Solidity":
        function_patterns = [
            r"\bfunction\s+\w+\s*\(",
        ]

        class_patterns = [
            r"\bcontract\s+\w+",
            r"\binterface\s+\w+",
            r"\blibrary\s+\w+",
        ]

        import_patterns = [
            r"^\s*import\s+",
        ]

    # SQL
    elif language == "SQL":
        function_patterns = [
            r"\bCREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\b",
            r"\bCREATE\s+(?:OR\s+REPLACE\s+)?PROCEDURE\b",
        ]

    # HTML
    elif language == "HTML":
        class_patterns = [
            r"\bclass\s*=",
        ]

    # CSS / SCSS
    elif language in {"CSS", "SCSS"}:
        class_patterns = [
            r"(?m)^\s*\.[A-Za-z_-][\w-]*",
        ]

        import_patterns = [
            r"@import\s+",
            r"@use\s+",
        ]

    # GraphQL
    elif language == "GraphQL":
        function_patterns = [
            r"\bquery\s+\w+",
            r"\bmutation\s+\w+",
            r"\bsubscription\s+\w+",
        ]

        class_patterns = [
            r"\btype\s+\w+",
            r"\binterface\s+\w+",
        ]

    functions = count_matches(
        function_patterns,
        code,
    )

    classes = count_matches(
        class_patterns,
        code,
    )

    imports = count_matches(
        import_patterns,
        code,
    )

    return {
        "functions": functions,
        "classes": classes,
        "imports": imports,
        "syntaxValid": True,
    }


# ============================================================
# COMPLEXITY
# ============================================================

def calculate_python_complexity(code: str):
    try:
        blocks = cc_visit(code)

        total_complexity = sum(
            block.complexity
            for block in blocks
        )

        results = []

        for block in blocks:
            results.append(
                {
                    "name": block.name,
                    "complexity": block.complexity,
                    "line": block.lineno,
                }
            )

        return {
            "complexity": total_complexity,
            "complexityBlocks": results,
        }

    except Exception:
        return {
            "complexity": 0,
            "complexityBlocks": [],
        }


def calculate_generic_complexity(code: str):
    keywords = [
        r"\bif\b",
        r"\belse\s+if\b",
        r"\belif\b",
        r"\bfor\b",
        r"\bwhile\b",
        r"\bcase\b",
        r"\bcatch\b",
        r"\bexcept\b",
        r"\bwhen\b",
        r"\bmatch\b",
        r"&&",
        r"\|\|",
        r"\?",
    ]

    complexity = 1

    for keyword in keywords:
        complexity += len(
            re.findall(
                keyword,
                code,
                flags=re.IGNORECASE,
            )
        )

    return {
        "complexity": complexity,
        "complexityBlocks": [],
    }


# ============================================================
# MAINTAINABILITY
# ============================================================

def calculate_python_maintainability(code: str):
    try:
        score = mi_visit(
            code,
            multi=True,
        )

        return round(score, 2)

    except Exception:
        return 0


def calculate_generic_maintainability(
    code_lines: int,
    comment_lines: int,
    complexity: int,
):
    score = 100.0

    # Complexity penalty
    score -= min(
        complexity * 1.5,
        35,
    )

    # Large-file penalty
    if code_lines > 50:
        score -= min(
            (code_lines - 50) * 0.10,
            20,
        )

    # Extremely large file penalty
    if code_lines > 200:
        score -= 10

    # Small comment bonus
    if code_lines > 0:
        comment_ratio = (
            comment_lines / code_lines
        )

        score += min(
            comment_ratio * 15,
            5,
        )

    score = max(
        0,
        min(score, 100),
    )

    return round(score, 2)


# ============================================================
# MAIN ANALYZER
# ============================================================

def analyze_code(code: str, language: str):
    line_metrics = count_lines(
        code,
        language,
    )

    # Python gets precise AST + Radon analysis
    if language == "Python":
        structure_metrics = (
            analyze_python_structures(code)
        )

        complexity_metrics = (
            calculate_python_complexity(code)
        )

        maintainability = (
            calculate_python_maintainability(
                code
            )
        )

    else:
        structure_metrics = (
            analyze_generic_structures(
                code,
                language,
            )
        )

        complexity_metrics = (
            calculate_generic_complexity(
                code
            )
        )

        maintainability = (
            calculate_generic_maintainability(
                line_metrics["codeLines"],
                line_metrics["commentLines"],
                complexity_metrics[
                    "complexity"
                ],
            )
        )

    return {
        "language": language,
        **line_metrics,
        **structure_metrics,
        **complexity_metrics,
        "maintainability": maintainability,
    }


# ============================================================
# STDIN ENTRY POINT
# ============================================================

def main():
    try:
        raw_input = sys.stdin.read()

        if not raw_input.strip():
            print(
                json.dumps(
                    {
                        "error": "No input provided."
                    }
                )
            )

            return

        data = json.loads(raw_input)

        code = data.get(
            "code",
            "",
        )

        language = data.get(
            "language",
            "",
        )

        if not code.strip():
            print(
                json.dumps(
                    {
                        "error": "No code provided."
                    }
                )
            )

            return

        if not language:
            print(
                json.dumps(
                    {
                        "error": "Language is required."
                    }
                )
            )

            return

        result = analyze_code(
            code,
            language,
        )

        print(
            json.dumps(result)
        )

    except Exception as error:
        print(
            json.dumps(
                {
                    "error": str(error)
                }
            )
        )


if __name__ == "__main__":
    main()