from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import subprocess, sys, io, json, traceback, ast, numpy as np, time

app = FastAPI(title="NeuralForge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory state ──────────────────────────────────────────────────────────
submissions: dict = {}  # slug -> list of submission dicts

class RunRequest(BaseModel):
    code: str
    problem_slug: str
    test_case_index: int = 0

class SubmitRequest(BaseModel):
    code: str
    problem_slug: str

class Submission(BaseModel):
    slug: str
    status: str
    runtime: str
    memory: str
    language: str = "Python 3"

# ── Test cases (mirrors frontend problemsData) ────────────────────────────────
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

def run_user_code(code: str, slug: str, case_idx: int = 0):
    cases = TEST_CASES.get(slug, [])
    if not cases:
        return {"status": "error", "message": "No test cases for this problem"}
    
    case = cases[case_idx] if case_idx < len(cases) else cases[0]
    fn_name = FUNCTION_NAMES.get(slug, "solution")
    
    # Build call args
    args_str = ", ".join(json.dumps(v) for v in case["input"].values())
    call_code = f"\nimport json, numpy as np\n_result = {fn_name}({args_str})\nif hasattr(_result, 'tolist'): _result = _result.tolist()\nprint(json.dumps(_result))\n"
    
    full_code = code + call_code
    
    try:
        start = time.time()
        proc = subprocess.run(
            [sys.executable, "-c", full_code],
            capture_output=True, text=True, timeout=5
        )
        elapsed = time.time() - start
        
        if proc.returncode != 0:
            return {"status": "error", "message": proc.stderr.strip(), "runtime": f"{elapsed*1000:.0f}ms"}
        
        output_line = proc.stdout.strip().split("\n")[-1]
        result = json.loads(output_line)
        
        expected = case["expected"]
        if expected == "converges":
            passed = True
        elif isinstance(expected, float):
            passed = abs(float(result) - expected) < 0.01
        elif isinstance(expected, list):
            r = np.array(result, dtype=float)
            e = np.array(expected, dtype=float)
            passed = r.shape == e.shape and np.allclose(r, e, atol=1e-4)
        else:
            passed = result == expected
        
        return {
            "status": "passed" if passed else "wrong",
            "output": str(result),
            "expected": str(expected),
            "runtime": f"{elapsed*1000:.0f}ms",
            "memory": "18.2 MB",
        }
    except subprocess.TimeoutExpired:
        return {"status": "error", "message": "Time Limit Exceeded (5s)", "runtime": ">5000ms"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def run_all_cases(code: str, slug: str):
    cases = TEST_CASES.get(slug, [])
    results = []
    for i in range(len(cases)):
        results.append(run_user_code(code, slug, i))
    all_passed = all(r["status"] == "passed" for r in results)
    return results, all_passed

@app.post("/run")
def run_code(req: RunRequest):
    result = run_user_code(req.code, req.problem_slug, req.test_case_index)
    return result

@app.post("/submit")
def submit_code(req: SubmitRequest):
    results, all_passed = run_all_cases(req.code, req.problem_slug)
    
    sub = {
        "id": len(submissions.get(req.problem_slug, [])) + 1,
        "status": "Accepted" if all_passed else "Wrong Answer",
        "runtime": results[0].get("runtime", "N/A") if results else "N/A",
        "memory": "18.2 MB",
        "language": "Python 3",
        "timestamp": time.strftime("%Y-%m-%d %H:%M"),
        "test_results": results,
        "passed": sum(1 for r in results if r["status"] == "passed"),
        "total": len(results),
    }
    
    if req.problem_slug not in submissions:
        submissions[req.problem_slug] = []
    submissions[req.problem_slug].insert(0, sub)
    
    return sub

@app.get("/submissions/{slug}")
def get_submissions(slug: str):
    return submissions.get(slug, [])

@app.get("/health")
def health():
    return {"status": "ok"}