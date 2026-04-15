import subprocess
import sys
import json
import time
from typing import Dict, List, Any, Tuple
import numpy as np

# Test cases definition
TEST_CASES = {
    "sigmoid-numpy": [
        {"input": {"x": [0, 2, -2]}, "expected": [0.5, 0.8807970779778823, 0.11920292202211755]},
        {"input": {"x": 0}, "expected": 0.5},
        {"input": {"x": [-10, 0, 10]}, "expected": [4.5397868702434395e-5, 0.5, 0.9999546021312976]},
    ],
    "logistic-regression-training": [
        {"input": {"X": [[0],[1],[2],[3]], "y": [0,0,1,1]}, "expected": "converges"},
    ],
    "matrix-transpose": [
        {"input": {"A": [[1,2,3],[4,5,6]]}, "expected": [[1,4],[2,5],[3,6]]},
        {"input": {"A": [[1,2],[3,4]]}, "expected": [[1,3],[2,4]]},
        {"input": {"A": [[5]]}, "expected": [[5]]},
    ],
    "gradient-descent-quadratic": [
        {"input": {"a":1,"b":-4,"c":3,"x0":0,"lr":0.1,"steps":50}, "expected": 2.0},
        {"input": {"a":1,"b":0,"c":0,"x0":5,"lr":0.1,"steps":100}, "expected": 0.0},
    ],
    "positional-encoding": [
        {"input": {"seq_len":1,"d_model":2,"base":10000.0}, "expected": [[0.0,1.0]]},
    ],
}

FUNCTION_NAMES = {
    "sigmoid-numpy": "sigmoid",
    "logistic-regression-training": "train_logistic_regression",
    "matrix-transpose": "matrix_transpose",
    "gradient-descent-quadratic": "gradient_descent_quadratic",
    "positional-encoding": "positional_encoding",
}

# XP rewards for different difficulties
XP_REWARDS = {
    "easy": 10,
    "medium": 25,
    "hard": 50,
}

# Level thresholds
LEVEL_THRESHOLDS = {
    1: 0,
    2: 100,
    3: 250,
    4: 450,
    5: 700,
}

class CodeExecutor:
    @staticmethod
    def get_test_cases(problem_slug: str) -> List[Dict]:
        """Get test cases for a problem"""
        return TEST_CASES.get(problem_slug, [])
    
    @staticmethod
    def run_single_test_case(code: str, problem_slug: str, test_case_index: int = 0) -> Dict[str, Any]:
        """Execute code for a single test case"""
        cases = TEST_CASES.get(problem_slug, [])
        if not cases:
            return {"status": "error", "message": "Problem not found"}
        
        if test_case_index >= len(cases):
            return {"status": "error", "message": "Test case index out of range"}
        
        case = cases[test_case_index]
        fn_name = FUNCTION_NAMES.get(problem_slug, "solution")
        
        # Build function call
        args_str = ", ".join(json.dumps(v) for v in case["input"].values())
        call_code = f"""
import json
import numpy as np
_result = {fn_name}({args_str})
if hasattr(_result, 'tolist'):
    _result = _result.tolist()
print(json.dumps(_result))
"""
        
        full_code = code + call_code
        
        try:
            start_time = time.time()
            proc = subprocess.run(
                [sys.executable, "-c", full_code],
                capture_output=True,
                text=True,
                timeout=5
            )
            elapsed_time = time.time() - start_time
            runtime_ms = f"{elapsed_time * 1000:.0f}ms"
            
            if proc.returncode != 0:
                return {
                    "status": "error",
                    "test_case_index": test_case_index,
                    "error_message": proc.stderr.strip(),
                    "runtime": runtime_ms
                }
            
            # Parse output
            output_lines = proc.stdout.strip().split("\n")
            output_line = output_lines[-1] if output_lines else ""
            
            try:
                result = json.loads(output_line)
            except json.JSONDecodeError:
                return {
                    "status": "error",
                    "test_case_index": test_case_index,
                    "error_message": f"Invalid output format: {output_line}",
                    "runtime": runtime_ms
                }
            
            # Compare with expected
            expected = case["expected"]
            passed = CodeExecutor._compare_results(result, expected)
            
            return {
                "status": "passed" if passed else "wrong",
                "test_case_index": test_case_index,
                "output": str(result),
                "expected": str(expected),
                "runtime": runtime_ms
            }
        
        except subprocess.TimeoutExpired:
            return {
                "status": "error",
                "test_case_index": test_case_index,
                "error_message": "Time Limit Exceeded (5 seconds)",
                "runtime": ">5000ms"
            }
        except Exception as e:
            return {
                "status": "error",
                "test_case_index": test_case_index,
                "error_message": str(e),
                "runtime": "0ms"
            }
    
    @staticmethod
    def run_all_test_cases(code: str, problem_slug: str) -> Tuple[List[Dict], bool]:
        """Execute code for all test cases of a problem"""
        cases = TEST_CASES.get(problem_slug, [])
        results = []
        
        for i in range(len(cases)):
            result = CodeExecutor.run_single_test_case(code, problem_slug, i)
            results.append(result)
        
        all_passed = all(r.get("status") == "passed" for r in results)
        return results, all_passed
    
    @staticmethod
    def _compare_results(result: Any, expected: Any) -> bool:
        """Compare test result with expected output"""
        if expected == "converges":
            return True
        
        if isinstance(expected, float):
            try:
                return abs(float(result) - expected) < 0.01
            except (ValueError, TypeError):
                return False
        
        if isinstance(expected, list):
            try:
                result_array = np.array(result, dtype=float)
                expected_array = np.array(expected, dtype=float)
                return (result_array.shape == expected_array.shape and 
                        np.allclose(result_array, expected_array, atol=1e-4))
            except (ValueError, TypeError):
                return False
        
        return result == expected
    
    @staticmethod
    def get_xp_for_problem(difficulty: str) -> int:
        """Get XP reward for solving a problem"""
        return XP_REWARDS.get(difficulty, 10)
    
    @staticmethod
    def calculate_level(total_xp: int) -> int:
        """Calculate user level based on total XP"""
        for level in sorted(LEVEL_THRESHOLDS.keys(), reverse=True):
            if total_xp >= LEVEL_THRESHOLDS[level]:
                return level
        return 1
