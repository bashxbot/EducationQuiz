import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { School, Book, Zap, Calendar, History, RotateCcw, BarChart3, Atom, TestTube, Dice6 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Quiz, QuizQuestion } from "@shared/schema";

const classes = ["Class 10", "Class 11", "Class 12"];
const subjects = [
  { name: "Mathematics", icon: "BarChart3", color: "bg-blue-100 dark:bg-blue-900", iconColor: "text-blue-600 dark:text-blue-400", topics: ["Algebra", "Geometry", "Calculus"] },
  { name: "Physics", icon: "Atom", color: "bg-green-100 dark:bg-green-900", iconColor: "text-green-600 dark:text-green-400", topics: ["Mechanics", "Thermodynamics", "Optics"] },
  { name: "Chemistry", icon: "TestTube", color: "bg-purple-100 dark:bg-purple-900", iconColor: "text-purple-600 dark:text-purple-400", topics: ["Organic", "Inorganic", "Physical"] },
];

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

  const queryClient = useQueryClient();

  const { data: quizHistory = [] } = useQuery({
    queryKey: ["/api/quiz/history"],
  });

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
    setSelectedAnswer(answer);
  };

  const nextQuestion = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);
    setSelectedAnswer("");
    
    if (currentQuestionIndex < (currentQuiz?.questions as QuizQuestion[]).length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit quiz
      newAnswers[currentQuestionIndex] = selectedAnswer;
      submitQuizMutation.mutate({
        quizId: currentQuiz!.id,
        answers: newAnswers,
      });
    }
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer("");
    setShowResults(false);
    setQuizResults(null);
    setSelectedSubject("");
    setSelectedTopic("");
  };

  if (showResults && quizResults) {
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
              <Button onClick={resetQuiz} variant="outline" data-testid="button-new-quiz">
                New Quiz
              </Button>
              <Button onClick={() => startQuiz(selectedSubject, selectedTopic)} data-testid="button-retry-quiz">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentQuiz) {
    const questions = currentQuiz.questions as QuizQuestion[];
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="p-4 space-y-6 pb-20">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Question {currentQuestionIndex + 1} of {questions.length}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetQuiz} data-testid="button-exit-quiz">
                Exit
              </Button>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full">
              <div 
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4" data-testid="text-question">
                {currentQuestion.question}
              </h3>
              
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === option ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto p-4"
                    onClick={() => handleAnswerSelect(option)}
                    data-testid={`button-option-${index}`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={nextQuestion}
              disabled={!selectedAnswer || submitQuizMutation.isPending}
              className="w-full"
              data-testid="button-next-question"
            >
              {currentQuestionIndex === questions.length - 1 ? "Submit Quiz" : "Next Question"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Quiz</h2>
        <p className="text-muted-foreground">Select a subject and topic to test your knowledge</p>
      </div>

      {/* Class Selection */}
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
                data-testid={`button-class-${cls.replace(' ', '').toLowerCase()}`}
              >
                {cls}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subject Selection */}
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
                data-testid={`button-subject-${subject.name.toLowerCase()}`}
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

      {/* Quick Quiz Options */}
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
              data-testid="button-random-quiz"
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
              data-testid="button-daily-challenge"
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

      {/* Recent Quizzes */}
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
                    data-testid={`button-retry-${quiz.id}`}
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
