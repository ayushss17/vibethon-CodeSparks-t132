// ── Category Cards ────────────────────────────────────────────────────────────
export const CATEGORY_CARDS = [
  { id: 1, icon: '🔥', title: 'PyTorch Sheet', count: 30, color: '#ee4b2b', comingSoon: false },
  { id: 2, icon: '🧠', title: 'Cracking ML', count: 35, color: '#a855f7', comingSoon: false },
  { id: 3, icon: '⚡', title: 'Deep Learning', count: 35, color: '#f59e0b', comingSoon: false },
  { id: 4, icon: '🔢', title: 'NumPy Sheet', count: 25, color: '#3b82f6', comingSoon: false },
  { id: 5, icon: '🗃️', title: 'SQL Sheet', count: 25, color: '#10b981', comingSoon: true },
  { id: 6, icon: '📊', title: 'Stats & Prob', count: 20, color: '#06b6d4', comingSoon: true },
]

// ── Topic Filters ─────────────────────────────────────────────────────────────
export const TOPIC_FILTERS = [
  'All', 'Activation Functions', 'Linear Algebra', 'Optimization',
  'Loss Functions', 'Transformers', 'Computer Vision', 'Backpropagation',
  'Regularization', 'Data Preprocessing', 'Probability', 'Neural Nets',
  'Embeddings', 'Attention', 'Metrics',
]

// ── ALL PROBLEMS ──────────────────────────────────────────────────────────────
export const ALL_PROBLEMS = [
  // ── Fully implemented (first 6) ──────────────────────────────────────────
  {
    id: 1,
    slug: 'sigmoid-numpy',
    title: 'Implement Sigmoid in NumPy',
    difficulty: 'Easy',
    topics: ['Activation Functions'],
    status: null,
    implemented: true,
    vizKey: 'sigmoid',
  },
  {
    id: 2,
    slug: 'logistic-regression-training',
    title: 'Logistic Regression Training Loop',
    difficulty: 'Medium',
    topics: ['Optimization', 'Loss Functions'],
    status: null,
    implemented: true,
    vizKey: 'logistic',
  },
  {
    id: 3,
    slug: 'matrix-transpose',
    title: 'Matrix Transpose Without NumPy',
    difficulty: 'Easy',
    topics: ['Linear Algebra'],
    status: null,
    implemented: true,
    vizKey: 'matrix',
  },
  {
    id: 4,
    slug: 'gradient-descent-quadratic',
    title: 'Gradient Descent on a Quadratic',
    difficulty: 'Medium',
    topics: ['Optimization', 'Backpropagation'],
    status: null,
    implemented: true,
    vizKey: 'gradient',
  },
  {
    id: 5,
    slug: 'positional-encoding',
    title: 'Positional Encoding (sin/cos)',
    difficulty: 'Medium',
    topics: ['Transformers', 'Embeddings'],
    status: null,
    implemented: true,
    vizKey: 'positional',
  },
  {
    id: 6,
    slug: 'conv-padding',
    title: 'Convolution Padding (same vs valid)',
    difficulty: 'Medium',
    topics: ['Computer Vision'],
    status: null,
    implemented: true,
    vizKey: 'padding',
  },
  // ── Placeholder problems (coming soon detail pages) ──────────────────────
  { id: 7,  slug: 'relu-derivative',       title: 'ReLU & Its Derivative',                difficulty: 'Easy',   topics: ['Activation Functions'], status: null, implemented: false },
  { id: 8,  slug: 'softmax-stable',        title: 'Numerically Stable Softmax',           difficulty: 'Medium', topics: ['Activation Functions', 'Loss Functions'], status: null, implemented: false },
  { id: 9,  slug: 'cross-entropy',         title: 'Cross-Entropy Loss Implementation',    difficulty: 'Easy',   topics: ['Loss Functions'], status: null, implemented: false },
  { id: 10, slug: 'batch-norm-forward',    title: 'Batch Normalization Forward Pass',     difficulty: 'Hard',   topics: ['Neural Nets', 'Regularization'], status: null, implemented: false },
  { id: 11, slug: 'dot-product-attention', title: 'Dot Product Attention',                difficulty: 'Hard',   topics: ['Attention', 'Transformers'], status: null, implemented: false },
  { id: 12, slug: 'l2-regularization',     title: 'L2 Regularization (Weight Decay)',     difficulty: 'Easy',   topics: ['Regularization'], status: null, implemented: false },
  { id: 13, slug: 'cosine-similarity',     title: 'Cosine Similarity',                    difficulty: 'Easy',   topics: ['Linear Algebra', 'Embeddings'], status: null, implemented: false },
  { id: 14, slug: 'k-means-step',          title: 'K-Means Clustering Step',              difficulty: 'Medium', topics: ['Optimization'], status: null, implemented: false },
  { id: 15, slug: 'pca-projection',        title: 'PCA Projection (2D → 1D)',             difficulty: 'Medium', topics: ['Linear Algebra', 'Data Preprocessing'], status: null, implemented: false },
  { id: 16, slug: 'confusion-matrix',      title: 'Confusion Matrix from Scratch',        difficulty: 'Easy',   topics: ['Metrics'], status: null, implemented: false },
  { id: 17, slug: 'iou-bboxes',            title: 'IoU for Bounding Boxes',               difficulty: 'Medium', topics: ['Computer Vision', 'Metrics'], status: null, implemented: false },
  { id: 18, slug: 'backprop-2layer',       title: 'Backprop in a 2-Layer Network',        difficulty: 'Hard',   topics: ['Backpropagation', 'Neural Nets'], status: null, implemented: false },
  { id: 19, slug: 'adam-step',             title: 'Adam Optimizer Step',                  difficulty: 'Hard',   topics: ['Optimization'], status: null, implemented: false },
  { id: 20, slug: 'tokenize-bpe',          title: 'BPE Tokenization (simplified)',        difficulty: 'Hard',   topics: ['Transformers', 'Embeddings'], status: null, implemented: false },
]

// ── Per-problem detail data ───────────────────────────────────────────────────
export const PROBLEM_DATA = {
  'sigmoid-numpy': {
    id: 1,
    title: 'Implement Sigmoid in NumPy',
    difficulty: 'Easy',
    topics: ['Activation Functions'],
    acceptance: '78.4%',
    submissions: '12.3K',
    vizKey: 'sigmoid',
    description: `Given a scalar, list, or NumPy array \`x\`, implement the **sigmoid activation function** using only NumPy.

The sigmoid function maps any real number to the open interval (0, 1), making it ideal for representing probabilities in machine learning models.

**Formula:**

σ(x) = 1 / (1 + e^(−x))

Your implementation must be **fully vectorized** — no Python loops allowed.`,

    examples: [
      { input: 'x = 0', output: '0.5', explanation: 'At x=0, sigmoid returns exactly 0.5' },
      { input: 'x = [0, 2, -2]', output: '[0.5, 0.881, 0.119]', explanation: 'Vectorized over array input' },
      { input: 'x = [-10, 0, 10]', output: '[4.54e-5, 0.5, 0.99995]', explanation: 'Saturation at extremes' },
    ],

    requirements: [
      'Accept scalar, list, or NumPy array as input',
      'Return a NumPy array of floats',
      'Must be vectorized — no Python for loops',
      'Use only NumPy (no scipy, math module, etc.)',
    ],

    constraints: [
      'Vectorized implementation only',
      'Time limit: 200 ms | Memory: 64 MB',
      'Allowed library: NumPy only',
    ],

    theory: {
      sections: [
        {
          title: 'What the Sigmoid Function Does',
          body: 'The sigmoid function squashes any real number into the range (0, 1). No matter how large or small the input, the output is always between 0 and 1 — ideal for representing probabilities.',
          formula: 'σ(x) = 1 / (1 + e^(−x))',
        },
        {
          title: 'The S-Shaped Curve',
          body: 'The sigmoid forms a characteristic S-shape. For large negative inputs the output approaches 0; for large positive inputs it approaches 1; at x=0 it equals exactly 0.5. This smooth, bounded behavior made sigmoid the dominant activation function before ReLU.',
          table: [
            ['−10', '≈ 0.0000454'], ['−5', '≈ 0.00669'], ['−2', '≈ 0.119'],
            ['0', '= 0.5 (exactly)'], ['2', '≈ 0.881'], ['5', '≈ 0.993'], ['10', '≈ 0.9999546'],
          ],
        },
        {
          title: 'Derivative (Gradient)',
          body: 'The gradient of sigmoid can be expressed in terms of σ itself, making it cheap to compute during backpropagation once the forward pass value is cached.',
          formula: "σ'(x) = σ(x) · (1 − σ(x))",
        },
        {
          title: 'Why NumPy Vectorization?',
          body: 'Python loops are ~100× slower than NumPy for numerical arrays because NumPy ops run in optimized C/Fortran. Always operate on the entire array with np.exp(-x) rather than looping element by element.',
        },
      ],
    },

    starterCode: `import numpy as np

def sigmoid(x):
    """
    Vectorized sigmoid activation function.
    
    Args:
        x: scalar, list, or NumPy array
    Returns:
        NumPy array with sigmoid applied element-wise
    """
    # Write your solution here
    pass
`,

    testCases: [
      { label: 'Case 1', input: 'x = [0, 2, -2]', expected: '[0.5, 0.881, 0.119]' },
      { label: 'Case 2', input: 'x = 0', expected: '0.5' },
      { label: 'Case 3', input: 'x = [-10, 0, 10]', expected: '[4.54e-5, 0.5, 0.99995]' },
    ],
  },

  'logistic-regression-training': {
    id: 2,
    title: 'Logistic Regression Training Loop',
    difficulty: 'Medium',
    topics: ['Optimization', 'Loss Functions'],
    acceptance: '61.2%',
    submissions: '8.7K',
    vizKey: 'logistic',
    description: `Implement a **logistic regression training loop** from scratch using NumPy.

Given a 2D feature matrix \`X\` and binary labels \`y\`, implement gradient descent to minimize the binary cross-entropy loss and return the trained weights \`w\` and bias \`b\`.

The function should converge within 1000 steps using a learning rate of 0.1.`,

    examples: [
      { input: 'X = [[0],[1],[2],[3]], y = [0,0,1,1]', output: 'Converges to separating boundary', explanation: 'Linear separability guaranteed' },
    ],

    requirements: [
      'Implement binary cross-entropy loss',
      'Gradient descent update for w and b',
      'Return w (weights array) and b (bias scalar)',
      'Vectorized — no inner Python loops over samples',
    ],

    constraints: [
      'Learning rate: 0.1, Steps: 1000',
      'Input: X.shape = (N, D), y.shape = (N,)',
      'Time limit: 2s | Memory: 128 MB',
    ],

    theory: {
      sections: [
        {
          title: 'Logistic Regression Model',
          body: 'Logistic regression applies sigmoid to a linear combination of features: ŷ = σ(Xw + b). The model learns to output probabilities for binary classification.',
          formula: 'ŷ = σ(Xw + b)',
        },
        {
          title: 'Binary Cross-Entropy Loss',
          body: 'BCE loss measures how well the predicted probabilities match the true binary labels. Minimizing it via gradient descent trains the model.',
          formula: 'L = −(1/N) Σ [y·log(ŷ) + (1−y)·log(1−ŷ)]',
        },
        {
          title: 'Gradient Descent Updates',
          body: 'The gradients of BCE with respect to w and b have a clean closed form — the error scaled by the features.',
          formula: '∂L/∂w = (1/N) Xᵀ(ŷ−y)  |  ∂L/∂b = (1/N) Σ(ŷ−y)',
        },
      ],
    },

    starterCode: `import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def train_logistic_regression(X, y, lr=0.1, steps=1000):
    """
    Train logistic regression via gradient descent.
    
    Args:
        X: np.array shape (N, D)
        y: np.array shape (N,)
        lr: learning rate
        steps: number of gradient steps
    Returns:
        w: weight array shape (D,)
        b: bias scalar
    """
    X = np.array(X, dtype=float)
    y = np.array(y, dtype=float)
    N, D = X.shape
    w = np.zeros(D)
    b = 0.0
    
    # Write your training loop here
    pass
    
    return w, b
`,

    testCases: [
      { label: 'Case 1', input: 'X=[[0],[1],[2],[3]], y=[0,0,1,1]', expected: 'converges' },
    ],
  },

  'matrix-transpose': {
    id: 3,
    title: 'Matrix Transpose Without NumPy',
    difficulty: 'Easy',
    topics: ['Linear Algebra'],
    acceptance: '84.1%',
    submissions: '15.1K',
    vizKey: 'matrix',
    description: `Implement the **matrix transpose** operation using only pure Python (no NumPy, no built-ins like \`zip\`).

Given a 2D matrix \`A\` as a list of lists with shape (m, n), return its transpose with shape (n, m).

This is a fundamental linear algebra operation — the transpose swaps rows and columns of a matrix.`,

    examples: [
      { input: 'A = [[1,2,3],[4,5,6]]', output: '[[1,4],[2,5],[3,6]]', explanation: '2×3 → 3×2 matrix' },
      { input: 'A = [[1,2],[3,4]]', output: '[[1,3],[2,4]]', explanation: 'Square matrix transpose' },
      { input: 'A = [[5]]', output: '[[5]]', explanation: 'Single element is its own transpose' },
    ],

    requirements: [
      'No NumPy or zip() allowed',
      'Return a list of lists',
      'Handle non-square matrices',
      'Handle single row/column edge cases',
    ],

    constraints: [
      '1 ≤ m, n ≤ 1000',
      'Pure Python only',
      'Time limit: 500ms | Memory: 32MB',
    ],

    theory: {
      sections: [
        {
          title: 'The Transpose Operation',
          body: 'The transpose of matrix A (written Aᵀ) swaps its rows and columns. Element [i][j] moves to position [j][i]. This operation is used everywhere in ML: dot products, covariance matrices, weight gradients.',
          formula: 'Aᵀ[j][i] = A[i][j]',
        },
        {
          title: 'Shape Change',
          body: 'If A has shape (m, n), its transpose Aᵀ has shape (n, m). This shape transformation is critical when computing matrix multiplications where dimensions must match.',
        },
        {
          title: 'Applications in ML',
          body: 'The gradient of a linear layer output Y = XW with respect to W is Xᵀ(∂L/∂Y), requiring the transpose. Understanding transpose is essential for implementing backpropagation from scratch.',
        },
      ],
    },

    starterCode: `def matrix_transpose(A):
    """
    Transpose a 2D matrix without NumPy.
    
    Args:
        A: list of lists, shape (m, n)
    Returns:
        list of lists, shape (n, m)
    """
    # Write your solution here
    pass
`,

    testCases: [
      { label: 'Case 1', input: 'A = [[1,2,3],[4,5,6]]', expected: '[[1,4],[2,5],[3,6]]' },
      { label: 'Case 2', input: 'A = [[1,2],[3,4]]', expected: '[[1,3],[2,4]]' },
      { label: 'Case 3', input: 'A = [[5]]', expected: '[[5]]' },
    ],
  },

  'gradient-descent-quadratic': {
    id: 4,
    title: 'Gradient Descent on a Quadratic',
    difficulty: 'Medium',
    topics: ['Optimization', 'Backpropagation'],
    acceptance: '69.8%',
    submissions: '9.4K',
    vizKey: 'gradient',
    description: `Implement **gradient descent** to minimize the quadratic function f(x) = ax² + bx + c.

Given the coefficients a, b, c, starting point x0, learning rate lr, and number of steps, return the x value after all steps.

This is the simplest possible optimization problem — perfect for understanding how gradient descent works before applying it to neural networks.`,

    examples: [
      { input: 'a=1, b=-4, c=3, x0=0, lr=0.1, steps=50', output: '≈ 2.0', explanation: 'Minimum at x=2 for f(x)=x²-4x+3' },
      { input: 'a=1, b=0, c=0, x0=5, lr=0.1, steps=100', output: '≈ 0.0', explanation: 'f(x)=x² has minimum at x=0' },
    ],

    requirements: [
      'Compute gradient df/dx = 2ax + b',
      'Apply update: x = x - lr * gradient',
      'Repeat for given number of steps',
      'Return final x value (float)',
    ],

    constraints: [
      '0.001 ≤ lr ≤ 0.5',
      '1 ≤ steps ≤ 10,000',
      'Tolerance: within 0.01 of analytical minimum',
      'Time limit: 500ms',
    ],

    theory: {
      sections: [
        {
          title: 'The Update Rule',
          body: 'At each step, compute the gradient (slope) at the current position and move in the opposite direction by a fraction (learning rate) of that gradient. This is the core of all neural network training.',
          formula: 'x ← x − α · ∇f(x)',
        },
        {
          title: 'For a Quadratic f(x) = ax² + bx + c',
          body: 'The derivative is simply df/dx = 2ax + b. The analytical minimum is at x* = -b/(2a), which gradient descent should converge to if the learning rate is not too large.',
          formula: "f'(x) = 2ax + b",
        },
        {
          title: 'Learning Rate Effects',
          body: 'Too large an α causes divergence (bouncing over the minimum). Too small causes very slow convergence. For a quadratic with coefficient a, the optimal α ≈ 1/(2a). This intuition generalizes to the curvature (Hessian) of any loss landscape.',
        },
      ],
    },

    starterCode: `def gradient_descent_quadratic(a, b, c, x0, lr, steps):
    """
    Minimize f(x) = ax^2 + bx + c via gradient descent.
    
    Args:
        a, b, c: quadratic coefficients
        x0: starting point
        lr: learning rate (alpha)
        steps: number of update steps
    Returns:
        float: x value after all steps
    """
    x = float(x0)
    
    # Write your gradient descent loop here
    pass
    
    return x
`,

    testCases: [
      { label: 'Case 1', input: 'a=1, b=-4, c=3, x0=0, lr=0.1, steps=50', expected: '≈ 2.0' },
      { label: 'Case 2', input: 'a=1, b=0, c=0, x0=5, lr=0.1, steps=100', expected: '≈ 0.0' },
    ],
  },

  'positional-encoding': {
    id: 5,
    title: 'Positional Encoding (sin/cos)',
    difficulty: 'Medium',
    topics: ['Transformers', 'Embeddings'],
    acceptance: '55.3%',
    submissions: '6.1K',
    vizKey: 'positional',
    description: `Implement the **sinusoidal positional encoding** from the original "Attention Is All You Need" paper.

Given sequence length \`seq_len\`, embedding dimension \`d_model\`, and base \`base\`, return a (seq_len × d_model) NumPy array where even dimensions use sine and odd dimensions use cosine of different frequencies.

This encoding gives each token position a unique fingerprint that the Transformer can use to track order.`,

    examples: [
      { input: 'seq_len=1, d_model=2, base=10000.0', output: '[[0.0, 1.0]]', explanation: 'Position 0: sin(0)=0, cos(0)=1' },
    ],

    requirements: [
      'Shape: (seq_len, d_model)',
      'Even dims (0, 2, 4, ...): sin(pos / base^(2i/d_model))',
      'Odd dims (1, 3, 5, ...): cos(pos / base^(2i/d_model))',
      'Return NumPy float array',
    ],

    constraints: [
      '1 ≤ seq_len ≤ 5000',
      'd_model must be even',
      'base = 10000.0 (standard)',
      'Time limit: 500ms | Memory: 64MB',
    ],

    theory: {
      sections: [
        {
          title: 'Why Positional Encoding?',
          body: 'Self-attention is permutation-invariant — it treats tokens as a set, not a sequence. Positional encodings inject order information by adding a position-dependent signal to each token embedding before entering the Transformer.',
        },
        {
          title: 'The Sinusoidal Formula',
          body: 'Different positions get different frequencies — low dimensions oscillate fast (high frequency) while high dimensions oscillate slowly. This creates a unique binary-like code for each position that generalizes to unseen sequence lengths.',
          formula: 'PE[pos, 2i] = sin(pos / 10000^(2i/d))  |  PE[pos, 2i+1] = cos(pos / 10000^(2i/d))',
        },
        {
          title: 'Key Properties',
          body: 'The dot product between two positional encodings depends only on their relative offset, not absolute positions. This lets the model learn relative position reasoning (e.g., "3 tokens apart") which transfers across sentence lengths.',
        },
      ],
    },

    starterCode: `import numpy as np

def positional_encoding(seq_len, d_model, base=10000.0):
    """
    Sinusoidal positional encoding from "Attention Is All You Need".
    
    Args:
        seq_len: number of positions
        d_model: embedding dimension (must be even)
        base: frequency base (default 10000.0)
    Returns:
        np.array shape (seq_len, d_model)
    """
    # Write your solution here
    pass
`,

    testCases: [
      { label: 'Case 1', input: 'seq_len=1, d_model=2, base=10000.0', expected: '[[0.0, 1.0]]' },
    ],
  },

  'conv-padding': {
    id: 6,
    title: 'Convolution Padding (same vs valid)',
    difficulty: 'Medium',
    topics: ['Computer Vision'],
    acceptance: '58.7%',
    submissions: '7.2K',
    vizKey: 'padding',
    description: `Implement **2D convolution** with support for 'same' and 'valid' padding modes.

Given input feature map \`X\` (shape H×W), kernel \`K\` (shape kH×kW), and padding mode, return the convolved output.

- **valid**: no padding, output is smaller
- **same**: zero-pad input so output matches input spatial dimensions

This is the core operation in every Convolutional Neural Network.`,

    examples: [
      { input: 'X=3×3 identity, K=3×3 ones, padding="valid"', output: '1×1 array [[9]]', explanation: 'Full overlap, sum of all ones' },
      { input: 'X=3×3, K=3×3, padding="same"', output: '3×3 array', explanation: 'Same padding preserves spatial dims' },
    ],

    requirements: [
      'Support padding modes: "valid" and "same"',
      'For "same": pad with zeros before convolving',
      'Output dtype: float64',
      'No PyTorch or TensorFlow — NumPy only',
    ],

    constraints: [
      '1 ≤ kH, kW ≤ min(H, W)',
      'Stride = 1 (fixed)',
      'Time limit: 1s | Memory: 64MB',
    ],

    theory: {
      sections: [
        {
          title: 'The Convolution Operation',
          body: 'A 2D convolution slides a kernel over an input image, computing the dot product at each position. This detects local patterns regardless of where they appear in the image — the property called translation equivariance.',
          formula: 'Y[i,j] = Σ_m Σ_n X[i+m, j+n] · K[m, n]',
        },
        {
          title: '"Valid" vs "Same" Padding',
          body: '"Valid" outputs only where the kernel fully overlaps the input, shrinking spatial dimensions by (k−1). "Same" adds k//2 zeros on each side so the output matches the input size — critical for building deep architectures without spatial collapse.',
        },
        {
          title: 'Role in CNNs',
          body: 'Every convolutional layer in networks like ResNet, VGG, and EfficientNet is built on this operation. Understanding padding is essential for reasoning about how feature map sizes change through the network.',
        },
      ],
    },

    starterCode: `import numpy as np

def conv2d(X, K, padding='valid'):
    """
    2D convolution with valid or same padding.
    
    Args:
        X: np.array shape (H, W)
        K: np.array shape (kH, kW)
        padding: 'valid' or 'same'
    Returns:
        np.array, convolution output
    """
    X = np.array(X, dtype=float)
    K = np.array(K, dtype=float)
    
    # Write your solution here
    pass
`,

    testCases: [
      { label: 'Case 1', input: 'X=eye(3), K=ones(3,3), padding="valid"', expected: '[[9.0]]' },
    ],
  },
}