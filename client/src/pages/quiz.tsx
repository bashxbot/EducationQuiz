
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { School, Book, Zap, Calendar, History, RotateCcw, BarChart3, Atom, TestTube, Dice6, Clock, CheckCircle, XCircle, Lightbulb, ArrowLeft, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuizHistory } from "@/hooks/use-app-storage";
import type { Quiz, QuizQuestion } from "@shared/schema";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const classes = ["Class 10", "Class 11", "Class 12"];
const subjects = [
  { name: "Mathematics", icon: "BarChart3", color: "bg-blue-100 dark:bg-blue-900", iconColor: "text-blue-600 dark:text-blue-400", topics: ["Algebra", "Geometry", "Calculus"] },
  { name: "Physics", icon: "Atom", color: "bg-green-100 dark:bg-green-900", iconColor: "text-green-600 dark:text-green-400", topics: ["Mechanics", "Thermodynamics", "Optics"] },
  { name: "Chemistry", icon: "TestTube", color: "bg-purple-100 dark:bg-purple-900", iconColor: "text-purple-600 dark:text-purple-400", topics: ["Organic", "Inorganic", "Physical"] },
];

interface QuizResult {
  questionId: string;
  userAnswer: string;
  correct: boolean;
  timeSpent: number;
}

export default function Quiz() {
  const [selectedClass, setSelectedClass] = useState("Class 10");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [questionResults, setQuestionResults] = useState<QuizResult[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [timer, setTimer] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  const queryClient = useQueryClient();
  const { addQuizResult } = useQuizHistory();

  const { data: quizHistory = [] } = useQuery({
    queryKey: ["/api/quiz/history"],
  });

  // Timer effect
  useEffect(() => {
    if (currentQuiz && !showResults && !isReviewMode) {
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentQuiz, showResults, isReviewMode]);

  const generateQuizMutation = useMutation({
    mutationFn: async (params: { class: string; subject: string; topic?: string }) => {
      const response = await apiRequest("POST", "/api/quiz/generate", params);
      return response.json();
    },
    onSuccess: (quiz) => {
      setCurrentQuiz(quiz);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setSelectedAnswer("");
      setShowResults(false);
      setQuestionResults([]);
      setTimer(0);
      setQuestionStartTime(Date.now());
      setShowExplanation(false);
      setIsReviewMode(false);
    },
  });

  const submitQuizMutation = useMutation({
    mutationFn: async ({ quizId, answers }: { quizId: string; answers: string[] }) => {
      const response = await apiRequest("POST", `/api/quiz/${quizId}/submit`, { answers });
      return response.json();
    },
    onSuccess: (results) => {
      setQuizResults(results);
      setShowResults(true);
      
      // Save to local storage
      addQuizResult({
        subject: selectedSubject,
        topic: selectedTopic,
        score: results.score,
        totalQuestions: results.totalQuestions,
        class: selectedClass,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/quiz/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  const startQuiz = (subject: string, topic?: string) => {
    setSelectedSubject(subject);
    setSelectedTopic(topic || "");
    generateQuizMutation.mutate({
      class: selectedClass,
      subject,
      topic,
    });
  };

  const startRandomQuiz = () => {
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    startQuiz(randomSubject.name);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showExplanation) return; // Prevent changing answer after submission
    setSelectedAnswer(answer);
  };

  const submitCurrentQuestion = () => {
    if (!selectedAnswer || !currentQuiz) return;

    const questions = currentQuiz.questions as QuizQuestion[];
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    // Record result
    const result: QuizResult = {
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      correct: isCorrect,
      timeSpent,
    };

    setQuestionResults(prev => [...prev, result]);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);
    
    if (currentQuestionIndex < (currentQuiz?.questions as QuizQuestion[]).length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer("");
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    } else {
      // Submit quiz
      newAnswers[currentQuestionIndex] = selectedAnswer;
      submitQuizMutation.mutate({
        quizId: currentQuiz!.id,
        answers: newAnswers,
      });
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] || "");
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    }
  };

  const startReview = () => {
    setIsReviewMode(true);
    setReviewIndex(0);
  };

  const retryWrongOnly = () => {
    // Filter wrong questions and create new quiz
    const questions = currentQuiz?.questions as QuizQuestion[];
    const wrongQuestions = questions.filter((_, index) => 
      !questionResults[index]?.correct
    );
    
    if (wrongQuestions.length > 0) {
      const newQuiz = {
        ...currentQuiz!,
        questions: wrongQuestions,
        id: `retry_${Date.now()}`,
      };
      setCurrentQuiz(newQuiz);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setSelectedAnswer("");
      setShowResults(false);
      setQuestionResults([]);
      setTimer(0);
      setQuestionStartTime(Date.now());
      setShowExplanation(false);
      setIsReviewMode(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer("");
    setShowResults(false);
    setQuizResults(null);
    setQuestionResults([]);
    setSelectedSubject("");
    setSelectedTopic("");
    setTimer(0);
    setShowExplanation(false);
    setIsReviewMode(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Review Mode
  if (isReviewMode && currentQuiz) {
    const questions = currentQuiz.questions as QuizQuestion[];
    const question = questions[reviewIndex];
    const result = questionResults[reviewIndex];

    return (
      <div className="p-4 space-y-6 pb-20">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Review Mode - Question {reviewIndex + 1}</CardTitle>
              <Button variant="outline" onClick={() => setIsReviewMode(false)}>
                Exit Review
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {question.question}
              </ReactMarkdown>
            </div>

            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${
                    option === question.correctAnswer 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : option === result?.userAnswer && !result?.correct
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {option === question.correctAnswer && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {option === result?.userAnswer && !result?.correct && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="flex-1">{option}</span>
                  </div>
                </div>
              ))}
            </div>

            <Card className="bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Explanation</h4>
                    <div className="text-sm text-blue-700 dark:text-blue-300 mt-1 prose prose-sm">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {question.explanation}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
                disabled={reviewIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setReviewIndex(Math.min(questions.length - 1, reviewIndex + 1))}
                disabled={reviewIndex === questions.length - 1}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results Screen
  if (showResults && quizResults) {
    const wrongQuestions = questionResults.filter(r => !r.correct);
    const averageTime = questionResults.reduce((sum, r) => sum + r.timeSpent, 0) / questionResults.length;

    return (
      <div className="p-4 space-y-6 pb-20">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">
                {quizResults.score}%
              </div>
              <p className="text-muted-foreground">
                {quizResults.correctCount} out of {quizResults.totalQuestions} correct
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Time: {formatTime(timer)} • Avg: {formatTime(Math.round(averageTime))} per question
              </p>
            </div>
            
            <div className="flex justify-center">
              <Badge 
                variant={quizResults.score >= 80 ? "default" : quizResults.score >= 60 ? "secondary" : "destructive"}
                className="text-lg px-4 py-2"
              >
                {quizResults.score >= 80 ? "Excellent!" : quizResults.score >= 60 ? "Good Job!" : "Keep Practicing!"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{quizResults.correctCount}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Correct</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{wrongQuestions.length}</div>
                <div className="text-sm text-red-700 dark:text-red-300">Wrong</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={startReview} variant="outline">
                Review Answers
              </Button>
              <Button onClick={resetQuiz} variant="outline">
                New Quiz
              </Button>
            </div>

            {wrongQuestions.length > 0 && (
              <Button onClick={retryWrongOnly} className="w-full">
                Retry Wrong Questions ({wrongQuestions.length})
              </Button>
            )}

            <Button onClick={() => startQuiz(selectedSubject, selectedTopic)} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz Taking Screen
  if (currentQuiz) {
    const questions = currentQuiz.questions as QuizQuestion[];
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="p-4 space-y-6 pb-20">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTime(timer)}
                  </div>
                  <div>{selectedSubject}: {selectedTopic || 'Mixed Topics'}</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={resetQuiz}>
                Exit
              </Button>
            </div>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {currentQuestion.question}
              </ReactMarkdown>
            </div>
            
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === option ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto p-4 ${
                    showExplanation ? (
                      option === currentQuestion.correctAnswer 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : option === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : ''
                    ) : ''
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showExplanation}
                >
                  <div className="flex items-center gap-2 w-full">
                    {showExplanation && option === currentQuestion.correctAnswer && (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    )}
                    {showExplanation && option === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer && (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    )}
                    <span className="flex-1">{option}</span>
                  </div>
                </Button>
              ))}
            </div>

            {showExplanation && (
              <Card className="bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">Explanation</h4>
                      <div className="text-sm text-blue-700 dark:text-blue-300 mt-1 prose prose-sm">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {currentQuestion.explanation}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </Card>
              </Card>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {!showExplanation ? (
                <Button
                  onClick={submitCurrentQuestion}
                  disabled={!selectedAnswer}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  disabled={submitQuizMutation.isPending}
                >
                  {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz Selection Screen (same as before)
  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Quiz</h2>
        <p className="text-muted-foreground">Select a subject and topic to test your knowledge</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <School className="h-5 w-5 text-primary" />
            Select Class
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {classes.map((cls) => (
              <Button
                key={cls}
                variant={selectedClass === cls ? "default" : "outline"}
                className="p-3"
                onClick={() => setSelectedClass(cls)}
              >
                {cls}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Book className="h-5 w-5 text-accent" />
            Select Subject
          </h3>
          <div className="space-y-2">
            {subjects.map((subject) => (
              <Button
                key={subject.name}
                variant="outline"
                className="w-full p-4 h-auto justify-between"
                onClick={() => startQuiz(subject.name)}
                disabled={generateQuizMutation.isPending}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${subject.color} rounded-lg flex items-center justify-center`}>
                    {subject.icon === 'BarChart3' && <BarChart3 className={`h-6 w-6 ${subject.iconColor}`} />}
                    {subject.icon === 'Atom' && <Atom className={`h-6 w-6 ${subject.iconColor}`} />}
                    {subject.icon === 'TestTube' && <TestTube className={`h-6 w-6 ${subject.iconColor}`} />}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{subject.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {subject.topics.join(", ")}
                    </p>
                  </div>
                </div>
                <span className="text-xs">→</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            Quick Start
          </h3>
          <div className="space-y-2">
            <Button
              onClick={startRandomQuiz}
              disabled={generateQuizMutation.isPending}
              className="w-full p-4 h-auto bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg"
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-left">
                  <p className="font-semibold">Random Quiz</p>
                  <p className="text-xs opacity-90">Mixed topics • 10 questions</p>
                </div>
                <Dice6 className="h-6 w-6" />
              </div>
            </Button>
            <Button
              onClick={startRandomQuiz}
              disabled={generateQuizMutation.isPending}
              className="w-full p-4 h-auto bg-success text-white hover:shadow-lg"
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-left">
                  <p className="font-semibold">Daily Challenge</p>
                  <p className="text-xs opacity-90">Today's special quiz • +50 points</p>
                </div>
                <Calendar className="h-6 w-6" />
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {(quizHistory as Quiz[]).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              Recent Quizzes
            </h3>
            <div className="space-y-3">
              {(quizHistory as Quiz[]).slice(0, 3).map((quiz: Quiz) => (
                <div key={quiz.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {quiz.subject}: {quiz.topic || "Mixed Topics"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Score: {quiz.score}% • {quiz.totalQuestions} questions
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startQuiz(quiz.subject, quiz.topic || undefined)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
