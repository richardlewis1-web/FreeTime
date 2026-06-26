import { TriviaGame } from "@/components/trivia-game";
import { getQuestions } from "@/lib/questions";

export default async function Home() {
  const questions = await getQuestions();

  return <TriviaGame questions={questions} />;
}
