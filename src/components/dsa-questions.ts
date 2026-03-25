export interface DSAQuestion {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const DSA_QUESTIONS: DSAQuestion[] = [
  {
    id: 1,
    category: 'Array',
    question: "Time complexity of accessing an array element by index?",
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctIndex: 0,
    explanation: "Array access by index is O(1) because elements are stored contiguously in memory."
  },
  {
    id: 2,
    category: 'Stack',
    question: "Which data structure follows LIFO principle?",
    options: ['Queue', 'Stack', 'Tree', 'Graph'],
    correctIndex: 1,
    explanation: "Stack follows Last In First Out (LIFO) principle."
  },
  {
    id: 3,
    category: 'Binary Search',
    question: "Binary Search requires:",
    options: ['Unsorted array', 'Sorted array', 'Linked list', 'Tree'],
    correctIndex: 1,
    explanation: "Binary Search requires sorted array to divide search space."
  },
  {
    id: 4,
    category: 'Sorting',
    question: "Which has average O(n log n) complexity?",
    options: ['Bubble Sort', 'Quick Sort', 'Selection Sort', 'Insertion Sort'],
    correctIndex: 1,
    explanation: "Quick Sort average case is O(n log n) with good pivot selection."
  },
  {
    id: 5,
    category: 'Linked List',
    question: "Advantage of doubly linked list?",
    options: ['Less memory', 'Bidirectional traversal', 'Faster search', 'Better cache'],
    correctIndex: 1,
    explanation: "Doubly linked lists allow traversal in both directions."
  },
  {
    id: 6,
    category: 'Hashing',
    question: "HashMap average lookup complexity?",
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctIndex: 0,
    explanation: "HashMap provides average O(1) lookup with good hash distribution."
  },
  {
    id: 7,
    category: 'Trees',
    question: "Preorder traversal order?",
    options: ['Left→Root→Right', 'Root→Left→Right', 'Left→Right→Root', 'Right→Left→Root'],
    correctIndex: 1,
    explanation: "Preorder: Root → Left → Right."
  },
  {
    id: 8,
    category: 'Graphs',
    question: "BFS uses which data structure?",
    options: ['Stack', 'Queue', 'Priority Queue', 'Hash Table'],
    correctIndex: 1,
    explanation: "BFS uses Queue for level-order traversal."
  },
  {
    id: 9,
    category: 'Dynamic Programming',
    question: "DP solves problems with:",
    options: ['Independent subproblems', 'Overlapping subproblems', 'Greedy choices', 'Backtracking'],
    correctIndex: 1,
    explanation: "Dynamic Programming solves overlapping subproblems with memoization."
  },
  {
    id: 10,
    category: 'Recursion',
    question: "Base case prevents:",
    options: ['Stack overflow', 'Infinite recursion', 'Both A & B', 'Memory leak'],
    correctIndex: 2,
    explanation: "Base case terminates recursion preventing stack overflow."
  },
  {
    id: 11,
    category: 'Array',
    question: "Two pointer technique best for?",
    options: ['Sorted array', 'Unsorted array', 'Matrix', 'String'],
    correctIndex: 0,
    explanation: "Two pointer works best on sorted arrays for pair finding."
  },
  {
    id: 12,
    category: 'Queue',
    question: "Queue follows which principle?",
    options: ['LIFO', 'FIFO', 'Random', 'Circular'],
    correctIndex: 1,
    explanation: "Queue follows First In First Out (FIFO) principle."
  },
  {
    id: 13,
    category: 'Heap',
    question: "Max heap property?",
    options: ['Parent ≤ children', 'Parent ≥ children', 'Left > Right', 'Sum = constant'],
    correctIndex: 1,
    explanation: "Max heap: parent ≥ both children."
  },
  {
    id: 14,
    category: 'Greedy',
    question: "Greedy algorithm gives:",
    options: ['Global optimum always', 'Local optimum', 'No guarantee', 'DP solution'],
    correctIndex: 2,
    explanation: "Greedy gives optimal solution only for specific problems."
  },
  {
    id: 15,
    category: 'Backtracking',
    question: "Backtracking used for?",
    options: ['Sorting', 'Searching all solutions', 'Single optimum', 'Dynamic programming'],
    correctIndex: 1,
    explanation: "Backtracking explores all possible solutions by undoing choices."
  },
  {
    id: 16,
    category: 'String',
    question: "KMP algorithm for?",
    options: ['Fast substring search', 'Palindrome check', 'Anagram', 'Reverse string'],
    correctIndex: 0,
    explanation: "KMP (Knuth-Morris-Pratt) finds substring in linear time."
  },
  {
    id: 17,
    category: 'Matrix',
    question: "Spiral matrix traversal time?",
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'],
    correctIndex: 2,
    explanation: "Visit each element exactly once: O(n²) for n×n matrix."
  },
  {
    id: 18,
    category: 'Bit Manipulation',
    question: "Check if power of 2: n & (n-1)?",
    options: ['!= 0', '== 0', '> 0', '< 0'],
    correctIndex: 1,
    explanation: "Power of 2 has single bit set: n & (n-1) == 0."
  },
  {
    id: 19,
    category: 'Sliding Window',
    question: "Sliding window best for?",
    options: ['Fixed size subarray', 'Substrings', 'Both', 'Trees'],
    correctIndex: 2,
    explanation: "Sliding window handles both fixed/variable size subarrays/strings."
  },
  {
    id: 20,
    category: 'Trie',
    question: "Trie advantage over hash?",
    options: ['Prefix search', 'Fast lookup', 'Less memory', 'Sorting'],
    correctIndex: 0,
    explanation: "Trie excellent for prefix-based searches/autocomplete."
  }
];

